#!/bin/sh
set -eu

# Proposal only. These commands were not executed.
# Running the final command against the current draft records revision_required readiness.

./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/accepted-snapshot-bindings.json --idempotency-key evidence-foundation-accepted-bindings-6a4f7692f165
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/effective-standards.json --idempotency-key evidence-foundation-effective-standards-d2d9fb05b177
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/role-skill-independence.json --idempotency-key evidence-foundation-role-skill-15aaad95d397
# ExternalCapability github-project-workflow is already active in Studio at journal sequence 7.
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/trusted-capability-assessment.json --idempotency-key evidence-foundation-capability-9a3566483c1a
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/threat-model-decision.json --idempotency-key evidence-foundation-threat-8703430c7a12
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/doctor-result.json --idempotency-key evidence-foundation-doctor-690b7a0dcefd
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/integration-contracts.json --idempotency-key evidence-foundation-contracts-153e51084338
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/integration-test-plan.json --idempotency-key evidence-foundation-integration-7fe964eb0088
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/rolling-progress-plan.json --idempotency-key evidence-foundation-progress-7f956eedbe8e
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/work-packages.json --idempotency-key evidence-foundation-work-packages-631a5a8ec93d
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/interface-decisions.json --idempotency-key evidence-foundation-interfaces-3cf10defdd89
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/instance-binding-assessment.json --idempotency-key evidence-foundation-instances-114adc2e723b
./studioctl evidence submit --file docs/project/readiness/service-booking-2-foundation/prerequisite-validation.json --idempotency-key evidence-foundation-prerequisites-7c15fd261bd4

./studioctl readiness submit --file docs/project/readiness/service-booking-2-foundation/milestone-readiness-draft.json --idempotency-key readiness-foundation-387541159810
