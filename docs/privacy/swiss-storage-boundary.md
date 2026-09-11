# Service Booking Two Swiss-storage boundary

This record applies the approved project specification, canonical approval-subject digest `227a4f029b576930530c4c5b388d2836963d9f7356913b5faf5f9dcc180c4c9b`, to the phase-one architecture. It records a storage requirement and production limit; it does not claim legal compliance or authorize deployment.

Local Docker Compose and automated tests use synthetic accounts, contact details, bookings, images and simulated transactions only. Local volumes are demonstration storage. No hosted storage provider, database region, backup destination or deployment environment is selected. No real-user data, card details or real monetary transaction is needed for the accepted journeys.

Before any hosted use, confirm that the application database and every backup are stored in Switzerland. The same application-data boundary covers uploaded images, replicas, snapshots, logs and diagnostics containing application data. A provider's general availability in Switzerland is not confirmation of the selected database or backup region. Do not introduce a non-Swiss hosted store or infer region from a default configuration. Future configuration and storage evidence must explicitly identify Switzerland for the actual selected resources.

| Classification | Treatment |
| --- | --- |
| Public | Published service/category/shop information and shop postal addresses may appear in public projections. Public visibility does not remove the storage requirement. Slot times are omitted from public responses. |
| Personal | Account names/emails, bookings and customer contact visibility remain within authenticated role/owner projections. Providers see only customer name/email on their own booking lines. |
| Secret | Passwords, verification/reset credentials, session credentials and redemption codes never enter public responses, logs, repository artifacts or Studio state. Store BCrypt passwords, verification/reset digests and redemption nonce/keyed fingerprint; environment-only HMAC secrets permit code derivation solely for authorized customer display and the simulated confirmation test boundary. |
| Simulated transaction | Purchased prices, quantities and payment outcomes contain no payment-card data. Successful price/quantity history remains immutable; failed payment attempts do not appear in customer order history. |

Verification, password reset, payment and notifications terminate at replaceable simulated ports and test spies. No real delivery provider or external inbox is selected. Redact diagnostics before persistence or outbound use; keep application personal/secret data out of GitHub tracking, test reports and release artifacts. Test fixtures and synthetic results do not establish a production data-handling posture.

Retention periods, deletion procedures, legal obligations including applicable data rights, tax treatment, operational backup policy and backup-region confirmation require review before real-user deployment. Provider-entered prices are displayed as final tax-inclusive CHF amounts; this is a product rule, not a tax determination. The exclusion of self-service account deletion and data-export UI does not resolve legal obligations. Do not invent retention durations or irreversible cleanup workflows.

Release archive/container-image production does not authorize hosted operation, registry publication or environment rollout. Production security, operational capacity and accessibility certification remain deferred. Resume production design only through the Orchestrator with an approved target and completed retention/legal/tax/backup-region review; no production-readiness claim follows from this local synthetic demonstration.
