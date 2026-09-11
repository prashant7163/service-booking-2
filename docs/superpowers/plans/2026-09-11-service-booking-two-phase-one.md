# Service Booking Two Phase One Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Switzerland-focused Service Booking Two marketplace so visitors discover services, verified customers reserve and purchase fixed-time inventory, providers publish and fulfill bookings, administrators perform only the accepted interventions, and exact validated revisions yield reproducible non-deploying release artifacts.

**Architecture:** Use a monorepo with a React single-page client, one Spring Boot REST API, and PostgreSQL started by Docker Compose. Keep domain boundaries inside the API (`auth`, `catalog`, `commerce`, `fulfillment`, `admin`, `simulation`), enforce consistency in database transactions, serve the client and API through one origin, and keep all external delivery/payment/GitHub behavior behind explicit adapters.

**Tech Stack:** Java 21; Spring Boot 4.1.1; Maven Wrapper; Spring Security, Validation, Data JPA, Flyway, PostgreSQL JDBC, JUnit 5 and Testcontainers; PostgreSQL 17 in Docker; Node.js 24 LTS; React 19 with TypeScript and Vite; Vitest and Testing Library; Playwright 1.63; Docker Buildx; GitHub Actions with every third-party action resolved to an immutable commit SHA.

**Spec:** [`docs/discovery/project-specification.json`](../../discovery/project-specification.json), approved canonical subject digest `227a4f029b576930530c4c5b388d2836963d9f7356913b5faf5f9dcc180c4c9b`

**Repository Execution Target:** `https://github.com/prashant7163/service-booking-2.git` is the approved Service Booking Two remote endpoint. Recording it here authorizes no Git initialization, remote configuration, authentication, GitHub record creation, commit, push, or other mutation.

## Global Constraints

- All customer-provider messaging and refunds are excluded by later owner corrections.
- No live external delivery or real-money integration; interfaces remain replaceable.
- Application data storage must be in Switzerland for hosted operation; local tests use synthetic data.
- No implementation, lifecycle transition, or approval follows merely from this draft.
- Unanswered elicitation is deferred under the owner's instruction to stop edge-case discovery.
- Local Studio tracker/state remains authoritative; GitHub status is a synchronized counterpart and creates no approval.
- GitHub/workflow mutations are post-specification-approval work; artifact production does not authorize environment deployment.
- Preserve persistent cart reservations until explicit removal, service unpublication, provider suspension, or administrator release; never add a cart timer.
- Reject checkout at or after slot start; define future inventory as slots whose start is strictly after the injected clock instant.
- Allow draft-slot overlap but enforce no overlap when publishing; accept one slot beginning exactly when another ends.
- Keep the two fixed categories `TUTOR_LESSON` and `BEAUTY_WELLNESS`; no category administration UI or endpoint.
- Use page size 20 and Chromium for the required 390px and 1280px acceptance matrix; this does not claim a broader browser certification.
- Do not add microservices, queues, caches, organizations, staff, public shop pages, real external integrations, registry publication, or deployment.
- Redact secrets before persistence or outbound use and bind every review/build/test/audit result to the exact candidate digest.

---

## Delivery and gate rules

The JSON milestone plan is [`docs/project/planning/phase-one-milestone-plan.json`](../../project/planning/phase-one-milestone-plan.json). Execution begins only after the application owner approves its exact canonical digest and the Orchestrator submits that exact file. The Orchestrator then creates readiness evidence and task records; those future lifecycle artifacts are not part of this draft.

Every task uses its declared `.worktrees/service-booking-2-*` workspace. At each milestone, all producer tasks complete before the same exact candidate goes through Code Reviewer, Build Manager, Quality Engineer, and Independent Auditor gates; the Orchestrator then prepares the milestone review for the application owner's final user-review decision. The Code Reviewer and Independent Auditor never implement the candidate; audit findings return only to the Orchestrator. A changed candidate repeats every affected gate.

Task 1 targets exactly `https://github.com/prashant7163/service-booking-2.git`. Before it can perform remote mutations, least-privilege issue/milestone credentials must be available outside repository and Studio state. If authorization is unavailable or broader than required, Task 1 records a local retry marker and blocks later implementation without losing authoritative local state.

## Complete file map

All paths are repository-relative. Existing governance files remain unchanged except `README.md` and `.gitignore`, which receive application usage entries in Task 4.

### Governance, architecture, and interaction records

| File | Responsibility |
|---|---|
| `docs/project/tracking/github-links.json` | Stable local milestone/task IDs to GitHub milestone/issue URLs and last reconciled local event. |
| `docs/project/tracking/sync-retry.json` | Actionable, secret-free retry state when GitHub reconciliation fails. |
| `scripts/github/sync-work-items.sh` | Idempotent `gh api` reconciliation from approved local plan/state to GitHub. |
| `scripts/github/sync-work-items.test.sh` | Fake-`gh` tests for redaction, idempotency, local authority, and retry preservation. |
| `docs/architecture/phase-one.md` | Module, transaction, trust, expiry, search, and release boundaries. |
| `docs/architecture/openapi/service-booking-two.yaml` | Exact HTTP paths, schemas, role rules, status/error codes, and forbidden-surface absence. |
| `docs/privacy/swiss-storage-boundary.md` | Local synthetic-data posture and binding Swiss-hosted-storage requirement without a production claim. |
| `docs/ux/phase-one-flows.md` | English/German role flows, 390px/1280px layouts, focus order, labels, validation, empty/error states, and excluded controls. |

### Root and local runtime

| File | Responsibility |
|---|---|
| `.gitignore` | Ignore secrets, local databases, build output, Playwright artifacts, and worktrees. |
| `.env.example` | Non-secret variable names and safe local defaults; no usable credential. |
| `.tool-versions` | Java 21 and Node 24 major-version toolchain contract. |
| `Makefile` | Stable `verify`, `up`, `down`, `e2e`, `release`, and `repro-check` commands. |
| `compose.yaml` | PostgreSQL, API, and web services with local synthetic configuration. |
| `README.md` | Locked setup, test, demo, security, Swiss-storage, and no-deployment instructions. |

### Backend application

| File | Responsibility |
|---|---|
| `backend/pom.xml` | Spring Boot dependencies, Java 21, deterministic JAR timestamp, unit/integration profiles. |
| `backend/mvnw`, `backend/mvnw.cmd`, `backend/.mvn/wrapper/maven-wrapper.properties` | Pinned Maven wrapper entry points. |
| `backend/Dockerfile` | Reproducible multi-stage API image using the digest lock. |
| `backend/src/main/java/ch/servicebookingtwo/Application.java` | Spring Boot entry point. |
| `backend/src/main/java/ch/servicebookingtwo/config/ClockConfig.java` | Production UTC `Clock` and e2e mutable-clock profile. |
| `backend/src/main/java/ch/servicebookingtwo/config/SecurityConfig.java` | Same-origin session, CSRF, role routes, safe headers, and redacted failure handling. |
| `backend/src/main/java/ch/servicebookingtwo/common/ApiError.java` | Stable localized-error-neutral API error envelope. |
| `backend/src/main/java/ch/servicebookingtwo/common/GlobalExceptionHandler.java` | Validation/conflict/authorization mappings without secret values. |
| `backend/src/main/java/ch/servicebookingtwo/auth/Role.java` | `CUSTOMER`, `PROVIDER`, and `ADMINISTRATOR` identities. |
| `backend/src/main/java/ch/servicebookingtwo/auth/Account.java` | Account state, BCrypt hash, verification, and provider suspension. |
| `backend/src/main/java/ch/servicebookingtwo/auth/AccountRepository.java` | Account persistence and unique email lookup. |
| `backend/src/main/java/ch/servicebookingtwo/auth/AuthService.java` | Registration, simulated verification/reset, session, and suspension checks. |
| `backend/src/main/java/ch/servicebookingtwo/auth/AuthController.java` | `/api/auth` HTTP contract. |
| `backend/src/main/java/ch/servicebookingtwo/auth/AuthDtos.java` | Auth request/response records with no hashes or tokens in public views. |
| `backend/src/main/java/ch/servicebookingtwo/simulation/VerificationPort.java` | Replaceable verification/reset delivery interface. |
| `backend/src/main/java/ch/servicebookingtwo/simulation/PaymentPort.java` | Replaceable deterministic payment-attempt interface. |
| `backend/src/main/java/ch/servicebookingtwo/simulation/NotificationPort.java` | Purchase/redemption/expiry/confirmation event interface. |
| `backend/src/main/java/ch/servicebookingtwo/simulation/SimulatedAdapters.java` | Local adapters that expose outcomes to tests without a user-facing inbox or secret logging. |
| `backend/src/main/java/ch/servicebookingtwo/catalog/Category.java` | Fixed category aggregate. |
| `backend/src/main/java/ch/servicebookingtwo/catalog/Shop.java` | One shop per provider and Swiss postal address. |
| `backend/src/main/java/ch/servicebookingtwo/catalog/Offering.java` | In-person offering, multilingual fields, images, CHF price, and publication state. |
| `backend/src/main/java/ch/servicebookingtwo/catalog/Slot.java` | Distinct fixed-time SKU, capacity, and protected schedule. |
| `backend/src/main/java/ch/servicebookingtwo/catalog/CatalogRepositories.java` | Owner-safe shop/offering/slot persistence and normalized search query. |
| `backend/src/main/java/ch/servicebookingtwo/catalog/CatalogService.java` | Shop, offering, bulk slot, publication, unpublication, and search rules. |
| `backend/src/main/java/ch/servicebookingtwo/catalog/CatalogController.java` | Public discovery and provider catalog endpoints. |
| `backend/src/main/java/ch/servicebookingtwo/catalog/CatalogDtos.java` | Public views hiding times and customer views exposing selectable future slots. |
| `backend/src/main/java/ch/servicebookingtwo/commerce/Cart.java` | One persistent cart per customer. |
| `backend/src/main/java/ch/servicebookingtwo/commerce/CartLine.java` | Reserved slot quantity with current offering price projection. |
| `backend/src/main/java/ch/servicebookingtwo/commerce/MarketplaceOrder.java` | One checkout aggregate and idempotency key. |
| `backend/src/main/java/ch/servicebookingtwo/commerce/BookingLine.java` | Immutable purchased quantity/price, slot, fulfillment state, and persisted redemption-code nonce/fingerprint. |
| `backend/src/main/java/ch/servicebookingtwo/commerce/CommerceRepositories.java` | Locking reservation/order persistence and owner projections. |
| `backend/src/main/java/ch/servicebookingtwo/commerce/CommerceService.java` | Atomic quantity delta, selected checkout, price acceptance, idempotency, and order aggregation. |
| `backend/src/main/java/ch/servicebookingtwo/commerce/CommerceController.java` | `/api/cart`, `/api/checkout`, and order endpoints. |
| `backend/src/main/java/ch/servicebookingtwo/commerce/CommerceDtos.java` | Cart, checkout, price, order, and provider-line records. |
| `backend/src/main/java/ch/servicebookingtwo/fulfillment/FulfillmentService.java` | HMAC-derived four-digit code display/validation, atomic delivery, expiry, and completion. |
| `backend/src/main/java/ch/servicebookingtwo/fulfillment/FulfillmentController.java` | Provider booking list and selected-booking redemption endpoint. |
| `backend/src/main/java/ch/servicebookingtwo/admin/AdminService.java` | Suspension, selected reservation release, and Expired-to-Delivered override. |
| `backend/src/main/java/ch/servicebookingtwo/admin/AdminController.java` | Limited `/api/admin` mutations only. |
| `backend/src/main/java/ch/servicebookingtwo/testing/E2eClockController.java` | `e2e`-profile-only deterministic clock advance; absent from normal/release profiles. |
| `backend/src/main/resources/application.yml` | Safe production-like defaults and environment-only secrets. |
| `backend/src/main/resources/application-local.yml` | Local PostgreSQL and synthetic adapters. |
| `backend/src/main/resources/application-e2e.yml` | Isolated e2e database, fixture secret, and mutable clock. |
| `backend/src/main/resources/db/migration/V1__identity_and_catalog.sql` | Account, category, shop, offering, slot, constraints, unaccent/trigram extensions. |
| `backend/src/main/resources/db/migration/V2__commerce_and_fulfillment.sql` | Cart, reservation, payment attempt, order, booking, and idempotency constraints. |
| `backend/src/test/java/ch/servicebookingtwo/AbstractPostgresIntegrationTest.java` | Shared Testcontainers PostgreSQL and deterministic clock fixture. |
| `backend/src/test/java/ch/servicebookingtwo/auth/AuthIntegrationTest.java` | Registration, role, verification/reset, session, CSRF, suspension, hashing, and redaction tests. |
| `backend/src/test/java/ch/servicebookingtwo/catalog/CatalogIntegrationTest.java` | Shop, slot, publication, discovery, search, visibility, and edit-rule tests. |
| `backend/src/test/java/ch/servicebookingtwo/commerce/CommerceIntegrationTest.java` | Cart, checkout, payment, CHF pricing, history, and owner-view tests. |
| `backend/src/test/java/ch/servicebookingtwo/commerce/CommerceConcurrencyTest.java` | Final-unit race, duplicate checkout, price race, and no-partial-order tests. |
| `backend/src/test/java/ch/servicebookingtwo/fulfillment/FulfillmentAdminIntegrationTest.java` | Redemption, expiry, notifications, unpublication, suspension, release, override, and race tests. |
| `backend/src/test/java/ch/servicebookingtwo/security/ForbiddenSurfaceTest.java` | Forbidden endpoints, response fields, and log-secret regression tests. |

### Frontend application

| File | Responsibility |
|---|---|
| `frontend/package.json`, `frontend/package-lock.json` | Exact React/Vite/Vitest/Testing Library dependencies and commands. |
| `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/eslint.config.js` | Strict TypeScript, test, proxy, and lint configuration. |
| `frontend/Dockerfile`, `frontend/nginx.conf` | Reproducible static image and same-origin `/api` reverse proxy. |
| `frontend/index.html`, `frontend/src/main.tsx` | Accessible document root and React entry point. |
| `frontend/src/app/App.tsx`, `frontend/src/app/routes.tsx` | Role-aware routes and page shell. |
| `frontend/src/api/client.ts` | Typed fetch, credentials/CSRF, stable error decoding, and no secret logging. |
| `frontend/src/auth/AuthContext.tsx` | Session bootstrap and role gates. |
| `frontend/src/i18n/index.ts`, `frontend/src/i18n/en.ts`, `frontend/src/i18n/de.ts` | Browser fallback, device-local switch, and complete UI dictionaries. |
| `frontend/src/components/Layout.tsx`, `frontend/src/components/FormField.tsx` | Responsive navigation, status labels, associated labels, and input errors. |
| `frontend/src/features/auth/AuthPages.tsx` | Customer/provider registration, provider verification acknowledgment, sign-in, reset, and sign-out UI. |
| `frontend/src/features/catalog/CatalogPages.tsx` | Provider shop/offering/slot forms and public/customer discovery views. |
| `frontend/src/features/commerce/CommercePages.tsx` | Persistent cart, changed-total acceptance, simulated payment, and order/provider-line views. |
| `frontend/src/features/fulfillment/FulfillmentPages.tsx` | Provider selected-booking redemption and limited administrator screens. |
| `frontend/src/styles.css` | Mobile-first layout, visible focus, error/status styling, and overflow protection. |
| `frontend/src/test/setup.ts` | DOM test environment. |
| `frontend/src/features/auth/AuthPages.test.tsx` | Role, language, label, keyboard, and error-state tests. |
| `frontend/src/features/catalog/CatalogPages.test.tsx` | Public-time hiding, provider slot forms, filters, and language-label tests. |
| `frontend/src/features/commerce/CommercePages.test.tsx` | Quantity, selection, price acceptance, payment failure, and history tests. |
| `frontend/src/features/fulfillment/FulfillmentPages.test.tsx` | Redemption/admin action visibility and error tests. |

### Browser acceptance, CI, and release

| File | Responsibility |
|---|---|
| `e2e/package.json`, `e2e/package-lock.json`, `e2e/playwright.config.ts` | Exact Playwright version, local web-server orchestration, reports, and viewport projects. |
| `e2e/fixtures/api.ts`, `e2e/fixtures/synthetic.ts` | Synthetic setup and e2e-only clock control without real-user data. |
| `e2e/specs/discover-purchase.spec.ts` | Public discovery through verified-customer purchase/history. |
| `e2e/specs/publish-deliver.spec.ts` | Provider registration/verification fixture, publication, booking view, and redemption. |
| `e2e/specs/expiry-completion.spec.ts` | Clock-driven expiry and mixed/all-expired completion. |
| `e2e/specs/admin-intervention.spec.ts` | Suspension, reservation release, and sole override. |
| `e2e/specs/responsive-accessibility.spec.ts` | 390px/1280px overflow, labels, keyboard, and validation errors. |
| `e2e/specs/excluded-surfaces.spec.ts` | Absence of excluded controls/routes and public slot times. |
| `.github/workflows/ci.yml` | PR/main locked build and test matrix with least privilege and revision-bound reports. |
| `.github/workflows/release.yml` | Main-only successful-validation consumer that produces artifacts but never deploys or publishes. |
| `release/toolchain.lock.json` | Resolved action SHAs, runtime versions, browser revision, and base-image digests. |
| `release/artifact-manifest.schema.json` | Source/toolchain/evidence/archive/image manifest contract. |
| `scripts/release/resolve-toolchain-lock.sh` | Resolve approved stable tags to immutable action/image identities and fail on mutable output. |
| `scripts/release/check-workflow-pins.sh` | Reject tag-based actions, mutable container bases, write permissions, deployment, and registry pushes. |
| `scripts/release/build-release.sh` | Normalize timestamps/ownership/order, build archives and OCI image archives, and write checksums/manifest. |
| `scripts/release/verify-reproducibility.sh` | Two-clean-build payload checksum comparison for one exact revision/lock. |
| `scripts/release/release.test.sh` | Negative tests proving failed validation and mutable inputs cannot reach release. |

## Stable interfaces

The tasks below may add implementation detail but must preserve these cross-task contracts:

```text
AuthService.registerCustomer(email, password, displayName) -> SessionView
AuthService.registerProvider(email, password, displayName) -> VerificationPendingView
AuthService.verifyProvider(token) -> SessionView

CatalogService.saveShop(actor, SaveShopCommand) -> ShopView
CatalogService.saveOffering(actor, SaveOfferingCommand) -> OfferingView
CatalogService.bulkSaveSlots(actor, offeringId, List<SaveSlotCommand>) -> List<SlotView>
CatalogService.publishOffering(actor, offeringId) -> OfferingView
CatalogService.search(SearchQuery, Optional<Actor>) -> Page<ServiceSummaryView>

CommerceService.changeQuantity(customer, slotId, quantity) -> CartView
CommerceService.removeLine(customer, cartLineId) -> CartView
CommerceService.checkout(customer, CheckoutCommand) -> CheckoutResult

FulfillmentService.redeem(provider, bookingLineId, fourDigitCode) -> BookingLineView
FulfillmentService.expireDueLines(Instant now) -> ExpiryResult
AdminService.suspendProvider(admin, providerId) -> SuspensionResult
AdminService.releaseReservation(admin, cartLineId) -> ReleaseResult
AdminService.deliverExpired(admin, bookingLineId) -> BookingLineView
```

Public service summaries never contain slot start/end values. Authenticated customer slot views contain time/capacity availability. Customer order views contain their own redisplayable codes; provider views contain customer name/email but never the usable code. `ApiError` is `{ code, messageKey, fieldErrors, correlationId }`; it never echoes passwords, tokens, session IDs, HMAC secrets, or submitted redemption codes.

### Task 1: Register GitHub tracking counterparts

**Plan task:** `service-booking-2-register-github-tracking`  
**Owner/workspace:** Orchestrator (`service-booking-2-orchestrator`) / `.worktrees/service-booking-2-register-github-tracking`

**Files:**
- Create: `docs/project/tracking/github-links.json`
- Create: `docs/project/tracking/sync-retry.json`
- Create: `scripts/github/sync-work-items.sh`
- Create: `scripts/github/sync-work-items.test.sh`

**Interfaces:**
- Consumes: approved `phase-one-milestone-plan.json`, `./studioctl status`, `SERVICE_BOOKING_GITHUB_REPOSITORY=https://github.com/prashant7163/service-booking-2.git`, and a least-privilege authenticated `gh` process.
- Produces: idempotent milestone/issue URLs keyed by local stable IDs and a secret-free retry record keyed by local event sequence.

- [ ] **Step 1: Write the failing synchronization contract test**

Create a fake `gh` executable in the test's temporary directory, return fixture milestone/issue JSON, force one update failure, and assert: one GitHub milestone per five local milestones; one issue per implementation task; repeat runs do not duplicate records; titles/bodies contain Service Booking Two IDs but no specification contents, credentials, or personal data; failure leaves `github-links.json` intact and writes `sync-retry.json` with `operation`, `local_event_sequence`, `attempt`, `error_class`, and `next_command`.

```bash
bash scripts/github/sync-work-items.test.sh
```

Expected: non-zero with `scripts/github/sync-work-items.sh: No such file or directory`.

- [ ] **Step 2: Implement the local-authority synchronization script**

Implement commands `register`, `checkpoint`, and `verify`. Read plan/state through `jq`; require `SERVICE_BOOKING_GITHUB_REPOSITORY` to equal `https://github.com/prashant7163/service-booking-2.git` and fail closed for any other value; use `gh api` to find-or-create by embedded local ID; associate each implementation issue with its local milestone; write output to a temporary file and atomically rename only after every response validates. On failure, preserve links, increment retry attempt, and emit an actionable command without tokens or response bodies.

```json
{
  "schema_version": "1.0.0",
  "project_id": "service-booking-2",
  "run_id": "service-booking-2-benchmark",
  "repository": "https://github.com/prashant7163/service-booking-2.git",
  "last_local_event_sequence": 0,
  "milestones": {},
  "tasks": {}
}
```

- [ ] **Step 3: Prove local authority, idempotency, redaction, and retry behavior**

```bash
bash scripts/github/sync-work-items.test.sh
```

Expected: `4 synchronization scenarios passed` and exit 0.

- [ ] **Step 4: Reconcile only after least-privilege GitHub authorization is supplied**

```bash
./studioctl status
SERVICE_BOOKING_GITHUB_REPOSITORY=https://github.com/prashant7163/service-booking-2.git scripts/github/sync-work-items.sh register
SERVICE_BOOKING_GITHUB_REPOSITORY=https://github.com/prashant7163/service-booking-2.git scripts/github/sync-work-items.sh verify
```

Expected: status remains locally authoritative; the two tracking JSON files contain Service Booking Two stable IDs and URLs under `https://github.com/prashant7163/service-booking-2`; no Studio phase or approval changes. If least-privilege authentication is absent, expected result is an actionable retry record and no remote mutation.

- [ ] **Step 5: Commit the tracking implementation**

```bash
git add docs/project/tracking scripts/github
git commit -m "chore: add governed GitHub work tracking"
```

Expected: one commit containing only the four declared files.

### Task 2: Define architecture, API, privacy, and threat boundaries

**Plan task:** `service-booking-2-define-architecture`  
**Owner/workspace:** Architect (`service-booking-2-architect`) / `.worktrees/service-booking-2-define-architecture`

**Files:**
- Create: `docs/architecture/phase-one.md`
- Create: `docs/architecture/openapi/service-booking-two.yaml`
- Create: `docs/privacy/swiss-storage-boundary.md`

**Interfaces:**
- Consumes: approved spec digest, state rules, deferred-item treatments, and the stable interfaces above.
- Produces: normative module boundaries and OpenAPI operations consumed by every backend/frontend task.

- [ ] **Step 1: Write a failing contract-presence check**

```bash
.studio/runtime/bin/python -c 'from pathlib import Path; import yaml; p=Path("docs/architecture/openapi/service-booking-two.yaml"); d=yaml.safe_load(p.read_text()); required={"/api/auth/customers","/api/auth/providers","/api/services","/api/cart","/api/checkout","/api/customer/orders","/api/provider/bookings","/api/admin/providers/{providerId}/suspension"}; assert required <= set(d["paths"]); assert d["info"]["title"] == "Service Booking Two API"'
```

Expected: fail because the OpenAPI file does not exist.

- [ ] **Step 2: Specify the monolith and transaction boundaries**

Document one API/database/client, same-origin session and CSRF, owner/role authorization, database exclusion constraints, row locks for reservation/checkout/redeem/expiry races, injected `Clock`, HMAC code derivation, simulated ports, public-versus-authenticated projections, and exact aggregate transitions from the spec. State that broader suspended-provider fulfillment access remains unimplemented because its exception details are deferred.

- [ ] **Step 3: Define the exact OpenAPI contract**

Describe the paths named in Tasks 4, 6, 8, and 10; request/response records; `401`, `403`, `404`, `409`, and `422` behavior; `ApiError`; CSRF/session cookie behavior; price-acceptance conflict; idempotency key; page size 20; public time omission; owner-safe projections; and the e2e clock operation under the `e2e` server profile only. Do not define endpoints for any excluded feature.

- [ ] **Step 4: Record Swiss-storage and production limits**

State that local Compose uses synthetic data, no hosted storage is selected, any future application database and backups must be confirmed in Switzerland, and retention/legal/tax/backup-region review remains a prerequisite to real-user deployment.

- [ ] **Step 5: Validate structure, identity, and forbidden path absence**

```bash
.studio/runtime/bin/python -c 'from pathlib import Path; import yaml; d=yaml.safe_load(Path("docs/architecture/openapi/service-booking-two.yaml").read_text()); s="\n".join(d["paths"]); forbidden=("cancel","reschedule","refund","message","delete-account","data-export","analytics","category-admin"); assert all(x not in s for x in forbidden); assert "service-booking-1" not in (Path("docs/architecture/phase-one.md").read_text()+Path("docs/privacy/swiss-storage-boundary.md").read_text()).lower()'
```

Expected: exit 0 with no output.

- [ ] **Step 6: Commit architecture records**

```bash
git add docs/architecture docs/privacy
git commit -m "docs: define phase one architecture boundaries"
```

Expected: one commit containing the three declared documents.

### Task 3: Specify accessible responsive interactions

**Plan task:** `service-booking-2-design-interactions`  
**Owner/workspace:** UX/UI Designer (`service-booking-2-ux`) / `.worktrees/service-booking-2-design-interactions`

**Files:**
- Create: `docs/ux/phase-one-flows.md`

**Interfaces:**
- Consumes: the four approved journeys and OpenAPI operation IDs.
- Produces: page/state/focus/copy acceptance map consumed by Tasks 5, 7, 9, 11, and 12.

- [ ] **Step 1: Write the interaction coverage assertion**

```bash
.studio/runtime/bin/python -c 'from pathlib import Path; t=Path("docs/ux/phase-one-flows.md").read_text(); required=("discover-purchase","publish-deliver","expiry-completion","admin-intervention","390px","1280px","English","Deutsch","keyboard","field error","empty state","payment failure"); assert all(x in t for x in required)'
```

Expected: fail because the flow document does not exist.

- [ ] **Step 2: Define page and state matrices**

For `/`, `/sign-in`, `/register/customer`, `/register/provider`, `/cart`, `/orders`, `/provider/shop`, `/provider/bookings`, and `/admin`, record allowed roles, primary action, loading/empty/success/error state, focus destination, and English/German copy key. Explicitly show public aggregate availability without times and customer slot selection with times.

- [ ] **Step 3: Define mobile/desktop and accessibility behavior**

Specify one-column 390px forms/lists, wrapping cards/tables with no page overflow, 1280px two-column opportunities, visible focus, logical tab order, native labels, keyboard-operable actions, `aria-live` status, and field-linked validation errors. Preserve provider-authored field language labels instead of automatic translation/version selection.

- [ ] **Step 4: Record excluded controls**

List each forbidden customer/provider/admin control and confirm that absence applies to navigation, forms, contextual actions, and active client routes.

- [ ] **Step 5: Run the coverage assertion and commit**

```bash
.studio/runtime/bin/python -c 'from pathlib import Path; t=Path("docs/ux/phase-one-flows.md").read_text(); required=("discover-purchase","publish-deliver","expiry-completion","admin-intervention","390px","1280px","English","Deutsch","keyboard","field error","empty state","payment failure"); assert all(x in t for x in required)'
git add docs/ux/phase-one-flows.md
git commit -m "docs: define phase one interaction flows"
```

Expected: assertion exits 0, then one documentation commit.

### Task 4: Build backend foundation, PostgreSQL, authentication, and simulations

**Plan task:** `service-booking-2-build-backend-foundation`  
**Owner/workspace:** Backend Engineer (`service-booking-2-backend`) / `.worktrees/service-booking-2-build-backend-foundation`

**Files:**
- Create: `.env.example`, `.tool-versions`, `Makefile`, `compose.yaml`
- Modify: `.gitignore`, `README.md`
- Create: `backend/pom.xml`, `backend/mvnw`, `backend/mvnw.cmd`, `backend/.mvn/wrapper/maven-wrapper.properties`, `backend/Dockerfile`
- Create: backend `Application`, config, common, auth, simulation, `application*.yml`, `V1__identity_and_catalog.sql`, shared integration fixture, `AuthIntegrationTest`, and initial `ForbiddenSurfaceTest` files from the complete file map.

**Interfaces:**
- Consumes: Task 2 OpenAPI operations and secure environment variables `DB_URL`, `DB_USER`, `DB_PASSWORD`, and `REDEMPTION_HMAC_SECRET`.
- Produces: authenticated `Actor(accountId, role, verified, suspended)`, CSRF/session behavior, simulated ports, PostgreSQL/Flyway runtime, and the shared test base.

- [ ] **Step 1: Create the Maven wrapper and locked project descriptor**

Configure Java 21, Spring Boot 4.1.1, reproducible `project.build.outputTimestamp`, and dependencies for web, security, validation, JPA, Flyway PostgreSQL, actuator health, PostgreSQL JDBC, test security, and Testcontainers PostgreSQL. Make `./mvnw -q -DskipTests package` the backend build.

- [ ] **Step 2: Write failing authentication and boundary tests**

```java
@Test void anonymousCannotCreateCart() { postJson("/api/cart", "{}").andExpect(status().isUnauthorized()); }
@Test void unverifiedProviderCannotPublish() { as(unverifiedProvider).post("/api/provider/offerings/1/publish").andExpect(status().isForbidden()); }
@Test void oneEmailCannotHoldCustomerAndProviderRoles() { assertConflict(registerProvider(customerEmail)); }
@Test void passwordIsBcryptAndNeverReturnedOrLogged() { assertThat(storedHash).startsWith("$2"); assertNoSecretInResponseOrLogs(); }
@Test void csrfIsRequiredForAuthenticatedMutation() { as(customer).withoutCsrf().post("/api/cart").andExpect(status().isForbidden()); }
```

```bash
cd backend
./mvnw -q -Dtest=AuthIntegrationTest,ForbiddenSurfaceTest test
```

Expected: fail because the application/auth types and endpoints do not exist.

- [ ] **Step 3: Create schema and safe runtime profiles**

Create account/session/verification credential tables with unique normalized email, one role per account, BCrypt hashes, one-to-one provider/shop constraint support, and no plaintext reset/verification token. Seed only the two fixed category codes. Configure local/e2e PostgreSQL, UTC, schema validation, secure cookie in non-local profiles, CSRF, and secrets exclusively from the environment; `.env.example` contains names and non-secret descriptions only.

- [ ] **Step 4: Implement auth and simulated interfaces minimally**

Implement the Task 2 auth routes. Hash credentials, store only verification/reset token digests, prevent suspended sign-in, require verified provider publication, and return only `SessionView(UUID accountId, Role role, boolean verified)`. The simulated adapter calls a test spy; normal logs contain event type/correlation ID only. No simulated inbox route or UI exists.

- [ ] **Step 5: Pass foundation tests and clean build**

```bash
cd backend
./mvnw -q -Dtest=AuthIntegrationTest,ForbiddenSurfaceTest test
./mvnw -q clean verify
cd ..
docker compose config --quiet
```

Expected: selected tests and full backend verification pass; Compose config is valid.

- [ ] **Step 6: Prove PostgreSQL startup and Flyway migration**

```bash
docker compose up -d postgres
docker compose run --rm api ./mvnw -q -DskipTests spring-boot:run
```

Expected: PostgreSQL health is healthy and API startup logs show successful Flyway V1 without credentials. Stop the foreground API after the health check.

- [ ] **Step 7: Commit backend foundation**

```bash
git add .env.example .tool-versions Makefile compose.yaml .gitignore README.md backend
git commit -m "feat: add secure service booking foundation"
```

Expected: one buildable foundation commit.

### Task 5: Build the React shell, authentication views, and bilingual UI

**Plan task:** `service-booking-2-build-frontend-shell`  
**Owner/workspace:** Frontend Engineer (`service-booking-2-frontend`) / `.worktrees/service-booking-2-build-frontend-shell`

**Files:**
- Create: frontend package/config/container/entry/app/api/auth/i18n/components/style/test files listed in the complete file map.
- Create: `frontend/src/features/auth/AuthPages.tsx`
- Create: `frontend/src/features/auth/AuthPages.test.tsx`

**Interfaces:**
- Consumes: `GET /api/auth/session`, registration/sign-in/sign-out/reset routes, `ApiError`, and CSRF cookie/header contract.
- Produces: `useAuth()`, `api.request<T>()`, `useI18n()`, `Layout`, `FormField`, and role-aware routes used by later client tasks.

- [ ] **Step 1: Create exact frontend dependencies and scripts**

Use Node 24, React 19, TypeScript, Vite, React Router, Vitest, Testing Library, user-event, ESLint, and no global state library. Commit `package-lock.json`. Define `npm run lint`, `npm run typecheck`, `npm test -- --run`, and `npm run build`.

- [ ] **Step 2: Write failing shell/auth/language tests**

```tsx
it('falls back to English and persists Deutsch on this device', async () => {
  Object.defineProperty(navigator, 'languages', { value: ['fr-CH'], configurable: true });
  render(<App />);
  expect(screen.getByRole('link', { name: 'Services' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Deutsch' }));
  expect(localStorage.getItem('service-booking-2-language')).toBe('de');
  expect(screen.getByRole('link', { name: 'Dienstleistungen' })).toBeVisible();
});
it('labels email and links its API error', async () => {
  render(<CustomerRegistration />);
  const email = screen.getByLabelText('Email');
  await userEvent.type(email, 'invalid');
  await userEvent.click(screen.getByRole('button', { name: 'Create customer account' }));
  expect(email).toHaveAccessibleDescription('Enter a valid email address.');
});
it('hides privileged navigation from an anonymous session', () => {
  render(<App />);
  expect(screen.queryByRole('link', { name: 'Cart' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Provider' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
});
it('redacts secret values from an API error', () => {
  expect(publicError({ code: 'AUTH_FAILED', message: 'token=4931 password=hunter2' }).message)
    .toBe('Authentication failed.');
});
```

```bash
cd frontend
npm test -- --run src/features/auth/AuthPages.test.tsx
```

Expected: fail because app/auth/i18n modules do not exist.

- [ ] **Step 3: Implement typed API, session, language, and layout primitives**

`api.request<T>()` always sends same-origin credentials and the CSRF header for mutations, maps `ApiError`, and never logs bodies. `AuthContext` bootstraps the session and exposes role/verified state. `useI18n()` selects `en`/`de` from supported browser preferences, falls back to `en`, stores only the manual choice in `localStorage`, and translates interface keys only. `Layout` exposes a visible language switch and role navigation.

- [ ] **Step 4: Implement accessible auth pages and protected routing**

Add customer/provider registration, sign-in, reset request/completion, sign-out, and provider verification acknowledgment. Use associated labels, field error IDs, focus the first invalid field, and show generic credential errors. Do not add account deletion or a simulated-email inbox.

- [ ] **Step 5: Pass frontend verification and build**

```bash
cd frontend
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Expected: all commands pass; Vite writes `frontend/dist`; no secret/token string appears in rendered error snapshots.

- [ ] **Step 6: Commit frontend foundation**

```bash
git add frontend
git commit -m "feat: add bilingual authenticated web shell"
```

Expected: one client foundation commit.

### Task 6: Implement catalog, slots, publication, and discovery API

**Plan task:** `service-booking-2-build-catalog-api`  
**Owner/workspace:** Backend Engineer (`service-booking-2-backend`) / `.worktrees/service-booking-2-build-catalog-api`

**Files:**
- Create: backend catalog Java files and `CatalogIntegrationTest` from the complete file map.
- Complete: `backend/src/main/resources/db/migration/V1__identity_and_catalog.sql`
- Modify: `backend/src/main/java/ch/servicebookingtwo/config/SecurityConfig.java`
- Modify: `docs/architecture/openapi/service-booking-two.yaml` only if implementation reveals a non-material schema clarification; any behavioral deviation returns to the Orchestrator.

**Interfaces:**
- Consumes: verified provider `Actor`, fixed category codes, injected `Clock`, and Task 2 catalog records.
- Produces: provider shop/offering/slot commands; `GET /api/services`; authenticated `GET /api/services/{offeringId}/slots`; `unpublishOffering` for Task 10.

- [ ] **Step 1: Write failing shop and publication tests**

Create these exact JUnit methods and assertions:

```text
providerCreatesExactlyOneSwissAddressShopAndDuplicateNamesAcrossOwnersAreAllowed:
  first shop -> 201; second shop for same provider -> 409 ONE_SHOP_ONLY; same name for another provider -> 201
publicationRequiresVerifiedProviderAddressImageInScopeCategoryPriceAndPositiveFutureInventory:
  each missing/invalid precondition -> 422; complete verified fixture -> 200 PUBLISHED
bulkSaveCreatesTwoNonRecurringSlotsAndDraftOverlapIsAllowedUntilPublish:
  two explicit rows -> 201 with two distinct SKU UUIDs; overlapping draft rows remain DRAFT
publishRejectsOverlapButAcceptsTouchingBoundaries:
  [10:00,11:00)+[10:30,11:30) -> 409 SLOT_OVERLAP; [10:00,11:00)+[11:00,12:00) -> 200
reservedOrPurchasedSlotTimeIsImmutableAndCapacityCannotFallBelowCommittedUnits:
  edit times after reservation/purchase -> 409; capacity below reserved+purchased -> 409; equal -> 200
checkoutAtOrAfterSlotStartIsRejected:
  clock == start and clock > start -> 409 SLOT_STARTED
```

- [ ] **Step 2: Write failing discovery/search tests**

```text
emptyQueryListsPublishedExhaustedOfferingsAndPublicProjectionHidesTimes:
  empty q -> includes available and exhausted published fixtures; serialized JSON has no startAt/endAt
signedInCustomerProjectionShowsSelectableFutureSlotTimes:
  customer GET offering slots -> future startAt/endAt; anonymous GET -> 401
searchMatchesOfferingCategoryAndShopAcrossCaseAccentUmlautAndOneTypo:
  Zürich/zurich/ZURICH and accepted one-edit misspelling -> identical fixture ID
quotedPhraseIsContiguousExactNormalizedAndNeverFuzzy:
  exact contiguous normalized phrase -> match; separated or misspelled quoted phrase -> none
resultsPageByTwentyDefaultToRelevanceAndSupportCategoryPriceAndPriceSort:
  21 fixtures -> 20+1 pages; default relevance; category/min/max and both price orders asserted
noDateLocationSavedSearchPersonalizationSeoOrPublicShopPathExists:
  OpenAPI and MockMvc -> 404/405 for forbidden paths and no unsupported query parameter contract
```

```bash
cd backend
./mvnw -q -Dtest=CatalogIntegrationTest test
```

Expected: fail because catalog domain/API is absent.

- [ ] **Step 3: Implement catalog persistence constraints**

Enable `unaccent`, `pg_trgm`, and `btree_gist`; add one-shop-per-provider uniqueness; positive two-decimal CHF price; positive capacity; `start_at < end_at`; distinct UUID SKU per slot; and a provider-wide published-time `tstzrange` exclusion constraint using `[)` bounds so touching slots pass. Persist multilingual text as independently optional `en`/`de` values plus a submitted-language marker per field; require at least one value without automatically selecting by UI language.

- [ ] **Step 4: Implement provider commands and public/customer projections**

Authorize by owner; require verified/non-suspended provider for publish; require Swiss postal address and one in-scope category; permit duplicate shop names; bulk-save at least two explicit slots in one request; enforce protected time/capacity edits using committed reservation plus purchase counts. Public `ServiceSummaryView` contains shop address and summed availability over `start_at > clock.instant()` but no slot timestamps; customer slot view contains future timestamps.

- [ ] **Step 5: Implement normalized search without stemming**

Normalize with lower-case and unaccent. For quoted input, apply contiguous `LIKE` matching to normalized offering/category/shop fields and no trigram predicate. For unquoted input, combine normalized containment and `similarity` for the accepted misspelling fixture, rank exact/containment above trigram, and never use a language text-search stemmer. Apply category and positive price bounds; allow `relevance`, `price_asc`, and `price_desc`; clamp size to 20.

- [ ] **Step 6: Pass catalog tests and the backend suite**

```bash
cd backend
./mvnw -q -Dtest=CatalogIntegrationTest test
./mvnw -q verify
```

Expected: every catalog method passes against PostgreSQL; the foundation tests remain green.

- [ ] **Step 7: Commit catalog API**

```bash
git add backend/src/main backend/src/test/java/ch/servicebookingtwo/catalog docs/architecture/openapi/service-booking-two.yaml
git commit -m "feat: add provider catalog and public discovery"
```

Expected: one catalog API commit.

### Task 7: Implement provider catalog and discovery UI

**Plan task:** `service-booking-2-build-catalog-ui`  
**Owner/workspace:** Frontend Engineer (`service-booking-2-frontend`) / `.worktrees/service-booking-2-build-catalog-ui`

**Files:**
- Create: `frontend/src/features/catalog/CatalogPages.tsx`
- Create: `frontend/src/features/catalog/CatalogPages.test.tsx`
- Modify: `frontend/src/app/routes.tsx`, `frontend/src/i18n/en.ts`, `frontend/src/i18n/de.ts`, `frontend/src/styles.css`

**Interfaces:**
- Consumes: catalog provider/public/customer OpenAPI records from Task 6.
- Produces: `/`, `/provider/shop`, offering/slot forms, and signed-in slot selector used by Task 9.

- [ ] **Step 1: Write failing provider/public discovery component tests**

```text
saves two explicit slots and links errors: submit two rows; assert one bulk request; return row-2 overlap; assert row-2 described-by text
public card hides time: render public fixture; assert address and aggregate count; assert no time element
customer reveals time: rerender with CUSTOMER session; assert both future times and quantity selector
accepted filters only: change query/category/CHF/page/price sort; assert URL; assert no date/location control
authored language stays explicit: switch UI language; assert German-authored value and its Deutsch label do not change
```

```bash
cd frontend
npm test -- --run src/features/catalog/CatalogPages.test.tsx
```

Expected: fail because the catalog pages do not exist.

- [ ] **Step 2: Implement provider shop/offering/slot forms**

Build one shop form with postal address and image URL entries, one offering form constrained to the two categories and positive two-decimal CHF price, explicit per-field `en`/`de` labels, draft save, bulk slot rows with start/end/capacity, publish/unpublish actions, and server-conflict focus. Do not add organization, staff, recurring, delivery-mode, ownership-transfer, or category-admin controls.

- [ ] **Step 3: Implement public and customer discovery**

Build query/category/min/max/sort/page controls; show exhausted published offerings; render address, submitted-language labels, CHF unit price, and aggregate future availability. Do not render public times or a public shop route. Once signed in as a customer, render future slot timestamps and quantity-to-cart handoff for Task 9.

- [ ] **Step 4: Complete translations and responsive states**

Add matching keys to both dictionaries for labels, errors, loading/empty/results, draft/published/exhausted, and pagination. At 390px controls stack and cards wrap; at 1280px filters and results may use columns without page overflow.

- [ ] **Step 5: Pass catalog UI and full frontend checks**

```bash
cd frontend
npm test -- --run src/features/catalog/CatalogPages.test.tsx
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Expected: all commands pass and the public rendered output contains no slot timestamp.

- [ ] **Step 6: Commit catalog UI**

```bash
git add frontend/src
git commit -m "feat: add provider publishing and service discovery UI"
```

Expected: one catalog client commit.

### Task 8: Implement atomic cart, checkout, pricing, and order API

**Plan task:** `service-booking-2-build-commerce-api`  
**Owner/workspace:** Backend Engineer (`service-booking-2-backend`) / `.worktrees/service-booking-2-build-commerce-api`

**Files:**
- Create: backend commerce Java files, `V2__commerce_and_fulfillment.sql`, `CommerceIntegrationTest`, and `CommerceConcurrencyTest` from the complete file map.
- Modify: `CatalogService.java`, `CatalogRepositories.java`, `SecurityConfig.java`, `ForbiddenSurfaceTest.java`, and OpenAPI commerce paths.
- Modify: simulation payment/notification adapters only through their declared ports.

**Interfaces:**
- Consumes: customer `Actor`, selectable `Slot`, current `Offering.price`, `PaymentPort.authorize(PaymentAttempt)`, and injected `Clock`.
- Produces: `CartView`, `CheckoutCommand(selectedCartLineIds, acceptedTotal, simulateOutcome, idempotencyKey)`, `CheckoutResult`, customer orders, and provider-owned booking projections.

- [ ] **Step 1: Write failing cart and pricing tests**

```text
quantityDeltaReservesAndExplicitRemovalReleasesExactlyThatDelta: capacity 5; quantities 2->3->1->removed; available 3->2->4->5
oneDatabaseCartSurvivesSignOutSessionExpiryDeviceAndPaymentFailureWithoutTimer: reload with two sessions and advanced clock; same line/quantity remains
selectedCheckoutLeavesUnselectedLinesAndReservationsInCart: select line A; order has A; cart still has B; B availability stays reduced
twoAtChf20PlusOneAtChf30TotalsChf70WithNoAddedFeeDiscountOrTax: unit and aggregate assertions equal 70.00 CHF
providerPriceEditRepricesCartAndRequiresCustomerAcceptance: 20.00->25.00; old accepted total -> 409 PRICE_ACCEPTANCE_REQUIRED
acceptedAttemptAmountAndSuccessfulOrderPricesIgnoreConcurrentLaterEdits: start at 25.00; edit to 30.00; successful attempt/order remain 25.00
```

- [ ] **Step 2: Write failing atomicity, idempotency, and ownership tests**

```text
competingFinalUnitReservationsProduceOneSuccessAndNeverNegativeAvailability: two synchronized transactions; statuses {200,409}; available 0
failedSelectedLineOrPaymentCreatesNoOrderAndPreservesEverySelectedReservation: force unavailable/payment failure; order count 0; both cart rows unchanged
replayedSuccessfulIdempotencyKeyReturnsSameOrderWithoutDoubleConsumption: two requests; same order UUID; purchased count unchanged after replay
providerSeesOnlyOwnedLinesWithCustomerNameAndEmail: two providers; each response has only owned line plus customer contact
customerHistoryShowsImmutablePricesCodesAndAwaitingFulfillmentButNoFailedPayment: one success/one failure; history contains success only and four-digit code
```

```bash
cd backend
./mvnw -q -Dtest=CommerceIntegrationTest,CommerceConcurrencyTest test
```

Expected: fail because commerce tables/services are absent.

- [ ] **Step 3: Implement commerce schema invariants**

Add one cart per customer, unique cart line per slot, positive reserved quantity, payment attempt with accepted `NUMERIC(12,2)` CHF amount, unique `(customer_id,idempotency_key)`, one marketplace order per successful key, and immutable booking-line unit/total price and quantity. Add database checks and foreign keys; keep availability derived as capacity minus cart reservations minus purchased quantity.

- [ ] **Step 4: Implement transactional quantity changes**

Lock the slot and cart line in one transaction, reject anonymous/unverified/wrong-role/cross-owner access, reject negative or over-capacity changes, and update only the delta. Waiting has no effect. Service unpublication/provider suspension hooks remove affected cart lines and thereby release reservations; successful checkout removes selected lines without returning those units.

- [ ] **Step 5: Implement atomic idempotent checkout**

Lock selected cart lines/slots in stable ID order; reject empty selection, started slot, unavailable line, or changed total with no order mutation. Persist the accepted total before calling the deterministic simulated payment port. On simulated failure, roll back order/booking creation but retain cart reservations. On success, create exactly one marketplace order and all booking lines, snapshot prices, remove selected lines, and emit confirmation/provider-purchase notifications after commit. Replaying the key returns the same result.

- [ ] **Step 6: Implement owner-safe history projections**

Customer history contains marketplace total, original line prices/quantities, status, slot, and customer-display redemption code. Provider view contains only owned lines plus customer name/email and never exposes another provider's lines. Until Task 10 resolves lines, aggregate status remains `AWAITING_FULFILLMENT`.

- [ ] **Step 7: Pass commerce and full backend tests**

```bash
cd backend
./mvnw -q -Dtest=CommerceIntegrationTest,CommerceConcurrencyTest test
./mvnw -q verify
```

Expected: all race tests pass repeatedly; no negative inventory, duplicate order, partial selection, or cross-owner result is observed.

- [ ] **Step 8: Commit commerce API**

```bash
git add backend/src/main backend/src/test docs/architecture/openapi/service-booking-two.yaml
git commit -m "feat: add atomic reservation and checkout workflow"
```

Expected: one commerce API commit.

### Task 9: Implement cart, payment, and order UI

**Plan task:** `service-booking-2-build-commerce-ui`  
**Owner/workspace:** Frontend Engineer (`service-booking-2-frontend`) / `.worktrees/service-booking-2-build-commerce-ui`

**Files:**
- Create: `frontend/src/features/commerce/CommercePages.tsx`
- Create: `frontend/src/features/commerce/CommercePages.test.tsx`
- Modify: catalog slot selector, routes, both dictionaries, and styles.

**Interfaces:**
- Consumes: `CartView`, checkout result/conflict, customer orders, and provider lines from Task 8.
- Produces: `/cart`, `/orders`, provider booking-list handoff, and a customer retry/price-acceptance flow.

- [ ] **Step 1: Write failing cart/checkout/history component tests**

```text
quantity/remove: mock two lines; set A quantity 3 then remove A; assert requests and B remains
selection/total: select 2x20 and 1x30 while leaving C unselected; assert CHF 70.00 and selected IDs only
price acceptance: return PRICE_ACCEPTANCE_REQUIRED with CHF 80.00; assert purchase disabled until Accept CHF 80.00 clicked
payment failure: choose Fail; assert error and identical cart; choose Retry and assert a new attempt key
history: return one order; assert original prices, Awaiting fulfillment, line outcomes, and customer code
```

```bash
cd frontend
npm test -- --run src/features/commerce/CommercePages.test.tsx
```

Expected: fail because commerce pages do not exist.

- [ ] **Step 2: Implement persistent cart and selected checkout**

Load cart from the authenticated account on entry rather than browser storage. Provide quantity, remove, and selected-line checkboxes; display every amount with `Intl.NumberFormat` currency `CHF`; show no fee/discount/tax row. Disable purchase until at least one line is selected and its current total has been accepted.

- [ ] **Step 3: Implement deterministic simulated payment states**

Generate one idempotency key per explicit attempt, offer visible `Succeed` and `Fail` simulation choices, keep the key for transport retry, create a new key after a completed failure, and handle `PRICE_ACCEPTANCE_REQUIRED` by displaying the changed total and requiring a fresh acceptance. Never render failed attempts in history.

- [ ] **Step 4: Implement order and provider-line views**

Render `Awaiting fulfillment` and `Completed`, line-level Delivered/Expired states, original quantity/unit/total price, slot, and customer-owned redemption code. Provider list renders only API-returned owned lines and contact data; redemption controls arrive in Task 11.

- [ ] **Step 5: Pass commerce UI and frontend verification**

```bash
cd frontend
npm test -- --run src/features/commerce/CommercePages.test.tsx
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Expected: all commands pass; payment failure preserves rendered cart lines and a price conflict requires a second acceptance action.

- [ ] **Step 6: Commit commerce UI**

```bash
git add frontend/src
git commit -m "feat: add cart checkout and order history UI"
```

Expected: one commerce client commit.

### Task 10: Implement fulfillment, expiry, provider lifecycle, and administration API

**Plan task:** `service-booking-2-build-fulfillment-admin-api`  
**Owner/workspace:** Backend Engineer (`service-booking-2-backend`) / `.worktrees/service-booking-2-build-fulfillment-admin-api`

**Files:**
- Create: backend fulfillment/admin Java files and `FulfillmentAdminIntegrationTest` from the complete file map.
- Create: `backend/src/main/java/ch/servicebookingtwo/testing/E2eClockController.java`
- Modify: commerce booking/order, catalog unpublication, auth suspension, simulated notification, security, e2e profile, forbidden-surface test, and OpenAPI files.

**Interfaces:**
- Consumes: booking lines/orders, cart reservations, provider ownership, injected `Clock`, environment HMAC secret, and `NotificationPort`.
- Produces: provider booking/redeem routes, due-line expiry, unpublication cleanup, and exactly three administrator mutations.

- [ ] **Step 1: Write failing redemption and expiry tests**

```text
samePurchasedSlotUnitsShareOneFourDigitCodeAndDifferentSlotsDoNot: quantity 2 line -> one code; second slot -> unequal code
owningProviderSelectsLineAndValidCodeAtomicallyDeliversAllUnitsEvenBeforeStart: pre-start redeem -> status Delivered and delivered quantity 2
wrongOwnerWrongCodeAndSecondRedemptionNeverDeliver: each call -> 403/422/409; state remains single Delivered transition
unresolvedLineExpiresExactlyAtEndAndItsCodeThenFails: before end unresolved; at end Expired; later redeem -> 409 BOOKING_EXPIRED
deliveredLineNeverExpiresAndMixedOrAllExpiredOrderBecomesCompleted: run both aggregates; every resolved aggregate -> Completed
expiryProducesNoRefundAndNoCartTimer: payment/order remains; no refund record or timed cart deletion after clock advance
```

- [ ] **Step 2: Write failing lifecycle/admin/notification tests**

```text
unpublishRemovesAffectedCartLinesButPreservesRedeemablePurchases: carts lose offering lines; availability restored; purchased line redeems
suspensionBlocksProviderSignInAndDiscoveryAndReleasesCartsButPreservesPurchases: sign-in 403; search absent; carts released; order present
administratorReleasesOnlyChosenReservation: two lines; release A; A removed/available; B unchanged
administratorAloneChangesExpiredToDeliveredWithoutReactivatingCode: provider 403; admin 200; later code 409; aggregate recalculated
purchaseRedemptionExpiryAndConfirmationEventsReachNotificationPortWithoutSecretLogs: assert four event kinds/correlation IDs and no code/token in captured logs
noCategoryEditHideCancellationRescheduleRefundOrMessageEndpointExists: OpenAPI and MockMvc prove every forbidden mutation absent
```

```bash
cd backend
./mvnw -q -Dtest=FulfillmentAdminIntegrationTest,ForbiddenSurfaceTest test
```

Expected: fail because fulfillment/admin behavior is absent.

- [ ] **Step 3: Implement scoped HMAC-derived redemption codes**

For each booking line, choose the lowest nonce whose `HMAC-SHA-256(secret, bookingLineId + orderId + slotId + nonce)` unbiased four-digit projection is unused by another slot SKU in that order; persist the nonce and a keyed fingerprint, not the usable code. Re-derive for the owning customer's view, compare provider input in constant time, and never log or expose the code outside that view and the simulated confirmation test boundary. Provider submission always includes the selected booking-line ID; authorize its provider owner before comparison. Do not add every-attempt history or a booking-level temporary block.

- [ ] **Step 4: Implement atomic delivery, expiry, and order completion**

Lock the booking and order. Valid provider redemption transitions only unresolved non-expired lines to `DELIVERED`, including before start, and emits redemption/confirmation events after commit. `expireDueLines(now)` locks unresolved lines with `end_at <= now`, marks them `EXPIRED`, invalidates ordinary redemption, emits expiry, and recalculates the aggregate: `COMPLETED` iff every line is Delivered or Expired. Delivered is never changed by expiry.

- [ ] **Step 5: Implement unpublication, suspension, release, and sole override**

Unpublication removes every affected cart line/reservation but leaves purchased booking lines. Suspension also blocks future provider sessions and removes the provider's listings while preserving purchases. Administrator release removes one selected cart line. Administrator override accepts only an Expired line, sets Delivered, recalculates order completion, does not run code validation, and leaves the code unusable. No direct hide/category/cancel/reschedule/refund mutation exists.

- [ ] **Step 6: Add deterministic e2e time control safely**

Expose clock read/advance only when the `e2e` Spring profile is active, bind it to loopback/test network, require the test control header, exclude it from normal/local/release profiles, and cover absence under the normal profile in `ForbiddenSurfaceTest`.

- [ ] **Step 7: Pass fulfillment, race, security, and full backend tests**

```bash
cd backend
./mvnw -q -Dtest=FulfillmentAdminIntegrationTest,CommerceConcurrencyTest,ForbiddenSurfaceTest test
./mvnw -q verify
```

Expected: all tests pass, including concurrent expiry/redemption and suspension/reservation cases, with no secret in captured logs.

- [ ] **Step 8: Commit fulfillment/admin API**

```bash
git add backend/src/main backend/src/test docs/architecture/openapi/service-booking-two.yaml
git commit -m "feat: add booking fulfillment and limited administration"
```

Expected: one fulfillment/admin API commit.

### Task 11: Implement provider fulfillment and administrator UI

**Plan task:** `service-booking-2-build-fulfillment-admin-ui`  
**Owner/workspace:** Frontend Engineer (`service-booking-2-frontend`) / `.worktrees/service-booking-2-build-fulfillment-admin-ui`

**Files:**
- Create: `frontend/src/features/fulfillment/FulfillmentPages.tsx`
- Create: `frontend/src/features/fulfillment/FulfillmentPages.test.tsx`
- Modify: commerce provider-line view, routes, both dictionaries, and styles.

**Interfaces:**
- Consumes: provider booking/redeem, unpublish, suspension, reservation-release, and expired-delivery operations from Task 10.
- Produces: `/provider/bookings` and `/admin` role-restricted pages completed for Task 12.

- [ ] **Step 1: Write failing provider/admin component tests**

```text
provider selection/code: submit with no line, 3 digits, 5 digits; assert linked errors; 4 digits sends selected line ID
atomic delivery/reuse: successful response quantity 2 Delivered; code cleared; action disabled on refresh
admin-only controls: render ADMINISTRATOR and CUSTOMER sessions; three controls present only for administrator
forbidden controls: query by accessible names for category edit/hide/cancel/reschedule/refund/message; all absent
expiry/completion: render expired and mixed aggregate fixtures; assert Expired/Completed and no refund/provider redeem action
```

```bash
cd frontend
npm test -- --run src/features/fulfillment/FulfillmentPages.test.tsx
```

Expected: fail because fulfillment pages do not exist.

- [ ] **Step 2: Implement provider booking and redemption states**

List only API-returned owned booking lines with customer name/email, quantity, slot, and status. Require a selected line and a four-digit input, associate errors with the code field, clear the input after success, refresh line/order state, and disable delivery for Delivered/Expired lines. Do not show the customer's valid code to the provider.

- [ ] **Step 3: Implement limited administrator controls**

Render provider suspension, selected cart-reservation release, and Expired-to-Delivered actions behind administrator role routing. Each requires explicit confirmation naming the target and displays preserved-purchase/released-quantity effects. No other moderation/category/fulfillment action is rendered.

- [ ] **Step 4: Complete English/German copy and responsive behavior**

Add matched keys for all statuses, actions, confirmations, and errors. On 390px, replace wide tables with labeled cards and preserve logical keyboard order; on 1280px, use tables only with accessible headers and responsive containment.

- [ ] **Step 5: Pass fulfillment UI and frontend verification**

```bash
cd frontend
npm test -- --run src/features/fulfillment/FulfillmentPages.test.tsx
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Expected: all commands pass; role-incompatible and excluded controls are absent.

- [ ] **Step 6: Commit fulfillment/admin UI**

```bash
git add frontend/src
git commit -m "feat: add provider fulfillment and admin controls"
```

Expected: one fulfillment/admin client commit.

### Task 12: Prove journeys, responsive accessibility, and exclusions in Playwright

**Plan task:** `service-booking-2-prove-acceptance`  
**Owner/workspace:** Frontend Engineer (`service-booking-2-frontend`) / `.worktrees/service-booking-2-prove-acceptance`

**Files:**
- Create: all `e2e` package/config/fixture/spec files from the complete file map.
- Modify: `compose.yaml`, `Makefile`, `README.md`, and `application-e2e.yml` for deterministic isolated execution.

**Interfaces:**
- Consumes: complete built application, synthetic fixture API, visible payment controls, e2e-only clock controller, and the UX flow map.
- Produces: HTML/JUnit/trace evidence for the four journeys, 390px/1280px matrix, and excluded surfaces.

- [ ] **Step 1: Create locked Playwright project and failing smoke assertion**

Pin Playwright 1.63 in `e2e/package-lock.json`; configure Chromium projects named `mobile-390` and `desktop-1280`, retries 0 locally/1 in CI, trace on first retry, screenshot on failure, HTML and JUnit reporters, and a unique synthetic run ID. Start the built Compose stack with `SPRING_PROFILES_ACTIVE=e2e`.

```ts
test('anonymous discovery hides slot times', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /services/i })).toBeVisible();
  await expect(page.getByTestId('public-slot-time')).toHaveCount(0);
});
```

```bash
cd e2e
npm test -- --project=desktop-1280 --grep "anonymous discovery hides slot times"
```

Expected: fail before the Playwright fixture/server configuration is complete.

- [ ] **Step 2: Implement synthetic setup and clock fixtures**

Create unique customer/provider identities, verify provider through the internal test boundary, create two category fixtures and multiple slot/price states, and reset the isolated database per worker. Advance the clock only through the e2e-profile control header. Never use real names, email delivery, payment cards, production credentials, or user data.

- [ ] **Step 3: Implement the four approved journey specs**

`discover-purchase.spec.ts` covers anonymous search/filter/public hiding, verified cart, multi-provider selected checkout, CHF total acceptance, visible payment failure/retry, one order, prices/codes/status. `publish-deliver.spec.ts` covers provider registration/verification fixture, one shop, images/address, offering, two touching slots, overlap rejection, public search, owned booking/contact view, and one-code all-unit delivery. `expiry-completion.spec.ts` advances to end, rejects code, preserves Delivered, and proves mixed/all-Expired Completed. `admin-intervention.spec.ts` proves suspension, selected reservation release, purchase preservation, sign-in denial, and Expired-to-Delivered only.

- [ ] **Step 4: Implement responsive/accessibility and excluded-surface specs**

At both configured widths, run public discovery, customer checkout, provider publication/booking/redemption; assert `document.documentElement.scrollWidth <= clientWidth`, primary actions visible and keyboard-triggerable, each form control has an accessible name, and field errors are linked. Visit all role routes and inspect the OpenAPI path list to prove excluded UI controls and mutation paths are absent.

- [ ] **Step 5: Run focused then complete browser verification**

```bash
cd e2e
npm test -- --project=desktop-1280
npm test -- --project=mobile-390
npm test
```

Expected: all six spec files pass in both projects; HTML/JUnit results and failure-only traces are produced under ignored artifact directories.

- [ ] **Step 6: Run the complete local candidate verification**

```bash
make verify
make e2e
```

Expected: locked frontend checks/build, all PostgreSQL-backed backend tests, and both Playwright viewports pass against one recorded candidate revision.

- [ ] **Step 7: Commit browser acceptance evidence**

```bash
git add e2e compose.yaml Makefile README.md backend/src/main/resources/application-e2e.yml
git commit -m "test: cover phase one journeys and accessibility"
```

Expected: one browser-acceptance commit; generated reports are not committed.

### Task 13: Implement least-privilege CI and reproducible release artifacts

**Plan task:** `service-booking-2-build-ci-release`  
**Owner/workspace:** Backend Engineer (`service-booking-2-backend`) / `.worktrees/service-booking-2-build-ci-release`

**Files:**
- Create: both workflow files, `release/toolchain.lock.json`, `release/artifact-manifest.schema.json`, and all four release scripts from the complete file map.
- Modify: backend/frontend Dockerfiles, frontend Nginx config, `pom.xml`, `package.json`, `Makefile`, `.gitignore`, and `README.md` for deterministic production artifacts.

**Interfaces:**
- Consumes: exact git revision, package/Maven locks, validated CI run identity, immutable action/base-image identities, frontend `dist`, backend JAR, and test evidence.
- Produces: deterministic frontend/backend `.tar.gz`, API/web OCI image archives, `SHA256SUMS`, and `artifact-manifest.json`; no remote publication or deployment.

- [ ] **Step 1: Write failing workflow/pin/release policy tests**

`check-workflow-pins.sh` must reject `uses:` values not ending in a 40-hex commit, any workflow-level permission beyond `contents: read`, PR secrets, `docker push`, registry login, environment/deployment keys, mutable Docker `FROM`, or a release job not bound to a successful CI artifact for the same SHA. `release.test.sh` uses temporary fixture workflows/manifests to assert each rejection and verifies that a failed validation marker prevents `build-release.sh`.

```bash
bash scripts/release/release.test.sh
```

Expected: fail because the policy scripts do not exist.

- [ ] **Step 2: Implement immutable toolchain resolution**

Make `resolve-toolchain-lock.sh` resolve approved stable release tags for checkout, setup-java, setup-node, Playwright browser image, upload/download artifact actions, PostgreSQL, Temurin JRE, and Nginx through GitHub/registry APIs; require signed/official upstream repositories; persist exact 40-hex action commits and `sha256:` image digests plus Java 21, Node 24, Spring Boot 4.1.1, Playwright 1.63, Maven wrapper, npm lock hashes, and resolution timestamp. The script fails if any identity remains tag-only.

```bash
scripts/release/resolve-toolchain-lock.sh
scripts/release/check-workflow-pins.sh release/toolchain.lock.json
```

Expected: lock contains only immutable action/image identities and the check exits 0. Network/auth failure leaves the prior lock unchanged and returns non-zero.

- [ ] **Step 3: Implement PR/main CI workflow**

Trigger on `pull_request` and pushes to `main`; set `permissions: contents: read`; check out the exact SHA; use locked Java/Node; run `npm ci`, frontend lint/typecheck/tests/build, `./mvnw -q verify` with Testcontainers PostgreSQL, `npm ci` and pinned Chromium install for e2e, then `make e2e`. Upload revision/run-bound JUnit, Playwright, and relevant failure diagnostics with redaction. Any failed required job fails validation.

- [ ] **Step 4: Implement deliberate-failure release denial test**

In temporary fixtures, inject one failing backend test and one failing Playwright assertion in separate runs; assert the validation status is failed and the release entry script exits before archive/image creation. The test restores no tracked application file because all mutation occurs under its temporary directory.

- [ ] **Step 5: Implement deterministic archive and image builds**

Set `SOURCE_DATE_EPOCH` from the exact commit; use Maven `project.build.outputTimestamp`; run clean `npm ci`/`npm run build`; create sorted tar archives with normalized UTC mtime, uid/gid 0, numeric ownership, and gzip `-n`; build API/web OCI archives with locked base digests and the same source epoch; write payload/image checksums. Validate `artifact-manifest.json` against its schema and include project/run/source SHA, lock hash, CI run URL/ID, test report hashes, archive hashes, and OCI digests.

- [ ] **Step 6: Implement a main-only successful-validation release workflow**

Trigger from completed CI for branch `main`; check `conclusion == success`; check out exactly the validated `head_sha`; download and verify that run's evidence; run pin policy and release tests; build locally downloadable artifacts; upload them to the workflow run. Keep `contents: read`, request no environments or publishing secrets, and perform no release creation, registry login/push, hosting, or deployment.

- [ ] **Step 7: Prove same-revision reproducibility**

```bash
make release
make repro-check
```

Expected: two clean builds of the same SHA and lock produce identical frontend/backend application payload checksums; normalized archives match; OCI digests either match or any allowed provenance-envelope difference is separately recorded while extracted application payload hashes match.

- [ ] **Step 8: Run complete policy and product validation**

```bash
bash scripts/release/release.test.sh
scripts/release/check-workflow-pins.sh release/toolchain.lock.json
make verify
make e2e
make repro-check
```

Expected: all commands pass; the negative fixtures prove backend/browser failure blocks release; no command deploys or publishes.

- [ ] **Step 9: Commit CI/release implementation**

```bash
git add .github release scripts/release backend/Dockerfile backend/pom.xml frontend/Dockerfile frontend/nginx.conf frontend/package.json Makefile .gitignore README.md
git commit -m "build: add validated reproducible release artifacts"
```

Expected: one CI/release commit with immutable pins and no credentials.

## Requirement-to-task coverage

| Requirement | Primary implementing task(s) |
|---|---|
| `fr-access` | Tasks 2, 4, 5 |
| `fr-shop` | Tasks 6, 7 |
| `fr-slots` | Tasks 6, 7 |
| `fr-discovery` | Tasks 6, 7 |
| `fr-search-match` | Tasks 6, 7 |
| `fr-cart` | Tasks 8, 9 |
| `fr-checkout` | Tasks 8, 9 |
| `fr-prices` | Tasks 8, 9 |
| `fr-order-history` | Tasks 8, 9 |
| `fr-redemption` | Tasks 10, 11 |
| `fr-expiry` | Tasks 10, 11 |
| `fr-provider-lifecycle` | Tasks 10, 11 |
| `fr-admin` | Tasks 10, 11 |
| `fr-language` | Tasks 3, 5, 7, 9, 11 |
| `fr-simulations` | Tasks 4, 8, 10 |
| `fr-exclusions` | Tasks 4, 6, 10, 11, 12 |
| `nfr-boundaries` | Tasks 2, 4, 8, 10, 12 |
| `nfr-inventory` | Task 8 |
| `nfr-mobile` | Tasks 3, 5, 7, 9, 11, 12 |
| `nfr-tests` | Tasks 4, 6, 8, 10, 12, 13 |
| `nfr-storage` | Tasks 2, 4 |
| `nfr-github-tracking` | Task 1 |
| `nfr-github-ci` | Task 13 |
| `nfr-release-artifacts` | Task 13 |

The structured plan carries criterion-level task mappings for all 72 acceptance criteria. The validation artifact records the machine-checked coverage, dependency, ownership, workspace, mandatory-gate, identity, and language checks for the exact draft.

## Milestone approval checkpoints

1. **Foundation:** demonstrate governed tracking, architecture, bilingual auth shell, PostgreSQL, simulations, and security/privacy boundaries; run Code Review → Build Verification → Quality Review → Independent Audit → User Review.
2. **Publish and discover:** demonstrate provider catalog/slot publication and public/customer discovery; run Code Review → Build Verification → Quality Review → Independent Audit → User Review.
3. **Reserve and purchase:** demonstrate atomic cart, payment failure/retry, immutable CHF pricing, and order views; run Code Review → Build Verification → Quality Review → Independent Audit → User Review.
4. **Fulfill and administer:** demonstrate redemption, expiry/completion, unpublication, suspension, release, and the sole override; run Code Review → Build Verification → Quality Review → Independent Audit → User Review.
5. **Validate and release:** demonstrate all journeys/widths/exclusions, deliberate release denial, and same-revision artifacts; run Code Review → Build Verification → Quality Review → Independent Audit → User Review.

Stop after each exact milestone review package until the application owner records an explicit decision for that digest. No CI result, GitHub status, reviewer statement, or audit outcome manufactures that decision.
