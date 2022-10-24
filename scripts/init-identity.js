'use strict';
const {requestJson}=require('../src/auth');
async function initialize(){
 const base=process.env.KEYCLOAK_URL||'http://localhost:4610',url=new URL(base);
 if(!['localhost','127.0.0.1'].includes(url.hostname))throw Error('Demo realm setup is restricted to loopback hosts');
 const body=new URLSearchParams({client_id:'admin-cli',grant_type:'password',username:process.env.KEYCLOAK_ADMIN||'admin',password:process.env.KEYCLOAK_ADMIN_PASSWORD||'admin-local-only'}).toString();
 const token=await requestJson(base+'/realms/master/protocol/openid-connect/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,timeoutMs:10000});
 const headers={Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'};
 try{const existing=await requestJson(base+'/admin/realms/platform-kit',{headers});if(existing.realm!=='platform-kit'||!existing.enabled)throw Error('Existing realm has incompatible configuration');console.log('Platform realm already exists; no configuration was overwritten');return;}
 catch(error){if(error.status!==404)throw error;}
 await requestJson(base+'/admin/realms',{method:'POST',headers,body:JSON.stringify(require('../infra/keycloak/realm.json')),timeoutMs:10000});
 console.log('Imported platform-kit realm through the Keycloak admin API');
}
if(require.main===module)initialize().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={initialize};
