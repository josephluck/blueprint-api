'use strict';

const faker = require('faker');

const generateRandomPropertyValue = function(property) {
  if (property.randomCategory && property.randomSubcategory) {
    let args = [];
    if (property.randomParams) {
      let keys = Object.keys(property.randomParams);
      args = keys.map((key) => property.randomParams[key]);
    }
    return faker[property.randomCategory][property.randomSubcategory].apply(null, args);
  }
  return null;
}

/* ------------------------------------------------------------
  This is used when a model has a key whose value is from
  another (existing) resource.
  Common use cases for this are relations for example:
  comments: [{
    comment: 'Cool app, bro',
    createdByUserId: 123 <-- from another resource
  }]
------------------------------------------------------------ */
const generateValueFromAnotherResource = function(property, resources) {
  let otherResource = resources.find(res => res.name === property.childResourceName);
  console.log('Implement me');
  return generateResource(otherResource, resources);
}

const generatePropertyValue = function(property, resources) {
  if (property.type === 'random') {
    return generateRandomPropertyValue(property);
  } else if (property.type === 'nestedJson') {
    /* ------------------------------------------------------------
      This is used there's a nested JSON object under a key
      for instance:
      createdByUserId: {id: 1, name: 'Joseph', surname: 'Luck'},
      tel: [{id: 1, no: 01234567890}, {id: 2, no: 07912874984}]
    ------------------------------------------------------------ */
    return this.generateResource(property, resources);
  } else if (property.type === 'anotherResource') {
    return this.generateValueFromAnotherResource(property, resources);
  }
  return "Hey";
}

const generateModel = function(model, resources) {
  let data = {};
  for (let i = 0, x = model.length; i < x; i++) {
    data[model[i].key] = generatePropertyValue(model[i], resources);
  }
  return data;
}

const generateResource = function(resource, resources) {
  if (resource.type === 'collection') {
    let data = [];
    for (let i = 0, x = parseInt(resource.numberOfRecords); i < x; i++) {
      if (resource.model) {
        let modelData = generateModel(resource.model, resources);
        modelData.id = i + 1;
        data.push(modelData);
      }
    }
    return data;
  }
  if (resource.model) {
    return generateModel(resource.model, resources);
  }
}

const generateProjectDb = function (resources) {
  let db = {};
  resources.forEach((resource) => {
    db[resource.name] = generateResource(resource, resources);
  })
  return db;
}

module.exports = {
  generateProjectDb
};
