# Local identity environment

`docker compose -p platform-kit up -d keycloak` starts Keycloak 17.0.1 and imports the project realm. The image release is [March 23](https://github.com/keycloak/keycloak/releases/tag/17.0.1). The client requires authorization code flow with S256 PKCE; password grants and public registration are disabled.

Local demo accounts: `developer` / `developer-local-only` and `viewer` / `viewer-local-only`. The first can create services; the second can browse. These are deliberately public development fixtures. Bind the stack to loopback and replace them before any shared deployment. The admin console uses `admin` / `admin-local-only` on port 4610.

The application callback is exactly `http://localhost:4600/auth/callback`. Open the portal using `localhost`, matching the registered origin.
