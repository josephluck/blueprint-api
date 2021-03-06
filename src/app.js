'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
app.options('*', cors())
app.use(cors())
app.use(favicon( path.join(app.get('public'), 'favicon.ico') ))
app.use('/', serveStatic( app.get('public') ))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.configure(hooks())
app.configure(rest())
app.configure(socketio())
app.configure(services)
app.configure(middleware);

module.exports = app;
