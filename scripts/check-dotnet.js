const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const {generate}=require('../src/templates');const root=path.join(__dirname,'../.generated');fs.mkdirSync(root,{recursive:true});
const parent=fs.mkdtempSync(path.join(root,'dotnet-')),target=path.join(parent,'api');
generate({name:'dotnet-api',owner:'platform-team',language:'dotnet'},target);
const dotnet=process.env.DOTNET||path.join(__dirname,'../.tools/dotnet/dotnet');
const r=spawnSync(dotnet,['run','--project','tests/Smoke.csproj','-c','Release','--no-launch-profile'],{cwd:target,encoding:'utf8',env:{...process.env,DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_NOLOGO:'1',DOTNET_CLI_HOME:path.join(root,'dotnet-home')}});
process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');if(r.error)throw r.error;if(r.status)process.exit(r.status);
console.log('Generated .NET service API checks passed');fs.rmSync(parent,{recursive:true,force:true});
