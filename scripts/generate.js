#!/usr/bin/env node
'use strict';
const {generate}=require('../src/templates');
function main(args){
 const options={};for(let i=0;i<args.length;i+=2){if(!args[i].startsWith('--') || args[i+1]===undefined) throw new Error('Use --name NAME --owner GROUP --language node --destination DIRECTORY');options[args[i].slice(2)]=args[i+1];}
 if(!options.destination) throw new Error('Destination is required');
 const result=generate(options,options.destination);console.log(`Created ${result.name} at ${result.path}`);
}
if(require.main===module)try{main(process.argv.slice(2));}catch(error){console.error(error.message);process.exitCode=2;}
module.exports={main};
