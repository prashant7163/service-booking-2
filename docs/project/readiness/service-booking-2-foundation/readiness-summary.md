# Service Booking Two foundation readiness summary

Readiness identity: `service-booking-2-foundation-readiness-draft-001`

Canonical readiness digest: `387541159810c30007dc2e9353c5acc9016d89f95e4655cfe111b2587289b4d9`

Outcome: `revision_required`

This draft is limited to milestone `service-booking-2-foundation`. It contains the five accepted foundation tasks and the four ordered assurance work packages for Code Review, Build Verification, Quality Review, and Independent Audit. It does not include or authorize tasks from the publish/discover, reserve/purchase, fulfill/administer, or validate/release milestones. The application owner's final milestone review remains a separate human boundary.

## Accepted lifecycle bindings

- Specification: `service-booking-2`, source locator `docs/discovery/project-specification.json`, accepted canonical SHA-256 `04350ae40cd031b0368e4b4508ffced35f3ed37df563a27c6138426d1ac96d29`.
- Phase One plan: `service-booking-2-phase-one`, source locator `docs/project/planning/phase-one-milestone-plan.json`, accepted canonical SHA-256 `2c877de39821812f3b1014e83e968511f1474780f65bcc7d21e76433cd627073`.
- Run: `service-booking-2-benchmark`, phase `readiness_pending`, journal sequence `7`, zero started tasks; capability `github-project-workflow` is active.
- Current Studio doctor: pass, snapshot digest `ef8cd61eeb6e26ee07cde2bd8931328b180f266fefba6aee6a293185a25d7055`.

## Readiness coverage

The package records the effective Studio engineering baseline, canonical role/skill boundaries, trusted-capability assessment, applicable threat decision, redacted doctor result, integration-test plan, rolling-progress plan, nine bounded work packages, five interface decisions, accepted snapshot bindings, prerequisite checks, nine complete pending AgentInstance envelopes, and nine separate digest-bound owner approval records. Their review matrix is `docs/project/readiness/service-booking-2-foundation/agent-instance-review-matrix.md`.

The work-package dependency order is:

1. Register first-milestone GitHub tracking counterparts.
2. Define architecture and security/privacy boundaries.
3. In parallel after architecture, define interaction flows and build the backend foundation.
4. Build the frontend shell after architecture, UX, and backend contracts.
5. Run independent Code Review, then Build Verification, Quality Review, and Independent Audit against one exact candidate.
6. Present the milestone review to the application owner; readiness cannot supply that decision.

## Blocking conditions

1. The owner-authorized benchmark exception covers the missing Studio AgentInstance registration interface, but `main` is unborn and has no commit from which the planned task and assurance worktrees can inherit a common clean baseline. Creating the initial baseline commit was not authorized.
2. All new evidence remains unregistered by instruction. The commands file is a proposal only; running the current readiness command would record blocked readiness, not passing readiness.

## One-time benchmark governance exception

Exception `service-booking-2-benchmark-agent-instance-registration-exception` is limited to the local `service-booking-2-benchmark` run and the nine exact approval-linked first-milestone envelopes. It permits those envelopes to be embedded in a final readiness candidate without unsupported Studio per-instance registration or activation events. It is non-production, non-precedential, does not alter permissions or GitHub scope, and creates no task or implementation authority.

Compensating controls remain binding: exact envelope and Approval digests, zero tasks, least-privilege scopes, unchanged work-package ownership, and separate Code Reviewer and Independent Auditor identities. The exception has not been exercised because the required Git baseline does not exist.

## Recorded AgentInstance subject approvals

At `2026-09-11T16:37:43Z`, nine separate Approval records were created under `docs/project/readiness/service-booking-2-foundation/agent-instance-approvals/`. Each binds exactly one `agent_instance` subject ID to the owner-approved approval-subject digest. The Approval records validate canonically, and byte-level verification confirms that all nine referenced envelope files remain unchanged with `lifecycle: pending`, `approval: null`, and `approval_reference: null`.

The installed Studio CLI has no approval-only AgentInstance registration operation. `run approve` is milestone-specific, while `trust apply` is capability-specific and state-mutating; neither was used. A separate authorization is required before creating successor envelopes, activating instances, or creating workspaces.

## Resolved local Git-initialization blocker

At `2026-09-11T13:38:33Z`, the project root was verified as `/Users/pacific/Playground/AgentHarness/service-booking-2`, initialized as an empty Git repository on unborn branch `main`, and configured with the exact origin `https://github.com/prashant7163/service-booking-2.git`. A read-only `git ls-remote origin` check exited successfully with no output, so the remote advertised zero refs. `git status --short --branch` reported `No commits yet on main` and only untracked project files. The exact validation is recorded in `validation-report.json`.

Repository initialization is resolved, but the unborn branch is now the smallest remaining Git precondition: `git rev-parse --verify HEAD` fails with `Needed a single revision`. An explicitly authorized initial commit on `main` containing the approved repository baseline is required before valid shared-baseline worktrees can be created. Orphan worktrees would have unrelated histories and are not used.

## Resolved GitHub authentication and access blocker

At `2026-09-11T14:14:37Z`, explicitly approved credential-backed checks verified GitHub CLI `2.100.0`, authenticated account `prashant7163`, macOS keyring storage, HTTPS Git protocol, private repository `prashant7163/service-booking-2`, repository permission `ADMIN` with reported push access, empty issue and milestone listings, and an empty Git ref advertisement. No credential value was requested or persisted.

The fine-grained access envelope is restricted to `service-booking-2` with Metadata read-only, Contents read/write, and Issues read/write. The registered quarantined predecessor remains canonical SHA-256 `fd5bdf8aa26d8aee89df8352ba9946491139897668ca4fb1cc6a4c4c26a912c4`. Activation approval `apr-service-booking-2-github-project-workflow-activation-001`, canonical artifact SHA-256 `7309943673323a2fed0a497466a459c731fad04a880cd1b6fdefc6d0bbde3b99`, authorizes the exact active successor at canonical SHA-256 `350927a500c2decc98165ec02d99c8e6b9b8749508b03e94f84666f88381e9eb`. Studio records `github-project-workflow` as active at journal sequence `7`; no GitHub mutation was performed by the trust transition.

The readiness draft now records the nine proposed envelopes and their nine separate local approval references. It remains `revision_required`; the exact subjects are approved, but no envelope was mutated or activated and readiness was not submitted.

No commit, push, fetch, additional branch or worktree creation, GitHub resource mutation, credential mutation, evidence submission, readiness submission, or implementation work was performed. The only governed transition was the explicitly authorized local Studio activation of `github-project-workflow`.
