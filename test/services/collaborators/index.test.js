'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('collaborators service', function() {
  it('registered the collaborators service', () => {
    assert.ok(app.service('collaborators'));
  });
});
