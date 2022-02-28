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
module.exports={probe};
