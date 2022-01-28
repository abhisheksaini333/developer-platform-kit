import React,{useEffect,useState} from 'react';
export function Documents(){
 const [docs,setDocs]=useState<{id:string,title:string}[]>([]),[article,setArticle]=useState<{title:string,body:string}|null>(null),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/docs').then(r=>r.json()).then(setDocs).catch(()=>setError('Documentation is unavailable. Please retry.'));},[]);
 async function open(id:string){try{const r=await fetch('/api/docs/'+id);if(!r.ok)throw Error();setArticle(await r.json());setError('');}catch{setError('This article could not be loaded.');}}
 return <section className="page"><p className="eyebrow">ENGINEERING HANDBOOK</p><h1>Build with a shared standard.</h1><p>Practical guidance for ownership, service creation and delivery.</p><div className="doc-links">{docs.map(d=><button key={d.id} onClick={()=>open(d.id)}>{d.title}</button>)}</div>{error&&<p role="alert">{error}</p>}{article&&<article><h2>{article.title}</h2><pre className="document">{article.body}</pre></article>}</section>
}
