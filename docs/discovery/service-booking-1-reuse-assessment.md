# Service Booking Two — discovery reuse assessment

Status: completed reuse assessment. Created 2026-09-11T11:25:37.107164Z; approved-specification follow-up recorded 2026-09-11T11:39:17Z. Project: `service-booking-2`.

This is one bounded delta-validation pass against the immutable [source manifest](source/service-booking-1/source-evidence.json). All four preserved source-file hashes were recomputed and match that manifest. The source files are provenance only; their approvals, validation reports, lifecycle state and repository assignment do not govern this project.

The active native run was observed as `service-booking-2-benchmark`, phase `discovery`, with no registered artifacts. Its pre-draft source revision was `5bae728e49c3fdc7308a78ac20d3fdbb851c9459acf6a7b7f22f722d906c1ae6`. This is the observed starting snapshot, not a claim that new draft files were included in that revision.

## Delta result

No material product contradiction or blocking product decision was found. All 24 requirements (16 functional, 8 nonfunctional), 72 acceptance criteria, four personas, four journeys, scope inclusions/exclusions, stack, risks, defaults, deferrals, state rules and requirement/source/decision mappings are unchanged. The benchmark remains the basic local/synthetic phase-one marketplace plus the already-established GitHub tracking, CI and release-artifact requirements.

| Area | Treatment |
| --- | --- |
| Identity and creation metadata | Current project ID/slug and Service Booking Two display name; current timestamp and Discovery Lead creation metadata. |
| Approval | The reused draft began with status draft and approval null. The source approval was not transferred. The application owner later approved the new Service Booking Two canonical digest, recorded as `apr-service-booking-2-spec-001`. |
| Repository | Source repository block removed. D22 retains its historical ID and S10 reference but is superseded for this project; it is removed from current artifact-level mappings. No current requirement references D22. The current endpoint is intentionally unassigned because this workspace is not a Git repository and studio.yaml defines none. |
| Source references | Historical discovery and source specification pointers resolve to the preserved source directory. They are evidence locators, not current-project identity or lifecycle authority. |
| Contracts | Current canonical ProjectSpecification and embedded ThreatModel validate. Exported schemas match the installed models after excluding only JSON Schema document metadata (`$id`, `$schema`). The Orchestrator also confirmed matching schema hashes and unchanged canonical validator source across the two projects. |
| Validation evidence | Recomputed for the current draft; no source-project validation hash, environment path or approved state is reused. |
| Product content | Preserved exactly, including the requirement/acceptance text, decision/source mappings, and D01–D184 registry except identity-specific D22. |

The preserved phase-one review contains an old specification file hash that differs from the preserved structured file. This is stale historical review metadata, not a product contradiction. The immutable source manifest establishes the actual source bytes; the current draft uses newly computed evidence.

## Resolutions and remaining deferrals

Later source decisions already resolve earlier historical wording: D164 refines D19/D95 to allow early redemption; D166 preserves purchased bookings after unpublication; D167/D168 resolve public inventory aggregation and signed-in slot visibility; D171–D179 settle suspension, language persistence and cart cleanup; D180/D181 exclude refunds and self-service account deletion. Their original provenance remains intact. Earlier registry text that says a detail is open must be read with these later resolutions and the final requirements.

`open_questions: []` is retained because no blocking question for the bounded phase-one draft remains. It does not imply the last unanswered batch received answers. Explicitly deferred details remain deferred: exact start/future comparisons, draft-overlap mechanics, retry consent details, category provisioning, field/image limits, manual-translation presentation, search tuning, simulation presentation, production operations and additional exception workflows. They do not authorize extra features or prevent review of the established benchmark. No interview was repeated and no answer was invented.

Swiss hosted storage remains a requirement; this is a local/synthetic demonstration, with production legal/security/retention review deferred. Persistent reservations, early redemption and suspended-provider fulfillment remain documented risks. Environment rollout and unapproved registry publication remain excluded.

## Current evidence and safe resume

Specification: [project-specification.json](project-specification.json). Readable review: [project-specification-draft.md](project-specification-draft.md). Validation: [specification-validation.json](specification-validation.json).

Approved specification source-file SHA-256: `615b01c206349032d0a66c49436088c977b7f06e30d6dda7b0969175261d9555`.

Canonical approval-subject digest: `227a4f029b576930530c4c5b388d2836963d9f7356913b5faf5f9dcc180c4c9b`.

Safe-resume marker: the application owner approved the exact canonical digest above, and Studio accepted the approved specification. The run is now `specification_approved`; stop before planning or implementation. Do not restart discovery or infer authorization for later lifecycle work from this report.

The bounded reuse pass created only the four requested discovery artifacts. A later explicit owner instruction recorded and submitted the approved specification only. No milestone plan, readiness artifact, task, code, GitHub record, commit, push, import or implementation was created.
