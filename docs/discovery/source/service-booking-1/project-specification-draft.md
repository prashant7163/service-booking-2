# Service Booking Marketplace — archived discovery record

Status: historical discovery record; not approved. Updated 2026-09-10.

Elicitation ended at the owner’s direction: “please stop discovering unnecessary edge cases. let\'s just implement a basic version with basic functionalities (discussed and locked so far) in phase 1.” The current review artifact is [project-specification.json](project-specification.json), with [phase-one review summary](phase-one-review.md). Historical open-question sections below are not requests for further answers and do not override that structured artifact.

This partial discovery artifact records application-owner decisions relayed by the Orchestrator. It is not yet a schema-valid ProjectSpecification or a candidate for approval. No implementation is authorized by this document. The current Studio phase is `new`.

## Authority and provenance

Project identity comes from `studio.yaml`: `service-booking-1`, Service Booking Marketplace. Discovery follows `AGENTS.md`, `docs/project-guide/discovery.md`, and `docs/project-guide/operator-handbook.md`. The eventual specification must satisfy `shared/contracts/project-spec.schema.json`, including requirement-to-acceptance traceability. Human approval must bind its exact digest.

Decision sources:

- S1: Application-owner answer relayed by the Orchestrator: “let's build a service-booking marketplace application”.
- S2: Application-owner accepted targets relayed by the Orchestrator on 2026-09-10, recorded individually below.
- S3: Application-owner answer to Q01 relayed by the Orchestrator on 2026-09-10: “service discovery and booking services through a dedicated portal. service providers can publish their services and buying/booking options in this portal for customers to discover and book services online”.
- S4: Application-owner answer to Q13 relayed by the Orchestrator on 2026-09-10: “slots with fixed timing”.
- S5 (superseded by S6): Application-owner answer on slot capacity under Q04 relayed by the Orchestrator on 2026-09-10: “lets keep it one customer per slot at this phase”.
- S6: Application-owner correction superseding S5, relayed by the Orchestrator on 2026-09-10: “actually the service provider should be able to provide aan inventory count for every slot”.
- S7: Application-owner answer on inventory units relayed by the Orchestrator on 2026-09-10, normalized to correct “shopping card” to “shopping cart” and use inclusive wording: every customer can put one or more units of slots in their shopping cart. This establishes cart quantities but does not answer what a unit entitles the customer to.
- S8: Application-owner answer about purchasing two units, relayed by the Orchestrator on 2026-09-10, with spelling normalized: “an email confirmation of two slots booking. order history shows the order pending, a 4 digit credential code for redeeming the booking at the shop. so customer provides this code to the service provider, service-provider validates the order delivery (providing service at the slot purchased) with this code and mark the order delivered for that slot.”
- S9: Application-owner answer on credential scope relayed by the Orchestrator on 2026-09-10, preserved verbatim: “one code for each slot sold unless both the slots are at the same time (same SKU) different slots will have different SKUs”.
- S10: Application-owner repository direction relayed by the Orchestrator on 2026-09-10: use `https://github.com/prashant7163/service-booking-1.git` for this project.
- S11: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should validating the shared redemption code mark all purchased units of that slot/SKU as delivered together?”
- S12: Application-owner answer about the meaning of pending in customer order history, relayed by the Orchestrator on 2026-09-10: “awaiting service fulfillment”.
- S13: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should a customer’s shopping cart support slots from multiple service providers?”
- S14: Application-owner answer on multi-provider checkout grouping, relayed by the Orchestrator on 2026-09-10: “one marketplace order”.
- S15: Application-owner answer on aggregate order fulfillment status, relayed by the Orchestrator on 2026-09-10: “awaiting fulfilment until all slots are awailed”. The typo “awailed” is interpreted as “availed”, using the established service-delivery terminology.
- S16: Application-owner answer on inventory availability timing, relayed by the Orchestrator on 2026-09-10: “when inventory exhausted for that slot”. This answers the exhaustion condition, not the event that reserves or decrements inventory.
- S17: Application-owner answer to whether adding units to a cart immediately reserves them, relayed by the Orchestrator on 2026-09-10, preserved verbatim: “yes, and remove from shopping cart in 60 minute if checkout is not initiated”.
- S18 (superseded by S19): Application-owner answer to how long inventory remains reserved after checkout begins without a completed purchase, relayed by the Orchestrator on 2026-09-10: “60 min”.
- S19: Application-owner correction superseding the separate checkout-hold interpretation in D31/S18, relayed by the Orchestrator on 2026-09-10: “no wait for this add 10 extra minutes to cart timer if already 50+ minutes have passed before checkout begins”.
- S20: Application-owner clarification of the extension calculation, relayed by the Orchestrator on 2026-09-10: “just add 10 min to the current timer”.
- S21: Application-owner answer on extension frequency, relayed by the Orchestrator on 2026-09-10: “automatically once and show the time on checkout header with an option to extent to another 10 min”. The typo “extent” is normalized to “extend”.
- S22: Application-owner wording clarification, relayed by the Orchestrator on 2026-09-10: “i mean show the timer on checkout header*”. This clarifies the countdown display without changing extension limits.
- S23: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should all items in the cart share one reservation timer?”
- S24: Application-owner phase-one reversal, relayed by the Orchestrator on 2026-09-10: “you know let's reverse this for phase one. once added in the cart the slot inventory is reserved unless removed from the cart”. This supersedes the expiry portion of S17 and all timer/extension behavior in S18–S23; immediate reservation from S17 remains current.
- S25: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “When checkout completes, should purchased items leave the cart while their inventory stays allocated to the order?”
- S26: Application-owner phase-one decision, relayed by the Orchestrator on 2026-09-10: “all bookings be instant-confirmation”. This supersedes D07's provider-approval branch; other S2 decisions remain current.
- S27: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should bookings be confirmed only after the simulated payment succeeds?”
- S28: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “If simulated payment fails, should the cart keep its items and inventory reservations so the customer can retry?”
- S29: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should customers be required to sign in before adding slot units to their cart?”
- S30: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should visitors be able to browse and search services without signing in?”
- S31: Application-owner search criteria, relayed by the Orchestrator on 2026-09-10: “full text search on product name, description and category name, category description”.
- S32: Application-owner addition to search criteria, relayed by the Orchestrator on 2026-09-10: “also include shop name”.
- S33: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes for phase 1” to “Should providers be able to register and publish their services without approval from a marketplace administrator?”
- S34: Application-owner phase-one scope correction, relayed by the Orchestrator on 2026-09-10: “no staff at phase 1, solo service provider”. This supersedes D08/S2; other current S2 decisions are unaffected.
- S35: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should each solo provider have exactly one shop/storefront in phase one?”
- S36: Application-owner answer on service delivery location, relayed by the Orchestrator on 2026-09-10: “at provider's shop”.
- S37: Application-owner phase-one scope correction, relayed by the Orchestrator on 2026-09-10: “remove home services in phase 1”. This partially supersedes D06/S2 by excluding home services; tutor/lesson and beauty/wellness remain.
- S38: Application-owner answer on launch country, relayed by the Orchestrator on 2026-09-10: “Switzerland”.
- S39: Application-owner answer on interface languages, relayed by the Orchestrator on 2026-09-10: “english, deutsch”.
- S40: Application-owner answer relayed by the Orchestrator on 2026-09-10: “no, any one language” to “Should providers be required to write their service descriptions in both English and German?”
- S41: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should provider content remain in its original language when the customer selects a different interface language?”
- S42: Application-owner answer on currency, relayed by the Orchestrator on 2026-09-10: “chf”.
- S43: Application-owner answer to whether providers set a separate price per unit for each slot/SKU, relayed by the Orchestrator on 2026-09-10: “no, in phase one all slots are same price”. The accepted scope is all slots within each service offering, not equality across different services.
- S44: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should the cart total simply sum each service’s per-unit price multiplied by its booked quantity, with no extra fees or discounts in phase one?”
- S45: Application-owner answer on reserved cart pricing, relayed by the Orchestrator on 2026-09-10: “no, it should update the price in cart items aslo”. The typo “aslo” is interpreted as “also”.
- S46: Application-owner answer on purchased-order pricing, relayed by the Orchestrator on 2026-09-10: “purchaged items prices should show original ordered price in the order history”. The typo “purchaged” is interpreted as “purchased”.
- S47: Application-owner answer relayed by the Orchestrator on 2026-09-10: “no” to “Should customers be able to cancel confirmed bookings before the appointment in phase one?”
- S48: Application-owner clarification, relayed by the Orchestrator on 2026-09-10: “no cancelation from either side in phase one”. This expands S47 to exclude provider-initiated cancellation as well.
- S49: Application-owner answer relayed by the Orchestrator on 2026-09-10: “no” to “Should confirmed bookings be reschedulable in phase one?”
- S50: Application-owner answer relayed by the Orchestrator on 2026-09-10: “expired” to “What status should a booking show after its appointment time passes without redemption?”
- S51: Application-owner answer on aggregate status when all lines are delivered or expired with at least one expired, relayed by the Orchestrator on 2026-09-10: “Completed or Fulfilled, keep it as for a normal order”.
- S52: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should the final order status be labeled ‘Completed’?”
- S53: Application-owner answer relayed by the Orchestrator on 2026-09-10: “no” to “Should providers be allowed to redeem a booking after it has become Expired?”
- S54: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should an unredeemed booking become Expired when its scheduled slot ends?”
- S55: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should providers enter both a start time and an end time when creating each slot?”
- S56: Application-owner answer relayed by the Orchestrator on 2026-09-10: “no” to “Should a solo provider be allowed to publish slots that overlap in time?”
- S57: Complete application-owner batch response in `/Users/pacific/.codex/attachments/e12f6111-6187-4f54-aa12-eac402a98e57/pasted-text.txt`, received through the Orchestrator on 2026-09-10. S57.1–S57.94 below preserve every question and answer. Answer capitalization is normalized for interpretation only; item 78 “Not Necessarily” means No. Item 49 and item 90 qualifications are preserved.
- S58: Application-owner clarification during batch processing, relayed by the Orchestrator on 2026-09-10: “no messaging at all”. All customer-provider messaging is excluded from phase one, resolving items 89–90 and superseding D10’s messaging target only.
- S59: Application-owner answer relayed by the Orchestrator on 2026-09-10: “yes” to “Should the amount accepted when simulated payment starts remain the amount paid if the provider changes the service price during that payment attempt?”
- S60.1: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should entering a valid code before the slot starts immediately mark the booking Delivered?”
- S60.2: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “May an administrator change an Expired booking to Delivered without redeeming its code?”
- S60.3: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should unpublishing a service leave already-purchased bookings valid and redeemable?”
- S60.4: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should the publicly displayed inventory count total the available units across the service’s future slots?”
- S60.5: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should signed-in customers see available slot times when selecting a service to book?”
- S60.6: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should an administrator releasing a cart reservation also remove the corresponding quantity from that cart?”
- S61.1: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should deleting a customer account remove its cart and release its cart reservations?”
- S61.2: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should suspending a provider prevent that provider from signing in?”
- S61.3: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should suspension remove that provider’s services from public discovery?”
- S61.4: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should suspension leave already-purchased bookings valid?”
- S61.5: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should English be the default when the browser prefers neither English nor German?”
- S61.6: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should a language selection be remembered on the current device only?”
- S61.7: Application-owner answer relayed by the Orchestrator on 2026-09-10: “NO” to “When providers supply both manual translations, should the version matching the interface language be displayed?”
- S61.8: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should quoted phrases disable typo tolerance within the quoted text?”
- S61.9: Application-owner answer relayed by the Orchestrator on 2026-09-10: “YES” to “Should administrators be able to refund selected quantities from a booking line?”
- S62: Application-owner response to the five-question follow-up, relayed by the Orchestrator on 2026-09-10: “1. YES; 2-4 No refund in phase 1; 5. No account delete in phase 1.” Item 1 accepts suspension cart cleanup; items 2–4 supersede all refund functionality; item 5 supersedes self-service account deletion.


## Accepted decisions

| ID | Decision | Source |
| --- | --- | --- |
| D01 | Build a service-booking marketplace application. | S1 |
| D02 | Use React for the web frontend. | S2 |
| D03 | Use Java Spring Boot for the API. | S2 |
| D04 | Use PostgreSQL in Docker. | S2 |
| D05 | Include backend tests and Playwright browser tests. | S2 |
| D06 — partially superseded by D49 | Historical category scope: tutor/lesson, beauty/wellness, and home services. The home-service portion is removed for phase one; D49 is the current category decision. | S2, partially superseded by S37 |
| D07 — superseded by D39 | Historical only: support both instant-confirmation and provider-approval bookings. The provider-approval branch is removed from phase one by S26. | S2, superseded by S26 |
| D08 — superseded by D46 | Historical only: support solo providers and provider organizations with staff scheduling. Organizations and staff are excluded from phase one by S34. | S2, superseded by S34 |
| D09 | Use local email/password authentication and roles. | S2 |
| D10 — refund and messaging portions superseded | Simulate email verification, password reset, notifications, and payments behind clean interfaces. Historical refunds and messaging targets are excluded from phase one by D180/S62 and D162/S58 respectively. | S2, partially superseded by S58 and S62 |
| D11 | The first-release outcome is a dedicated two-sided portal where providers publish service offerings and buying/booking options, and customers discover and book those services online. | S3 |
| D12 | The first-release booking option is services published as fixed-time appointment slots. | S4 |
| D13 — superseded by D14 | Historical decision only: first-release capacity is one customer booking per fixed-time appointment slot. This limit is no longer current. | S5, superseded by S6 |
| D14 | Providers define an inventory/capacity count for each fixed-time slot in the first release. | S6 |
| D15 | A customer may add a quantity of one or more units from a fixed-time slot's available inventory to a shopping cart. | S7 |
| D16 | Purchasing two units yields email confirmation for two booked units; email is simulated under D10. | S8, S2 |
| D17 | The purchased order appears as pending in customer order history; D24 clarifies its meaning. | S8 |
| D18 | A four-digit redemption credential is supplied to the customer, who presents it to the service provider. | S8 |
| D19 | The service provider validates the credential when or after providing the purchased service and marks the relevant order/slot delivered. | S8 |
| D20 | Each distinct fixed-time slot is a distinct SKU; different slots have different SKUs. | S9 |
| D21 | All units purchased for the same timed slot/SKU share one redemption code; units for different slot SKUs receive different codes. | S9 |
| D22 | Use `https://github.com/prashant7163/service-booking-1.git` as the project repository. | S10 |
| D23 | When a provider validates the shared redemption code for a slot/SKU, all purchased units covered by that code are marked delivered together atomically. | S11 |
| D24 | Pending in customer order history means the relevant booking/order is awaiting fulfillment of the purchased service. | S12 |
| D25 | One customer cart may contain slot/SKU quantities from multiple service providers in the first release. | S13 |
| D26 | Checkout of a cart containing multiple providers creates one customer-visible marketplace order. | S14 |
| D27 — refined by D62 | Original aggregate rule: await fulfillment until all included slots/SKUs are delivered. D62 extends resolution to Delivered or Expired lines; an expired line no longer keeps an otherwise resolved order pending. | S15, refined by S51 |
| D28 | A fixed-time slot becomes unavailable for further booking when its remaining inventory reaches zero/is exhausted. | S16 |
| D29 | Adding slot units to a shopping cart immediately reserves those units, making them unavailable to other customers. | S17 |
| D30 — superseded by D37 | Historical only: automatic cart-item removal and inventory release after 60 minutes without checkout. No longer applies in phase one. | S17, superseded by S24 |
| D31 — superseded by D32 | Historical interpretation only: checkout starts a separate 60-minute reservation window, with release if purchase is unfinished. This separate checkout hold is no longer current. | S18, superseded by S19 |
| D32 — superseded by D37 | Historical only: the 60-minute cart timer continues into checkout and gains 10 minutes when checkout starts at or after minute 50. No longer applies in phase one. | S19, superseded by S24 |
| D33 — superseded by D37 | Historical only: add 10 minutes to the current deadline, so checkout at minute 55 moves expiry from minute 60 to minute 70. No longer applies in phase one. | S20, superseded by S24 |
| D34 — superseded by D37 | Historical only: allow one qualifying automatic and one optional manual 10-minute extension. No longer applies in phase one. | S21, superseded by S24 |
| D35 — superseded by D37 | Historical only: display the reservation countdown and extension option in the checkout header. No longer applies in phase one. | S21, S22, superseded by S24 |
| D36 — superseded by D37 | Historical only: use one shared timer for the whole cart. No longer applies in phase one. | S23, superseded by S24 |
| D37 | In phase one, cart inventory remains reserved until the relevant item/quantity is removed from the cart. There is no automatic reservation expiry, countdown timer, or automatic/manual extension. D29's immediate reservation remains current. | S24 |
| D38 | On successful checkout, purchased items/quantities leave the cart and their reserved inventory converts to inventory allocated/consumed by the created marketplace order. Checkout removal does not restore those units to available inventory. | S25 |
| D39 | All phase-one bookings use instant confirmation; no provider-approval workflow is included. D40 establishes simulated payment success as a prerequisite for confirmation. | S26 |
| D40 | Simulated payment success is required before the marketplace order/bookings are created in or transitioned into the instant-confirmed state. This does not determine whether unconfirmed order records exist before payment. | S27 |
| D41 | When simulated payment fails, cart items and their inventory reservations remain intact so the customer can retry. | S28 |
| D42 | Only an authenticated customer account may create/use a cart and reserve slot inventory. | S29 |
| D43 | Service browsing and search are publicly accessible to unauthenticated visitors. D42 still requires authentication for carts and inventory reservations. | S30 |
| D44 | Public full-text search indexes product/service-offering name, product/service description, category name, category description, and shop/provider storefront name. “Product” and “shop” preserve the owner’s wording; D47 establishes one shop per solo provider, while final terminology and whether shop/provider are the same domain entity remain undecided. | S31, S32 |
| D45 | In phase one, provider onboarding and service publication are self-service and require no marketplace-administrator approval. | S33 |
| D46 | Phase one supports solo service providers only. Provider organizations, staff accounts, staff scheduling, organization membership, and staff-slot assignment are excluded. | S34 |
| D47 | In phase one, solo-provider accounts and shops/storefronts have a one-to-one relationship: each solo provider owns/manages exactly one shop. | S35 |
| D48 | All phase-one booked services are delivered in person at the solo provider’s single shop/storefront. Customer-location and online/remote delivery modes are excluded. | S36 |
| D49 | Phase-one service categories are tutor/lesson and beauty/wellness only. Home services are excluded. | S37 |
| D50 | The phase-one marketplace serves Switzerland. | S38 |
| D51 | The phase-one user interface supports English and German (Deutsch). Canonical language identifiers: English/en and German/de. | S39 |
| D52 | Provider-authored service/shop content may be supplied in either English or German. Bilingual copies are not required in phase one. | S40 |
| D53 | Provider-authored service/shop content is displayed in its submitted/original English or German even when the interface language differs. No automatic translation is performed in phase one. | S41 |
| D54 | All phase-one displayed prices, cart/order totals, and simulated payments use Swiss francs (CHF) only. Historical refund-currency scope is retired by D180. | S42 |
| D55 | Each service offering has one provider-defined per-unit price shared by all its bookable slots/SKUs in phase one. Different service offerings need not share a price. | S43 |
| D56 | The cart total equals the sum of each service’s per-unit price multiplied by its booked quantity. No extra fees or discounts apply in phase one. | S44 |
| D57 | When a provider changes a service’s price, reserved cart items for that service are repriced to the new current price. Purchased order-history prices are governed separately by D58. | S45 |
| D58 | Successfully purchased order history preserves and displays the original ordered unit prices and totals, unaffected by later provider price changes. | S46 |
| D59 | Both customer-initiated and provider-initiated cancellation of confirmed bookings are excluded from phase one. S48 expands the original customer-only exclusion in S47. | S47, S48 |
| D60 | Rescheduling confirmed bookings is excluded from phase one. | S49 |
| D61 | An unredeemed booking/slot line automatically shows Expired when its scheduled slot ends, as clarified by D65. | S50 |
| D62 | Once all booking lines are resolved as Delivered or Expired, the marketplace order enters the same normal terminal state used for an all-delivered order. Expired lines do not produce a special failed/partial aggregate state. D63 establishes the displayed label as Completed. | S51 |
| D63 | The normal terminal marketplace-order status is labeled Completed, including when every booking line has resolved through any mix of Delivered and Expired. | S52 |
| D64 | An Expired booking/slot line cannot later be redeemed; its redemption code is no longer valid for fulfillment. | S53 |
| D65 | The scheduled slot end instant is the expiry boundary for an unredeemed booking/slot line. | S54 |
| D66 | Every provider-created fixed-time slot requires an explicit start time and end time. | S55 |
| D67 | A solo provider’s published slots must not overlap in time in phase one. | S56 |
| D162 | All customer-provider messaging is excluded from phase one. This supersedes D10’s messaging target and resolves the interpretations of D156–D157 (batch items 89–90). | S58 |
| D163 | The amount accepted when a simulated payment attempt starts remains the amount paid for that attempt despite provider price changes during it. A later retry is a distinct attempt; this decision does not independently fix its pricing or consent behavior. | S59 |
| D164 | Entering a valid code before slot start immediately marks the booking Delivered. This explicitly refines D19: the system does not require the scheduled start or proof of prior service provision before this transition. | S60.1 |
| D165 | An administrator may change an Expired booking to Delivered without code redemption. D64 still prohibits redemption of an expired code; this is an administrative status change, not code reactivation. | S60.2 |
| D166 | Unpublishing a service leaves already-purchased bookings valid and redeemable, subject to their existing redemption/expiry rules. It still removes service items from carts under D116. | S60.3 |
| D167 | The public inventory count totals available units across the service’s future slots. The exact time boundary defining future remains open. | S60.4 |
| D168 | Signed-in customers see available slot times when selecting a service to book. D121 continues to exclude those times from public service pages. | S60.5 |
| D169 | Administrative release of a cart reservation also removes the corresponding quantity from the cart. | S60.6 |
| D170 — superseded by D181 | Deleting a customer account removes its cart and releases its cart reservations; purchased-booking/data retention remains open. | S61.1 |
| D171 | Provider suspension blocks that provider from signing in. | S61.2 |
| D172 | Provider suspension removes that provider’s services from public discovery; this is a suspension consequence, not the separately excluded direct service-hiding tool. | S61.3 |
| D173 | Provider suspension preserves already-purchased bookings as valid; fulfillment while provider sign-in is blocked remains open. | S61.4 |
| D174 | English is the default interface language when the browser prefers neither English nor German. | S61.5 |
| D175 | Language selection persists on the current device only, not across devices. | S61.6 |
| D176 | When manual English/German versions exist, the application must not automatically select a version by matching the interface language. The actual version-selection rule remains unresolved. | S61.7 |
| D177 | Quoted search phrases disable typo tolerance within the quoted text. | S61.8 |
| D178 — superseded by D180 | Administrators may refund selected quantities from a booking line. Refund effects on redemption, inventory, and booking/order status remain open. | S61.9 |
| D179 | Provider suspension removes that provider’s service quantities from existing carts and releases those reservations. Purchased bookings remain valid under D173. | S62 item 1 |
| D180 | All refund functionality is excluded from phase one, including simulated and administrator-issued refunds. Earlier refund features and effect questions are superseded. | S62 items 2–4 |
| D181 | Self-service account deletion is excluded from phase one. D108 and D170 are historical/non-current; no legal data-retention conclusions follow. | S62 item 5 |

These decisions establish technology and capability targets. They do not settle the detailed user journeys, permissions, booking rules, or acceptance criteria. Real integrations for the capabilities in D10 are outside the currently accepted target.


## Batch decisions and source traceability

All 94 rows are phase-one decisions. The response column preserves supplied wording (including capitalization). D68–D161 interpret each answer within its question scope; unresolved consequences are not inferred. These discovery answers do not approve the specification.

| Item/source | Decision ID | Question | Owner response | Accepted decision |
| --- | --- | --- | --- | --- |
| S57.1 | D68 | May one slot start exactly when the provider’s previous slot ends? | Yes | Adjacent published slots may touch: one may start exactly when the previous slot ends. |
| S57.2 | D69 | Can providers save unpublished draft slots? | Yes | Providers may save unpublished draft slots. |
| S57.3 | D70 | Can providers create slots through a recurring schedule? | No | Recurring-schedule slot creation is excluded. |
| S57.4 | D71 | Can providers create multiple nonrecurring slots in one operation? | YES | Providers may create multiple nonrecurring slots in one operation. |
| S57.5 | D72 | Should slot times become uneditable once inventory is reserved or purchased? | YES | Slot start/end times become uneditable once any inventory is reserved or purchased. |
| S57.6 | D73 | Must providers be prevented from reducing capacity below the quantity already reserved or purchased? | YES | Capacity cannot be reduced below reserved plus purchased quantities. |
| S57.7 | D74 | May providers publish slots with zero available inventory? | NO | Providers may not publish slots with zero available inventory. |
| S57.8 | D75 | Does one inventory unit entitle one person to receive the service? | YES | One inventory unit entitles one person to receive the service. |
| S57.9 | D76 | Must customers supply an attendee name for every purchased unit? | NO | Attendee names are not required for every purchased unit. |
| S57.10 | D77 | Must purchases be prevented after a slot starts? | YES | Purchases are prohibited after the slot starts; the exact start-instant comparison remains open. |
| S57.11 | D78 | Should all slot times use Swiss local time, including daylight-saving changes? | YES | Slot entry/display uses Swiss local time, including daylight-saving changes. |
| S57.12 | D79 | May providers anywhere in Switzerland register? | YES | Providers anywhere in Switzerland may register. |
| S57.13 | D80 | May one account act as both customer and solo provider? | NO | An account may not act as both customer and solo provider. |
| S57.14 | D81 | Should each customer have exactly one active cart? | YES | Each customer has exactly one active cart. |
| S57.15 | D82 | Should cart items and reservations persist after sign-out or session expiry? | YES | Cart items and reservations persist after sign-out or session expiry. |
| S57.16 | D83 | Should a customer’s cart be shared across devices and concurrent sessions? | YES | A customer's cart is shared across devices and concurrent sessions. |
| S57.17 | D84 | Can customers change quantities directly in their cart? | YES | Customers may change quantities directly in their cart. |
| S57.18 | D85 | Can customers edit their cart after a failed payment before retrying? | YES | Customers may edit their cart after a failed payment before retrying. |
| S57.19 | D86 | Can customers purchase selected cart items while leaving the rest reserved? | YES | Customers may purchase selected cart items while leaving the rest reserved. |
| S57.20 | D87 | Should checkout succeed only when every selected item can be purchased together? | YES | Checkout succeeds only when all selected items can be purchased together. |
| S57.21 | D88 | Must customers accept an updated total before payment after a provider changes a cart item’s price? | YES | Customers must accept an updated total before payment after a provider changes a cart item's price. |
| S57.22 | D89 | Should a price change during simulated payment stop the attempt and require confirmation of the new total? | NO | A price change during simulated payment must not stop the attempt and require reconfirmation; D163 subsequently fixes the amount to that accepted when the attempt starts. |
| S57.23 | D90 | Should failed payment attempts appear in order history? | NO | Failed payment attempts do not appear in customer order history. |
| S57.24 | D91 | Should checkout include a visible control for simulating payment failure? | YES | Checkout includes a visible control for simulating payment failure. |
| S57.25 | D92 | Should each redemption code appear beside its booking line in order history? | YES | Each redemption code appears beside its booking line in order history. |
| S57.26 | D93 | Should simulated confirmation emails include redemption codes? | YES | Simulated confirmation emails include redemption codes. |
| S57.27 | D94 | Must providers select a booking before entering its four-digit code? | YES | Providers must select a booking before entering its four-digit code. |
| S57.28 | D95 | Should redemption be prohibited before the slot starts? | NO | Redemption is not prohibited solely because the slot has not started; reconciliation with service-delivery validation in D19 remains open. |
| S57.29 | D96 | Should a successfully redeemed code become unusable immediately? | YES | A successfully redeemed code becomes unusable immediately. |
| S57.30 | D97 | Should repeated incorrect codes temporarily block further attempts for that booking? | NO | Repeated incorrect codes do not trigger a temporary booking-level attempt block; other safeguards remain undecided. |
| S57.31 | D98 | Should every redemption attempt be recorded in an audit history? | NO | An audit history of every redemption attempt is not required by the product scope; other audit requirements remain undecided. |
| S57.32 | D99 | Should customers see each line’s `Delivered` or `Expired` status alongside the overall order status? | YES | Customers see each booking line's Delivered or Expired status alongside the overall order status. |
| S57.33 | D100 | Should providers see only their own lines in a multi-provider marketplace order? | YES | Providers see only their own lines within a multi-provider marketplace order. |
| S57.34 | D101 | Should providers see the booking customer’s name? | YES | Providers see their booking customer's name. |
| S57.35 | D102 | Should providers see the booking customer’s email address? | YES | Providers see their booking customer's email address. |
| S57.36 | D103 | Should expired bookings receive an automatic simulated refund? | NO | Expired bookings do not receive automatic simulated refunds. |
| S57.37 | D104 — superseded by D180 | Should marketplace administrators be able to issue simulated refunds? | YES | Marketplace administrators may issue simulated refunds. |
| S57.38 | D105 — superseded by D180 | Should refunds use the original ordered price? | YES | Refunds use the original ordered price; refund granularity and amount rules remain open. |
| S57.39 | D106 | Should administrators have a booking-status override? | YES | Administrators have a booking-status override capability; allowed transitions remain open. |
| S57.40 | D107 | Should administrators be able to release abandoned-cart reservations manually? | YES | Administrators may manually release abandoned-cart reservations. |
| S57.41 | D108 — superseded by D181 | Should users be able to delete their accounts through the application? | YES | Users may delete their accounts through the application; related data and reservation handling remain open. |
| S57.42 | D109 | Must a shop have a postal address before publishing services? | YES | A shop requires a postal address before publishing services. |
| S57.43 | D110 | Should shop addresses be publicly visible? | YES | Shop addresses are publicly visible. |
| S57.44 | D111 | Should shops have public storefront pages? | NO | Public shop storefront pages are excluded; this does not remove the shop entity or shop-name search. |
| S57.45 | D112 | Must shop names be unique across the marketplace? | NO | Shop names need not be unique across the marketplace. |
| S57.46 | D113 | Can providers create their shop before publishing services? | YES | Providers may create their shop before publishing services. |
| S57.47 | D114 | Can providers upload shop images? | YES | Providers may upload shop images. |
| S57.48 | D115 | Can providers upload service images? | YES | Providers may upload service images. |
| S57.49 | D116 | Should providers be prevented from unpublishing a service that has reserved inventory or future purchased bookings? | NO, unpublishing should remove that item from carts | Providers are not blocked from unpublishing a service with reserved inventory or future purchased bookings. Unpublishing removes that service's items from carts; purchased-booking consequences remain unresolved. |
| S57.50 | D117 | Can administrators hide published services from public discovery? | NO | Administrators cannot hide published services from public discovery through a dedicated service-hiding capability; suspension consequences remain open. |
| S57.51 | D118 | Can administrators suspend provider accounts? | YES | Administrators may suspend provider accounts. |
| S57.52 | D119 | Should administrators have tools for editing category names and descriptions? | NO | Administrator tools for editing category names/descriptions are excluded. |
| S57.53 | D120 | Should shop ownership transfers between accounts be supported? | NO | Shop ownership transfers between accounts are excluded. |
| S57.54 | D121 | Should public service pages show available slot times? | NO | Public service pages do not show available slot times; the authenticated slot-selection journey remains open. |
| S57.55 | D122 | Should public service pages show exact remaining inventory? | YES | Public service pages show exact remaining inventory; the aggregation/display scope remains open. |
| S57.56 | D123 | Should services remain discoverable when all slots are exhausted? | YES | Services remain discoverable when all slots are exhausted. |
| S57.57 | D124 | Should an empty search show all published services? | YES | An empty search shows all published services. |
| S57.58 | D125 | Should search ignore capitalization? | YES | Search ignores capitalization. |
| S57.59 | D126 | Should search ignore accent and umlaut differences? | YES | Search ignores accent and umlaut differences. |
| S57.60 | D127 | Should search tolerate spelling mistakes? | YES | Search tolerates spelling mistakes. |
| S57.61 | D128 | Should quoted search text require an exact phrase match? | YES | Quoted search text requires an exact phrase match. |
| S57.62 | D129 | Should search match grammatical word variants in English and German? | NO | Grammatical word-variant matching is not required in English or German. |
| S57.63 | D130 | Should results default to relevance ordering? | YES | Search results default to relevance ordering. |
| S57.64 | D131 | Should search results be paginated? | YES | Search results are paginated; page size remains open. |
| S57.65 | D132 | Should visitors be able to filter by category? | YES | Visitors may filter by category. |
| S57.66 | D133 | Should visitors be able to filter by appointment date? | NO | Appointment-date filtering is excluded. |
| S57.67 | D134 | Should visitors be able to filter by price range? | YES | Visitors may filter by price range. |
| S57.68 | D135 | Should visitors be able to filter by shop location? | NO | Shop-location filtering is excluded. |
| S57.69 | D136 | Should visitors be able to sort by price? | YES | Visitors may sort by price. |
| S57.70 | D137 | Should signed-in customers have saved searches? | NO | Saved searches are excluded. |
| S57.71 | D138 | Should results be personalized from a customer’s prior activity? | NO | Search results are not personalized using prior customer activity. |
| S57.72 | D139 | Should public service pages support search-engine indexing? | NO | Search-engine indexing support for public service pages is excluded; crawl-policy details remain open. |
| S57.73 | D140 | Should the initial interface language follow the browser preference when it is English or German? | YES | The initial interface language follows the browser preference when it is English or German. |
| S57.74 | D141 | Should users have a visible English/German language switch? | YES | Users have a visible English/German language switch. |
| S57.75 | D142 | Should a signed-in user’s language choice persist across devices? | NO | A signed-in user's language choice does not persist across devices; local persistence remains open. |
| S57.76 | D143 | Should provider content show its submitted language? | YES | Provider content indicates its submitted language. |
| S57.77 | D144 | May providers optionally supply manual English and German versions? | YES | Providers may optionally supply manual English and German versions. |
| S57.78 | D145 | Must all text fields within one service offering use the same submitted language? | Not Necessarily | Text fields within one service offering need not all share one submitted language. |
| S57.79 | D146 | Should provider-entered prices be the final tax-inclusive customer price? | YES | Provider-entered prices are the final tax-inclusive customer price; legal/tax treatment is not inferred. |
| S57.80 | D147 | Should prices be limited to two decimal places? | YES | Entered prices are limited to two decimal places. |
| S57.81 | D148 | Should free services priced at CHF 0.00 be allowed? | NO | Free services priced at CHF 0.00 are excluded. |
| S57.82 | D149 | Should every monetary amount display the explicit `CHF` code? | YES | Every monetary amount displays the explicit CHF code. |
| S57.83 | D150 | Must customers complete simulated email verification before reserving inventory? | YES | Customers must complete simulated email verification before reserving inventory. |
| S57.84 | D151 | Must providers complete simulated email verification before publishing? | YES | Providers must complete simulated email verification before publishing. |
| S57.85 | D152 | Should users have an in-app inbox for simulated emails? | NO | An in-app inbox for simulated emails is excluded. |
| S57.86 | D153 | Should providers receive a simulated notification for each successful purchase? | YES | Providers receive a simulated notification for each successful purchase of their service. |
| S57.87 | D154 | Should customers receive a simulated notification when a booking is redeemed? | YES | Customers receive a simulated notification when a booking is redeemed. |
| S57.88 | D155 | Should customers receive a simulated notification when a booking expires? | YES | Customers receive a simulated notification when a booking expires. |
| S57.89 | D156 | Should customer-provider messaging become available only after a successful booking? | NO | Historical answer: No to restricting messaging to successful bookings. D162/S58 now resolves scope by excluding all customer-provider messaging; no pre-booking messaging is inferred. |
| S57.90 | D157 | Should each booking have its own conversation? | NO booking conversations in phase 1 | Booking conversations are excluded in phase one. D162/S58 clarifies that all customer-provider messaging is excluded. |
| S57.91 | D158 | Must every customer and provider workflow support mobile-sized screens? | YES | Every customer and provider workflow supports mobile-sized screens. |
| S57.92 | D159 | Should users be able to export their account and booking data? | NO | User-facing export of account and booking data is excluded from product scope; applicable data-rights obligations remain to be assessed. |
| S57.93 | D160 | Must application data be stored in Switzerland? | YES | Application data must be stored in Switzerland. |
| S57.94 | D161 | Should phase one include usage analytics? | NO | Usage analytics are excluded. |

## Problem and desired outcome

The accepted first-release need is service discovery and online booking through a dedicated portal. Providers must be able to publish their offerings and buying/booking options; customers must be able to discover and book them (D11, S3). The booking option is fixed-time appointment slots (D12, S4). Existing alternatives, specific customer segments, detailed slot rules, and measurable improvements have not yet been established.

## Current interpretation and unresolved interactions

The current decisions include the original non-superseded decisions, D68–D161, and subsequent clarifications D162–D181. D104–D105, D108, D170, and D178 are superseded by D180–D181; the refund and messaging portions of D10 are also non-current. Earlier explicit reversals remain historical: D06 is replaced by D49 for category scope; D07–D08, D13, and D30–D36 are non-current. No answers are assumed for matters not covered by the owner's responses.

- D68–D79 refine scheduling: adjacent slots are allowed, drafts and bulk nonrecurring creation are supported, recurrence is excluded, reserved/purchased slot times are locked, and capacity cannot drop below commitments. Zero-inventory publication is prohibited, while D123 allows an already-exhausted service to remain discoverable; these are different conditions.
- D80–D87 settle separate customer/provider roles, one persistent shared cart per customer, quantity edits, selected-item checkout, and all-selected-items checkout consistency. D82 refines persistence across sign-out/session expiry without reviving cart timers. D181 retires customer-account deletion and its D170 cleanup behavior. D171–D173 define suspension as blocking provider sign-in and removing services from discovery while preserving purchased bookings. D179 removes suspended-provider quantities from carts and releases reservations. Fulfillment access during suspension remains open.
- D88 requires acceptance of a repriced total before payment; D89 rejects stopping an in-progress payment because of a price change. D163/S59 resolves the amount: the accepted amount is fixed for that attempt. For a successful attempt, D58 preserves that purchased price in order history. D57 continues to reprice cart items. A later retry is a distinct attempt; retry consent and price-selection details are not inferred beyond the existing live-cart rules.
- D164/S60.1 explicitly refines D19/D95: a valid code before slot start immediately marks Delivered. This transition does not prove physical service provision. No additional authorization safeguards or state changes are inferred.
- D97 excludes temporary booking-level blocking after repeated incorrect codes; D98 excludes a history of every redemption attempt. These do not approve unlimited automated guessing or remove required security controls.
- D180/S62 excludes all refund functionality. D104–D105 and D178 remain historical only; refund amounts, quantities, redemption/inventory effects, and status questions are retired. D103’s no-automatic-refund rule is consistent with this broader exclusion.
- D165/S60.2 refines D106: administrators may set Expired to Delivered without code redemption. D64 still prohibits using expired codes; they are not reactivated. Other override transitions, permissions, and safeguards remain open; refund consequences are retired by D180. Customer/provider cancellation and rescheduling remain excluded.
- D169/S60.6 refines D107: administrative release removes the corresponding cart quantity. This adds no automatic expiry. Authorization, concurrency, and subsequent checkout handling remain open.
- D166/S60.3 refines D116: unpublication removes service items from carts while preserving purchased bookings and their redemption rights under existing expiry rules. Under D37 removed cart quantities no longer retain cart reservations.
- D171–D173/S61.2–S61.4 refine D118: suspension blocks provider sign-in, removes services from discovery, and preserves purchased bookings. D117 still excludes a separate direct service-hiding tool. D179 resolves suspension cart cleanup/release. Who fulfills existing bookings while provider sign-in is blocked remains open.
- D111 excludes public storefront pages while retaining the one-shop-per-provider model, public shop addresses, shop images, and shop-name search. Where shop information appears remains to be designed.
- D167/S60.4 refines D122: public inventory is the sum of available units across the service’s future slots. The exact meaning of future remains open. D168/S60.5 refines D121: signed-in customers see slot times during booking selection, while public service pages do not. UI layout and navigation remain open.
- D125–D129 define case/accent-insensitive, typo-tolerant, quoted-phrase search without grammatical word-variant matching. D177 disables typo tolerance inside quoted phrases. Other interactions among phrase matching, accents, and mixed-language fields remain open.
- D174 establishes English browser fallback and D175 establishes current-device-only preference persistence, refining D140–D142.
- D144 permits optional manual translations, refining D52's absence of a bilingual requirement. D53 continues to exclude automatic translation. D176 explicitly rejects automatically matching supplied versions to interface language; the actual selection rule remains open. D145 permits mixed-language fields; labeling and search handling must account for that.
- D146–D149 establish final tax-inclusive CHF prices, two decimal places, no free services, and explicit CHF display. These are product presentation decisions, not legal/tax conclusions or a VAT computation design.
- D150–D151 require simulated verification before customer reservations/provider publication. D152 excludes a simulated-email inbox; delivery and verification/reset interaction mechanisms remain open.
- D156–D157 preserve items 89–90, including “NO booking conversations in phase 1”. S58/D162 resolves the ambiguity: all customer-provider messaging is excluded in phase one, superseding only D10’s messaging portion. Simulated notifications, verification, reset, and payments remain current; refunds are excluded by D180.
- D159 excludes a user-facing data export feature from product scope. Applicable legal obligations and any operational process remain to be assessed. D160 requires Swiss data storage without selecting hosting, backups, or retention policy.
- D65 fixes unredeemed booking expiry at slot end and D64 prohibits redemption thereafter. This is unrelated to retired cart timers; the batch did not reintroduce a grace period or automatic cart expiry.

## Phase-one risks

R01 — abandoned-cart inventory locking: because reservations do not expire automatically under D37, abandoned carts can hold inventory indefinitely and prevent other customers from booking it. This is a consequence of the accepted phase-one rule, not a decision to add expiry or another release mechanism.

R02 — resolved/retired by D49/S37: the historical home-service/shop-only-delivery tension no longer applies because home services are excluded from phase one. The original conflict is preserved here for traceability.

## Repository evidence

E01 — verified inspection/setup evidence supplied by the Orchestrator on 2026-09-10, distinct from application-owner decision D22:

- `git ls-remote https://github.com/prashant7163/service-booking-1.git` succeeded with no output: the reachable remote exposed no refs at inspection time.
- The workspace was not previously a Git repository. The Orchestrator initialized it on local branch `main` and configured `origin` fetch/push to `https://github.com/prashant7163/service-booking-1.git`.
- `git status --short` showed the existing Studio/discovery project files as untracked. No application code was added or implemented, and nothing was committed or pushed during that setup.

These are time-bound observations reported by the Orchestrator, not additional owner decisions or specification approval. The Discovery Lead did not perform repository setup. No remote content or history beyond the exposed-ref observation is inferred.

## Open questions after the batch

| ID | Remaining requirement area |
| --- | --- |
| Q01 | Intended customer audience and measurable customer/business outcome beyond the established portal journey. |
| Q02 | Administrative permission matrix; account signup/profile fields; role lifecycle; fulfillment access while provider sign-in is blocked. D171–D173 and D179 settle suspension sign-in/discovery/purchased-booking preservation and cart cleanup. Self-service deletion and its follow-up questions are retired by D181; ordinary retention policy remains open. Separate customer/provider roles and one shared persistent cart are settled. |
| Q03 | Actual manual-translation selection after D176 rejects interface-language matching, per-field language labels, mixed-language content/search, Swiss-time input and ambiguous/nonexistent daylight-saving times, address details, legal/tax requirements, and storage/retention boundaries. |
| Q04 | Slot validation, minimum/maximum capacity and duration, exact start cutoff, bulk-creation input, draft-overlap rules, editing conflicts, and behavior when a reserved slot passes its start/end. Unit entitlement, adjacent slots, explicit timing, no recurrence, and published non-overlap are settled. |
| Q05 | D179 settles suspension cart cleanup; administrative release authorization/concurrency; concurrency/idempotency and selected-checkout failure semantics; slot-time passage in carts; quantity ceilings. Persistent reservations and no automatic expiry remain current. |
| Q06 | Exact future-slot boundary for public inventory totals and authenticated slot-selection UI; required listing/customer fields; search-match precedence, ranking details, page size, price filters/sort details; failed-payment and retry UI; unconfirmed-order/payment-attempt records; simulation mechanisms; language-aware notifications and code delivery. |
| Q07 | Additional administrative override transitions and safeguards beyond Expired-to-Delivered;  redemption/expiry races and processing timing; booking history retention. Customer/provider cancellation, rescheduling, and post-expiry redemption remain excluded. |
| Q08 | Required shop/service/profile/image fields and limits; presentation of shop data without public storefront pages; category provisioning without administrator editing tools; publication/edit/delete rules, remaining provider-suspension effects, identity verification, while purchased-booking preservation after unpublication is settled by D166. |
| Q09 | D163 fixes the in-progress attempt amount; later-retry consent/price-selection details;  price validation/rounding and tax-inclusive presentation details; business success criteria. |
| Q10 | Remaining explicit scope boundaries, priorities, measurable success criteria, and end-to-end acceptance scenarios. |
| Q11 | Security controls for authentication/redemption, rate limits without booking-level temporary blocks, required audit evidence distinct from an every-attempt product history, privacy/data classifications, retention, Swiss-storage architecture constraints, accessibility, performance, reliability, and operational requirements. |
| Q12 | Design direction, supported browsers, notification/simulated-email delivery without inbox, deployment/delivery constraints, and application-owner identity. Mobile-sized support is settled; usage analytics and user-facing export are excluded. |
| Q14 | Code generation/uniqueness and non-blocking anti-abuse controls; exact authorization and other administrator override boundaries. Early valid-code redemption immediately marks Delivered; expired-code redemption remains prohibited. Codes are selected by booking, shown in history/email, and single-use after success. |

All 94 batch answers are recorded as D68–D161 with individual source references S57.1–S57.94. “Not Necessarily” in item 78 is interpreted as No, without changing the original response text. Items requiring values, policy detail, or interaction design remain open rather than receiving invented defaults.

## Requirements and acceptance traceability

D02–D05 establish stack/verification constraints; D22 designates the repository. Current earlier scope anchors are D09–D12, D14–D21, D23–D29 (D27 refined by D62), and D37–D67. D68–D161 record the complete batch and refine those decisions as described above. D162/S58 subsequently excludes all customer-provider messaging, partially superseding D10 and resolving items 89–90. D163/S59 resolves the price snapshot for an in-progress payment attempt. D170–D178/S61.1–S61.9 record the nine-question batch; D170 and D178 are subsequently superseded by D181 and D180. D179–D181/S62 settle suspension cart cleanup and exclude refunds/self-service deletion. The actual manual-translation selection rule remains open. D164–D169/S60.1–S60.6 resolve early redemption, the Expired-to-Delivered administrative exception, unpublication preservation, public inventory aggregation, authenticated slot-time visibility, and administrative cart removal. D06 is replaced by D49 for current categories; D07–D08, D13, and D30–D36 are historical only. Detailed requirements and acceptance criteria still need stable IDs and traceability; this remains a partial, unapproved discovery artifact.

## Safe resume

Discovery is closed. Review `docs/discovery/project-specification.json` and `phase-one-review.md`; validation is recorded in `specification-validation.json`. Preserve this record as provenance only. Do not ask the archived questions or infer answers to the final unanswered batch. The specification remains draft, with no human approval. Return lifecycle/approval handling to the Orchestrator. No implementation, plan, commit, push, or lifecycle transition was performed.
