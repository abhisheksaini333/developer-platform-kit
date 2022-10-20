import React,{useEffect,useState} from 'react';
export function Identity(){const [user,setUser]=useState<any>(null);useEffect(()=>{fetch('/api/session').then(r=>r.ok?r.json():null).then(setUser).catch(()=>setUser(null));},[]);
 async function logout(){const r=await fetch('/auth/logout',{method:'POST'});if(r.ok)setUser(null);}
 return <div className="identity">{user?<><strong>{user.name}</strong><small>{user.roles.includes('developer')?'Service developer':'Catalog viewer'}</small><button onClick={logout}>Sign out</button></>:<a href="/auth/login">Sign in to create services →</a>}</div>;
}
