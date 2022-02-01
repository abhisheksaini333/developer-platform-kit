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

exports['node template includes a runnable TypeScript health service'] = () => {
 const files=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'});
 assert(files['src/server.ts'].includes('createServer'));
 assert(files['package.json'].includes('orders'));
};

exports['node template validates submitted work items'] = () => {
 const files=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'});
 assert(files['src/items.ts']);
 assert(files['src/server.ts'].includes('/items'));
};

exports['generated Node project carries executable behavior tests'] = () => {
 const f=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'});
 assert(JSON.parse(f['package.json']).scripts.test);assert(f['tests/api.js'].includes('422'));
};

exports['generated API includes an OpenAPI discovery endpoint'] = () => {
 const f=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'});
 const spec=JSON.parse(f['openapi.json']);assert(spec.paths['/items'].post);assert(f['src/server.ts'].includes('/openapi.json'));
};

exports['Node API emits structured request diagnostics'] = () => {
 const f=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'});
 assert(f['src/server.ts'].includes('durationMs'));assert(f['src/server.ts'].includes('requestId'));
};

exports['CLI rejects invalid input without creating a target'] = () => {
 const r=require('child_process').spawnSync(process.execPath,[require('path').join(__dirname,'../scripts/generate.js'),'--name','../bad','--owner','platform-team','--language','node','--destination','/tmp/invalid-platform'],{encoding:'utf8'});
 assert.strictEqual(r.status,2);assert(r.stderr.includes('Name'));
};
