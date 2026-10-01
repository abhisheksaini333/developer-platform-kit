'use strict';
const express=require('express'),path=require('path');
const {createCatalog}=require('./backstage');
async function start(port=Number(process.env.PORT||4600),options={}) {
 const app=express();app.disable('x-powered-by');app.use(express.json({limit:'64kb'}));
 app.get('/health',(_req,res)=>res.json({status:'ok'}));
 const auth=options.auth||require('./auth').createAuth({issuer:process.env.OIDC_ISSUER,baseUrl:process.env.APP_BASE_URL});
 app.use(require('cookie-parser')());app.use(auth.router);
 const templates=require('./templates'),fs=require('fs');
 const workspace=options.workspace||path.join(__dirname,'../.generated/services');fs.mkdirSync(workspace,{recursive:true});
 app.post('/api/templates/generate',auth.requireDeveloper,(req,res)=>{const errors=templates.validateInput(req.body);if(errors.length)return res.status(422).json({error:errors.join('; ')});try{const result=templates.generate(req.body,path.join(workspace,req.body.name));res.status(201).json({name:result.name,commands:req.body.language==='dotnet'?['cd '+result.path,'dotnet build','dotnet run']:['cd '+result.path,'npm install','npm test','npm start']});}catch(error){res.status(error.message.includes('exists')?409:422).json({error:error.message});}});
 app.post('/api/templates/preview',(req,res)=>{try{res.json(templates.preview(req.body));}catch(error){res.status(422).json({error:error.message});}});
 const status=require('./status');
 const services=options.services||[{name:'sample-service',url:process.env.SERVICE_URL||'http://127.0.0.1:4605/ready'}];
 const statusStore=new status.StatusStore(services);
 app.get('/api/status',async(_req,res,next)=>{try{const observations=await statusStore.read();res.json({services:observations});}catch(error){next(error);}});
 app.get('/api/deployment',async(_req,res)=>res.json(await require('./deployment').readDeployment()));
 const docs=require('./docs');
 app.get('/api/docs',(_req,res)=>res.json(docs.listDocuments()));
 app.get('/api/docs/:id',(req,res)=>{try{res.json(docs.readDocument(req.params.id));}catch{res.status(404).json({error:'Document not found'});}});
 let catalog,failed=false;
 const ready=(options.catalogFactory||createCatalog)().then(c=>{catalog=c;}).catch(error=>{failed=true;console.error('Catalog unavailable:',error.message);});
 app.use('/api/catalog',(req,res,next)=>['GET','HEAD'].includes(req.method)?next():auth.requireDeveloper(req,res,next));
 app.use('/api/catalog',(req,res,next)=>catalog?catalog.router(req,res,next):res.status(503).json({error:failed?'Catalog unavailable':'Catalog is starting'}));
 app.use('/api',(_req,res)=>res.status(404).json({error:'API resource not found'}));
 app.use(express.static(path.join(__dirname,'../dist')));
 app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'../dist/index.html')));
 app.use((error,_req,res,_next)=>{console.error(error.message);res.status(error.status||500).json({error:error.status===400?'Invalid JSON':'Platform request failed'});});
 let server;try{server=await new Promise((resolve,reject)=>{const s=app.listen(port,'127.0.0.1',()=>{s.removeListener('error',reject);resolve(s);});s.once('error',reject);});}catch(error){await ready;if(catalog)await catalog.stop();throw error;}
 return {app,server,ready,stop:async()=>{await new Promise(resolve=>server.close(resolve));await ready;if(catalog)await catalog.stop();}};
}
if(require.main===module) start().then(runtime=>{console.log(`Platform listening on http://localhost:${runtime.server.address().port}`);for(const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>runtime.stop().then(()=>process.exit(0)));}).catch(error=>{console.error(error);process.exitCode=1;});
module.exports={start};
