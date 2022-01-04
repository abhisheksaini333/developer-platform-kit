const assert = require('assert');
const entities = require('../catalog/entities.json');
exports['catalog services link to a real owning group'] = () => {
 const groups = new Set(entities.filter(e=>e.kind==='Group').map(e=>'group:default/'+e.metadata.name));
 for(const e of entities.filter(e=>e.kind==='Component')) assert(groups.has(e.spec.owner));
};
