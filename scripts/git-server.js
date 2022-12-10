const http=require('http'),path=require('path'),{spawn}=require('child_process');
const repo=path.join(process.env.GIT_ROOT||'/data','platform-demo.git');
const port=Number(process.env.GIT_PORT||4615);
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://local'),advertise=req.method==='GET'&&url.pathname==='/platform-demo.git/info/refs'&&url.searchParams.get('service')==='git-upload-pack';
 const fetch=req.method==='POST'&&url.pathname==='/platform-demo.git/git-upload-pack'&&req.headers['content-type']==='application/x-git-upload-pack-request';
 if(!advertise&&!fetch){res.writeHead(req.method==='POST'?403:404);return res.end('Read-only Git source');}
 const child=spawn('git',['upload-pack','--stateless-rpc',...(advertise?['--advertise-refs']:[]),repo],{stdio:['pipe','pipe','pipe']});
 const timer=setTimeout(()=>{child.kill();res.destroy();},30000);let size=0;
 res.setHeader('Content-Type','application/x-git-upload-pack-'+(advertise?'advertisement':'result'));res.setHeader('Cache-Control','no-cache');
 if(advertise){const banner='# service=git-upload-pack\n';res.write((Buffer.byteLength(banner)+4).toString(16).padStart(4,'0')+banner+'0000');child.stdin.end();}
 else {req.on('data',chunk=>{size+=chunk.length;if(size>2*1024*1024){child.kill();res.destroy();}});req.pipe(child.stdin);}
 child.stdout.pipe(res);child.stderr.resume();child.stdin.on('error',()=>{});child.on('error',()=>res.destroy());child.on('close',()=>clearTimeout(timer));res.on('close',()=>{clearTimeout(timer);child.kill();});
}).listen(port,'0.0.0.0',()=>console.log('Read-only smart Git source listening on '+port));
