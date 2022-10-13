'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
function hash(bytes){return crypto.createHash('sha256').update(bytes).digest('hex');}
function managedPath(root,name){if(typeof name!=='string'||path.isAbsolute(name)||name.split(/[\\/]/).some(p=>!p||p==='..'||p==='.')||name.includes('\0'))throw Error('Invalid managed path');const file=path.join(root,name);let current=root;for(const part of name.split('/')){current=path.join(current,part);if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink())throw Error('Managed files must not be symlinks');}return file;}
function metadata(dir){const m=JSON.parse(fs.readFileSync(path.join(dir,'.platform-template.json'),'utf8'));if(!['1.0.0','1.1.0'].includes(m.version))throw Error('Unsupported template version');if(!['node','dotnet'].includes(m.template)||m.template!==m.inputs?.language)throw Error('Invalid template identity');if(!m.files||typeof m.files!=='object'||Array.isArray(m.files)||!m.inputs)throw Error('Invalid template metadata');for(const [name,digest]of Object.entries(m.files)){managedPath(dir,name);if(!/^[a-f0-9]{64}$/.test(digest))throw Error('Invalid managed digest');}return m;}
function drift(dir){const m=metadata(dir);return Object.entries(m.files).map(([name,digest])=>{const file=managedPath(dir,name);return {path:name,state:!fs.existsSync(file)?'missing':hash(fs.readFileSync(file))===digest?'intact':'modified'};});}
function planUpgrade(dir,overrides={}){
 const previous=metadata(dir),input={...previous.inputs,...overrides},templates=require('./templates');
 const errors=templates.validateInput(input);if(errors.length)throw Error(errors.join('; '));
 const next=templates.render(input),changes=[],conflicts=[];
 for(const [name,content]of Object.entries(next)){
  if(name==='.platform-template.json')continue;
  const file=managedPath(dir,name),exists=fs.existsSync(file),actual=exists?hash(fs.readFileSync(file)):null;
  if(actual===hash(content))continue;
  if(exists&&actual!==previous.files[name])conflicts.push(name);
  else changes.push({path:name,action:exists?'update':'create'});
 }
 for(const name of Object.keys(previous.files))if(!(name in next)){const file=managedPath(dir,name);if(fs.existsSync(file)){if(hash(fs.readFileSync(file))!==previous.files[name])conflicts.push(name);else changes.push({path:name,action:'delete'});}}
 return {input,changes,conflicts,files:next};
}
function applyUpgrade(dir,overrides={}){
 dir=path.resolve(dir);const plan=planUpgrade(dir,overrides);if(plan.conflicts.length)throw Error('Upgrade conflicts: '+plan.conflicts.join(', '));
 const parent=path.dirname(dir),staging=fs.mkdtempSync(path.join(parent,'.platform-upgrade-')),backupRoot=fs.mkdtempSync(path.join(parent,'.platform-backup-')),backup=path.join(backupRoot,'original');
 let moved=false;
 try{
  fs.cpSync(dir,staging,{recursive:true,preserveTimestamps:true});
  for(const change of plan.changes){const file=managedPath(staging,change.path);if(change.action==='delete')fs.unlinkSync(file);else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,plan.files[change.path]);}}
  fs.writeFileSync(path.join(staging,'.platform-template.json'),plan.files['.platform-template.json']);
  fs.renameSync(dir,backup);moved=true;fs.renameSync(staging,dir);
  return {backup,changes:plan.changes};
 }catch(error){if(moved&&!fs.existsSync(dir))fs.renameSync(backup,dir);fs.rmSync(staging,{recursive:true,force:true});throw error;}
}
module.exports={drift,metadata,managedPath,hash,planUpgrade,applyUpgrade};
