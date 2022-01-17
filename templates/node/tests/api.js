const assert=require('assert');
const http=require('http');
const {createServer}=require('../dist/server');
const server=createServer();
function request(port,path,method='GET',body) {
 return new Promise((resolve,reject)=>{
  const r=http.request({host:'127.0.0.1',port,path,method,headers:{'Content-Type':'application/json'}},res=>{
   let text='';res.on('data',c=>text+=c);res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(text)}));
  });r.on('error',reject);if(body!==undefined) r.write(JSON.stringify(body));r.end();
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
  console.log('Generated service API checks passed');
 } catch(error) {console.error(error);process.exitCode=1;}finally{server.close();}
});
