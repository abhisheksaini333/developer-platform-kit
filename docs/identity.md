# Local identity environment

`docker compose -p platform-kit up -d keycloak` starts Keycloak 17.0.1. Once its master realm is ready, run `node scripts/init-identity.js` to import the project realm through the admin API. Existing realms are preserved. This release does not support the later startup `--import-realm` option. The image release is [March 23](https://github.com/keycloak/keycloak/releases/tag/17.0.1). The client requires authorization code flow with S256 PKCE; password grants and public registration are disabled.

Local demo accounts: `developer` / `developer-local-only` and `viewer` / `viewer-local-only`. The first can create services; the second can browse. These are deliberately public development fixtures. Bind the stack to loopback and replace them before any shared deployment. The admin console uses `admin` / `admin-local-only` on port 4610.

The application callback is exactly `http://localhost:4600/auth/callback`. Open the portal using `localhost`, matching the registered origin.


## First startup and access checks

The pinned amd64 image runs under emulation on Apple Silicon. Reserve 768 MiB and one CPU. The default JVM augmentation exceeded that cap; the tested configuration uses a 256 MiB heap, 128 MiB metaspace, a 48 MiB code cache and tier-one compilation. First augmentation took 118.8 seconds in the measured local run. Wait for the discovery endpoint before importing:

```sh
curl --fail http://localhost:4610/realms/master/.well-known/openid-configuration
node scripts/init-identity.js
```

`tests/browser/identity.js` exercises the actual authorization-code redirect, Keycloak login form, signed token verification and browser session. It checks anonymous rejection, developer generation, HttpOnly/SameSite cookies, logout and viewer denial. The measured five-check run took 10.4 seconds after warm startup. Session tokens remain only in server memory, so restarting the portal signs users out. Cookies are local HTTP development cookies; a shared HTTPS deployment must set Secure cookies and use a persistent protected session store.
