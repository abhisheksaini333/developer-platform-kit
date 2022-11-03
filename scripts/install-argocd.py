#!/usr/bin/env python3
import pathlib,json,urllib.request,hashlib,subprocess
root=pathlib.Path(__file__).resolve().parents[1];runtime=root/'.runtime';marker=json.loads((runtime/'cluster-owner.json').read_text())
if marker!={'name':'platform-kit-2022','root':str(root)}:raise SystemExit('Cluster ownership mismatch')
lock=json.loads((root/'infra/argocd/install-lock.json').read_text());data=urllib.request.urlopen(lock['url'],timeout=60).read()
if hashlib.sha256(data).hexdigest()!=lock['sha256']:raise SystemExit('Argo CD manifest checksum mismatch')
manifest=runtime/'argocd-install.yaml';manifest.write_bytes(data)
base=[str(root/'.tools/kubectl'),'--kubeconfig',str(runtime/'kubeconfig')]
def kube(*args,**kw):return subprocess.run(base+list(args),check=True,**kw)
ns=subprocess.check_output(base+['create','namespace','argocd','--dry-run=client','-o','yaml'])
kube('apply','-f','-',input=ns)
kube('apply','-n','argocd','--server-side','-f',str(manifest))
for deployment in ['argocd-dex-server','argocd-notifications-controller','argocd-applicationset-controller']:
    kube('scale','-n','argocd','deployment',deployment,'--replicas=0')
for kind,name,memory in [('deployment','argocd-repo-server','512Mi'),('deployment','argocd-server','256Mi'),('statefulset','argocd-application-controller','512Mi'),('deployment','argocd-redis','128Mi')]:
    kube('set','resources','-n','argocd',kind,name,'--requests=cpu=50m,memory=64Mi',f'--limits=cpu=600m,memory={memory}')
for workload in ['deployment/argocd-repo-server','deployment/argocd-server','deployment/argocd-redis','statefulset/argocd-application-controller']:
    kube('rollout','status','-n','argocd',workload,'--timeout=240s')
print('Argo CD controllers are ready in the dedicated cluster')
