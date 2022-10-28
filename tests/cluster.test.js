const assert=require('assert'),fs=require('fs'),path=require('path');
exports['cluster configuration isolates published ports and kubeconfig']=()=>{
 const root=path.join(__dirname,'..'),config=require('yaml').parse(fs.readFileSync(path.join(root,'infra/kind.yaml'),'utf8'));
 assert.strictEqual(config.nodes.length,1);assert.strictEqual(config.nodes[0].extraPortMappings[0].listenAddress,'127.0.0.1');assert.strictEqual(config.nodes[0].extraPortMappings[0].hostPort,4625);
 const c=require('../scripts/lib/cluster');assert(c.kubeconfig.startsWith(path.join(root,'.runtime')));assert.strictEqual(c.name,'platform-kit-2022');
};
