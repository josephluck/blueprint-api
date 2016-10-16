'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('company service', function() {
  it('registered the companies service', () => {
    assert.ok(app.service('companies'));
  });
});
