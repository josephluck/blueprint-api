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
mainApp.use('/admin', feathersApp)
mainApp.use('/api', apiApp);

feathersApp.service('projects').find().then((projects) => {
  let jsonData = {
    "posts": [
      {
        "id": 1,
        "title": "json-server",
        "author": "typicode"
      }
    ],
    "comments": [
      {
        "id": 1,
        "comment": "Hey"
      }
    ]
  };
  apiRouter.replace(jsonServer.router(jsonData));
});

// feathersApp.service('projects').on('updated', (project) => {
//   console.log('Updated project');
// });

const port = feathersApp.get('port');
const server = mainApp.listen(port);
server.on('listening', () =>
  console.log(`Feathers app started on ${feathersApp.get('host')}:${port}`)
);