# Jockey Hollow Atlas access controller

The access controller wraps the existing publication build. The controller serves the restricted landing page and authenticated owner management. When the owner enables PUBLIC, it serves the existing Atlas, using the same relative paths for the app, gallery, and glossary. The scientific source files are left in place.

## Deployment status

On November 22, 2026, Render listed the existing Jockey_Hollow_Atlas service (`srv-dankm6ajnfac738v4k1g`) as a static site suspended by the billing subsystem. Its root, data script, and sample original image returned HTTP 503 from Render. A prior Render deployment marked live in deployment history does not override that service state.

The last completed static deployment recorded by Render is `dep-dc1dnbrtqb8s73add3pg` at `53809cc11dd38154d58e02df10465e9b354d39f2`. This is the rollback reference for the previous publication artifact. Keep that static service suspended and do not use its former artifact as a restricted rollout target.

The GitHub repository is public. Direct unauthenticated GitHub access to the checked-in Atlas data was observed. The wrapper cannot restrict GitHub, previously downloaded copies, or any independent origin. Before a production cutover, the owner needs to decide the intended visibility of the repository and its media, review mirrors and other origins, and verify any changes independently. Treat billing resolution as a potential activation path for the old static artifact. Verify a provider-side lock on that artifact before changing billing or routing.

Render documents that an existing service cannot change between static and web service types. The runtime therefore requires an approved new web-service target or an independently verified access gateway. The existing Render hostname stays on the suspended static service unless Render confirms another supported routing arrangement. A custom hostname may be used for an approved replacement service. No replacement service has been provisioned from this branch.

## Publication build

Run from the repository root:

```sh
node scripts/verify_atlas_images.cjs
node atlas_access/prepare.cjs /path/to/new-collection
docker build -f atlas_access/Dockerfile -t jockey-hollow-atlas-access .
```

The first command verifies the existing gallery and restoration manifests. The second produces a new publication directory and a release manifest. It stages the existing published gallery references, app loaders, and simulator pages and modules. It omits repository metadata, research notes, and unlisted files. The separate Gym Juno cloud integration remains disabled in the staged package and requires its own independently approved configuration if commissioned. Runtime images should be built from an exact reviewed commit.

Use a dedicated directory for runtime state with write access for the container user (UID 10001). Gunicorn starts the application on port 10000. Use a single instance with multiple workers sharing the same SQLite database on durable storage. SQLite WAL provides transactional mode and audit changes. Do not share the SQLite database over a network filesystem or run replicas with separate stores. Configure backups for the state database before use and verify recovery without restoring a public arm. Docker was not available in the isolated test environment. The same application factory and Gunicorn serving command were tested directly.

### Runtime settings

| Setting | Value |
| --- | --- |
| `ATLAS_ORIGIN` | Exact canonical HTTPS origin, no trailing slash. HTTP loopback is accepted for a local preview. |
| `ATLAS_STATE_DB` | Absolute state database path on the writable persistent mount. |
| `ATLAS_OWNER_TOKEN_SHA256` | Lowercase SHA-256 digest of a key generated using `secrets.token_urlsafe(32)`. Save the original key only in the owner's password manager. |
| `ATLAS_REOPEN_TOKEN` | Omit for a restricted rollout. Use a fresh `secrets.token_urlsafe(32)` value only for an explicitly authorized reopen. |
| `ATLAS_ROLLBACK_COMMIT` | Optional verified rollback commit SHA displayed in owner management. |
| `ATLAS_DEPLOYMENT_ID` | Optional verified Render deployment ID. |
| `ATLAS_COLLECTION` | Optional staged directory override. The container default is `/app/collection`. |

Render's `RENDER_GIT_COMMIT` is displayed when present. For a local preview, set `ATLAS_COMMIT` to the exact source revision. The dashboard remains the authority for provider deployment history. Configure `/healthz` as the runtime health-check path. Successful health checks represent a running controller and readable access state. The collection inventory in owner management reflects checks performed during the build.

### Access security

- The server checks mode before looking up or streaming a collection path. The release manifest restricts public routing to approved build output. Public mode applies `no-store` so the gateway and CDN should not keep reusable copies. Verify that setting on the live edge. Requests already in flight and copies previously downloaded may remain available to those recipients.
- Owner sign-in uses a generated 256-bit key, verified against a server-only digest. Owner sessions use random opaque tokens, expire after 30 minutes, and revoke on sign-out or owner-key rotation. HTTPS cookies are host-only, Secure, HttpOnly, and SameSite Strict.
- State-changing requests require the session CSRF token and a same-origin form. An invalid sign-in is logged and the controller limits failures to 12 per 15 minutes across workers. This instance-wide cap can temporarily delay legitimate sign-in during abuse. Apply rate limiting at the approved live edge if available.
- The app records sign-ins, denied sign-ins, denied mode confirmations, signed-out sessions, and mode changes in its state database. The audit view shows recent events in UTC. The application controls do not mutate Render or GitHub settings.
- Review a branded restricted route, no-store behavior, TLS, cookie flags, public arm configuration, access logs, and the audit persistence on any real deployment before calling it production verified.

Run the HTTP regression tests from the repository root after installing the runtime packages and pytest:

```sh
PYTHONPATH=atlas_access python -m pytest -q atlas_access/tests
```

The isolated run passed seven HTTP regression tests. In public preview, all 1,548 referenced image URLs returned exact source bytes and two representative specimens passed gallery and glossary checks. Restricted mode denied the same image and data paths after the switch. Restricted and owner layouts passed in Chromium desktop, Pixel 7 and iPhone 13 emulation, 768 px tablet and 320 px mobile profiles, and viewports equivalent to 80%, 125%, and 200% browser zoom. Automated WCAG rule checks found no violations on the restricted, sign-in, and management pages at desktop and 320 px widths. Microsoft Edge, physical devices, and full manual accessibility conformance were outside the available test environment.

## Restricted rollout and later reopening

1. Keep the old static service suspended. Obtain the owner's approval for the replacement serving target, hostname, and durable storage before provisioning. Verify independent copies and direct GitHub access against the desired access boundary.
2. Deploy the reviewed commit to the replacement with `ATLAS_REOPEN_TOKEN` unset. Verify that the branded root returns 503, `/healthz` returns 204, owner management accepts only authorized sign-ins, and anonymous reads of `/data.js`, a valid gallery image, collection subpages, and unpublished artifacts are denied. Save the exact deploy ID as the restricted rollback baseline.
3. After explicit authorization to reopen, set a fresh `ATLAS_REOPEN_TOKEN` in the replacement runtime and deploy. The database and owner confirmation must still select PUBLIC. Recheck the root and protected assets before applying the change. Never reuse a prior release token.
4. In the authenticated owner panel, select PUBLIC, type `PUBLIC` exactly, and apply the change. Verify the recorded event and anonymous access to the Atlas, including a gallery image, glossary interaction, and desktop and mobile navigation.
5. To roll back access, select RESTRICTED, type `RESTRICTED`, and apply the change. Confirm root restriction and direct-file denial with a new anonymous session, including previously requested files. Remove the release token from configuration so a rollback or state restore cannot reopen the service. If the owner panel is unavailable, remove the token and redeploy, or suspend the approved replacement at the provider. A code rollback must use a gated deployment with the token absent. Never resume the old public static artifact as a safety rollback.

Steps 3 through 5 were exercised only against isolated loopback instances. The production cutover and provider-level rollback are pending owner authorization and hosting configuration.
