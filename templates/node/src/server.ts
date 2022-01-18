import http, { IncomingMessage, ServerResponse } from 'http';
import {Item,validateItem} from './items';
export function createServer() {
 const items:Item[]=[];
 return http.createServer(async (req: IncomingMessage,res: ServerResponse) => {
  res.setHeader('Content-Type','application/json');
  if(req.method==='GET' && req.url==='/openapi.json') {res.end(JSON.stringify(require('../openapi.json')));return;}
  if(req.method==='GET' && req.url==='/health') {res.end(JSON.stringify({status:'ok',service:'__NAME__'}));return;}
  if(req.url==='/items' && req.method==='GET') {res.end(JSON.stringify(items));return;}
  if(req.url==='/items' && req.method==='POST') {
   let body='';for await(const chunk of req) body+=chunk;
   let value;try {value=JSON.parse(body);}catch {res.statusCode=400;res.end(JSON.stringify({error:'Invalid JSON'}));return;}
   const error=validateItem(value);if(error) {res.statusCode=422;res.end(JSON.stringify({error}));return;}
   const item={id:items.length+1,title:value.title.trim()};items.push(item);res.statusCode=201;res.end(JSON.stringify(item));return;
  }
  res.statusCode=404;res.end(JSON.stringify({error:'Not found'}));
 });
}
if(require.main===module) createServer().listen(Number(process.env.PORT || 4605),'0.0.0.0');
