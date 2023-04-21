'use strict';
const fs = require('fs');
const NAME = /^[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
function entityRef(e) { return `${String(e.kind).toLowerCase()}:default/${e.metadata.name}`; }
function validateCatalog(entities) {
  const errors = [], refs = new Set();
  if(!Array.isArray(entities))return ['Catalog must contain an entity array'];
  entities=entities.filter(e=>{if(!e||!e.metadata||!e.kind){errors.push('Entity requires kind and metadata');return false;}return true;});
  for(const e of entities)if(e.spec&&e.spec.dependsOn!==undefined&&!Array.isArray(e.spec.dependsOn))errors.push('Dependencies must be an array');
  for (const e of entities) {
    const name = e.metadata && e.metadata.name;
    if (typeof name !== 'string' || !NAME.test(name)) errors.push('Invalid entity name');
    const ref = `${String(e.kind).toLowerCase()}:default/${name}`;
    if (refs.has(ref)) errors.push(`Duplicate entity ${ref}`);
    refs.add(ref);
    if (e.kind === 'Component') {
      if (!e.spec || !e.spec.owner) errors.push(`${name}: owner is required`);
      if (!e.spec || !['experimental','production','deprecated'].includes(e.spec.lifecycle)) errors.push(`${name}: invalid lifecycle`);
    }
  }
  for (const e of entities) if (e.spec && e.spec.owner) {
    if(typeof e.spec.owner!=='string'||!e.spec.owner.startsWith('group:')) errors.push(`${e.metadata.name}: owner must reference a Group`);
    else if(!refs.has(e.spec.owner)) errors.push(`${e.metadata.name}: unknown owner ${e.spec.owner}`);
  }
  const graph = new Map(entities.map(e=>[entityRef(e), (Array.isArray(e.spec?.dependsOn)?e.spec.dependsOn:[])]));
  const visited = new Set(), active = new Set();
  function visit(ref) {
    if(active.has(ref)) { errors.push(`Dependency cycle at ${ref}`); return; }
    if(visited.has(ref)) return;
    visited.add(ref); active.add(ref);
    for(const dependency of graph.get(ref) || []) {
      if(!graph.has(dependency)) errors.push(`Unknown dependency ${dependency}`);
      else visit(dependency);
    }
    active.delete(ref);
  }
  for(const ref of graph.keys()) visit(ref);
  return errors;
}
module.exports = {validateCatalog, entityRef, NAME};
