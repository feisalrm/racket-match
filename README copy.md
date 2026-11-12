# RacketMatch — MVP 0.2

Private tennis racket catalogue, comparison and owner content studio. Built with React/TypeScript/Vinext, Cloudflare Workers and D1. Hosted identity and private access are enforced by Sites.

## Modules
- `modules/catalog`: domain types, demo seed, validation, catalogue UI.
- `modules/comparison`: 1–4 racket comparison, missing values, difference filtering.
- `modules/admin`: racket CRUD, status transitions, attribute definitions and nullable scores.
- `shared/ui`: code-native illustration shared by pages.
- `app/api/catalog`: authenticated writes, same-origin enforcement, server validation, optimistic revision checks.
- `db`: schema; `drizzle`: append-only SQL migrations.

The default published catalogue now contains 10 models with field-level manufacturer evidence checked on 2026-11-03. Character scores and level labels are deliberately unrated. Four unchanged legacy demo models are archived pending verification. Missing specifications remain null; sourced means checked against a publication, not independently measured. No data is scraped or licensed product imagery used. Illustrations are generic, not product photos.

## Security boundary
This release is OWNER-PRIVATE. The authenticated sole owner can edit through the content studio. Do not change access to shared/public until explicit admin/editor memberships and server authorization are implemented. No password is stored in the client. No first-visitor role assignment.

## Persistence
Versioned JSON catalogue snapshot in D1, with server validation and audit metadata. This deliberately small repository adapter can later be replaced with normalized brand/model/spec/rating tables without changing UI domain types. An empty database reads the demo seed; the first successful edit persists the complete catalogue. Editing is not localStorage-based.

## Development
Install through the Sites dependency helper; `npm run db:generate` after schema edits. Apply local migrations before preview. `npm run build` builds the full application. Hosted migrations run during deployment.

## Next iterations
1. Expand verified model coverage and firsthand measured swingweight/RA with explicit conditions.
2. Separate rating sets with reviewer/setup and versioned rubrics.
3. Admin/editor roles before broader access; publish review workflow.
4. Personal fit weighting, saved lists, community reviews and import/export.

Known scope: no account registration, uploads, community scores or purchase recommendations. Technical fields include nominal and strung weight/balance, head, pattern, length, beam, swingweight, RA and recommended tension bounds. Every populated curated field carries URL/title/check-date/condition/note. Missing measurement conditions are explicit. Source evidence is cleared when an admin changes a value. Attribute scales fixed at 1–10. Level currently single-select. Changes are audited but no rollback UI yet.

## Dataset upgrade
`modules/catalog/upgrade.ts` upgrades only exact untouched v0.1 demo records. Owner edits and deletions are preserved. Version-2 snapshots are not re-seeded. The transformation is read-time and persists at the next successful edit, without altering the database schema. Tests cover idempotence and preservation.

`modules/specifications/registry.ts` owns field labels, units and condition formatting. Shared detail/editor components consume it. Source URLs are http(s)-validated server-side; dates and tension bounds are validated.

## Detail UI (0.3)
`modules/detail/RacketDetail.tsx` provides the icon summary and accessible tabbed profile: specifications, character, and sources/notes. Technical values remain sourced through the shared specifications registry. Sources open on demand for each field. Unrated character data uses an explicit empty state instead of zero-score bars. Sticky close/tab/action controls retain access while scrolling. Keyboard arrow/Home/End navigation is supported for tabs; the parent dialog retains its focus trap and Escape handling. No data schema or catalogue edits in this update.

## Rating framework (0.4)
`modules/ratings` owns the immutable v1.0 eight-aspect editorial rubric, methodology UI, review form, context display, comparison caveats, and server snapshot logic. The rubric is RacketMatch's own framework, not an industry standard or a laboratory result. References are contextual reading, not score endorsements.

New published editorial/playtest scores require reviewer, date, reference, and per-aspect reasons. Editorial scores require an HTTP(S) source URL. Playtests require string/gauge description, tension with units, sessions, court/ball/player conditions, and modifications. New rubric scores are whole numbers 1–10. Draft assessments can remain incomplete. Untouched legacy scores are retained with an explicit incomplete-context label; changing or publishing new legacy scores requires the context to be completed. No scores are generated from technical specs.

The server builds and preserves guide snapshots with a saved assessment. Attribute-definition edits alone do not rewrite its historical snapshot; rescoring or changing assessment context records a fresh snapshot. This is one current assessment per racket, not a full review-history system. Custom attributes can supply their own five-part scoring guide; versioned reviews snapshot it as well. No reviewer averages or overall score.

Run `node tests/run.mjs` then `node tests/api.test.mjs` for rubric validation and persistent snapshot checks against SQLite. UI QA covers public guide expansion, admin guide and context form, and unrated detail behavior.

## Public community foundation (0.5 / V1 preparation)
Guest users can read published catalog records and approved community entries. Login is required to submit reviews/comments and withdraw one's own content. Each site-scoped user ID owns their entries. Public JSON never includes account email or author ID. ADMIN_EMAIL is a hosted server-only secret identifying the verified owner account email; missing config fails closed. Signed-in users are not administrators by default. Public catalog responses exclude drafts/archives. Configure this secret before changing audience.

A review contains standard rubric-1.0 scores/reasons and optional personal attributes. One active review per account/racket is enforced with a partial unique SQLite index. Editorial and firsthand reviews remain distinct. Only approved firsthand standard scores contribute to the community mean, with an independent n per aspect; missing scores are excluded. Personal attributes never affect standard aggregates. No reviews means manufacturer specs plus explicit missing community scores. The private admin editorial assessment remains separately labeled.

All contributions start pending. Admin-only moderation approves or rejects, with optimistic revisions and audit metadata. Authors can withdraw their own entries; this hides content without permanent deletion. To replace an active review, withdraw it and submit a replacement. Rejected/withdrawn content cannot be reapproved through moderation. POSTs are capped at ten new contributions per account/hour. This is an initial rate limit, not a complete anti-abuse service. Comments are flat, with no threads, votes, notifications, or report button yet.

Server tests cover public read, non-admin denial, draft hiding, ownership, pending isolation, moderation conflicts, two-review aggregation and n, personal-attribute isolation, withdrawal/replacement, and comments using isolated SQLite data. Production login with multiple real accounts and mobile interaction remain explicit V1 release checks.

### V1 milestones
1. Catalog/comparison/source integrity: installed, ten sourced published rackets.
2. Anonymous reading and authenticated community/admin: installed, real multi-account acceptance test pending.
3. Content readiness: target twenty models across at least four brands; values sourced or clearly missing, prioritize measured SW/RA conditions.
4. Release QA: guest/reviewer/admin on desktop/mobile, login return path, content moderation/withdrawal, privacy, access checks, and performance; no blocking bugs.
5. Market pilot: invite ten–twenty tennis players after 3–4 pass. Observe search, compare, shortlist, and review completion.

V1 is ready for the market pilot when content and release QA gates pass. Automated personal-fit recommendations, marketplace, native mobile apps and additional identity providers are beyond V1. The admin Roadmap V1 tab shows these gates; installed does not mean market-validated.


## Catalogue taxonomy (dataset v3)
20 published models across Wilson (4), Babolat (2), HEAD (2), Yonex (4), Tecnifibre (2), Diadem (3), Solinco (3). Eight independent multi-label product positioning categories, three skill levels and two playing purposes. Labels never generate numeric review scores. Sources and editorial interpretations are visible in detail and editable in the admin taxonomy module. Missing specifications remain empty; conversions are annotated.

The v3 read-time upgrade replaces only untouched v2 entries, appends genuinely new IDs, and preserves owner edits and deletions. Edited entries can be classified by admin. Public browsing combines brand, character, level, purpose, weight and search without login.

V1 content quantity reached. Remaining launch gate: real multi-account desktop/phone journeys, login recovery, moderation and withdrawal, privacy/performance verification; then a 10–20 player pilot.
