const assert=require('assert');
const {request}=require('./helpers');
exports['catalog routing preserves filters and entity endpoint paths']=async()=>{
 const express=require('express'),router=express.Router();
 router.get('/entities',(req,res)=>res.json({filter:req.query.filter}));
 router.get('/entities/by-name/:kind/:namespace/:name',(req,res)=>res.json(req.params));
 const runtime=await require('../src/server').start(0,{catalogFactory:async()=>({router,stop:async()=>{}})});
 try{await runtime.ready;const p=runtime.server.address().port;assert.deepStrictEqual((await request(p,'/api/catalog/entities?filter=kind=component')).body,{filter:'kind=component'});assert.strictEqual((await request(p,'/api/catalog/entities/by-name/component/default/orders')).body.name,'orders');}finally{await runtime.stop();}
};
