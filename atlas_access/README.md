# Atlas access controls

The existing Render static site publishes the repository root. This branch adds a Django and django-allauth web service in the same repository. Deploy it as a web service for rehearsal while the current Atlas remains available.

- The future sign-in route is `/accounts/login/`. The owner dashboard is `/owner/`.
- The initial policy is Private with guest codes disabled. Limited Beta serves the explicit entries in `showcase.json`, which starts empty. Each entry contains the accession, approved title and description, and exact approved image paths.
- The authorized viewer uses the existing Atlas interface. Direct data and media requests require an active Viewer, an Owner with a completed MFA challenge, or a current guest session. Guest codes expire in one hour, allow one redemption, and issue two-hour sessions. The guest switch invalidates all codes and sessions upon disabling.
- Invites use a one-hour link mailed to an approved address. Activated accounts can request password recovery. The Owner enrolls TOTP and stores recovery codes during sign-in. Recovery codes are single-use.
- The server generates a candidate inventory from the existing gallery and direct viewer dependencies. Working files, manifests, repository metadata, and the classified collection are outside delivery. The build excludes images with identified GPS EXIF or XMP fields. Review the shipped record text, media contents, and source metadata for private localities and release restrictions before approving the build digest. The automated check cannot classify data sensitivity or interpretation.

## Rehearsal and cutover

Use a Render web service linked to this Atlas repository, a persistent PostgreSQL database with TLS, and a verified transactional sender. This implementation uses Brevo's HTTPS endpoint for invitation and recovery mail. Store the database URL, app secret, provider API key, sender, HTTPS origin, and approved candidate digest in Render environment variables `DATABASE_URL`, `ATLAS_SECRET_KEY`, `ATLAS_BREVO_API_KEY`, `ATLAS_FROM_EMAIL`, `ATLAS_PUBLIC_ORIGIN`, and `ATLAS_VIEWER_MANIFEST_SHA256`. Keep a recoverable copy of the app secret in the owner's secret manager. It protects MFA data and session integrity.

- Build command `python -m pip install -r atlas_access/requirements.txt && node atlas_access/build_viewer.cjs`
- Start command `bash atlas_access/start.sh`
- Health check `/healthz`
- With the staged environment configured, issue the Owner activation with `python -m django invite_atlas_owner OWNER_EMAIL --settings=atlas_access.settings`. Verify mailbox delivery, sign-in, TOTP enrollment, password recovery, and use of one recovery code with the owner. Confirm the existing owner can recover the database and application secret.
- Verify Viewer invitation and revocation, guest access, atomic redemption on PostgreSQL, both visitor modes, and the proxy's rate-limit behavior from independent networks before inviting real viewers or changing the live site.
- Keep the old Atlas serving until the owner approves cutover. At cutover, the old static origin must stop serving the repository root and route visitors to the protected service. Check old direct data and media URLs after the static CDN cache is invalidated. Use a prepared minimal redirect site for the old origin if the Render subdomain cannot move.
- Public GitHub files, prior commits, forks and clones, previously downloaded files, cached copies, and independently shared Drive images sit outside the application switch. Any GitHub visibility or history change and broad Drive sharing change require the owner's approval.
