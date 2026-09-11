# service-booking-2

This project uses Agentic Development Studio's Codex-native Stage One workflow.

Bootstrap the pinned local runtime with `./studioctl bootstrap`, run
`./studioctl doctor`, then initialize or explicitly import a run. Inspect it with
`./studioctl status` and follow `docs/project-guide/first-discovery-prompt.md`. Bootstrap installs
the exact dependency closure with locked artifact hashes and doctor rechecks installed-file
provenance. Final milestone approval uses the explicit, digest-bound `./studioctl run approve`
command described in the operator handbook.

## Local backend foundation

Use Java 21, Maven 3.9.11 through `backend/mvnw`, and Docker Compose with PostgreSQL 17.
The wrapper distribution is checksum-pinned. Spring Boot is locked to 4.1.1; the
JAR timestamp is fixed. Node 24 is reserved for the later client task.

Set the environment variables described in `.env.example`; do not commit values.
Use synthetic accounts and a locally generated database password and HMAC secret.
Set optional `DB_PORT` if port 5432 is occupied (`0` selects a free local port).
`make up` starts PostgreSQL and the API on localhost port 8080. `make down` stops
them while preserving the database volume. Do not use this local profile for hosting.

From `backend`, run `./mvnw -q -DskipTests package` to build or `./mvnw -q clean verify`
to run the PostgreSQL integration suite. Tests require Docker. `make verify` also
validates Compose configuration. The health endpoint is `/actuator/health`.
To prove migrations explicitly, run `docker compose up -d postgres`, then
`docker compose run --rm api ./mvnw -q -DskipTests spring-boot:run`; inspect the
API health inside that container and stop the foreground API with Ctrl-C.

Authentication uses same-origin server sessions and session-bound CSRF. Fetch
`GET /api/auth/csrf` before every new session's mutations, including registration
and sign-in, and refresh the token after authentication/verification rotates the
session. Passwords use BCrypt; verification/reset credentials are stored only as
digests. Delivery/payment/notifications are simulated ports with test observers;
there is no inbox or real delivery. No administrator registration is exposed.

Hosted application storage must be in Switzerland. This local synthetic setup
makes no production/storage-location certification or deployment claim. Client,
browser acceptance, release digest locks and release commands are completed by
their later plan tasks; no deployment or registry publication is configured here.
