'use strict';

module.exports = function(app) {
  return function(req, res, next) {
    const body = req.body;
    app.service('users').create({
      email: body.email,
      name: body.name,
      password: body.password
    })
    .then((user) => {
      res.send(user)
    })
    .catch(next);
  };
};