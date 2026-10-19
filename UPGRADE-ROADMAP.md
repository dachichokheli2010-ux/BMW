# APEX upgrade roadmap

This is an incremental upgrade to the existing buildless JavaScript site, with dedicated pages, the existing Three.js viewers, Neon on Vercel, and SQLite for an unconfigured local preview. Existing catalogs, account identities, saved garages and learning progress are retained.

## Stage 1 — Academy foundation

The current implementation has 40 activities and 135 questions. This pass closes foundation gaps rather than replacing those activities:

- Added an 18-term searchable glossary with English, Georgian and Russian definitions, related terms, sources, lessons and documented BMW examples. Inline definitions work with touch, keyboard and screen readers in lesson explanations and supported specification values.
- Added three learning objectives to each activity, key-term buttons, optional advanced explanations and relevant catalog links. Related vehicles illustrate concepts; component fitment is not inferred.
- Added authored Georgian and Russian translations for Academy teaching copy, questions, answers, hints, diagrams, navigation and progress. Factory identifiers, unit symbols, source titles and photo credits remain in their original form. Language switching preserves the active quiz and selected answers.
- Unfinished quizzes survive refresh in the same browser tab. Drafts are scoped to the current account or guest, reference published question IDs, and retain first-attempt accuracy. Resumed review questions keep their diagnostic evidence. Drafts are not synced to a different device; completed progress and the selected learning path are.
- Reward values live in `public/academy-rewards.js`: 20 XP for a normal lesson, 15 for a perfect lesson quiz, 25 for the daily challenge, 30 for the first lesson, and 100 for a unit. Checkpoints, advanced cases and spaced review have their own configured amounts. Previously earned XP is not recalculated.
- Achievements have stable IDs and saved unlock dates. Historical dates are recovered only when the old record establishes them; otherwise the UI reports an unknown historical date. Learning ranks do not imply a professional qualification.
- The browser calendar remains the consistent source for learning days, with the detected time zone shown in My progress. Current and longest streaks and the last learning day are displayed.
- Server saves reject XP, credits and achievement claims unsupported by the submitted published activity records. A private receipt ledger prevents the same reward from being added twice through older snapshots. It is stored in the existing garage JSON, with no database migration, and is excluded from public responses.

These are personal learning records. Imported/browser-supplied answers are not independently verified exams, so public competitive rankings remain unavailable. Existing account authorization, CSRF protection, rate limits, revision conflicts and explicit guest imports remain in use.

The recent M photo rounds intentionally keep their 6/8/6-question format. Ordinary lessons still use short quizzes. Manual revving is not reintroduced. A sound-identification game is deferred until suitable recordings with reliable identification and usage rights are available.

The four documented engine-family lessons are retained. Additional families, generation courses and advanced material require separately reviewed content and sources; their presence is not claimed by this foundation update.

### Files and data

- UI and presentation: `public/academy-ui.js`, `academy-teaching.js`, `academy-foundation-upgrade.css`.
- Glossary: `public/academy-glossary.js`, `academy-glossary.css`, `academy-links.js`.
- Progress: `public/academy-state.js`, `academy-session.js`, `academy-rewards.js`, `academy-achievements.js`.
- Localization: `public/preferences.js` and the `academy-translations*.js` dictionaries.
- Integration: `public/platform.js`, `smart-search.js`, `account-sync.js`, `account.js`.
- Backend: `server/academy-policy.js`, `api.js`, `validation.js`; additive fields in existing JSON only. The seven manually created Neon public tables are preserved.

### Verification

Run `npm run check` and `npm run build`. Checks cover curriculum answers, translation coverage, reload recovery, first-attempt scoring, reward replay, historical progress, achievement dates, account isolation, PostgreSQL behavior and safe guest imports. Browser QA uses phone-sized Chromium/Edge viewports and desktop; it does not establish physical iPhone/Safari compatibility.

To inspect locally, run `npm start` and open:

- `/learn?tab=glossary` for search and definitions.
- `/learn?lesson=first-engine` for objectives, terms, related vehicles and a quiz. Check an answer, reload, and continue.
- `/learn?tab=models` for the existing M photo rounds.
- `/learn?tab=practice` for matching, ordering and component-photo puzzles.
- `/learn?tab=achievements` and `/learn?tab=profile` for dates and progress.

Switch English → Georgian → Russian during a quiz to check that selected answers remain intact. Account sync requires a configured backend; direct production Neon access and a Vercel deployment are not part of local browser verification.

## Stage 2 — Interactive engine teaching

Keep the existing viewer and audit its explanatory labels. Refine the four-stroke controls and component-to-lesson links. Use accurate 2D teaching diagrams where suitable component-level 3D assets are absent. Do not present illustrative geometry as exact factory CAD or an authentic exploded engine.

## Stage 3 — Generation and buyer guides

Add a small set of fully documented generations, with variant-specific engines, transmission and drivetrain information. Ownership claims need evidence, not assumed failure rates. Provide saved buyer checklists. Research current official Georgian procedures before adding import or regulatory guidance.

## Stage 4 — Comparison

The existing workspace already supports three cars, grouped metrics, normalized units, visual bars and shareable links. Continue auditing variant/year/market consistency and missing-data behavior; retain honest unavailable values rather than inventing a winner.

## Stage 5 — Engagement and garage

Retain favorites, saved tuning concepts and validated import/export. Consider a compact deterministic daily feature, a sourced BMW M timeline and useful personal collections. Add a sound quiz only with appropriate recordings. Add visual configurator options only where the assets support them; keep estimated performance separate from measured data.

## Stage 6 — Site polish

Preserve the short discovery homepage and dedicated feature pages. Continue mobile, accessibility, loading/error and performance reviews across the remaining specialist pages. Extend complete translation coverage beyond the Academy as those workspaces are revised. The mobile drawer and native phone dropdown improvements from the previous pass are retained.

## Deployment

These changes are in the local checkout. Deploy the updated checkout through the existing Vercel project to update the live site. A redeployment of an older commit will not include local changes. See `DATABASE.md` for Neon configuration and non-destructive diagnostics.
