#!/usr/bin/env node
const fs=require('fs'),path=require('path'),c=require('./lib/cluster');
try{
 const action=process.argv[2];
 if(action==='create'){
  const names=c.run(c.kind,['get','clusters']).trim().split(/\s+/);if(names.includes(c.name))throw Error('Cluster already exists; inspect ownership before reuse');
  fs.mkdirSync(c.runtime,{recursive:true});
  c.run(c.kind,['create','cluster','--name',c.name,'--image','kindest/node:v1.23.3','--config',path.join(c.root,'infra/kind.yaml'),'--kubeconfig',c.kubeconfig,'--wait','180s'],{stdio:'inherit'});
  fs.writeFileSync(path.join(c.runtime,'cluster-owner.json'),JSON.stringify({name:c.name,root:c.root}));fs.chmodSync(c.kubeconfig,0o600);
 }else if(action==='load'){c.assertOwned();c.run(c.kind,['load','docker-image','platform-kit-node:demo','--name',c.name],{stdio:'inherit'});}
 else if(action==='delete'){c.assertOwned();c.run(c.kind,['delete','cluster','--name',c.name],{stdio:'inherit'});fs.unlinkSync(path.join(c.runtime,'cluster-owner.json'));}
 else throw Error('Usage: node scripts/cluster.js create|load|delete');
}catch(error){console.error(error.message);process.exitCode=1;}
