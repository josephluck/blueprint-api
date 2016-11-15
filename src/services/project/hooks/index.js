'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const errors = require('feathers-errors');

const filterToUsersOwnProjects = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('collaborators').find({
        query: {
          userId: hook.params.user._id
        }
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
        query: {
          projectId: hook.result._id,
          userId: hook.params.user._id
        }
      }).then((collaborators) => {
        resolve()
      }, () => {
        reject(new errors.NotFound('No permission for this project'))
      })
    })
  }
}

const createCollaboratorAfterProjectCreated = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('collaborators').create({
        projectId: hook.result._id,
        email: hook.params.user.email
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

const addProjectCollaborators = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('collaborators').find({
        query: {
          projectId: hook.result._id
        }
      }).then((collaborators) => {
        hook.result.collaborators = collaborators
        resolve()
      }, () => {
        reject(new Error("No collaborators for this project"))
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
    filterToUsersOwnProjects(),
    hooks.populate('createdByUser', {
      service: 'users',
      field: 'createdByUserId'
    }),
    hooks.populate('updatedByUser', {
      service: 'users',
      field: 'updatedByUserId'
    })
  ],
  get: [
    restrictToUsersOwnProject(),
    hooks.populate('createdByUser', {
      service: 'users',
      field: 'createdByUserId'
    }),
    hooks.populate('updatedByUser', {
      service: 'users',
      field: 'updatedByUserId'
    }),
    addProjectCollaborators()
  ],
  create: [
    createCollaboratorAfterProjectCreated()
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
