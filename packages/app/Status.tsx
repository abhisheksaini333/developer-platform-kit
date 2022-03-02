import React,{useState,useEffect} from 'react';
export function Status(){const [data,setData]=useState<any>(null),[error,setError]=useState('');
 async function refresh(){try{const r=await fetch('/api/status');if(!r.ok)throw Error();setData(await r.json());setError('');}catch{setError('Readiness could not be refreshed. Catalog and documentation remain available.');}}
 useEffect(()=>{refresh();const id=setInterval(refresh,15000);return()=>clearInterval(id);},[]);
 return <section className="page"><p className="eyebrow">DELIVERY READINESS</p><h1>A clear view of what is ready.</h1><p>Live observations of each service. Unavailable integrations are reported separately.</p><button onClick={refresh}>Refresh status</button>{error&&<p role="alert" className="error">{error}</p>}{!data&&!error&&<p role="status">Checking services…</p>}<div className="status-grid">{data?.services.map((s:any)=><article className="status-card" key={s.name}><span className={'state '+s.state}>{s.state}</span><h2>{s.name}</h2><p>{s.detail}</p><small>Checked {new Date(s.observedAt).toLocaleTimeString()} · {s.latencyMs} ms</small></article>)}</div></section>;
}
