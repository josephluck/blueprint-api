'use strict'
const DynamicMiddleware = require('dynamic-middleware')
const ApiDatabaseHelper = require('./utils/apiDatabaseHelper')
const Feathers = require('feathers')
const Socketio = require('feathers-socketio')
const BodyParser = require('body-parser')
const JsonServer = require('json-server')

const app = Feathers()

app.configure(Socketio())

const projectJsonServers = {}

const adminApp = require('./app')

const setupProjectApi = (project) => {
  console.log('----------------------------------------------')
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
    console.log('Updating project', project._id, projectDatabaseData)
  } else {
    let newProjectMiddleware = DynamicMiddleware.create(projectJsonServer)
    projectJsonServers[project._id] = newProjectMiddleware
    app.use(`/api/${project._id}`, newProjectMiddleware.handler())
    console.log('Creating project', project._id, projectDatabaseData)
  }
  console.log('----------------------------------------------')
}

// Set up projects apis initially
adminApp.service('projects').find().then((projects) => {
  projects.data.forEach(setupProjectApi)
  console.log('Finished setting up projects')
  console.log('----------------------------------------------')
})

// Update project api when changed
adminApp.service('projects').on('updated', (project) => {
  console.log('Should update', project._id)
  setupProjectApi(project)
})

app.use('/admin', adminApp)

const port = adminApp.get('port')
const server = app.listen(port)
adminApp.setup(server)
server.on('listening', () =>
  console.log(`Feathers app started on ${adminApp.get('host')}:${port}`)
)