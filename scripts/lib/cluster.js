const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'../..'),runtime=path.join(root,'.runtime'),name='platform-kit-2022';
const kind=path.join(root,'.tools/kind'),kubectl=path.join(root,'.tools/kubectl'),kubeconfig=path.join(runtime,'kubeconfig');
function run(command,args,options={}){return execFileSync(command,args,{cwd:root,encoding:'utf8',stdio:['pipe','pipe','pipe'],...options});}
function kube(args,options={}){return run(kubectl,['--kubeconfig',kubeconfig,...args],options);}
function assertOwned(){const p=path.join(runtime,'cluster-owner.json');if(!fs.existsSync(p))throw Error('No project cluster ownership marker');const marker=JSON.parse(fs.readFileSync(p));if(marker.name!==name||marker.root!==root)throw Error('Cluster ownership mismatch');}
module.exports={root,runtime,name,kind,kubectl,kubeconfig,run,kube,assertOwned};
