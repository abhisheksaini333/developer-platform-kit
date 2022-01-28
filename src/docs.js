const fs=require('fs'),path=require('path');
const documents=[{id:'onboarding',title:'Service onboarding',file:'onboarding.md'},{id:'api',title:'Platform API',file:'api.md'},{id:'dependencies',title:'Dependency baseline',file:'dependencies.md'}];
function listDocuments() {return documents.map(({id,title})=>({id,title}));}
function readDocument(id) {const d=documents.find(x=>x.id===id);if(!d) throw new Error('Unknown document');return {id,title:d.title,body:fs.readFileSync(path.join(__dirname,'../docs',d.file),'utf8')};}
module.exports={listDocuments,readDocument};
