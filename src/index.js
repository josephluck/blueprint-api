'use strict';
const DynamicMiddleware = require('dynamic-middleware')
const ApiDatabaseHelper = require('./utils/apiDatabaseHelper');

const feathers = require('feathers')
const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const cors = require('cors');

const mainApp = feathers()
const feathersApp = require('./app');

mainApp.options('*', cors())
mainApp.use('/admin', feathersApp)

feathersApp.service('projects').find().then((projects) => {
  projects.data.forEach((project) => {
    const projectDatabaseData = ApiDatabaseHelper.generateProjectDb(project.resources);
    console.log(projectDatabaseData);
    const projectJsonServer = jsonServer.create();
    const projectRouter = jsonServer.router(projectDatabaseData);
    projectJsonServer.use(bodyParser.json());
    projectJsonServer.use(jsonServer.defaults());
    projectJsonServer.use(projectRouter);
    mainApp.use(`/api/${project._id}`, projectJsonServer);
  })
});

const port = feathersApp.get('port');
const server = mainApp.listen(port);
server.on('listening', () =>
  console.log(`Feathers app started on ${feathersApp.get('host')}:${port}`)
);