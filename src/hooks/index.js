'use strict';

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

function getUserIdFromHook(hook) {hook.params.user._id};

exports.createdBy = function(options) {
	return function(hook) {
		hook.data.createdByUserId = getUserIdFromHook(hook);
		hook.data.createdAt = new Date();
	}
}

exports.updatedBy = function(options) {
	return function(hook) {
		hook.data.updatedByUserId = getUserIdFromHook(hook);
		hook.data.updatedAt = new Date();
	}
}