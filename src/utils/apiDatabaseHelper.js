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

const generatePropertyValue = function(property) {
  if (property.type === 'random') {
    return generateRandomPropertyValue(property);
  }
  return "Hey";
}

const generateModel = function(model) {
  let data = {};
  for (let i = 0, x = model.length; i < x; i++) {
    data[model[i].key] = generatePropertyValue(model[i]);
  }
  return data;
}

const generateResource = function(resource) {
  if (resource.type === 'collection') {
    let data = [];
    for (let i = 0, x = parseInt(resource.numberOfRecords); i < x; i++) {
      if (resource.model) {
        let modelData = generateModel(resource.model);
        modelData.id = i + 1;
        data.push(modelData);
      }
    }
    return data;
  }
}

const generateProjectDb = function (resources) {
  let db = {};
  resources.forEach((resource) => {
    db[resource.name] = generateResource(resource);
  })
  return db;
}

module.exports = {
  generateProjectDb
};
