const assert=require('assert');
const {request}=require('./helpers');
exports['catalog outage leaves platform health and documentation available'] = async()=>{
 const runtime=await require('../src/server').start(0,{catalogFactory:async()=>{throw Error('db offline')}});
 try{await runtime.ready;const port=runtime.server.address().port;assert.strictEqual((await request(port,'/health')).status,200);assert.strictEqual((await request(port,'/api/docs')).status,200);assert.strictEqual((await request(port,'/api/catalog/entities')).status,503);}finally{await runtime.stop();}
};
