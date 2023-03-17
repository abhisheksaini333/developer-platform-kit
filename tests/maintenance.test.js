const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
function project(run){const d=fs.mkdtempSync(path.join(os.tmpdir(),'maint-')),dir=path.join(d,'api');require('../src/templates').generate({name:'orders',owner:'platform-team',language:'node'},dir);try{return run(dir)}finally{fs.rmSync(d,{recursive:true,force:true})}}

exports["maintenance DPK01"]=()=>{const {validateInput}=require('../src/templates');const base={name:'api',owner:'team',language:'node'};for(const value of ['api-', ['api'],{toString:()=> 'api'},'a'.repeat(64)])assert(validateInput({...base,name:value}).length);assert.deepStrictEqual(validateInput({...base,name:'a'.repeat(63)}),[]);assert.deepStrictEqual(validateInput({...base,name:'a'}),[])};
