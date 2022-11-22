# Deploy, observe and recover

The local delivery environment is a dedicated kind cluster named `platform-kit-2022`. Every helper uses `.runtime/kubeconfig`; global kubectl context is untouched. The ownership marker prevents deleting or loading an unrelated cluster.

```sh
python3 scripts/install-cluster-tools.py
node scripts/cluster.js create
python3 scripts/install-argocd.py
node scripts/gitops.js seed
docker build -t platform-kit-node:demo .runtime/gitops-work
node scripts/cluster.js load
node scripts/gitops.js serve
```

Keep the read-only Git server running. It exposes only the generated public demo repository on port 4615, allowing the cluster to fetch `host.docker.internal`. In another terminal:

```sh
node scripts/gitops.js register
git -C .runtime/gitops-work rev-parse HEAD
node scripts/deploy.js sync <full-commit-sha>
node scripts/deploy.js ready
curl --fail http://localhost:4625/ready
```

Argo's project permits only Deployments and Services in `platform-demo`, from this one source repository. It does not enable automatic synchronization: a deliberate drift can be inspected before an explicit reconciliation. Readiness gates rollout; a new unavailable pod cannot replace the healthy replica.

For a failed deployment, inspect `node scripts/deploy.js status` and the project-scoped pod events. Synchronize the last verified Git revision to recover service, then revert the bad change in `.runtime/gitops-work`, publish and sync the new revert revision. This restores desired Git state as well as runtime state. Avoid editing the application container directly.

Stop the Git server before cleanup. `node scripts/cluster.js delete` removes only the owned cluster. `docker compose -p platform-kit stop` stops the catalog and identity fixtures while keeping their local state. To reproduce a fresh Keycloak realm, recreate only the Keycloak service and run the initializer again.
