'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');
const companyFilter = require('../../filters/company')

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'resources.db'),
    autoload: true
  });

  let options = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/resources', service(options));

  // Get our initialize service to that we can bind hooks
  const resourceService = app.service('/resources');

  // Set up our before hooks
  resourceService.before(hooks.before);

  // Set up our after hooks
  resourceService.after(hooks.after);

  // Set up a filter so that sockets only broadcast resources that have been created against the same company as the
  // user is registered to
  resourceService.filter(companyFilter);
};
