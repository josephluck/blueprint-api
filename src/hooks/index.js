'use strict';

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

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