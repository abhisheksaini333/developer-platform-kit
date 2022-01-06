'use strict';
const fs = require('fs');
const NAME = /^[a-z][a-z0-9-]{0,62}$/;
function entityRef(e) { return `${String(e.kind).toLowerCase()}:default/${e.metadata.name}`; }
function validateCatalog(entities) {
  const errors = [], refs = new Set();
  for (const e of entities) {
    const name = e.metadata && e.metadata.name;
    if (!NAME.test(name || '')) errors.push('Invalid entity name');
    const ref = `${String(e.kind).toLowerCase()}:default/${name}`;
    if (refs.has(ref)) errors.push(`Duplicate entity ${ref}`);
    refs.add(ref);
    if (e.kind === 'Component') {
      if (!e.spec || !e.spec.owner) errors.push(`${name}: owner is required`);
      if (!e.spec || !['experimental','production','deprecated'].includes(e.spec.lifecycle)) errors.push(`${name}: invalid lifecycle`);
    }
  }
  for (const e of entities) if (e.spec && e.spec.owner && !refs.has(e.spec.owner)) errors.push(`${e.metadata.name}: unknown owner ${e.spec.owner}`);
  return errors;
}
module.exports = {validateCatalog, entityRef, NAME};
