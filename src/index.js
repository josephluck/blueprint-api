'use strict'

const DynamicMiddleware = require('dynamic-middleware')
const ApiDatabaseHelper = require('./utils/apiDatabaseHelper')
const Feathers = require('feathers')
const Socketio = require('feathers-socketio')
const BodyParser = require('body-parser')
const JsonServer = require('json-server')
const app = Feathers()
const adminApp = require('./app')
const projectJsonServers = {}

const setupProjectApi = (project) => {
  let existingProjectMiddleware = projectJsonServers[project._id]

  let projectDatabaseData = ApiDatabaseHelper.generateProjectDb(project.resources)
  let projectJsonServer = JsonServer.create()
  let projectRouter = JsonServer.router(projectDatabaseData)
  projectJsonServer.use(BodyParser.json())
  projectJsonServer.use(JsonServer.defaults())
  projectJsonServer.use(projectRouter)

  if (existingProjectMiddleware) {
    let newProjectMiddleware = existingProjectMiddleware.replace(projectJsonServer)
    existingProjectMiddleware = newProjectMiddleware
  } else {
    let newProjectMiddleware = DynamicMiddleware.create(projectJsonServer)
    projectJsonServers[project._id] = newProjectMiddleware
    app.use(`/api/${project._id}`, newProjectMiddleware.handler())
  }
}

const removeProjectApi = (project) => {
  let existingProjectMiddleware = projectJsonServers[project._id]
  if (existingProjectMiddleware) {
    existingProjectMiddleware.disable()
  }
}

// Set up projects apis initially
adminApp.service('projects').find().then((projects) => projects.data.forEach(setupProjectApi))

// Create new project api when new project is created
adminApp.service('projects').on('created', project => setupProjectApi(project))

// Update project api when changed
adminApp.service('projects').on('updated', project => setupProjectApi(project))
adminApp.service('projects').on('patched', project => setupProjectApi(project))

// Remove project api when deleted
adminApp.service('projects').on('deleted', project => removeProjectApi(project))

app.use('/admin', adminApp)
app.configure(Socketio())

const port = adminApp.get('port')
const server = app.listen(port)
adminApp.setup(server)