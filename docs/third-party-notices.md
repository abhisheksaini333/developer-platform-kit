# Third-party components

Original platform code is Apache-2.0, under the repository's LICENSE. Dependencies and container contents retain their upstream terms. No upstream repository history is copied into this project.

| Component | Upstream license/source |
| --- | --- |
| Backstage and Argo CD | [Backstage Apache-2.0](https://github.com/backstage/backstage/blob/v1.0.0/LICENSE), [Argo CD Apache-2.0](https://github.com/argoproj/argo-cd/blob/v2.3.0/LICENSE) |
| React, Express, TypeScript and esbuild | MIT; licenses remain in installed npm packages. |
| Node.js | [Node.js license](https://github.com/nodejs/node/blob/v16.16.0/LICENSE), including bundled notices. |
| .NET / ASP.NET Core | [dotnet runtime MIT](https://github.com/dotnet/runtime/blob/v6.0.3/LICENSE.TXT), [ASP.NET Core MIT](https://github.com/dotnet/aspnetcore/blob/v6.0.3/LICENSE.txt). SDK archives retain bundled notices. |
| Keycloak, kind and Kubernetes | Apache-2.0; original image/binary distributions retain their notices. |
| PostgreSQL | [PostgreSQL license](https://www.postgresql.org/about/licence/). |
| Git / Alpine Git image | Git GPL-2.0, distributed unchanged as a pinned development-tool image; [Git source](https://github.com/git/git/tree/v2.34.1). Alpine base packages retain their own licenses. |

`infra/*-lock.json` records checksums and version provenance for downloaded development tools. `package-lock.json` records the npm dependency graph. Keep upstream notices when redistributing containers or installed dependencies.
