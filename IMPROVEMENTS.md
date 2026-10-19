# APEX repair and content pass

The current checkout includes a responsive car-detail repair, a more translucent glass header, all 93 car stories, engine design guides, additional photography and 12 creator-hosted 3D cars. It also adds the owners club, friends, shared garages, reviewed owner-car submissions and a private admin workspace. These changes are local; the supplied Vercel preview has not been redeployed.

## Compare, search and owners club

- Corrected the small comparison tray's conflicting mobile width and centering transform. Its selected cars, removal controls and actions remain bounded. Search filters wrap; search results and comparisons have explicit scroll regions, proper close icons and focus handling. Comparison picker state resets on reopening and preserves scroll during edits.
- Added public owner-car stories at `/community` and `/community/cars/:id`, friends at `/friends`, and submissions at `/submit-car`. An accepted friend can open an explicitly shared garage. Garage links are disabled by default and revocable; email, service history, costs and learning records are excluded.
- Server-issued questions award 5 credits for a correct answer, up to 10 rewarded questions per UTC day. A first car submission costs 50 credits. Credit spending and retries are transactional; rejected-car corrections do not charge again. Local Arcade XP remains separate.
- Photo submissions are resized before uploading and retain captions. The server validates raster content and removes metadata. Drafts, pending photos and review evidence stay private. Approval publishes a car; requesting changes can remove an approved car from public access.
- `/admin` has a moderation queue, reviewed records, eight real counters and recent community events. Permission is controlled only by verified server-configured admin emails or immutable account IDs. See [setup and API contract](server/COMMUNITY.md). No review emails are sent.
- Repaired light-theme text, mobile inputs, radio controls, review-image proportions, long-text wrapping and the four-group footer. Core community controls and entry links include Georgian and Russian translations.
- New APIs use the existing Vercel catch-all to avoid extra function entry points. Both generated builds validate their dependencies; Vercel also validates private and dynamic route rewrites.

The final focused checks pass **182 backend assertions** using SQLite and real PostgreSQL execution through PGlite, **69 UI assertions**, overlay/collection-tray regressions and **22 live local HTTP checks**. The full pre-existing suite passed alongside the initial community checks; final concurrency, retry and expiry fixes were retested with their complete focused suites. Final Worker and Vercel outputs pass. The Vercel graph includes 91 modules, 33 linked stylesheets, 681 images and 1,358 discovery URLs. These are code, API and DOM checks; they do not establish final rendered appearance at every resolution.

## Changed behavior

- Long car names and selectors fit the narrow detail page. Learn, engine and tuning links form compact controls instead of oversized blue blocks. Photo shortcuts scroll within their row.
- The header’s measured height is separate from its CSS height. Resizing between desktop and mobile can now resize the header correctly. Glass uses layered highlights, adaptive tint, an atmospheric page background and reduced-transparency/blur fallbacks.
- Arcade Next and Academy Continue focus and reveal the next question below the floating header. Visible questions and long explanations avoid unnecessary scrolling; reduced motion uses an immediate move.
- Every car has its own introduction, a model-specific fact, a second learning note and practical buying considerations. Available specifications appear in grouped sections; research gaps remain accessible in a separate disclosure.
- All 30 engine entries have a design guide, an engine fact and a link to a real connected part. EV profiles retain motor/drive layout and fixed-ratio transmission information. Explicit usable battery figures stay separate from gross energy.
- The F92 M8 Competition Coupé and F91 Competition Convertible have separate June 2019 factory configurations, including mass convention, dimensions, gearbox, performance and chassis data. The Coupé is not assigned the Convertible’s mass.
- Engine-family photographs identify their actual subject and revision. Exact vehicle-image gaps remain in the audit. Two exterior photographs wrongly rejected by the license filter are restored with checked attribution permissions.
- Eight added 3D exteriors cover the M8 F92, M4 G82, M2 G87, E30 M3, E39 M5, F10 M5, Z4 G29 and M4 F82. Loading is deliberate, credited and recoverable after an error or timeout.

## Verification

The automated suite covers data, source/units preservation, accounts, PostgreSQL, translations, parts, games and garage behavior. Route mounting now checks 37 paths. The actual app-entry regression opens every retained car and all 12 3D entry panels. These checks use a DOM simulation; the external viewers and GPU rendering are not visually verified by them.

The build’s Vercel verifier checks versioned module/style graphs, exact file casing, local photographs and discovery deep links. The Worker build is retained. See [VISUAL-FIXES.md](VISUAL-FIXES.md) for deployment architecture and browser limitations.

## Research still required

The zero-gap content requirement is **not complete**. Many production dates, dimensions, market-specific efficiency/charging figures, prices, production quantities, designers and ownership issues still need matching sources. Source-linked editorial guidance is not independently cross-checked factory data. Some displayed photographs are family references; exact interiors, angles and engine revisions remain incomplete.

- [Completeness overview](reports/explorer-completeness.md)
- [Field-level review queue](reports/explorer-needs-review.json)
- [Missing exact images](reports/explorer-missing-images.json)
- [Engine photo provenance](reports/engine-photo-research.json)
- [3D model metadata](reports/three-model-research.json)

## Ten useful next additions

1. VIN- and market-specific factory configuration selectors.
2. A charging planner using sourced charging curves and temperatures.
3. A generation timeline with directly compared predecessor/successor cars.
4. More exact interior and engine-bay photo sets.
5. A narrated, captioned engine lesson with playback speed controls.
6. Opt-in garage maintenance calendar export.
7. Searchable factory paint swatches tied to model year.
8. A saved comparison history with shareable links.
9. An accessible offline lesson pack.
10. Real-device screenshot baselines and measured performance budgets.
