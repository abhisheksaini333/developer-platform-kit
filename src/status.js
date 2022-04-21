'use strict';
const http=require('http'),https=require('https');
function validateProbeUrl(value,allowedHosts=['localhost','127.0.0.1','host.docker.internal']){
 const url=new URL(value);if(!['http:','https:'].includes(url.protocol))throw Error('Only HTTP probes are supported');if(url.username||url.password)throw Error('Probe URLs must not contain credentials');if(!allowedHosts.includes(url.hostname))throw Error('Probe host is not allowed');return url;
}
function probe(url,{timeoutMs=1500,allowedHosts}={}){
 validateProbeUrl(url,allowedHosts);
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
class StatusStore{
 constructor(services,{ttlMs=5000,now=Date.now,...options}={}){this.services=services;this.ttlMs=ttlMs;this.now=now;this.options=options;this.cached=null;this.pending=null;this.updated=0;}
 async read(){if(this.cached&&this.now()-this.updated<this.ttlMs)return this.cached;if(!this.pending)this.pending=probeAll(this.services,this.options).then(values=>{this.cached=values;this.updated=this.now();return values;}).finally(()=>{this.pending=null;});return this.pending;}
}
module.exports={probe,probeAll,StatusStore,validateProbeUrl};
