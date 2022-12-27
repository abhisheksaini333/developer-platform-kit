# Verification evidence

The final source passes **63 focused behavior/configuration checks**, TypeScript checking and the Backstage production bundle. Both generated service stacks were built and exercised through actual HTTP requests from fresh project directories. Container validation also passed for the non-root Node runtime and the .NET SDK acceptance image.

## Measured clean onboarding

Host: macOS arm64, **Node v16.16.0**, isolated **.NET SDK 6.0.201**. The check copied tracked source into a fresh directory, installed a clean `node_modules` from the lock, then ran each stage below. The npm download cache was warm; Node and the isolated SDK were already installed. This measures project onboarding, not machine provisioning or a cold network download.

| Stage | Seconds |
| --- | ---: |
| install | 11.02 |
| esbuild | 0.07 |
| unit | 2.65 |
| typecheck | 2.90 |
| build | 0.94 |
| services | 12.60 |
| **Total** | **30.19** |

Reproduce with `node scripts/check-onboarding.js`. [Raw measurement](verification/onboarding.json) includes every stage and outcome.

## Real integration checks

| Capability | Observed result |
| --- | --- |
| Backstage catalog | Actual PostgreSQL-backed processing returned six entities including the source Location, with ownership and dependency relations. The browser displayed both service components without page errors. |
| Service generation | Fresh Node and ASP.NET projects built and served health, readiness, work-item and OpenAPI endpoints. Tests cover malformed input, body limits, concurrent identifiers and readiness failure. Node additionally survives an interrupted request body. |
| Identity | Actual Keycloak login form and authorization-code callback succeeded. Anonymous creation returned 401, developer creation succeeded, viewer creation returned 403, HttpOnly/SameSite cookies were checked, and logout removed application access. Five browser checks took 5.12 seconds after warm startup. |
| Kubernetes / Argo CD | A generated Node service ran on kind. A manual replica change became OutOfSync and was reconciled. An unavailable rollout exceeded its progress deadline while the previous replica continued serving. A verified-revision rollback and Git revert restored Healthy/Synced state. Repeat run: 54.10 seconds. |
| Browser resilience | Readiness refresh failure preserved previous observations and documentation navigation. Keyboard skip navigation, template switching and a 375-pixel viewport passed. The README screenshot shows actual resolved Argo state. |
| Upgrade safety | Managed edits cause explicit conflicts; custom files, permissions and repository metadata survive. Injected publication failure restores the original project. |

[Identity observations](verification/identity.json) and [Kubernetes observations](verification/kubernetes.json) record the checks and local fixture revisions. The cluster and Git fixture were stopped after validation.

## Reproduction and limits

Run the setup in the README before catalog/identity browser checks. Follow the deployment runbook before `node scripts/check-kubernetes.js`; that harness deliberately changes only the owned demonstration repository and cluster. It leaves the service on a healthy Git revert revision.

Browser automation uses a separate installed Playwright/Chromium host toolchain, outside the application npm lock. The hosted workflow executes unit/type/build, fresh Node generation and the actual .NET acceptance container. Hosted GitHub run results must be checked after publication; the results above are local evidence.

The fixtures exercise local delivery, identity and failure recovery. They do not establish a public deployment, production traffic performance, cloud IAM configuration or a production database for generated work items.
