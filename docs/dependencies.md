# Dependency baseline

The application starts from the published [Backstage v0.61.0 package set](https://github.com/backstage/backstage/tree/v0.61.0). React 17.0.2 and the router beta follow that release's peer constraints. The complete npm lock was resolved with `npm install --before=2022-01-01 --legacy-peer-deps`; transitive versions are frozen as well as direct versions.

The frontend is a real Backstage application built through its app/provider/router APIs. A small esbuild pipeline packages the app independently of the upstream monorepo's build CLI.

Run `npm ci --ignore-scripts` followed by `node node_modules/esbuild/install.js`, then `npm run build`. Dependencies intentionally follow the selected platform baseline. Operate this learning/development environment on local interfaces.
