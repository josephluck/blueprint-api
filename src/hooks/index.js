'use strict';

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

exports.addCreatedByUser = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('users').get(hook.result.createdByUserId).then((user) => {
        hook.result.createdByUser = user
        resolve()
      }, () => {
        reject(new Error("User does not exist"))
      })
    })
  }
}

exports.addUpdatedByUser = function(options) {
  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.app.service('users').get(hook.result.createdByUserId).then((user) => {
        hook.result.updatedByUser = user
        resolve()
      }, () => {
        reject(new Error("User does not exist"))
      })
    })
  }
}

exports.addCreatedBy = function(options) {
	return function(hook) {
    hook.data.createdByUserId = hook.params.user._id;
		hook.data.createdAtDateTime = new Date();
	}
}

exports.addUpdatedBy = function(options) {
	return function(hook) {
		hook.data.updatedByUserId = hook.params.user._id;
		hook.data.updatedAtDateTime = new Date();
	}
}