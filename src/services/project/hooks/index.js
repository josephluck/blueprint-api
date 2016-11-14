'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const errors = require('feathers-errors');

const restrictToUsersOwnProjects = function(options) {
  return function(hook) {
    let query = hook.params.query;
    query.user_id = hook.params.user.id;
  }
}

const restrictToUsersOwnProject = function(options) {
  return function(hook) {
    let userDidNotCreateProject = hook.result.created_by._id !== hook.params.user.id
    if (userDidNotCreateProject) {
      throw new errors.NotFound('You are not authorized to access this information')
    }
  }
}

// Do stuff with the data before saving it
exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [
    restrictToUsersOwnProjects()
  ],
  get: [],
  create: [
    globalHooks.createdBy()
  ],
  update: [
    globalHooks.updatedBy()
  ],
  patch: [],
  remove: []
};

// Do something with the data before responding
exports.after = {
  all: [],
  find: [],
  get: [
    restrictToUsersOwnProject()
  ],
  create: [],
  update: [],
  patch: [],
  remove: []
};
