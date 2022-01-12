'use strict';
const fs = require('fs');
const path = require('path');
const {NAME} = require('./catalog');
function validateInput(input) {
 const errors=[];
 if(!input || typeof input !== 'object') return ['Input must be an object'];
 if(!NAME.test(input.name || '')) errors.push('Name must be a lowercase DNS label');
 if(!NAME.test(input.owner || '')) errors.push('Owner must be a catalog group name');
 if(!['node'].includes(input.language)) errors.push('Language must be node');
 return errors;
}
function render(input) {
 return {'README.md':`# ${input.name}\n\nOwned by ${input.owner}.\n`};
}
function generate(input, destination) {
 const errors=validateInput(input); if(errors.length) throw new Error(errors.join('; '));
 const target=path.resolve(destination);
 if(fs.existsSync(target)) throw new Error('Destination already exists');
 const staging=fs.mkdtempSync(path.join(path.dirname(target), '.platform-'));
 try {
  for(const [name,content] of Object.entries(render(input))) {
   const file=path.join(staging,name); fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);
  }
  fs.renameSync(staging,target);
 } catch(error) { fs.rmSync(staging,{recursive:true,force:true}); throw error; }
 return {name:input.name,path:target};
}
module.exports={validateInput,render,generate};
