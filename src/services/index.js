'use strict';
const collaborators = require('./collaborators');
const project = require('./project');
const authentication = require('./authentication');
const user = require('./user');

module.exports = function() {
  const app = this;

  app.configure(authentication);
  app.configure(user);
  app.configure(project);
  app.configure(collaborators);
};
