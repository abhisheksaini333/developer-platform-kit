const path=require('path'),fs=require('fs'),{execFileSync}=require('child_process');
const {generate}=require('./templates');
function git(dir,args){return execFileSync('git',['-C',dir,...args],{encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();}
function seed(base){
 const work=path.join(base,'gitops-work'),web=path.join(base,'git-web'),bare=path.join(web,'platform-demo.git');
 if(fs.existsSync(work)||fs.existsSync(bare))throw Error('GitOps seed already exists');
 fs.mkdirSync(base,{recursive:true});fs.mkdirSync(web,{recursive:true});
 generate({name:'platform-demo',owner:'platform-team',language:'node'},work);
 const manifest=path.join(work,'k8s/deployment.yaml');let body=fs.readFileSync(manifest,'utf8').replace('platform-demo:1.0.0','platform-kit-node:demo').replace('  selector: {app: platform-demo}','  type: NodePort\n  selector: {app: platform-demo}').replace('targetPort: http}','targetPort: http, nodePort: 30080}');fs.writeFileSync(manifest,body);
 git(work,['init','-b','main']);git(work,['config','user.name','Platform Local Validation']);git(work,['config','user.email','platform-validation@example.invalid']);git(work,['add','.']);git(work,['commit','-m','Deploy generated service baseline']);
 fs.mkdirSync(bare);git(bare,['init','--bare','--initial-branch=main']);git(work,['remote','add','origin',bare]);publish(work,bare);
 return {work,bare,revision:git(work,['rev-parse','HEAD'])};
}
function publish(work,bare){git(work,['push','origin','main']);git(bare,['update-server-info']);return git(work,['rev-parse','HEAD']);}
function manifests(repoUrl){
 const project={apiVersion:'argoproj.io/v1alpha1',kind:'AppProject',metadata:{name:'platform-kit',namespace:'argocd'},spec:{sourceRepos:[repoUrl],destinations:[{namespace:'platform-demo',server:'https://kubernetes.default.svc'}],clusterResourceWhitelist:[],namespaceResourceWhitelist:[{group:'apps',kind:'Deployment'},{group:'',kind:'Service'}]}};
 const application={apiVersion:'argoproj.io/v1alpha1',kind:'Application',metadata:{name:'platform-demo',namespace:'argocd'},spec:{project:'platform-kit',source:{repoURL:repoUrl,targetRevision:'main',path:'k8s'},destination:{server:'https://kubernetes.default.svc',namespace:'platform-demo'}}};return [project,application];
}
module.exports={seed,publish,git,manifests};
