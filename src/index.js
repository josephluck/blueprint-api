'use strict';
const DynamicMiddleware = require('dynamic-middleware')

const feathers = require('feathers')
const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const cors = require('cors');

const mainApp = feathers()
const feathersApp = require('./app');

const apiApp = jsonServer.create();
const apiRouter = DynamicMiddleware.create(jsonServer.router({
  "posts": []
}));
apiApp.use(bodyParser.json());
apiApp.use(jsonServer.defaults());
apiApp.use(apiRouter.handler());

mainApp.options('*', cors())
// mainApp.use('/admin', feathersApp)
// mainApp.use('/api', apiApp);

const generateProjectDatabaseData = function (resources) {
  // let db = {};
  // resources.forEach((resource) => {
  //   db[resource.name] = resource;
  // })
  // return db;
  return {
    users: [
      {
        id: 1,
        name: 'joseph'
      }
    ]
  }
}

feathersApp.service('projects').find().then((projects) => {
  projects.data.forEach((project) => {
    const projectDatabaseData = generateProjectDatabaseData(project.resources);
    const projectJsonServer = jsonServer.create();
    const projectRouter = jsonServer.router(projectDatabaseData);
    projectJsonServer.use(bodyParser.json());
    projectJsonServer.use(jsonServer.defaults());
    projectJsonServer.use(projectRouter);
    mainApp.use(`/api/${project._id}`, projectJsonServer);
  })
});

// feathersApp.service('projects').on('updated', (project) => {
//   console.log('Updated project');
// });

const port = feathersApp.get('port');
const server = mainApp.listen(port);
server.on('listening', () =>
  console.log(`Feathers app started on ${feathersApp.get('host')}:${port}`)
);