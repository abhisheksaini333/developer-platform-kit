const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

exports['template contract rejects unsafe names and unknown language'] = () => {
 const {validateInput} = require('../src/templates');
 assert.deepStrictEqual(validateInput({name:'orders-api',owner:'platform-team',language:'node'}),[]);
 for(const input of [{name:'../oops',owner:'platform-team',language:'node'},{name:'orders',owner:'???',language:'node'},{name:'orders',owner:'platform-team',language:'ruby'}]) assert(validateInput(input).length);
};
