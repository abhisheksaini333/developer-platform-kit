const http=require('http'),fs=require('fs'),path=require('path');
const root=process.env.GIT_ROOT||'/data';
http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let file;try{const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);if(!pathname.startsWith('/platform-demo.git/')||pathname.split('/').some(x=>x==='..'||x.startsWith('.')))throw Error();file=fs.realpathSync(path.join(root,pathname));if(!file.startsWith(fs.realpathSync(root)+path.sep)||!fs.statSync(file).isFile())throw Error();}catch{res.writeHead(404);return res.end();}
 res.setHeader('Content-Type','application/octet-stream');res.setHeader('Content-Length',fs.statSync(file).size);if(req.method==='HEAD')return res.end();fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
}).listen(4615,'0.0.0.0',()=>console.log('Read-only Git fixture listening on 4615'));
