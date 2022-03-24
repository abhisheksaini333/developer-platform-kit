# Dependency baseline

The application starts from the published [Backstage v0.61.0 package set](https://github.com/backstage/backstage/tree/v0.61.0). React 17.0.2 and the router beta follow that release's peer constraints. The complete npm lock was resolved with `npm install --before=2022-01-01 --legacy-peer-deps`; transitive versions are frozen as well as direct versions.

The frontend is a real Backstage application built through its app/provider/router APIs. A small esbuild pipeline packages the app independently of the upstream monorepo's build CLI.

Run `npm ci --ignore-scripts` followed by `node node_modules/esbuild/install.js`, then `npm run build`. Dependencies intentionally follow the selected platform baseline. Operate this learning/development environment on local interfaces.

## Stable Backstage platform

The platform upgrades to the [Backstage 1.0.0 package set](https://github.com/backstage/backstage/tree/v1.0.0), released March 17. The upgrade lock uses a March 18 resolution cutoff and retains React 17. The catalog permission client is wired explicitly; catalog read access is public in this local deployment, while template write access is enforced separately.
