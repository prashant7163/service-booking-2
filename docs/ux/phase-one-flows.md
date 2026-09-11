# Phase-one interaction flows

Output: `ux-flow` for Task 3, consumed by Tasks 5, 7, 9, 11, and 12. This is a page/state/focus/copy acceptance map, not implemented-browser evidence or independent approval.

Sources: the [accepted specification](../discovery/project-specification.json), approval-subject digest `227a4f029b576930530c4c5b388d2836963d9f7356913b5faf5f9dcc180c4c9b`; the merged [architecture](../architecture/phase-one.md) and [OpenAPI contract](../architecture/openapi/service-booking-two.yaml) at dependency commit `b69f1a49feb6695d843b3972bdb8bac845788a05`; Task 3 of the [accepted plan](../superpowers/plans/2026-09-11-service-booking-two-phase-one.md). Operation names below are exact OpenAPI operation IDs. No additional API or product route is required.

## Shared interaction rules

- Visitors and all account roles may browse `/`. Account roles are exclusive: CUSTOMER, PROVIDER, or ADMINISTRATOR. Show only the current role's workspace links; do not offer a role-switch control. Anonymous navigation offers sign-in and separate customer/provider registration. Sign-out uses `signOut` and leaves the persistent customer cart intact.
- Determine access using `getSession`. An unauthenticated protected-route visit leads to `/sign-in`; successful sign-in returns to an allowed requested page, otherwise `/` for customers, `/provider/shop` for providers, or `/admin` for administrators. A wrong-role direct visit renders the access error without fetching protected content. Unverified customers can read customer slots but cannot reserve or pay; active unverified providers can edit their shop/drafts but cannot publish. A suspended provider has no workspace access, including fulfillment.
- On route entry, move focus to the page's single main heading after rendering. Use a skip link to main content. Opening an inline detail/editor moves focus to its heading or first field; closing returns focus to its invoking button. Do not introduce modal-only workflows.
- Every request has a visible loading state (`common.loading`) with `aria-busy` on its affected region. Keep the initiating control in place, prevent duplicate submission, and retain non-secret input on recoverable errors. An empty state is distinct from a failed load. An error provides a retry action only where repeating the operation is safe; do not announce success until the response confirms it.
- For submitted validation failures, show a focusable error summary (`common.validation`) linking to each field error. Put the specific error beside the native labelled field, link it with `aria-describedby`, and set `aria-invalid="true"`. Focus the summary on failed submission; following a link focuses its field. General request failures focus the inline error heading. Background updates never steal focus.
- Translate API `messageKey` and `fieldErrors` through the interface dictionary; never render raw server diagnostics, submitted secrets, or stack traces. The copy keys defined here are client keys unless explicitly identified as a contract key. Handle 401 with sign-in, 403 with `common.accessDenied` (or the known verification/suspension explanation), 404 with `common.unavailable`, 409 with the matching state explanation, and 422 with field-linked validation. Unknown failures use `common.requestFailed`. Do not infer another owner's identity from an error.
- Successful inline mutations use `aria-live="polite"`/`role="status"`; failures use one error announcement, avoiding duplicate summary and live-region speech. Maintain focus on the initiating control unless it disappears, then move to the changed region's heading or the next remaining row. An emptied list receives focus on its empty-state heading.
- All money includes CHF and two decimal places. Current cart prices and selected total are separate from immutable purchased prices. Format slot instants as a full date plus start/end with an explicit Europe/Zurich time-zone label/offset; preserve the supplied instant, including daylight-saving boundaries. Time and status must not rely on colour alone.
- Browser session/CSRF setup uses `getCsrf` and refreshes after authentication/verification rotation. Keep tokens out of product copy and client persistence. Do not persist passwords, verification/reset credentials, customer contacts, or redemption codes in browser storage.

## Page and state matrix

All rows inherit the shared loading, access, validation, retry, and focus rules. Keys refer to the English/Deutsch copy map below. Detail, verification, reset, and checkout states remain within the listed routes.

| Page / allowed roles | Primary action and operations | Loading / empty / success / error | Focus destination and copy keys |
| --- | --- | --- | --- |
| `/` — public; all roles | Search/filter (`searchServices`); open inline offering details (`getService`, `getImage`). CUSTOMER only: show future times (`listCustomerSlots`); verified CUSTOMER: reserve quantity (`changeQuantity`). | Loading results/detail/slots independently. Empty results offer clearing search/filter inputs. Exhausted published services remain visible with zero availability. Missing detail shows unavailable. Failed slot/reservation request preserves the selection and shows the returned inventory/start/verification error. | Page heading `catalog.title`; search submission moves focus to results heading with result count announced. Inline detail heading on open; after reservation retain focus and announce `cart.updated`. Keys: `catalog.search`, `catalog.empty`, `catalog.availability`, `catalog.viewTimes`, `catalog.signIn`, `catalog.noSlots`, `catalog.reserve`, `catalog.inventoryChanged`. |
| `/sign-in` — anonymous; current account may view signed-in status | `signIn`; inline password-reset request and credential/new-password submission use `requestPasswordReset` and `resetPassword`. | Empty form ready for input; loading blocks duplicate submit. Success navigates to an allowed destination. Reset request always shows the same acknowledgment regardless of email existence. Reset success returns to sign-in form. Invalid credentials, suspended access, invalid/consumed reset credential, or field errors remain in the form. | Heading `auth.signIn`; failures focus error summary. Reset disclosure focuses its email field; reset acknowledgment focuses its status heading; completed reset focuses sign-in heading. Keys: `auth.signedIn`, `auth.invalidCredentials`, `auth.suspended`, `auth.reset`, `auth.resetRequested`, `auth.resetComplete`, `auth.invalidToken`. |
| `/register/customer` — anonymous registration; unverified CUSTOMER verification state | Submit name/email/password with `registerCustomer`; consume the simulated credential with `verifyCustomer` in an inline verification form. | Empty registration form. Pending submit; success shows unverified session and verification instructions. Verified success permits reservation/checkout. Duplicate email and field errors preserve non-secret fields; invalid/consumed token stays in verification state. | Heading `auth.registerCustomer`; registration success focuses verification heading; verification success focuses confirmation with link back to discovery/cart. Keys: `auth.verifyCustomer`, `auth.verificationPending`, `auth.verified`, `auth.emailInUse`, `auth.invalidToken`. |
| `/register/provider` — anonymous registration; provider verification state | `registerProvider`, then inline `verifyProvider`. | Empty registration form. Success is verification pending, not an assumed authenticated provider session. Verification establishes the provider session. No administrator-approval waiting state. Duplicate email, invalid/consumed credential, and suspended provider errors remain visible. | Heading `auth.registerProvider`; pending state focuses verification heading; verified success offers `/provider/shop`. Keys: `auth.verifyProvider`, `auth.verificationPending`, `auth.verified`, `auth.emailInUse`, `auth.invalidToken`, `auth.suspended`. |
| `/cart` — CUSTOMER, own cart; mutations/checkout require verification | `getCart`, `changeQuantity`, `removeCartLine`; select lines, accept current selected CHF total, and submit `checkout`. | Loading cart/quantity/payment separately. Empty cart links to `/`. Updated quantities/prices and selection remain visible. Success opens confirmed order within `/orders`. Payment failure retains all reservations; changed total requires fresh explicit acceptance; started/unavailable items cannot be purchased. | Heading `cart.title`; row removal moves to next row or empty heading. Payment/price errors focus checkout error/acceptance heading. Confirmed order heading receives focus after navigation. Keys: `cart.empty`, `cart.updated`, `cart.remove`, `cart.select`, `cart.started`, `checkout.accept`, `checkout.pay`, `checkout.priceChanged`, `checkout.failed`, `checkout.unknown`, `checkout.confirmed`. |
| `/orders` — CUSTOMER, own orders only | `listCustomerOrders`, inline selected order `getCustomerOrder`; refresh those reads to view fulfillment changes. | Loading list/detail. Empty history states there are no confirmed orders. Success shows purchased quantities, CHF unit prices/totals, each line's code and status, and aggregate state. Read failure does not imply booking failure. Failed payment attempts never appear. | Heading `orders.title`; selected order detail heading; manual refresh retains focus and announces changed status. Keys: `orders.empty`, `orders.code`, `orders.codeInactive`, `status.awaiting`, `status.delivered`, `status.expired`, `status.completed`. |
| `/provider/shop` — active PROVIDER, own shop/offerings | `getOwnShop`, `createShop`, `updateShop`, `uploadImage`, `getImage`, `listOwnOfferings`, `getOwnOffering`, `createOffering`, `updateOffering`, `listOwnSlots`, `bulkSaveSlots`, `updateSlot`, `publishOffering`, `unpublishOffering`. | Loading owned resources/save/upload separately. Own-shop 404 is the create-shop empty state; no offerings/slots invite first entry. Saved draft, saved shop, published, and unpublished are distinct success states. Publication prerequisites, overlap, committed-time/capacity conflicts, image errors, and verification failures preserve edits and identify affected fields/rows. | Heading `provider.shop`; create/open editor focuses first field. Adding a bulk-entry row focuses its start field. Save retains focus and announces success; failed publication focuses linked summary. Unpublication returns focus to offering heading. Keys: `provider.createShop`, `provider.noOfferings`, `provider.noSlots`, `provider.save`, `provider.addSlot`, `provider.draft`, `provider.publish`, `provider.published`, `provider.unpublish`, `provider.unpublishEffect`, `provider.publicationInvalid`, `provider.slotConflict`, `provider.invalidImage`. |
| `/provider/bookings` — active PROVIDER, owned lines only | `listProviderBookings`; select a booking, enter four-digit code, submit `redeemBooking`. | Loading list/redemption. Empty bookings is not an error. Show own line and customer name/email without prefilled/returned code. Delivered success applies to all covered units. Wrong code is a field error; already Delivered/Expired is a state conflict with refreshed list. Suspended access removes workspace content. | Heading `provider.bookings`; selecting a line focuses its labelled code input. Wrong-code summary links to code field. Delivery success replaces input with focused line-status heading; clear submitted code. Keys: `provider.noBookings`, `provider.code`, `provider.redeem`, `provider.delivered`, `provider.invalidCode`, `provider.alreadyDelivered`, `provider.expired`. |
| `/admin` — ADMINISTRATOR only | Three separate target-ID forms: `suspendProvider`, `releaseReservation`, `deliverExpiredBooking`. | Initial empty form is ready for target selection, not a fabricated empty provider/reservation list. Pending action disables duplicate submit. Result shows only returned target/status/released counts. Invalid UUID is field-linked; unknown target is unavailable; non-Expired override shows its state conflict. | Heading `admin.title`; inline action confirmation focuses confirmation heading, cancel restores invoking control. Success focuses result heading; error focuses summary. Keys: `admin.providerId`, `admin.reservationId`, `admin.bookingId`, `admin.suspend`, `admin.release`, `admin.deliverExpired`, `admin.suspendEffect`, `admin.releaseEffect`, `admin.overrideEffect`, `admin.suspended`, `admin.released`, `admin.delivered`, `admin.requiresExpired`. |

The administrator contract has mutation endpoints but no listing/search endpoints. Use an explicitly supplied target UUID in each form; do not invent an administrator directory, booking lookup, or personal-data projection. Echo the chosen ID and the applicable effect before the user activates the final named action.

## Four journey acceptance maps

### discover-purchase

1. On `/`, `searchServices` accepts an empty query, category (`TUTOR_LESSON` or `BEAUTY_WELLNESS`), positive CHF minimum/maximum, relevance or price ordering, and page. Provide search, category, min/max price, sort and previous/next-page controls only. Pagination requests zero-based pages of 20; present human-readable page numbers. A changed query/filter resets to the first page. Support quoted text without rewriting it; matching remains server-owned.
2. Cards and inline `getService` detail show offering content/images, category, shop name/postal address, CHF unit price, and summed available units over future starts. Public responses, markup, accessible descriptions and image captions contain no slot IDs/timestamps. Zero availability is visible and does not remove a published result. There is no public shop-page link.
3. Anonymous users follow `catalog.signIn`. CUSTOMER users explicitly open the time-selection region backed by `listCustomerSlots`; show full start/end, capacity/available quantity and labelled whole-number quantity input. Exhausted rows cannot be reserved. An unverified customer sees `auth.verifyCustomer` instead of an enabled reserve action. Provider/administrator public browsing does not fetch customer slots.
4. A verified customer submits an absolute quantity via `changeQuantity`. Show the confirmed quantity and announce the cart update; adding units reserves inventory without creating a paid booking. An inventory/start conflict leaves the prior reservation intact and prompts a fresh slot/cart read. An empty slot list displays `catalog.noSlots`.
5. `/cart` reads the server cart across sessions/devices. Label each selection checkbox with service, slot and quantity; offer explicit quantity update and `removeCartLine`. Show current CHF unit prices, line totals, cart total and selected total. Two units at CHF 20.00 plus one at CHF 30.00 total CHF 70.00. Add no fees, discounts or extra tax. Started rows stay visible, may be reduced/removed, and cannot be selected for purchase or increased. Waiting/sign-out/session expiry never removes rows or starts a countdown.
6. Show `checkout.accept` with the selected current total and a required explicit acceptance control before `checkout.pay`. Changing selection, quantities, or refreshed prices invalidates acceptance. Include a visible labelled simulated-outcome choice with Success/Failure (`checkout.simulation`, `checkout.simulationSuccess`, `checkout.simulationFailure`), defaulting to Success. Do not collect card/bank data. Send only selected line IDs, accepted CHF total, and `simulateOutcome` with the request's idempotency key.
7. During payment keep the accepted amount fixed. `PRICE_ACCEPTANCE_REQUIRED` is a pre-payment rejection: refresh `getCart`, show `checkout.priceChanged`, and require acceptance of the new total before another payment submission. If any selected item is invalid, no subset is confirmed; preserve retained cart data and show the actionable conflict. Do not silently deselect and purchase a subset.
8. A terminal `FAILURE` is HTTP 200 with contract key `payment.simulatedFailure`; show the payment failure state (`checkout.failed`), retain every reservation and offer a new explicitly submitted attempt with a new key. An uncertain network response shows `checkout.unknown`; retry the identical frozen payload with the same key to recover its result. Do not create a new attempt until the previous outcome is known. `IDEMPOTENCY_KEY_REUSED` is an error requiring recovery, not permission to automatically repeat payment with a fresh key.
9. `SUCCESS` opens the `getCustomerOrder` confirmation in `/orders`. Exactly one marketplace order includes every selected line, original accepted prices and line codes. Selected cart rows are removed by allocation transfer; unselected rows remain. Confirmation/provider-purchase notification delivery is simulated; do not claim actual email delivery or provide an inbox. If fetching the confirmed order fails, retain its known order identity and retry the read; never repeat payment to load a receipt.

### publish-deliver

1. Register/verify the solo provider using the registration-page operations. The verification state identifies the simulated process; credentials are supplied through the simulated verification boundary, never retrieved from an invented inbox endpoint. Password reset uses the corresponding sign-in inline states. No public administrator registration or provider approval queue exists.
2. `/provider/shop` creates or edits exactly one shop, with shop name, owned image upload and Swiss street/postal-code/city address (`country=CH`). Duplicate shop names are allowed. Address may be absent while drafting but is required for publication. Select JPEG/PNG files using a labelled native file input; upload errors preserve the rest of the form. Use returned image IDs, never arbitrary remote URLs or filesystem paths.
3. Draft an offering with independently labelled language versions for name/description, fixed category, image, and one positive final CHF price for all its slots. Drafts may omit description/category/price per contract. Add at least two explicit, nonrecurring rows and save together with `bulkSaveSlots`; each row has labelled start, end and integer capacity. No availability input exists. Draft overlap may save; publishing overlaps anywhere in the provider's published schedule fails. Touching end/start boundaries are valid.
4. Publication requires verification, Swiss address, offering name/description/image, category, price, and positive future availability. Display returned prerequisite errors and links to the corresponding fields/rows. A slot-time edit after reservation/purchase fails (`SLOT_TIME_IMMUTABLE`); capacity below committed units fails (`CAPACITY_COMMITTED`); published overlap fails (`SLOT_OVERLAP`). Preserve input and refresh current saved values on conflict; do not claim the edit succeeded. Provider price edits affect carts, never accepted attempts or purchased history.
5. Unpublish uses an inline confirmation with `provider.unpublishEffect`, then `unpublishOffering`. On success mark Draft and explain that affected cart reservations were removed while purchased bookings remain valid under existing redemption/expiry rules. Do not present cancellation or deletion controls.
6. `/provider/bookings` shows only provider-owned booking lines, customer name/email, quantity, purchased unit price/total, time and status. Do not show other providers' lines, whole marketplace totals or usable codes. Selecting a line precedes entry of its code; show a single text input with numeric keyboard hint and four-digit validation, preserving leading zeroes (not an integer input).
7. A valid `redeemBooking` immediately delivers all units on that line, even before start. Announce quantity and Delivered status, clear the input, and prevent ordinary repeated redemption. `INVALID_CODE` links a field error to the code input without echoing the value. `BOOKING_ALREADY_DELIVERED` shows the existing status; `BOOKING_EXPIRED` shows Expired and no provider override. No attempt-history display, temporary booking-level lockout, or partial-unit redemption is added. Customer redemption notification is simulated.

### expiry-completion

1. `/orders` displays `AWAITING_FULFILLMENT` at order and unresolved-line level using `status.awaiting`; each purchased slot line has one four-digit code for all its units. Different slots within an order have different codes. Codes may remain redisplayable for the owning customer after resolution, explicitly labelled `orders.codeInactive`.
2. At scheduled end, the backend resolves an unredeemed line to `EXPIRED`. A normal order read/refresh shows `status.expired`; the client clock never performs the transition. Delivered lines remain Delivered. No countdown, refund, code reactivation, cart cleanup, or customer expiry action is introduced. Expiry notification delivery is simulated.
3. Keep the aggregate Awaiting fulfillment while any line is unresolved. Show `COMPLETED` only when all lines are Delivered or Expired, including mixed and all-Expired orders. Do not invent Failed or Partially completed aggregate states. Manual refresh retains focus and announces any updated line/aggregate status without automatically reading codes aloud.
4. Acceptance evidence for Tasks 11/12 uses the contract's e2e-only `readE2eClock`/`advanceE2eClock` externally to reach the boundary, then reads the customer/provider views. Those operations have no navigation entry, button, form, or active product client route in any role.

### admin-intervention

1. `/admin` exposes exactly three actions in separate labelled forms. Enter the intended provider, reservation/cart-line, or booking-line UUID. Before final submission, show the exact target and effect in an inline confirmation; `common.cancel` returns to the form without mutation. Invalid or missing IDs never produce success messaging.
2. `suspendProvider`: confirmation says sign-in/current provider access will be blocked, listings removed and affected cart reservations released, while purchases remain valid. Success displays provider ID and `releasedCartLineCount`. Repeating suspension may succeed with zero newly released lines. No reinstatement or suspended-provider fulfillment exception is offered.
3. `releaseReservation`: confirmation identifies the one selected cart-line UUID. Success displays `releasedQuantity` and that only this cart quantity was removed. A 404 means the reservation is unavailable/already removed, not a new successful release. Other cart rows and purchased bookings are unaffected.
4. `deliverExpiredBooking`: label it distinctly as an administrator Expired-to-Delivered override. Confirmation states no code is redeemed/reactivated. Success displays returned line status/quantity and order status. `OVERRIDE_REQUIRES_EXPIRED` explains that only an Expired line qualifies. Do not supply a code input or offer other source/target states.
5. Subsequent affected customer/provider reads reflect the action. When a cart refresh differs after an external removal, announce `cart.changed`; do not claim a specific administrator/provider cause absent from the response. Suspension errors clear protected provider data and show `auth.suspended`; preserved purchases do not create a provider-access bypass.

## Responsive, keyboard and language acceptance

- At **390px**, forms and lists use one column; labels remain above or beside their own controls without truncation. Service/booking/order rows become wrapping cards or stacked labelled cells, keeping each value's association with its heading. Action groups wrap, long emails/IDs and German text wrap, images fit their container, and no page-level horizontal overflow occurs. Checkout summary follows cart items in reading order.
- At **1280px**, use two-column opportunities for search controls/results, cart/selected-total summary, and editor/context summary. Preserve the same DOM reading/tab order as the mobile layout. Wide booking/order tables may use semantic headers; narrow alternatives retain equivalent labels and actions. Do not make content/action access depend on hover or pointer precision.
- Every action is keyboard-operable using native links, buttons, checkboxes, radios, selects and inputs. Tab order follows page heading/navigation, form fields or rows, then actions. Visible focus is never hidden by headers or summaries; no positive tabindex or keyboard traps. Expand/collapse controls expose `aria-expanded` and reference their region. Disabled actions have adjacent explanations; availability and status are conveyed by text.
- Use native visible labels, fieldsets/legends for selection/simulation/language groups, meaningful image alternatives from existing offering/shop context, empty alternative text for redundant decorative imagery, sufficient text/control contrast, and usable controls at zoom. Errors are not colour-only. `aria-live` announces loading completion, empty results, cart changes, payment outcome and fulfillment changes without exposing credentials/codes.
- Interface language follows a supported browser preference, otherwise English. A visible **English / Deutsch** switch persists on this device only and updates page `lang`, interface labels, validation, dates and money formatting without losing form input or focus. Do not add an account language preference or server synchronization.
- Each provider-authored `LocalizedText` field has its own `submittedLanguage` and at least one existing value. Show the submitted-language label beside content, set the content's `lang`, and initially display its submitted version. If both versions exist, a labelled explicit version choice may display the other. Switching interface language never changes this choice or translates the content. Different fields may use different languages; bilingual input is optional. Plain shop names, postal addresses and customer names are not converted into translation fields.
- Acceptance at both widths in Chromium covers all four journeys with keyboard-only operation, focus after success/failure/removal, linked field errors, long English/German labels, empty states, and visible simulated payment failure/retry. These are implementation acceptance targets, not a claim of browser execution or accessibility certification.

## English / Deutsch copy map

Use these stable client keys for headings, actions and state messages. `{count}`, `{quantity}` and `{total}` interpolate confirmed values; format `{total}` with CHF. Map the API's specific `messageKey`/error code to the appropriate state and field text without changing the HTTP contract. Field labels and detailed validation must be translated using the same dictionary pattern.

| Key | English | Deutsch |
| --- | --- | --- |
| `common.loading` | Loading… | Wird geladen… |
| `common.validation` | Check the highlighted fields. | Prüfen Sie die markierten Felder. |
| `common.accessDenied` | You cannot access this page or action with this account. | Mit diesem Konto können Sie diese Seite oder Aktion nicht aufrufen. |
| `common.unavailable` | This item is no longer available. | Dieser Eintrag ist nicht mehr verfügbar. |
| `common.requestFailed` | This request could not be completed. | Diese Anfrage konnte nicht abgeschlossen werden. |
| `common.retry` | Try again | Erneut versuchen |
| `common.cancel` | Cancel | Abbrechen |
| `catalog.title` | Discover services | Dienstleistungen entdecken |
| `catalog.search` | Search services | Dienstleistungen suchen |
| `catalog.empty` | No services match. Change or clear your search and filters. | Keine passenden Dienstleistungen. Ändern oder löschen Sie Ihre Suche und Filter. |
| `catalog.availability` | {count} units available in future slots | {count} Plätze in zukünftigen Terminen verfügbar |
| `catalog.viewTimes` | View available times | Verfügbare Termine anzeigen |
| `catalog.signIn` | Sign in as a customer to view times | Als Kundin oder Kunde anmelden, um Termine anzuzeigen |
| `catalog.noSlots` | No future slots are available. | Keine zukünftigen Termine verfügbar. |
| `catalog.reserve` | Add to cart | In den Warenkorb |
| `catalog.inventoryChanged` | Availability changed. Review the current quantity. | Die Verfügbarkeit hat sich geändert. Prüfen Sie die aktuelle Anzahl. |
| `auth.signIn` | Sign in | Anmelden |
| `auth.signedIn` | You are signed in. | Sie sind angemeldet. |
| `auth.registerCustomer` | Create customer account | Kundenkonto erstellen |
| `auth.registerProvider` | Create provider account | Anbieterkonto erstellen |
| `auth.verifyCustomer` | Verify your customer account before reserving or paying. | Bestätigen Sie Ihr Kundenkonto, bevor Sie reservieren oder bezahlen. |
| `auth.verifyProvider` | Verify your provider account before publishing. | Bestätigen Sie Ihr Anbieterkonto vor der Veröffentlichung. |
| `auth.verificationPending` | Complete the simulated email verification. | Schliessen Sie die simulierte E-Mail-Bestätigung ab. |
| `auth.verified` | Account verified. | Konto bestätigt. |
| `auth.invalidCredentials` | Email or password is incorrect. | E-Mail-Adresse oder Passwort ist falsch. |
| `auth.emailInUse` | This email is already registered. Sign in instead. | Diese E-Mail-Adresse ist bereits registriert. Melden Sie sich an. |
| `auth.suspended` | Provider access is suspended. | Der Anbieterzugang ist gesperrt. |
| `auth.reset` | Reset password | Passwort zurücksetzen |
| `auth.resetRequested` | If this account exists, reset instructions are available through the simulated process. | Falls dieses Konto existiert, sind Anweisungen zum Zurücksetzen über den simulierten Ablauf verfügbar. |
| `auth.resetComplete` | Password changed. Sign in again. | Passwort geändert. Melden Sie sich erneut an. |
| `auth.invalidToken` | This verification or reset credential is invalid or already used. | Diese Bestätigungs- oder Zurücksetzungskennung ist ungültig oder bereits verwendet. |
| `cart.title` | Cart | Warenkorb |
| `cart.empty` | Your cart is empty. Discover services. | Ihr Warenkorb ist leer. Entdecken Sie Dienstleistungen. |
| `cart.updated` | Cart updated. | Warenkorb aktualisiert. |
| `cart.changed` | Your cart changed. Review the remaining items and total. | Ihr Warenkorb hat sich geändert. Prüfen Sie die verbleibenden Einträge und den Gesamtbetrag. |
| `cart.remove` | Remove from cart | Aus dem Warenkorb entfernen |
| `cart.select` | Select for purchase | Zum Kauf auswählen |
| `cart.started` | This slot has started and can no longer be purchased. You can reduce or remove its quantity. | Dieser Termin hat begonnen und kann nicht mehr gebucht werden. Sie können die Anzahl verringern oder den Eintrag entfernen. |
| `checkout.accept` | I accept the selected total of {total}. | Ich akzeptiere den Gesamtbetrag von {total} für die ausgewählten Einträge. |
| `checkout.pay` | Pay {total} — simulation | {total} bezahlen — Simulation |
| `checkout.simulation` | Simulated payment outcome | Simuliertes Zahlungsergebnis |
| `checkout.simulationSuccess` | Success | Erfolgreich |
| `checkout.simulationFailure` | Failure | Fehlgeschlagen |
| `checkout.priceChanged` | The price changed. Review and accept the new total before paying. | Der Preis hat sich geändert. Prüfen und akzeptieren Sie den neuen Gesamtbetrag vor der Zahlung. |
| `checkout.failed` / API `payment.simulatedFailure` | Simulated payment failed. Your cart and reservations remain. You can try a new payment. | Die simulierte Zahlung ist fehlgeschlagen. Ihr Warenkorb und Ihre Reservierungen bleiben erhalten. Sie können eine neue Zahlung versuchen. |
| `checkout.unknown` | Payment outcome is not yet known. Retry to retrieve this attempt's result. | Das Zahlungsergebnis ist noch unbekannt. Rufen Sie das Ergebnis dieses Versuchs erneut ab. |
| `checkout.confirmed` | Order confirmed. | Bestellung bestätigt. |
| `orders.title` | Your orders | Ihre Bestellungen |
| `orders.empty` | No confirmed orders yet. | Noch keine bestätigten Bestellungen. |
| `orders.code` | Code for all {quantity} units | Code für alle {quantity} Plätze |
| `orders.codeInactive` | This code can no longer be redeemed. | Dieser Code kann nicht mehr eingelöst werden. |
| `status.awaiting` | Awaiting fulfillment | Leistung ausstehend |
| `status.delivered` | Delivered | Erbracht |
| `status.expired` | Expired | Abgelaufen |
| `status.completed` | Completed | Abgeschlossen |
| `provider.shop` | Your shop and services | Ihr Geschäft und Ihre Dienstleistungen |
| `provider.createShop` | Create your shop | Geschäft erstellen |
| `provider.noOfferings` | No services yet. Create a draft. | Noch keine Dienstleistungen. Erstellen Sie einen Entwurf. |
| `provider.noSlots` | No slots yet. Add explicit start and end times. | Noch keine Termine. Fügen Sie konkrete Start- und Endzeiten hinzu. |
| `provider.save` | Save | Speichern |
| `provider.addSlot` | Add slot row | Terminzeile hinzufügen |
| `provider.draft` | Draft saved. | Entwurf gespeichert. |
| `provider.publish` | Publish service | Dienstleistung veröffentlichen |
| `provider.published` | Service published. | Dienstleistung veröffentlicht. |
| `provider.unpublish` | Unpublish service | Veröffentlichung zurücknehmen |
| `provider.unpublishEffect` | This removes affected cart reservations. Purchased bookings remain valid. | Dies entfernt betroffene Warenkorbreservierungen. Gekaufte Buchungen bleiben gültig. |
| `provider.publicationInvalid` | Complete the required content, address and future availability before publishing. | Ergänzen Sie vor der Veröffentlichung die erforderlichen Inhalte, die Adresse und die zukünftige Verfügbarkeit. |
| `provider.slotConflict` | This slot change conflicts with the schedule or reserved/purchased quantities. | Diese Terminänderung steht im Konflikt mit dem Zeitplan oder reservierten/gekauften Mengen. |
| `provider.invalidImage` | Select a valid JPEG or PNG image. | Wählen Sie ein gültiges JPEG- oder PNG-Bild. |
| `provider.bookings` | Your bookings | Ihre Buchungen |
| `provider.noBookings` | No bookings yet. | Noch keine Buchungen. |
| `provider.code` | Four-digit booking code | Vierstelliger Buchungscode |
| `provider.redeem` | Redeem code for all units | Code für alle Plätze einlösen |
| `provider.delivered` | All {quantity} units marked Delivered. | Alle {quantity} Plätze als erbracht markiert. |
| `provider.invalidCode` | Enter the correct four-digit code for this booking. | Geben Sie den richtigen vierstelligen Code für diese Buchung ein. |
| `provider.alreadyDelivered` | This booking is already Delivered. | Diese Buchung ist bereits erbracht. |
| `provider.expired` | This booking has expired. Its code cannot be redeemed. | Diese Buchung ist abgelaufen. Ihr Code kann nicht eingelöst werden. |
| `admin.title` | Administration | Verwaltung |
| `admin.providerId` | Provider ID | Anbieter-ID |
| `admin.reservationId` | Reservation cart-line ID | Warenkorbzeilen-ID der Reservierung |
| `admin.bookingId` | Booking-line ID | Buchungszeilen-ID |
| `admin.suspend` | Suspend provider | Anbieter sperren |
| `admin.release` | Release reservation | Reservierung freigeben |
| `admin.deliverExpired` | Mark expired booking Delivered | Abgelaufene Buchung als erbracht markieren |
| `admin.suspendEffect` | This blocks provider access, removes listings and releases affected cart reservations. Purchases remain valid. | Dies sperrt den Anbieterzugang, entfernt Angebote und gibt betroffene Warenkorbreservierungen frei. Käufe bleiben gültig. |
| `admin.releaseEffect` | This removes only the selected cart reservation and releases its quantity. | Dies entfernt nur die ausgewählte Warenkorbreservierung und gibt deren Plätze frei. |
| `admin.overrideEffect` | Only an Expired booking can become Delivered. No code is redeemed or reactivated. | Nur eine abgelaufene Buchung kann als erbracht markiert werden. Kein Code wird eingelöst oder reaktiviert. |
| `admin.suspended` | Provider suspended; {count} cart reservations released. | Anbieter gesperrt; {count} Warenkorbreservierungen freigegeben. |
| `admin.released` | Reservation removed; {quantity} units released. | Reservierung entfernt; {quantity} Plätze freigegeben. |
| `admin.delivered` | Expired booking marked Delivered. | Abgelaufene Buchung als erbracht markiert. |
| `admin.requiresExpired` | Only Expired bookings can use this action. | Diese Aktion ist nur für abgelaufene Buchungen verfügbar. |

## Excluded controls and route absence

For every item below, absence applies equally to navigation, forms, contextual actions, and active client routes. Hiding a link while retaining an active forbidden route does not satisfy acceptance. Direct visits to unsupported client paths render the generic unavailable/not-found state and issue no forbidden mutation.

| Audience | Forbidden controls |
| --- | --- |
| Customer | Cancellation, rescheduling, refunds, messaging, attendee-name collection, provider-approval requests, recurring booking, expiry extension, code reactivation, self-service account deletion, data-export UI, usage analytics, saved searches, personalization, date/location filters, automatic cart expiry/countdowns/extensions, real-money/card/bank payment, fees/discount/coupon/additional-tax controls. |
| Provider | Customer cancellation/rescheduling/refunds, booking approval queues, partial-unit redemption, ordinary redemption after expiry, manual booking-expiry/completion controls, redemption attempt history or temporary booking-level blocking, direct availability editing, automatic/recurring slot generation, extra shops, organizations/staff, ownership transfer, customer-location/home/remote delivery, automatic translation or interface-driven content-version selection, messaging, account deletion, data-export UI, analytics, arbitrary image-URL fetching, suspended-provider access bypass. |
| Administrator | Category creation/editing, separate direct service hiding, provider reinstatement, general booking-status overrides beyond Expired-to-Delivered, code validation/reactivation, cancellation/rescheduling/refunds, record/account deletion, data-export UI, analytics, uncontracted provider/customer/booking search directories, public administrator registration. |
| All / public | Public slot-time displays, public shop pages, SEO-feature controls, dual-role account switching, real email/payment/notification connections, simulation inbox, production/test-clock controls in product UI, registry publication or environment deployment controls. |

Provider unpublication and administrator suspension retain their explicitly accepted effects; their existence does not authorize adjacent deletion, cancellation, or general moderation tools. Any required new route, API operation, or material behavior beyond this map returns to the Orchestrator and Discovery.

## Review-ready handoff

The scope of this deliverable is this file alone. Review it against the cited merged dependency and the four journey maps; downstream implementation/browser tasks supply runtime evidence. Task 3's missing-file assertion and final coverage assertion are recorded in the task handoff with the resulting documentation commit. Safe resume is independent review of that exact commit by the Orchestrator; no push, PR, merge, CI, deployment, or later task is part of this handoff.
