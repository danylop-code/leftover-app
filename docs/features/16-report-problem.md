# Feature: report-problem

## Plan — FROZEN (changes go in Changelog)

### Goal
A user can tell us something went wrong, tied to an order when relevant, and gets a reference they can quote.

### Context
Artboards **Report** ("Report a problem — we'll reply by email", Subject radio: Problem with an order / Shop was closed / App isn't working / Payment question / Something else; "Which order? (optional)" listing recent orders + "Not about an order"; Message with "At least 10 characters" and 0/500; Send report) and **ReportSent** ("Thanks — we've got it", "Our team will reply to <email>. Reference R-3107.", Back to profile, Report something else).

### In scope
- Migration: `reports(id, reference UNIQUE, user_id, subject, order_id?, message, created_at)`.
- API `POST /reports` (`requireAuth`, both roles): `subject` enum, optional `orderId` that must belong to the user, message 10–500 → 201 `{ reference: "R-####" }` (unique, retried on collision).
- Shared `ReportBody`, `ReportSubject` enum, `ReportCreated`.
- Mobile `src/features/report`: ReportScreen (subject radio group, the order picker populated from the customer's orders in the last 7 days — hidden for shops, message with counter), ReportSentScreen showing the user's email + reference.

### Out of scope
- Sending email / a support inbox (reports are stored only; read via SQL for now).
- Attachments.
- Global list: see [README](README.md#global-out-of-scope-every-brief).

### Acceptance criteria
- [x] Given a subject + a 20-char message, when sent, then 201 with a reference matching `R-\d{4}`, and the Sent screen shows it with the user's email.
- [x] Given a message < 10 or > 500 chars, then Send is disabled with helper/error text, and the API returns 400.
- [x] Given an `orderId` belonging to another user, then 404 and nothing is stored.
- [x] Given no subject selected, then Send is disabled.
- [x] Given "Report something else", then an empty form opens.

### Approach steps
1. Write the migration + shared schemas.
2. Add the service (reference generation) + route + integration tests.
3. Build the screens + hook.

### Testing
- Unit: reference format/collision retry.
- Integration: `test/reports.test.ts` covering every API AC.
- Component: ReportScreen validation states, order picker hidden for store role.
- E2E: none.

---

## Status
done

## Last updated
2026-09-29

## Changelog
- 2026-09-29 — created from the design canvas
- 2026-09-30 — done on `feat/16-18-report-web-tabbar`. Decisions and deviations:
  - One root route `/report` (both roles; route groups can't share a file name) that shows the Sent state itself; "Report something else" resets the form.
  - Subject and order are radio lists (the artboard's selects don't exist natively). Migration `0002_reports`.
