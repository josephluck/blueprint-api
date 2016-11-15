'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const errors = require('feathers-errors');

const filterToUsersOwnProjects = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('collaborators').find({
        userId: hook.params.user._id
      }).then((collaborators) => {
        let projectIdsUserHasAccessTo = collaborators.filter((collaborator) => {
          return collaborator.userId === hook.params.user._id
        }).map((collaborator) => {
          return collaborator.projectId
        })
        let projectsUserHasAccessTo = hook.result.filter((project) => {
          return projectIdsUserHasAccessTo.includes(project._id)
        })
        hook.result = projectsUserHasAccessTo
        resolve()
      }, () => {
        reject(new errors.NotFound('This user is not collaborating on any projects'))
      });
    })
  }
}

const restrictToUsersOwnProject = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('collaborators').find({
        projectId: hook.result._id,
        userId: hook.params.user._id
      }).then((collaborators) => {
        resolve()
      }, () => {
        reject(new errors.NotFound('No permission for this project'))
      })
    })
  }
}

const addCollaboratorAfterProjectCreated = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('collaborators').create({
        projectId: hook.result._id,
        userId: hook.params.user._id
      }).then((collaborator) => {
        let collaborators = []
        collaborators.push(collaborator)
        hook.result.collaborators = collaborators
        resolve()
      }, () => {
        reject()
      })
    })
  }
}

// Do stuff with the data before saving it
exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [],
  get: [],
  create: [
    globalHooks.addCreatedBy()
  ],
  update: [
    globalHooks.addUpdatedBy()
  ],
  patch: [],
  remove: []
};

// Do something with the data before responding
exports.after = {
  all: [],
  find: [
    filterToUsersOwnProjects()
  ],
  get: [
    restrictToUsersOwnProject(),
    globalHooks.addCreatedByUser(),
    globalHooks.addUpdatedByUser()
  ],
  create: [
    addCollaboratorAfterProjectCreated()
  ],
  update: [
    restrictToUsersOwnProject()
  ],
  patch: [
    restrictToUsersOwnProject()
  ],
  remove: [
    restrictToUsersOwnProject()
  ]
};
