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
module.exports={LoginTransactions};
