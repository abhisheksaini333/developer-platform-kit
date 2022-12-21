# Service onboarding

Start in the catalog: identify the owning group, system, lifecycle and any service dependencies. A new service should have one accountable group, an API contract and a recovery runbook before being promoted beyond experimentation.

## Create and validate

1. Sign in as a developer, open **Create a service**, choose a DNS-style name, owning group and language, then preview the generated files.
2. Create the service. The portal writes only inside `.generated/services` and refuses an existing destination.
3. Follow the returned commands. Node services run `npm test`; ASP.NET services run `dotnet build` and `dotnet run --project tests/Smoke.csproj -c Release` with SDK 6.0.201.
4. Exercise `/health`, `/ready`, `/items` and `/openapi.json`. Both APIs validate titles and reject bodies larger than 64 KiB. The generated item store is in memory.
5. Review `catalog-info.yaml`, including owner and `providesApis`, before registering it with a catalog location. The local portal's initial catalog comes from `catalog/entities.yaml`; generation does not silently publish a GitHub repository.
6. Build the container and follow the deployment runbook. Readiness controls traffic; liveness confirms that the process still responds.

The platform's CLI uses the same validation and rendering path as the portal. Parent directories must exist, existing outputs are preserved, and symlinked destination parents are rejected. Output files are prepared in a sibling staging directory, then an exclusive target reservation prevents overwriting a directory created concurrently.

## Change the standard safely

`.platform-template.json` records inputs, the template version and SHA-256 digests of managed files. `scripts/upgrade.js` previews changed files and conflicts. Applying a conflict-free upgrade copies the complete project, preserves custom files and `.git`, moves the original into a reported backup, then publishes the replacement. A failed publication restores the original.

Keep the backup until build, HTTP tests and rollout health pass. Locally modified managed files must be reviewed and reconciled before retrying; the upgrader does not silently replace them.

## Verification and CI

`node scripts/check-services.js` generates both stacks in fresh directories and runs their real HTTP acceptance checks. `node scripts/check-onboarding.js` copies tracked source into a fresh directory, installs its npm lock, checks types/build/tests, and verifies both generated stacks. It reuses the installed Node runtime and isolated .NET SDK; it does not provision Docker or Kubernetes.

Generated CI emits results in runner logs and avoids retired artifact-upload actions. The platform workflow also builds/runs the .NET acceptance container, preserving its native environment when hosted runners evolve. Browser checks use separate testing tools; they do not update the application dependency lock.
