import http, { IncomingMessage, ServerResponse } from 'http';
export function createServer() {
 return http.createServer(async (req: IncomingMessage,res: ServerResponse) => {
  res.setHeader('Content-Type','application/json');
  if(req.method==='GET' && req.url==='/health') {res.end(JSON.stringify({status:'ok',service:'__NAME__'}));return;}
  res.statusCode=404;res.end(JSON.stringify({error:'Not found'}));
 });
}
if(require.main===module) createServer().listen(Number(process.env.PORT || 4605),'0.0.0.0');
