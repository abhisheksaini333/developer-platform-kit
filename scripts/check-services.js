const {spawnSync}=require('child_process');
for(const script of ['check-generated.js','check-dotnet.js']){
 const r=spawnSync(process.execPath,[require('path').join(__dirname,script)],{stdio:'inherit'});
 if(r.status!==0)process.exit(r.status||1);
}
console.log('Both generated service stacks passed from fresh directories');
