'use strict';
const fs = require('fs');
const path = require('path');
(async () => {
  let failed = 0, passed = 0;
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'));
  for (const file of files) {
    for (const [name, test] of Object.entries(require(path.join(__dirname, file)))) {
      try { await test(); console.log(`PASS ${file}: ${name}`); passed++; }
      catch (error) { console.error(`FAIL ${file}: ${name}\n${error.stack}`); failed++; }
    }
  }
  console.log(`${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
})();
