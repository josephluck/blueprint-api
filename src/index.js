'use strict';

const feathers = require('feathers')
const cors = require('cors');

const mainApp = feathers()
const feathersApp = require('./app');
const apiApp = feathers()

mainApp.options('*', cors())
mainApp.use('/admin', feathersApp)
mainApp.use('/api', apiApp);

feathersApp.service('projects').on('updated', (project) => {
  console.log('Updated project');
});

const port = feathersApp.get('port');
const server = mainApp.listen(port);
server.on('listening', () =>
  console.log(`Feathers app started on ${feathersApp.get('host')}:${port}`)
);