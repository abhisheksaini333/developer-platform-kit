const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
function project(run){const d=fs.mkdtempSync(path.join(os.tmpdir(),'maint-')),dir=path.join(d,'api');require('../src/templates').generate({name:'orders',owner:'platform-team',language:'node'},dir);try{return run(dir)}finally{fs.rmSync(d,{recursive:true,force:true})}}

exports["maintenance DPK01"]=()=>{const {validateInput}=require('../src/templates');const base={name:'api',owner:'team',language:'node'};for(const value of ['api-', ['api'],{toString:()=> 'api'},'a'.repeat(64)])assert(validateInput({...base,name:value}).length);assert.deepStrictEqual(validateInput({...base,name:'a'.repeat(63)}),[]);assert.deepStrictEqual(validateInput({...base,name:'a'}),[])};

exports["maintenance DPK02"]=()=>{const {validateInput}=require('../src/templates');const base={name:'api',owner:'team',language:'node'};for(const port of [true,[4605],'0x1200','1e3',' 4605 ',0,65536])assert(validateInput({...base,port}).length);for(const port of [1,65535,'4605'])assert.deepStrictEqual(validateInput({...base,port}),[])};

exports["maintenance DPK03"]=()=>{const {validateCatalog}=require('../src/catalog');const bad=[{kind:'Component',metadata:{name:'api'},spec:{lifecycle:'production',owner:'component:default/api'}}];assert(validateCatalog(bad).some(x=>x.includes('Group')));const good=[{kind:'Group',metadata:{name:'team'}},{...bad[0],spec:{...bad[0].spec,owner:'group:default/team'}}];assert.deepStrictEqual(validateCatalog(good),[])};

exports["maintenance DPK04"]=()=>{const {entityRef,validateCatalog}=require('../src/catalog');const e=namespace=>({kind:'Group',metadata:{name:'team',namespace}});assert.equal(entityRef(e('payments')),'group:payments/team');assert.deepStrictEqual(validateCatalog([e('payments'),e('support')]),[]);assert(validateCatalog([e('payments'),e('payments')]).some(x=>x.includes('Duplicate')));assert(validateCatalog([e('../bad')]).some(x=>x.includes('namespace')))};
