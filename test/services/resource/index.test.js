'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('resource service', function() {
  it('registered the resources service', () => {
    assert.ok(app.service('resources'));
  });
});
