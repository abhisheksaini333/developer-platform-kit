const assert = require('assert');
const entities = require('../catalog/entities.json');
exports['catalog services link to a real owning group'] = () => {
 const groups = new Set(entities.filter(e=>e.kind==='Group').map(e=>'group:default/'+e.metadata.name));
 for(const e of entities.filter(e=>e.kind==='Component')) assert(groups.has(e.spec.owner));
};

exports['rejects unowned or invalid service entities'] = () => {
 const {validateCatalog} = require('../src/catalog');
 assert.deepStrictEqual(validateCatalog(entities), []);
 assert(validateCatalog([{kind:'Component',metadata:{name:'../bad'},spec:{}}]).length >= 3);
};

exports['rejects dangling dependencies and dependency cycles'] = () => {
 const {validateCatalog} = require('../src/catalog');
 const a=JSON.parse(JSON.stringify(entities));
 a[4].spec.dependsOn=['component:default/platform-portal'];
 assert(validateCatalog(a).some(e=>e.includes('cycle')));
 a[4].spec.dependsOn=['component:default/missing'];
 assert(validateCatalog(a).some(e=>e.includes('Unknown dependency')));
};
