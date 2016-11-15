'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'collaborators.db'),
    autoload: true
  });

  let options = {
    Model: db
  };

  // Initialize our service with any options it requires
  app.use('/collaborators', service(options));

  // Get our initialize service to that we can bind hooks
  const collaboratorsService = app.service('/collaborators');

  // Set up our before hooks
  collaboratorsService.before(hooks.before);

  // Set up our after hooks
  collaboratorsService.after(hooks.after);
};
