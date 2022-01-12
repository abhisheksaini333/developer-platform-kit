const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

exports['template contract rejects unsafe names and unknown language'] = () => {
 const {validateInput} = require('../src/templates');
 assert.deepStrictEqual(validateInput({name:'orders-api',owner:'platform-team',language:'node'}),[]);
 for(const input of [{name:'../oops',owner:'platform-team',language:'node'},{name:'orders',owner:'???',language:'node'},{name:'orders',owner:'platform-team',language:'ruby'}]) assert(validateInput(input).length);
};

exports['generator creates a fresh project and refuses overwrite'] = () => {
 const {generate} = require('../src/templates');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'platform-'));
 try {
  const target=path.join(dir,'orders');
  generate({name:'orders',owner:'platform-team',language:'node'},target);
  assert(fs.existsSync(path.join(target,'README.md')));
  assert.throws(()=>generate({name:'orders',owner:'platform-team',language:'node'},target),/exists/);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
};
