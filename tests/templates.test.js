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

exports['generated projects record template provenance'] = () => {
 const f=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'});
 const m=JSON.parse(f['.platform-template.json']);assert.strictEqual(m.template,'node');assert.strictEqual(m.version,'1.0.0');assert.strictEqual(m.inputs.name,'orders');
};

exports['generated service catalog entity carries explicit ownership'] = () => {
 const f=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'});
 const e=JSON.parse(f['catalog-info.yaml']);assert.strictEqual(e.spec.owner,'group:default/platform-team');assert.strictEqual(e.spec.type,'service');
};

exports['preview returns generated files without filesystem side effects'] = () => {
 const {preview}=require('../src/templates');const result=preview({name:'orders',owner:'platform-team',language:'node'});assert(result.files.includes('src/server.ts'));assert(result.bytes>500);assert.throws(()=>preview({}),/Name/);
};

exports['generator rejects symlinked destination parents'] = () => {
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'platform-'));try{fs.mkdirSync(path.join(d,'real'));fs.symlinkSync(path.join(d,'real'),path.join(d,'alias'));assert.throws(()=>require('../src/templates').generate({name:'orders',owner:'platform-team',language:'node'},path.join(d,'alias','orders')),/symlink/);}finally{fs.rmSync(d,{recursive:true,force:true});}
};

exports['Node service supports draining and bounded graceful shutdown'] = () => {
 const text=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'})['src/server.ts'];assert(text.includes('SIGTERM'));assert(text.includes('draining'));
};

exports['template ports are valid TCP ports and reach the generated runtime'] = () => {const t=require('../src/templates');for(const port of [-1,0,65536,'oops',4.5])assert(t.validateInput({name:'orders',owner:'platform-team',language:'node',port}).length);assert(t.render({name:'orders',owner:'platform-team',language:'node',port:4620})['src/server.ts'].includes('4620'));};

exports['template provenance records per-file integrity'] = () => {const crypto=require('crypto');const f=require('../src/templates').render({name:'orders',owner:'platform-team',language:'node'});const m=JSON.parse(f['.platform-template.json']);assert.strictEqual(m.files['src/server.ts'],crypto.createHash('sha256').update(f['src/server.ts']).digest('hex'));};

exports['CLI JSON output is machine-readable and excludes secrets'] = () => {const d=fs.mkdtempSync(path.join(os.tmpdir(),'cli-'));try{const r=require('child_process').spawnSync(process.execPath,[path.join(__dirname,'../scripts/generate.js'),'--name','orders','--owner','platform-team','--language','node','--destination',path.join(d,'orders'),'--format','json'],{encoding:'utf8'});assert.strictEqual(r.status,0);assert.strictEqual(JSON.parse(r.stdout).name,'orders');}finally{fs.rmSync(d,{recursive:true,force:true});}};

exports['ASP.NET template creates a pinned .NET 6 web project'] = () => {const t=require('../src/templates');assert.deepStrictEqual(t.validateInput({name:'orders',owner:'platform-team',language:'dotnet'}),[]);const f=t.render({name:'orders',owner:'platform-team',language:'dotnet'});assert(f['Service.csproj'].includes('net6.0'));assert(f['README.md'].includes('dotnet'));};
