'use strict'

const faker = require('faker')

/* ------------------------------------------------------------
  Use faker to create a random value given some options
------------------------------------------------------------ */
const generateRandomPropertyValue = function (property) {
  if (property.randomCategory && property.randomSubcategory) {
    let args = []
    if (property.randomParams) {
      let keys = Object.keys(property.randomParams)
      args = keys.map((key) => {
        if (key === 'json') {
          let jsonString = property.randomParams[key]
          try {
            JSON.parse(jsonString)
          } catch (e) {
            return null
          }
          return JSON.parse(jsonString)
        }
        return property.randomParams[key]
      })
    }
    console.log(args)
    return faker[property.randomCategory][property.randomSubcategory].apply(null, args)
  }
  return null
}

/* ------------------------------------------------------------
  Check whether a model is requesting a child resource has
  a model key  that that is also a child resource that is
  the same resource as the model above i.e:

  users: [{
    type: 'anotherResource',
    anotherResourceName: 'comments'
  }]
  comments: [{
    type: 'anotherResource',
    anotherResourceName: 'users'
  }]

  The above will fail since it'll cause an infinite loop of
  generateResource calls.
------------------------------------------------------------ */
const doesResourceCauseInfiniteDataLoop = function (requestedResourceName, otherResource) {
  for (let i = 0, x = otherResource.model.length; i < x; i++) {
    if (otherResource.model[i].type === 'anotherResource') {
      if (otherResource.model[i].otherResourceName === requestedResourceName) {
        return true
      }
    }
  }
  return false
}

/* ------------------------------------------------------------
  This is used when a model has a key whose value is from
  another (existing) resource.
  Common use cases for this are relations for example:
  comments: [{
    comment: 'Cool app, bro',
    createdByUserId: 123 <-- from another resource
  }]
  The options are:
  collection - returns a subset of the array of the resource
  record - returns a random record in the resource
  id - returns a random id from one of the resources records
------------------------------------------------------------ */
const generateValueFromAnotherResource = function (property, model, resource, resources) {
  let otherResource = resources.find(res => res.name === property.otherResourceName)
  if (otherResource) {
    let resourceCausesInfiniteDataLoop = doesResourceCauseInfiniteDataLoop(resource.name, otherResource)
    if (resourceCausesInfiniteDataLoop) {
      return 'ERROR, ' + property.otherResourceName + ' causes infinite data loop'
    }
    let otherResourceData = generateResource(otherResource, resources)

    if (property.anotherResourceMethod === 'collection') {
      if (property.anotherResourceLimit) {
        let limit = parseFloat(property.anotherResourceLimit)
        if (limit > otherResourceData.length) {
          return otherResourceData
        }
        return otherResourceData.slice(0, limit)
      }
      return otherResourceData
    } else if (property.anotherResourceMethod === 'record') {
      return otherResourceData[Math.floor((Math.random() * otherResourceData.length))]
    } else if (property.anotherResourceMethod === 'id') {
      return otherResourceData[Math.floor((Math.random() * otherResourceData.length))].id
    } else {
      return otherResourceData
    }
  }
  return null
}

const generatePredefinedPropertyValue = function (property) {
  if (property.predefinedType === 'string') {
    return property.predefinedValue
  } else if (property.predefinedType === 'number') {
    return parseFloat(property.predefinedValue)
  } else if (property.predefinedType === 'boolean') {
    // Comes in as a string so convert to type bool
    return property.predefinedValue === 'true'
  } else if (property.predefinedType === 'date') {
    return new Date(property.predefinedValue)
  }
  return null
}

const generatePropertyValue = function (property, model, resource, resources) {
  if (property.type === 'random') {
    return generateRandomPropertyValue(property)
  } else if (property.type === 'predefined') {
    return generatePredefinedPropertyValue(property)
  } else if (property.type === 'anotherResource') {
    return generateValueFromAnotherResource(property, model, resource, resources)
  }
  return null
}

const generateModel = function (model, resource, resources) {
  let data = {}
  for (let i = 0, x = model.length; i < x; i++) {
    data[model[i].key] = generatePropertyValue(model[i], model, resource, resources)
  }
  return data
}

const generateResource = function (resource, resources) {
  if (resource.type === 'collection') {
    let data = []
    for (let i = 0, x = parseInt(resource.numberOfRecords); i < x; i++) {
      if (resource.model) {
        let modelData = generateModel(resource.model, resource, resources)
        modelData.id = i + 1
        data.push(modelData)
      }
    }
    return data
  }
  if (resource.model) {
    return generateModel(resource.model, resources)
  }
}

const generateProjectDb = function (resources) {
  let db = {}
  resources.forEach(resource => {
    db[resource.name] = generateResource(resource, resources)
  })
  return db
}

module.exports = {
  generateRandomPropertyValue,
  generateValueFromAnotherResource,
  generatePredefinedPropertyValue,
  generatePropertyValue,
  generateModel,
  generateResource,
  generateProjectDb
}
