'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

const addUserToResponse = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('users').get(hook.result.userId).then((user) => {
        hook.result.user = user
        resolve()
      }, () => {
        reject(new Error("User not found for this collaborator"))
      })
    })
  }
}

const saveUserByEmailAddress = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('users').find({
        query: {
          email: hook.data.email
        }
      }).then((users) => {
        if (users.length) {
          hook.data.userId = users[0]._id
          resolve()
        } else {
          reject(new Error("User not found"))
        }
      }, () => {
        reject(new Error("User not found"))
      })
    })
  }
}

const deleteProjectAfterAllCollaboratorsRemoved = function() {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('collaborators').find({
        query: {
          projectId: hook.result.projectId
        }
      }).then((collaboratorsInProject) => {
        if (!collaboratorsInProject.length) {
          hook.app.service('projects').delete(hook.result.projectId).then(() => {
            resolve()
          })
        } else {
          resolve()
        }
      })
    })
  }
}

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [],
  get: [],
  create: [
    saveUserByEmailAddress()
  ],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [
    hooks.populate('user', {
      service: 'users',
      field: 'userId'
    })
  ],
  get: [
    hooks.populate('user', {
      service: 'users',
      field: 'userId'
    })
  ],
  create: [
    hooks.populate('user', {
      service: 'users',
      field: 'userId'
    })
  ],
  update: [],
  patch: [],
  remove: [
    // deleteProjectAfterAllCollaboratorsRemoved()
  ]
};
