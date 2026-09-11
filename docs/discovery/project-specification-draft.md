# Service Booking Two — phase-one project specification

Status: approved. Created 2026-09-11T11:24:01Z by Discovery Lead; approved by the application owner at 2026-09-11T11:39:17Z. Project ID and slug: `service-booking-2`.

The reviewable specification is [project-specification.json](project-specification.json). This readable draft summarizes the same 24 requirements and 72 acceptance criteria; the structured artifact contains their exact text, source/decision registry and complete traceability. It carries no approval from the source project. The [reuse assessment](service-booking-1-reuse-assessment.md) records the bounded identity and contract delta.

## Intended outcome and journeys

A basic Switzerland-focused service marketplace lets solo providers publish shop-based tutor/lesson and beauty/wellness offerings, and customers discover, reserve and book fixed-time inventory. The four personas are visitor, customer, solo provider and administrator.

The four journeys are discovery through purchase, provider publication through delivery, booking expiry through order completion, and accepted administrator intervention. Public visitors browse/search; verified customers select slot units and pay through a simulation; providers publish and redeem their own bookings; administrators apply the limited reservation, suspension and Expired-to-Delivered controls.

## Included behavior

- Switzerland, CHF, English/German responsive interface, original-language provider content, one shop per solo provider and local email/password roles.
- Explicit start/end slot SKUs, provider capacity, drafts, bulk nonrecurring creation and no published overlap; adjacent slots are allowed.
- Public full-text search across offering name/description, category name/description and shop name, with the accepted matching, pagination, category/price filtering and sorting. Public inventory is aggregated over future slots; signed-in customers see slot times.
- Persistent cart inventory reservations across sessions/devices, selected-item checkout across providers into one marketplace order, and simulated payment failure/retry.
- Current cart prices, consent to changed totals, an accepted price snapshot per payment attempt and immutable ordered prices.
- Four-digit booking-scoped redemption codes; all quantities covered by a valid code become Delivered together, including before slot start. Unredeemed lines expire at slot end. An order is Completed when all lines are Delivered or Expired.
- Unpublication/suspension cleanup of affected carts with purchased bookings preserved, manual administrator reservation release and the distinct administrator Expired-to-Delivered override.
- Simulated verification, password reset, payments and notifications behind replaceable interfaces.
- Post-approval GitHub work/progress counterparts with local Studio authority, PR/main validation and versioned reproducible release/container artifacts after successful CI.

## Exclusions and boundaries

Organizations/staff, home services, remote/customer-location delivery, provider approval, cancellation/rescheduling, refunds, messaging, self-service account deletion, data-export UI, analytics, real payments or external delivery, recurring schedules, shop transfer, public shop pages, automatic cart expiry and timer extensions are excluded. Administrator category editing and a separate direct service-hiding tool are also excluded.

Actual environment deployment and unapproved registry publication remain deferred. The repository endpoint is intentionally unassigned for this project; no source-project repository URL is inherited. Generic GitHub requirements remain in scope, with endpoint setup belonging to the subsequently authorized workflow.

## Acceptance and traceability

| Requirement | Behavior | Criteria |
| --- | --- | ---: |
| `fr-access` | Provide separate customer, solo-provider, and administrator access using local email/password accounts. | 3 |
| `fr-shop` | Each solo provider owns one shop and publishes services without administrator approval. | 3 |
| `fr-slots` | Create fixed-time slot SKUs with explicit start/end, capacity, drafts, and nonrecurring bulk entry. | 4 |
| `fr-discovery` | Expose public full-text service discovery and the accepted filters and visibility rules. | 3 |
| `fr-search-match` | Support the agreed text matching behavior without grammatical stemming. | 2 |
| `fr-cart` | Maintain one authenticated customer cart across sessions/devices, reserving quantities immediately. | 3 |
| `fr-checkout` | Complete selected checkout as one marketplace order only after successful simulated payment. | 3 |
| `fr-prices` | Use one current CHF unit price per offering for all its slots, with simple quantity totals. | 4 |
| `fr-order-history` | Show the marketplace order and its individual booking-line fulfillment outcomes. | 3 |
| `fr-redemption` | Use one four-digit code per purchased slot SKU to deliver all covered units together. | 3 |
| `fr-expiry` | Expire unredeemed lines at slot end without enabling ordinary post-expiry redemption. | 2 |
| `fr-provider-lifecycle` | Permit unpublication while preserving purchased bookings and removing affected cart items. | 2 |
| `fr-admin` | Provide the accepted limited administrator actions. | 4 |
| `fr-language` | Support English/German interface selection and provider-authored multilingual content. | 3 |
| `fr-simulations` | Keep verification, password reset, payments, and notifications simulated behind replaceable interfaces. | 3 |
| `fr-exclusions` | Do not expose retired or explicitly excluded phase-one workflows. | 2 |
| `nfr-boundaries` | Enforce authentication, role ownership, and secret-handling boundaries. | 3 |
| `nfr-inventory` | Keep committed inventory and payment outcomes consistent under retries and competing requests. | 3 |
| `nfr-mobile` | Make every customer/provider workflow usable on mobile and desktop widths. | 2 |
| `nfr-tests` | Verify the main phase-one journeys with backend and Playwright tests. | 3 |
| `nfr-storage` | Respect the owner’s Swiss-storage requirement and baseline data handling. | 2 |
| `nfr-github-tracking` | Maintain GitHub milestone/issue counterparts while local Studio artifacts and state remain authoritative. | 4 |
| `nfr-github-ci` | Use GitHub Actions to keep frontend, backend and browser-supported scope build-ready on pull requests and main changes. | 4 |
| `nfr-release-artifacts` | Produce versioned reproducible release archives and container-image artifacts only after successful CI, without deploying an environment. | 4 |

Every requirement maps to all its acceptance criteria, decision IDs and source references. The 184-entry decision registry preserves accepted decisions and reversals; historical D22 is retired for the current project. No current requirement references a retired decision. The full specification retains all original acceptance IDs and statements.

## Stack, constraints and risks

The accepted stack is React, Java Spring Boot and PostgreSQL in Docker, with backend tests and Playwright browser tests. The current Studio engineering baseline applies. Customer/provider workflows must operate at mobile and desktop sizes; exact visual branding and browser-matrix details remain deferred.

Authentication, personal information, redemption credentials, inventory, administrator actions and the GitHub/CI/release boundaries require the embedded draft threat model. Ownership checks, password hashing/redaction, atomic inventory/checkout behavior, scoped single-use code validation and least-privilege CI are required. Hosted application data must remain in Switzerland; local demonstration uses synthetic data.

Persistent abandoned carts can lock inventory until manual release. Early redemption does not prove physical service provision. Suspended-provider fulfillment exceptions and production legal/security/retention readiness remain deferred risks, not newly resolved policy.

## Defaults and deferrals

Existing defaults remain explicit: neutral owner label, demonstrable journeys rather than invented commercial KPIs, simple responsive forms/lists/statuses, draft threat analysis, specified synchronization checkpoints, PR/main validation baseline and immutable commit-addressed artifacts.

No blocking phase-one question remains. `open_questions: []` does not turn unanswered historical questions into decisions. Exact time-boundary comparisons, draft-overlap semantics, retry-price details, category provisioning, fields/images, manual-language selection, search tuning, simulation presentation, wider exception handling and production operations remain in the structured `deferred_items`. Implementing the accepted scope must preserve the established invariants without adding excluded workflows.

## Validation and approval boundary

Current canonical ProjectSpecification and embedded ThreatModel validation pass, including approval-binding, traceability and identity checks. All 24 requirements and 72 acceptance criteria are preserved unchanged. The application owner approved the exact canonical approval-subject digest below; approval ID `apr-service-booking-2-spec-001` records that decision. This is specification validation, not evidence that an application exists or its tests pass.

Approved source-file SHA-256: `615b01c206349032d0a66c49436088c977b7f06e30d6dda7b0969175261d9555`.

Canonical approval-subject digest: `227a4f029b576930530c4c5b388d2836963d9f7356913b5faf5f9dcc180c4c9b`.

Safe-resume marker: Studio accepted the exact approved specification and is in `specification_approved`. Stop before planning. No milestone plan, readiness work, task dispatch, GitHub mutation or implementation is authorized by this approval-recording step.
