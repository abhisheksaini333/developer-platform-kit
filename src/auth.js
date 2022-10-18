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
 async verify(token,nonce){const {payload}=await require('jose').jwtVerify(token,this.key,{issuer:this.issuer,audience:this.clientId,algorithms:['RS256'],clockTolerance:5});if(!payload.sub||typeof payload.exp!=='number')throw Error('Missing token subject or expiry');if(nonce!==undefined&&payload.nonce!==nonce)throw Error('Invalid token nonce');return payload;}
}
function requestJson(url,{method='GET',headers={},body,timeoutMs=2000}={}){
 return new Promise((resolve,reject)=>{const parsed=new URL(url),transport=parsed.protocol==='https:'?require('https'):require('http');let done=false;
  const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);error?reject(error):resolve(value);};
  const req=transport.request(parsed,{method,headers},res=>{let chunks=[],size=0;res.on('data',chunk=>{size+=chunk.length;if(size>65536){finish(Error('Identity response too large'));req.destroy();}else chunks.push(chunk);});res.on('end',()=>{if(res.statusCode!==200)return finish(Error('Identity request failed'));try{finish(null,JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{finish(Error('Invalid identity response'));}});res.on('error',()=>finish(Error('Identity response interrupted')));});
  const timer=setTimeout(()=>{finish(Error('Identity request timed out'));req.destroy();},timeoutMs);req.on('error',()=>finish(Error('Identity connection failed')));req.end(body);
 });
}
function createAuth({issuer='http://localhost:4610/realms/platform-kit',clientId='platform-portal',baseUrl='http://localhost:4600',key,now=Date.now}={}){
 const express=require('express'),router=express.Router(),transactions=new LoginTransactions({now}),verifier=new TokenVerifier({issuer,clientId,key}),sessions=new Map();
 const cookie={httpOnly:true,sameSite:'lax',secure:new URL(baseUrl).protocol==='https:',path:'/'};
 const callback=baseUrl+'/auth/callback';
 function prune(){for(const [id,session]of sessions)if(session.expires<=now())sessions.delete(id);}
 async function identity(req){
  let token;
  if(req.headers.authorization){if(!/^Bearer [A-Za-z0-9_.-]+$/.test(req.headers.authorization))throw Error('Invalid authorization');token=req.headers.authorization.slice(7);}
  else{prune();const session=sessions.get(req.cookies?.platform_session);if(!session)throw Error('Sign in required');token=session.token;}
  const claims=await verifier.verify(token);const roles=Array.isArray(claims.realm_access?.roles)?claims.realm_access.roles.filter(r=>typeof r==='string'):[];
  return {subject:claims.sub,name:claims.preferred_username||claims.sub,roles};
 }
 router.get('/auth/login',(req,res)=>{
  try{const t=transactions.begin(typeof req.query.returnTo==='string'?req.query.returnTo:'/catalog');res.cookie('platform_login',t.binding,{...cookie,path:'/auth',maxAge:300000});
   const url=new URL(issuer+'/protocol/openid-connect/auth');url.search=new URLSearchParams({client_id:clientId,redirect_uri:callback,response_type:'code',scope:'openid profile email',state:t.state,nonce:t.nonce,code_challenge:t.challenge,code_challenge_method:'S256'}).toString();res.redirect(url.toString());
  }catch{res.status(400).json({error:'Unable to start sign-in'});}
 });
 router.get('/auth/callback',async(req,res)=>{
  try{if(typeof req.query.code!=='string'||req.query.code.length>2048)throw Error('Invalid authorization code');const t=transactions.consume(req.query.state,req.cookies?.platform_login);res.clearCookie('platform_login',{...cookie,path:'/auth'});
   const body=new URLSearchParams({client_id:clientId,grant_type:'authorization_code',redirect_uri:callback,code:req.query.code,code_verifier:t.verifier}).toString();
   const tokens=await requestJson(issuer+'/protocol/openid-connect/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
   const id=await verifier.verify(tokens.id_token,t.nonce),access=await verifier.verify(tokens.access_token);if(id.sub!==access.sub)throw Error('Token identity mismatch');
   prune();if(sessions.size>=1000)throw Error('Session capacity reached');const sid=random(),expires=Math.min(access.exp*1000,id.exp*1000,now()+1800000);sessions.set(sid,{token:tokens.access_token,expires});res.cookie('platform_session',sid,{...cookie,maxAge:expires-now()});res.redirect(t.returnTo);
  }catch{res.status(401).json({error:'Sign-in could not be verified. Please start again.'});}
 });
 router.get('/api/session',async(req,res)=>{try{res.json(await identity(req));}catch{res.status(401).json({error:'Sign in required',signIn:'/auth/login'});}});
 async function requireDeveloper(req,res,next){
  try{const user=await identity(req);if(!user.roles.includes('developer'))return res.status(403).json({error:'Developer role required'});if(!req.headers.authorization&&req.headers.origin!==new URL(baseUrl).origin)return res.status(403).json({error:'Request origin rejected'});req.identity=user;next();}
  catch{res.status(401).json({error:'Sign in required'});}
 }
 return {router,requireDeveloper,identity};
}
module.exports={LoginTransactions,TokenVerifier,requestJson,createAuth};
