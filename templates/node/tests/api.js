const assert=require('assert');
const http=require('http');
const {createServer}=require('../dist/server');
const server=createServer();
function request(port,path,method='GET',body,headers={}) {
 return new Promise((resolve,reject)=>{
  const r=http.request({host:'127.0.0.1',port,path,method,headers:{'Content-Type':'application/json',...headers}},res=>{
   let text='';res.on('data',c=>text+=c);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:JSON.parse(text)}));
  });r.on('error',reject);if(body!==undefined) r.write(typeof body==='string'?body:JSON.stringify(body));r.end();
 });
}
server.listen(0,'127.0.0.1',async()=>{
 try {
  const port=server.address().port;
  assert.strictEqual((await request(port,'/health')).body.status,'ok');
  assert.strictEqual((await request(port,'/items','POST',{title:''})).status,422);
  assert.strictEqual((await request(port,'/items','POST',{title:'First item'})).status,201);
  assert.strictEqual((await request(port,'/items')).body.length,1);
  assert.strictEqual((await request(port,'/missing')).status,404);
  assert.strictEqual((await request(port,'/ready')).body.status,'ready');
  assert.strictEqual((await request(port,'/items','POST',{title:'x'.repeat(70000)})).status,413);
  const bad=await request(port,'/items','POST','{broken');assert.strictEqual(bad.status,400);assert(bad.body.error.includes('JSON'));
  const correlated=await request(port,'/health','GET',undefined,{'X-Request-Id':'request-42'});assert.strictEqual(correlated.headers['x-request-id'],'request-42');
  await new Promise(resolve=>{const socket=require('net').connect(port,'127.0.0.1',()=>{socket.write('POST /items HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: 1000\r\n\r\n{"title":"unfinished');setTimeout(()=>socket.destroy(),20);});socket.on('error',()=>{});socket.on('close',resolve);});
  await new Promise(resolve=>setTimeout(resolve,40));assert.strictEqual((await request(port,'/health')).status,200);
  const concurrent=await Promise.all(Array.from({length:12},(_,i)=>request(port,'/items','POST',{title:'Concurrent '+i})));assert(concurrent.every(r=>r.status===201));assert.strictEqual(new Set(concurrent.map(r=>r.body.id)).size,12);
  assert.strictEqual((await request(port,'/items','POST','plain',{'Content-Type':'text/plain'})).status,415);
  process.env.READY='false';assert.strictEqual((await request(port,'/ready')).status,503);assert.strictEqual((await request(port,'/health')).status,200);delete process.env.READY;
  console.log('Generated service API checks passed');
 } catch(error) {console.error(error);process.exitCode=1;}finally{server.close();}
});
