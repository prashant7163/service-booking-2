# Phase-one specification — approved baseline

The structured approval artifact is [project-specification.json](project-specification.json). The application owner explicitly approved its canonical subject digest on 2026-09-10; the embedded approval binding validates. Discovery is complete and implementation planning may begin.

## Included

- Switzerland; English/German interface; original-language provider content; CHF-only prices.
- Separate customer, solo-provider and administrator roles. One shop per provider; tutor/lesson and beauty/wellness services delivered at that shop.
- Explicit start/end slot SKUs, capacity, drafts and bulk nonrecurring creation. Published slots cannot overlap; adjacent slots are allowed.
- Public full-text search across five fields, category/price filtering, relevance/price ordering and pagination. Public pages show aggregate future inventory; signed-in customers see slot times.
- One persistent verified-customer cart across sessions/devices, immediate inventory reservations, selected-item checkout, one marketplace order, and simulated payment failure/retry.
- Current cart pricing, consent to changed totals before payment, price fixed within an in-progress attempt, and original ordered prices preserved in history.
- Four-digit booking-scoped codes. Valid redemption delivers all covered quantities, including before slot start. Unredeemed lines expire at slot end; all-resolved orders are Completed.
- Provider unpublication and suspension preserve purchased bookings while removing affected cart reservations. Administrators can release cart reservations and change Expired to Delivered without reactivating codes.
- Simulated verification, password reset, payment and notifications behind replaceable interfaces. React, Java Spring Boot, PostgreSQL in Docker, backend tests and Playwright.

- GitHub milestones/issues mirror every implementation milestone/work item with bidirectional identifiers. Local Studio tracking remains authoritative; synchronization occurs at approved work registration, start, block/resume, verification handoff, and recorded human milestone decisions.
- GitHub Actions validates frontend/backend builds and tests plus Playwright scope on pull requests and main changes. Successful main validation produces versioned release archives and container-image artifacts with source/CI traceability and reproducibility checks.

## Excluded

Organizations/staff, home services, remote/customer-location delivery, provider approval, cancellation/rescheduling, refunds, messaging, account-deletion UI, data-export UI, analytics, real-money/external delivery, recurring schedules, shop transfers, public shop pages, automatic cart expiry and all timer extensions remain outside phase one. Administrator category-editing and direct service-hiding tools are excluded; provider suspension still removes listings.

Actual environment deployment and unapproved registry publication are deferred: no deployment target has been approved. GitHub issue/milestone creation and workflow implementation are post-specification-approval work.

## Acceptance and traceability

The specification contains 24 stable requirements and 72 measurable acceptance criteria. Every requirement maps to all its criteria and relevant decision/source references. The embedded registry preserves D01–D184 and the explicit reversals; retired decisions are not used as current requirement references.

Primary journeys: provider publishes; customer discovers/reserves/pays; provider redeems or slot expires; administrator applies the accepted intervention. Acceptance covers inventory concurrency, ownership, payment failure, price snapshots, line/order states and mobile workflows.

## Defaults and deferred details

Defaults are explicitly identified separately from owner decisions: a neutral application-owner label, demonstrable-journey success criteria instead of invented business KPIs, basic responsive forms/lists/status presentation, and a draft threat assessment for authentication/personal-data boundaries. No unprovided business rules are adopted. Additional conservative workflow defaults define synchronization checkpoints, a common PR/main validation baseline, immutable source-revision artifact versions, normalized reproducibility evidence, and downloadable artifacts without environment rollout.

The last five unanswered binary questions remain unanswered. Exact start/future comparisons, draft-overlap semantics, detailed retry consent, category provisioning, field/image limits, manual-translation presentation, search tuning, simulation interaction details, operational sizing and production compliance are deferred. They do not authorize new product features. `open_questions: []` means elicitation is closed, not that deferred details have owner answers.

Persistent abandoned carts may lock inventory indefinitely; manual administrator release is the accepted remedy. Early redemption does not prove physical service provision. Suspended-provider fulfillment and wider override workflows remain deferred. Swiss hosting/storage and real-user legal/security readiness require confirmation before production use.

## Validation and safe resume

Studio's canonical `ProjectSpecification.model_validate` and `ThreatModel.model_validate` pass. Additional checks confirm all decision references exist, none reference retired decisions, and all requirement/criterion mappings are complete. This validates the approved specification artifact, not application behavior.

Specification file SHA-256: `938c3e521c21e2e67d46796515e65259469606a92c2537b62e5966da4d213933`.

Canonical approval-subject digest: `637f0e2082e73bd106a246d7bf47034943b41724db78fb828ccd028aa638e202`.

Resume with the Orchestrator creating the dependency-aware milestone plan from this exact approved specification. Do not resume elicitation. This record creates no GitHub records, workflow files, implementation plan, commit, push, or implementation change by itself.

Approval ID: `apr-service-booking-1-spec-001`.

Approval decision: `approved` by `application-owner` at `2026-09-10T21:09:25Z`.
