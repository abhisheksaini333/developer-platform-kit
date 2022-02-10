const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const {generate}=require('../src/templates');
const root=path.join(__dirname,'../.generated');fs.mkdirSync(root,{recursive:true});
const dir=fs.mkdtempSync(path.join(root,'check-'));const target=path.join(dir,'node-api');
const started=process.hrtime.bigint();generate({name:'node-api',owner:'platform-team',language:'node'},target);
for(const args of [['install','--ignore-scripts','--before=2022-01-01','--no-audit','--no-fund'],['test']]){
 const r=spawnSync('npm',args,{cwd:target,encoding:'utf8'});process.stdout.write(r.stdout);process.stderr.write(r.stderr);if(r.status)process.exit(r.status);
}
console.log(JSON.stringify({language:'node',elapsedMs:Number(process.hrtime.bigint()-started)/1e6}));
fs.rmSync(dir,{recursive:true,force:true});
