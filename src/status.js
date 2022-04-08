'use strict';
const http=require('http'),https=require('https');
function probe(url,{timeoutMs=1500}={}){
 return new Promise(resolve=>{
  const start=Date.now();let done=false;
  const finish=(state,detail)=>{if(done)return;done=true;clearTimeout(timer);resolve({state,detail,latencyMs:Date.now()-start,observedAt:new Date().toISOString()});};
  const req=(url.startsWith('https:')?https:http).get(url,res=>{let text='';res.on('data',c=>text+=c);res.on('end',()=>{if(res.statusCode!==200)return finish('unhealthy',`HTTP ${res.statusCode}`);try{const data=JSON.parse(text);finish(['ok','ready'].includes(data.status)?'ready':'unhealthy',data.status||'Unexpected health response');}catch{finish('unhealthy','Invalid health response');}});res.on('error',()=>finish('unavailable','Connection closed'));});
  const timer=setTimeout(()=>{finish('unavailable','Probe deadline exceeded');req.destroy();},timeoutMs);
  req.on('error',()=>finish('unavailable','Connection failed'));
 });
}
async function probeAll(services,{concurrency=4,...options}={}){
 if(!Number.isInteger(concurrency)||concurrency<1||concurrency>20)throw Error('Invalid probe concurrency');
 const results=new Array(services.length);let cursor=0;
 async function worker(){while(cursor<services.length){const i=cursor++,service=services[i];results[i]={name:service.name,...await probe(service.url,options)};}}
 await Promise.all(Array.from({length:Math.min(concurrency,services.length)},worker));return results;
}
module.exports={probe,probeAll};
