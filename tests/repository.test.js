const assert = require('assert');
exports['project exposes an executable test command'] = () => {
  const p = require('../package.json');
  assert.strictEqual(p.scripts.test, 'node tests/run.js');
  assert.strictEqual(p.license, 'Apache-2.0');
};
