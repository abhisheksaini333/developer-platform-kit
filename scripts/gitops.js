const fs=require('fs'),path=require('path'),express=require('express'),c=require('./lib/cluster'),g=require('../src/gitops');
const repoUrl='http://host.docker.internal:4615/platform-demo.git';
try{
 const action=process.argv[2];
 if(action==='seed')console.log(JSON.stringify(g.seed(c.runtime)));
 else if(action==='serve'){const web=path.join(c.runtime,'git-web');if(!fs.existsSync(web))throw Error('Seed the local repository first');const app=express();app.use((req,res,next)=>['GET','HEAD'].includes(req.method)?next():res.sendStatus(405));app.use(express.static(web,{dotfiles:'deny',redirect:false}));app.listen(4615,'0.0.0.0',()=>console.log('Read-only local Git objects served on port 4615'));}
 else if(action==='register'){c.assertOwned();c.kube(['create','namespace','platform-demo','--dry-run=client','-o','yaml']).split('\n');const ns={apiVersion:'v1',kind:'Namespace',metadata:{name:'platform-demo'}};for(const object of [ns,...g.manifests(repoUrl)])c.kube(['apply','-f','-'],{input:JSON.stringify(object)});console.log('Registered scoped Argo CD application');}
 else if(action==='publish')console.log(g.publish(path.join(c.runtime,'gitops-work'),path.join(c.runtime,'git-web/platform-demo.git')));
 else throw Error('Usage: node scripts/gitops.js seed|serve|register|publish');
}catch(error){console.error(error.message);process.exitCode=1;}
