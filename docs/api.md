# Platform API

The portal listens on loopback port 4600. JSON request bodies are limited to 64 KiB. Catalog reads and documentation are available without sign-in; mutations require a verified developer identity.

| Endpoint | Behavior |
| --- | --- |
| `GET /health` | Portal process liveness. |
| `GET /api/catalog/entities` | Actual processed Backstage entities and relations. A catalog outage returns 503 only for catalog routes. |
| `POST /api/templates/preview` | Validate name, owner, language and optional port; return filenames and generated size without writing files. |
| `POST /api/templates/generate` | Create a fresh project under the fixed portal workspace; developer role required. Existing output returns 409. |
| `GET /api/status` | Independent readiness observations, bounded deadlines and short shared caching. |
| `GET /api/deployment` | Sanitized Argo application health, synchronization, revision and resource state; unavailable integration remains explicit. |
| `GET /api/docs`, `GET /api/docs/:id` | Known handbook articles only. |
| `GET /auth/login`, `GET /auth/callback` | OIDC authorization-code/PKCE flow with one-use browser-bound state and nonce. |
| `GET /api/session` | Verified subject, display name and roles. Tokens are never returned. |
| `POST /auth/logout` | Remove the application session; exact application Origin required. |

Example preview:

```json
{"name":"orders-api","owner":"platform-team","language":"node","port":4605}
```

Browser writes require an HttpOnly session cookie and matching Origin. Bearer callers require a correctly signed token with the expected issuer, audience, expiry and developer role. Catalog writes use the same developer gate. Viewer writes return 403; missing or invalid identity returns 401.

Generated service endpoints are separate from the portal: `POST /items` creates a validated work item, `GET /items` lists current in-memory items, and `/openapi.json` describes that contract. `READY=false` makes readiness fail while liveness remains available.
