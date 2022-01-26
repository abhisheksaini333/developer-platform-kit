const assert=require('assert'),http=require('http');
http.get('http://localhost:4600/api/catalog/entities',res=>{
 let body='';res.on('data',c=>body+=c);res.on('end',()=>{
  const entities=JSON.parse(body);assert.strictEqual(res.statusCode,200);
  const service=entities.find(e=>e.metadata.name==='platform-api');assert(service);
  assert(service.relations.some(r=>r.type==='ownedBy' && r.target.name==='platform-team'));
  console.log(`Actual Backstage catalog returned ${entities.length} entities with ownership relations`);
 });
}).on('error',e=>{console.error(e);process.exitCode=1;});
