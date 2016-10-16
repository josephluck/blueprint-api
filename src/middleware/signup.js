'use strict';

module.exports = function(app) {
  return function(req, res, next) {
    const body = req.body;

    app.service('companies').create({
      name: body.company_name
    }).then(company => {
      app.service('users').create({
        email: body.email,
        password: body.password,
        company_id: company._id
      })
      .then(user => res.send(user))
    })
    .catch(next);
  };
};