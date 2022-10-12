#!/usr/bin/env node
const {planUpgrade,applyUpgrade,drift}=require('../src/upgrades');
try{
 const [directory,...args]=process.argv.slice(2);if(!directory)throw Error('Usage: node scripts/upgrade.js DIRECTORY [--port PORT] [--apply]');
 const overrides={};let apply=false;
 for(let i=0;i<args.length;i++){if(args[i]==='--apply')apply=true;else if(args[i]==='--port')overrides.port=Number(args[++i]);else throw Error('Unknown option: '+args[i]);}
 const result=apply?applyUpgrade(directory,overrides):planUpgrade(directory,overrides);
 const {files,...summary}=result;console.log(JSON.stringify(summary,null,2));if(summary.conflicts?.length)process.exitCode=2;
}catch(error){console.error(error.message);process.exitCode=2;}
