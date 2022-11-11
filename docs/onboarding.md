# Service onboarding

Each service has a named owner, lifecycle, API contract and operational runbook. Start by checking existing services and their dependencies in the catalog.


Generated CI emits validation in the runner log. It does not depend on the retired GitHub upload-artifact v2/v3 services. The pinned application dependencies and runtime versions are separate from the hosted runner lifecycle; use the container build when the hosted runner no longer supplies a compatible .NET 6 native environment.
