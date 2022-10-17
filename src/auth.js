'use strict';
const crypto=require('crypto');
const random=()=>crypto.randomBytes(32).toString('base64url');
class LoginTransactions {
 constructor({now=Date.now,ttlMs=300000,limit=1000}={}){this.now=now;this.ttlMs=ttlMs;this.limit=limit;this.entries=new Map();}
 consume(state,binding){
  const entry=this.entries.get(state);if(!entry||typeof binding!=='string'||binding.length!==entry.binding.length||!crypto.timingSafeEqual(Buffer.from(binding),Buffer.from(entry.binding)))throw Error('Invalid login state');
  this.entries.delete(state);if(entry.expires<=this.now())throw Error('Login transaction expired');return entry;
 }
 begin(returnTo='/catalog'){
  if(typeof returnTo!=='string'||!returnTo.startsWith('/')||returnTo.startsWith('//')||returnTo.includes('\\')||/[\r\n]/.test(returnTo))throw Error('Invalid return path');
  for(const [key,value]of this.entries)if(value.expires<=this.now())this.entries.delete(key);
  if(this.entries.size>=this.limit)throw Error('Too many pending sign-ins');
  const value={state:random(),binding:random(),verifier:random(),nonce:random(),returnTo,expires:this.now()+this.ttlMs};
  this.entries.set(value.state,value);return {...value,challenge:crypto.createHash('sha256').update(value.verifier).digest('base64url')};
 }
}
class TokenVerifier {
 constructor({issuer,clientId,key}){this.issuer=issuer;this.clientId=clientId;this.key=key||require('jose').createRemoteJWKSet(new URL(issuer+'/protocol/openid-connect/certs'),{timeoutDuration:1500});}
 async verify(token,nonce){const {payload}=await require('jose').jwtVerify(token,this.key,{issuer:this.issuer,audience:this.clientId,algorithms:['RS256'],clockTolerance:5});if(!payload.sub)throw Error('Missing token subject');if(nonce!==undefined&&payload.nonce!==nonce)throw Error('Invalid token nonce');return payload;}
}
function requestJson(url,{method='GET',headers={},body,timeoutMs=2000}={}){
 return new Promise((resolve,reject)=>{const parsed=new URL(url),transport=parsed.protocol==='https:'?require('https'):require('http');let done=false;
  const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);error?reject(error):resolve(value);};
  const req=transport.request(parsed,{method,headers},res=>{let chunks=[],size=0;res.on('data',chunk=>{size+=chunk.length;if(size>65536){finish(Error('Identity response too large'));req.destroy();}else chunks.push(chunk);});res.on('end',()=>{if(res.statusCode!==200)return finish(Error('Identity request failed'));try{finish(null,JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{finish(Error('Invalid identity response'));}});res.on('error',()=>finish(Error('Identity response interrupted')));});
  const timer=setTimeout(()=>{finish(Error('Identity request timed out'));req.destroy();},timeoutMs);req.on('error',()=>finish(Error('Identity connection failed')));req.end(body);
 });
}
module.exports={LoginTransactions,TokenVerifier,requestJson};
