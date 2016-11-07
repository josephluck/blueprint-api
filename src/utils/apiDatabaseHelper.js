'use strict';

const generatePropertyValue = function(property) {
  let data = "Hey!";
  return data;
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
