'use strict';
const fs = require('fs');
const path = require('path');
const {NAME} = require('./catalog');
function validateInput(input) {
 const errors=[];
 if(!input || typeof input !== 'object') return ['Input must be an object'];
 for(const key of Object.keys(input)) if(!['name','owner','language','port','destination','format'].includes(key)) errors.push('Unknown template option: '+key);
 if(input.format!==undefined && !['text','json'].includes(input.format))errors.push('Format must be text or json');
 if(!NAME.test(input.name || '')) errors.push('Name must be a lowercase DNS label');
 if(!NAME.test(input.owner || '')) errors.push('Owner must be a catalog group name');
 if(input.port!==undefined && (!Number.isInteger(Number(input.port)) || Number(input.port)<1 || Number(input.port)>65535)) errors.push('Port must be an integer from 1 to 65535');
 if(!['node','dotnet'].includes(input.language)) errors.push('Language must be node or dotnet');
 return errors;
}
function render(input) {
 const files={'README.md':`# ${input.name}\n\nOwned by ${input.owner}.\n\nRun ${input.language==='dotnet'?'dotnet build and dotnet run':'npm install, npm run build and npm start'}.\n`};
 const base=path.join(__dirname,'../templates',input.language);
 function walk(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
   const file=path.join(dir,entry.name);
   if(entry.isDirectory()) walk(file);
   else files[path.relative(base,file)]=fs.readFileSync(file,'utf8').replace(/__NAME__/g,input.name).replace(/__OWNER__/g,input.owner).replace(/__PORT__/g,String(input.port||4605));
  }
 }
 walk(base); files['catalog-info.yaml']=JSON.stringify({apiVersion:'backstage.io/v1alpha1',kind:'Component',metadata:{name:input.name,annotations:{'platform-kit/template':input.language}},spec:{type:'service',lifecycle:'experimental',owner:'group:default/'+input.owner,providesApis:[input.name+'-api']}},null,2)+'\n---\n'+JSON.stringify({apiVersion:'backstage.io/v1alpha1',kind:'API',metadata:{name:input.name+'-api'},spec:{type:'openapi',lifecycle:'experimental',owner:'group:default/'+input.owner,definition:files['openapi.json']}},null,2)+'\n'; files['.platform-template.json']=JSON.stringify({template:input.language,version:'1.1.0',inputs:{name:input.name,owner:input.owner,language:input.language,port:Number(input.port||4605)},files:Object.fromEntries(Object.entries(files).map(([name,content])=>[name,require('crypto').createHash('sha256').update(content).digest('hex')]))},null,2)+'\n'; return files;
}
function generate(input, destination) {
 const errors=validateInput(input); if(errors.length) throw new Error(errors.join('; '));
 const target=path.resolve(destination);
 let ancestor=path.dirname(target);while(ancestor!==path.dirname(ancestor)){if(fs.lstatSync(ancestor).isSymbolicLink() && !['/var','/tmp','/etc'].includes(ancestor))throw new Error('Destination must not contain a symlink');ancestor=path.dirname(ancestor);}
 if(fs.existsSync(target)) throw new Error('Destination already exists');
 const staging=fs.mkdtempSync(path.join(path.dirname(target), '.platform-'));
 let reserved=false;
 try {
  for(const [name,content] of Object.entries(render(input))) {
   const file=path.join(staging,name); fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);
  }
  fs.mkdirSync(target);reserved=true;
  for(const name of fs.readdirSync(staging))fs.renameSync(path.join(staging,name),path.join(target,name));
  fs.rmdirSync(staging);
 } catch(error) { if(reserved)fs.rmSync(target,{recursive:true,force:true});fs.rmSync(staging,{recursive:true,force:true}); throw error; }
 return {name:input.name,path:target};
}
function preview(input) {const errors=validateInput(input);if(errors.length) throw new Error(errors.join('; '));const files=render(input);return {name:input.name,language:input.language,files:Object.keys(files).sort(),bytes:Object.values(files).reduce((n,x)=>n+Buffer.byteLength(x),0)};}
module.exports={validateInput,render,generate,preview};
