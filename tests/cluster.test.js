const assert=require('assert'),fs=require('fs'),path=require('path');
exports['cluster configuration isolates published ports and kubeconfig']=()=>{
 const root=path.join(__dirname,'..'),config=require('yaml').parse(fs.readFileSync(path.join(root,'infra/kind.yaml'),'utf8'));
 assert.strictEqual(config.nodes.length,1);assert.strictEqual(config.nodes[0].extraPortMappings[0].listenAddress,'127.0.0.1');assert.strictEqual(config.nodes[0].extraPortMappings[0].hostPort,4625);
 const c=require('../scripts/lib/cluster');assert(c.kubeconfig.startsWith(path.join(root,'.runtime')));assert.strictEqual(c.name,'platform-kit-2022');
};

exports['generated workloads define safe probes and bounded rolling updates']=()=>{for(const language of ['node','dotnet']){const docs=require('yaml').parseAllDocuments(require('../src/templates').render({name:'test-service',owner:'platform-team',language})['k8s/deployment.yaml']).map(x=>x.toJSON());const d=docs[0],c=d.spec.template.spec.containers[0];assert.strictEqual(c.readinessProbe.httpGet.path,'/ready');assert.strictEqual(c.livenessProbe.httpGet.path,'/health');assert.strictEqual(d.spec.strategy.rollingUpdate.maxUnavailable,0);assert.strictEqual(c.securityContext.allowPrivilegeEscalation,false);assert.strictEqual(c.resources.limits.memory,'128Mi');}};

exports['deployment view exposes only bounded operational fields']=()=>{const {summarize}=require('../src/deployment');const data=summarize({metadata:{name:'platform-demo'},status:{health:{status:'Healthy'},sync:{status:'Synced',revision:'a'.repeat(40)},resources:[{kind:'Service',name:'platform-demo',namespace:'platform-demo',status:'Synced',secret:'never'}]}});assert.strictEqual(data.health,'Healthy');assert.strictEqual(data.sync,'Synced');assert(!JSON.stringify(data).includes('never'));assert.strictEqual(data.resources.length,1);assert.throws(()=>summarize(null),/Invalid/);};
