'use strict'

const dynamicMiddleware = require('dynamic-middleware')
const feathers = require('feathers')
const socketio = require('feathers-socketio')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')

const app = feathers()
app.configure(socketio())

const adminApp = require('./app')
const apiDatabaseHelper = require('./utils/apiDatabaseHelper')
const existingProjectApis = {}

const setupProjectApi = (project, existingProjectApis, app) => {
  let existingProjectMiddleware = existingProjectApis[project._id]

  let projectDatabaseData = apiDatabaseHelper.generateProjectDb(project.resources)
  let projectJsonServer = jsonServer.create()
  let projectRouter = jsonServer.router(projectDatabaseData)
  projectJsonServer.use(bodyParser.json())
  projectJsonServer.use(jsonServer.defaults())
  projectJsonServer.use(projectRouter)

  if (existingProjectMiddleware) {
    let newProjectMiddleware = existingProjectMiddleware.replace(projectJsonServer)
    existingProjectMiddleware = newProjectMiddleware
  } else {
    let newProjectMiddleware = dynamicMiddleware.create(projectJsonServer)
    existingProjectApis[project._id] = newProjectMiddleware
    app.use(`/api/${project._id}`, newProjectMiddleware.handler())
  }
}

const removeProjectApi = (project, existingProjectApis) => {
  let middleware = existingProjectApis[project._id]
  if (middleware) {
    middleware.disable()
  }
}

adminApp.service('projects').find().then((projects) => {
  projects.data.forEach((project) => {
    setupProjectApi(project, existingProjectApis, app)
  })
})
adminApp.service('projects').on('created', (project) => {
  setupProjectApi(project, existingProjectApis, app)
})
adminApp.service('projects').on('updated', (project) => {
  setupProjectApi(project, existingProjectApis, app)
})
adminApp.service('projects').on('patched', (project) => {
  setupProjectApi(project, existingProjectApis, app)
})
adminApp.service('projects').on('removed', (project) => {
  removeProjectApi(project, existingProjectApis)
})

app.use('/admin', adminApp)

const port = 3030
const server = app.listen(port)