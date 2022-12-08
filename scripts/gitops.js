const fs=require('fs'),path=require('path'),express=require('express'),c=require('./lib/cluster'),g=require('../src/gitops');
const repoUrl='http://platform-kit-git-source:4615/platform-demo.git';
try{
 const action=process.argv[2];
 if(action==='seed')console.log(JSON.stringify(g.seed(c.runtime)));
 else if(action==='serve'){c.assertOwned();const web=path.join(c.runtime,'git-web');if(!fs.existsSync(web))throw Error('Seed the local repository first');c.run('docker',['run','--rm','--name','platform-kit-git-source','--network','kind','--memory','64m','--cpus','0.25','--user','node','--read-only','--cap-drop','ALL','--mount','type=bind,source='+web+',target=/data,readonly','--mount','type=bind,source='+path.join(c.root,'scripts/git-server.js')+',target=/server.js,readonly','node:16.13.1-alpine','node','/server.js'],{stdio:'inherit'});}
 else if(action==='register'){c.assertOwned();c.kube(['create','namespace','platform-demo','--dry-run=client','-o','yaml']).split('\n');const ns={apiVersion:'v1',kind:'Namespace',metadata:{name:'platform-demo'}};for(const object of [ns,...g.manifests(repoUrl)])c.kube(['apply','-f','-'],{input:JSON.stringify(object)});console.log('Registered scoped Argo CD application');}
 else if(action==='publish')console.log(g.publish(path.join(c.runtime,'gitops-work'),path.join(c.runtime,'git-web/platform-demo.git')));
 else throw Error('Usage: node scripts/gitops.js seed|serve|register|publish');
}catch(error){console.error(error.message);process.exitCode=1;}
