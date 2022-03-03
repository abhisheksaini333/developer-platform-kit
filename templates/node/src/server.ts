import http, { IncomingMessage, ServerResponse } from 'http';
import {randomUUID} from 'crypto';
import {Item,validateItem} from './items';
export function createServer() {
 const items:Item[]=[];let draining=false;
 const server=http.createServer(async (req: IncomingMessage,res: ServerResponse) => {
  const started=process.hrtime.bigint(),requestId=randomUUID();
  res.setHeader('X-Request-Id',requestId);
  res.on('finish',()=>console.log(JSON.stringify({requestId,method:req.method,path:(req.url || '').split('?')[0],status:res.statusCode,durationMs:Number(process.hrtime.bigint()-started)/1e6})));
  res.setHeader('Content-Type','application/json');
  if(req.method==='GET' && req.url==='/openapi.json') {res.end(JSON.stringify(require('../openapi.json')));return;}
  if(req.method==='GET' && req.url==='/ready') {const ready=!draining && process.env.READY!=='false';res.statusCode=ready?200:503;res.end(JSON.stringify({status:ready?'ready':'unavailable'}));return;}
  if(req.method==='GET' && req.url==='/health') {res.end(JSON.stringify({status:'ok',service:'__NAME__'}));return;}
  if(req.url==='/items' && req.method==='GET') {res.end(JSON.stringify(items));return;}
  if(req.url==='/items' && req.method==='POST') {
   if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json')) {res.statusCode=415;res.end(JSON.stringify({error:'Use application/json'}));return;}
   let body='';for await(const chunk of req) {body+=chunk;if(Buffer.byteLength(body)>65536){res.statusCode=413;res.end(JSON.stringify({error:'Body exceeds 64 KiB'}));return;}}
   let value;try {value=JSON.parse(body);}catch {res.statusCode=400;res.end(JSON.stringify({error:'Invalid JSON'}));return;}
   const error=validateItem(value);if(error) {res.statusCode=422;res.end(JSON.stringify({error}));return;}
   const item={id:items.length+1,title:value.title.trim()};items.push(item);res.statusCode=201;res.end(JSON.stringify(item));return;
  }
  res.statusCode=404;res.end(JSON.stringify({error:'Not found'}));
 });
 (server as any).drain=()=>{draining=true;};return server;
}
if(require.main===module) {
 const server=createServer();server.listen(Number(process.env.PORT || __PORT__),'0.0.0.0');
 const stop=()=>{(server as any).drain();server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),10000).unref();};
 process.once('SIGTERM',stop);process.once('SIGINT',stop);
}
