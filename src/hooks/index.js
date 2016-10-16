'use strict';

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

const getUserIdFromHook = function (hook) {
  return hook.params.user._id
};

const getCompanyIdFromHook = function (hook) {
  return hook.params.user.company_id
};

exports.createdBy = function(options) {
	return function(hook) {
    hook.data.created_by_user_id = getUserIdFromHook(hook);
		hook.data.company_id = getCompanyIdFromHook(hook);
		hook.data.created_at = new Date();
	}
}

exports.updatedBy = function(options) {
	return function(hook) {
		hook.data.updated_by_user_id = getUserIdFromHook(hook);
		hook.data.updated_at = new Date();
	}
}