const assert=require('assert');
const {request}=require('./helpers');
exports['catalog outage leaves platform health and documentation available'] = async()=>{
 const runtime=await require('../src/server').start(0,{catalogFactory:async()=>{throw Error('db offline')}});
 try{await runtime.ready;const port=runtime.server.address().port;assert.strictEqual((await request(port,'/health')).status,200);assert.strictEqual((await request(port,'/api/docs')).status,200);assert.strictEqual((await request(port,'/api/catalog/entities')).status,503);}finally{await runtime.stop();}
};

exports['template API validates requests and previews files'] = async()=>{const runtime=await require('../src/server').start(0,{catalogFactory:async()=>{throw Error('offline')}});try{const p=runtime.server.address().port;assert.strictEqual((await request(p,'/api/templates/preview','POST',{})).status,422);const r=await request(p,'/api/templates/preview','POST',{name:'orders',owner:'platform-team',language:'node'});assert.strictEqual(r.status,200);assert(r.body.files.includes('src/server.ts'));}finally{await runtime.stop();}};

exports['template API creates projects only under its configured workspace'] = async()=>{const fs=require('fs'),os=require('os'),path=require('path'),root=fs.mkdtempSync(path.join(os.tmpdir(),'workspace-'));const runtime=await require('../src/server').start(0,{workspace:root,catalogFactory:async()=>{throw Error('offline')}});try{const p=runtime.server.address().port;const r=await request(p,'/api/templates/generate','POST',{name:'orders',owner:'platform-team',language:'node',destination:'/etc'});assert.strictEqual(r.status,201);assert(fs.existsSync(path.join(root,'orders','src/server.ts')));assert.strictEqual((await request(p,'/api/templates/generate','POST',{name:'orders',owner:'platform-team',language:'node'})).status,409);}finally{await runtime.stop();fs.rmSync(root,{recursive:true,force:true});}};
