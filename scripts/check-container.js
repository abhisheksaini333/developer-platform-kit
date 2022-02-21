const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process'),{generate}=require('../src/templates');
const root=path.join(__dirname,'../.generated');fs.mkdirSync(root,{recursive:true});const parent=fs.mkdtempSync(path.join(root,'container-')),target=path.join(parent,'api');
generate({name:'container-api',owner:'platform-team',language:'node'},target);
function run(args){const r=spawnSync('docker',args,{encoding:'utf8'});process.stdout.write(r.stdout);process.stderr.write(r.stderr);if(r.status)throw new Error('Docker check failed');return r.stdout;}
try{run(['build','-t','platform-kit-node:check',target]);const result=run(['run','--rm','--entrypoint','node','platform-kit-node:check','-e','if(process.getuid()===0)process.exit(1);require("./dist/server").createServer().listen(0,function(){console.log("non-root service started");this.close()})']);if(!result.includes('non-root'))throw Error('Runtime not verified');}finally{fs.rmSync(parent,{recursive:true,force:true});}
