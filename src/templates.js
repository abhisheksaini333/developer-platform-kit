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
module.exports={validateInput};
