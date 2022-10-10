'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
function hash(bytes){return crypto.createHash('sha256').update(bytes).digest('hex');}
function managedPath(root,name){if(typeof name!=='string'||path.isAbsolute(name)||name.split(/[\\/]/).some(p=>!p||p==='..'||p==='.')||name.includes('\0'))throw Error('Invalid managed path');const file=path.join(root,name);let current=root;for(const part of name.split('/')){current=path.join(current,part);if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink())throw Error('Managed files must not be symlinks');}return file;}
function metadata(dir){const m=JSON.parse(fs.readFileSync(path.join(dir,'.platform-template.json'),'utf8'));if(!m.files||typeof m.files!=='object'||Array.isArray(m.files)||!m.inputs)throw Error('Invalid template metadata');for(const [name,digest]of Object.entries(m.files)){managedPath(dir,name);if(!/^[a-f0-9]{64}$/.test(digest))throw Error('Invalid managed digest');}return m;}
function drift(dir){const m=metadata(dir);return Object.entries(m.files).map(([name,digest])=>{const file=managedPath(dir,name);return {path:name,state:!fs.existsSync(file)?'missing':hash(fs.readFileSync(file))===digest?'intact':'modified'};});}
module.exports={drift,metadata,managedPath,hash};
