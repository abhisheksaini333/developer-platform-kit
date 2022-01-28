'use strict';
const express=require('express'),path=require('path');
const {createCatalog}=require('./backstage');
async function start(port=Number(process.env.PORT||4600)) {
 const app=express();
 app.disable('x-powered-by');
 app.get('/health',(_req,res)=>res.json({status:'ok'}));
 const docs=require('./docs');
 app.get('/api/docs',(_req,res)=>res.json(docs.listDocuments()));
 app.get('/api/docs/:id',(req,res)=>{try{res.json(docs.readDocument(req.params.id));}catch{res.status(404).json({error:'Document not found'});}});
 const catalog=await createCatalog();
 app.use('/api/catalog',catalog.router);
 app.use(express.static(path.join(__dirname,'../dist')));
 app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'../dist/index.html')));
 app.use((error,_req,res,_next)=>{console.error(error.message);res.status(500).json({error:'Platform request failed'});});
 const server=app.listen(port,'127.0.0.1',()=>console.log(`Platform listening on http://localhost:${port}`));
 return {app,server,stop:async()=>{await new Promise(resolve=>server.close(resolve));await catalog.stop();}};
}
if(require.main===module) start().then(runtime=>{for(const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>runtime.stop().then(()=>process.exit(0)));}).catch(error=>{console.error(error);process.exitCode=1;});
module.exports={start};
