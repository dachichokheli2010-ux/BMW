# APEX expansion — 20 October 2026

## What changed

The existing vanilla JavaScript application, APEX name/logo, saved models/builds, accounts, Academy, galleries, tuning workspace, buyer guides and comparisons are preserved. New functionality is additive. No deployment was performed.

| Phase | Implemented | Still open |
|---|---|---|
| 1 — Foundation | Clean entity URLs, a structured car/engine index, normalized parts, evidence statuses, integrity validation, missing-image and review reports | Full evidence completeness; the strict audit fails honestly |
| 2 — Cars and engines | All 93 retained cars have clean routes; 30 engine/drive-family pages show source-scoped applications, photos/credits or labeled placeholders; current-lineup research matrix | Every production generation/variant, unique complete stories, exact galleries and two matching sources for every numeric specification |
| 3 — Parts | 182 individual component guides across 15 systems; analogies, technical explanations, locations, symptoms, BMW context, related parts and sources; 3 X-ray scenes/18 hotspots; accessible four-stroke animation | 181 exact BMW part photographs and dated numeric service-life/cost ranges |
| 4 — Design | Floating pill-shaped glass header, cursor shine, scroll styling, active-tab indicator, six main tabs, global search, themes, units, XP, Easy/Nerd switch and mobile bottom navigation | Real-device/real-browser visual verification and measured Lighthouse results |
| 5 — Beginners | Three-tap personalized start, lesson/car/quiz recommendations, BMW name decoder, preference finder with reasons, reusable glossary pages and accessible existing jargon explanations | Larger glossary, automatic linking of every technical term throughout every legacy page; verified budget filtering |
| 6 — Play | 869 sourced questions; 17 playable modes; 71 reachable badges; explanations and learning links; daily seeded challenge/resume, local scores, streaks, hints, themed levels, pass-and-play, memory/matching/sequences and mistakes review | Cropped detail/headlight/grille recognition sets; shared global leaderboard; richer exported result cards |
| 7 — Garage | Cards/sets/daily card, power/sprint/value statistics, personality, replayable 0–100 comparison, dream-garage budget/theme checks, maintenance/reminders, dated timeline, illustrative color/wheel studio, account-scoped browser storage, merging backup and SVG poster | Live market values, exact model/paint/wheel photography, quarter-mile data, online sharing links and backend sync for new collection/Arcade fields |
| 8 — Polish | Friendly 404, route manifests, conditional sitemap generation, client metadata/OpenGraph/Vehicle JSON-LD, source/trademark disclosure, expanded documentation, automated module/data/UI/HTTP checks | Server-rendered entity metadata, measured performance tuning and final visual/mobile QA |

## How the new features behave

- The new finder filters the documented collection by powertrain, body and interests. Budget stays an explicit research note until actual market prices are verified. No price fit is invented.
- Garage values come from the user's own USD entries. The combined horsepower statistic converts PS/kW to mechanical hp rather than adding unlike units. Average 0–100 uses only available configuration-specific values, with its sample count shown.
- The sprint animation uses documented 0–100 times, compresses time and explicitly does not claim measured distance, quarter-mile results or a real-world race prediction.
- Service reminders use dates entered by the user and point to real component pages. BMW Condition Based Service and the vehicle handbook remain the source for actual service requirements. Logged yearly spending is a total of actual entered records, not an invented running-cost forecast.
- The color studio uses real BMW color names on an original generic educational silhouette. It clearly identifies its illustrative scope rather than recoloring a photograph and claiming a factory configuration.
- Arcade and collection data have separate guest/account browser keys. They do not change the existing backend reward format. Original account-synced favorites, builds and Academy records keep their existing behavior.
- Numerical questions preserve configuration, units, source and market. Expert comparison questions use the existing verified-specification subset. Generated decks exhaust their selected pool before repeating.
- The two old auth test suites and account-sync fixtures were updated to assert the existing non-enumerating signup/explicit-login and documented guest-favorite merge behavior. Production authentication was not weakened.

## Verification

`npm run check` runs the retained validation suites plus the new explorer, parts, Arcade, experience and complete-shell integration suites. `npm run build` packages the retained Worker format. Neither command deploys the site.

The local HTTP audit in [public-http-qa.md](reports/public-http-qa.md) checks **1,950 URLs**: 1,320 discovery pages, 598 local image references/variants and 32 entry scripts/styles. All returned HTTP 200 with the expected content type. The platform suite mounts 13 complete HTML shells with actual lazy imports and checks for runtime error/loading failures. Separate tests exercise onboarding, units, account isolation, garage imports, every parts detail page, every Arcade mode, hints, daily resume, scoring and persisted rewards.

These are automated HTTP and DOM checks. **No real-browser desktop/mobile visual pass or Lighthouse 90+ result is claimed.** The browser connector exposed no surfaces; the Windows Computer Use attempt was stopped because it could not reliably determine the active browser URL. No attempt was made to bypass that restriction.

Final build passed and packaged 748 assets into 23 Worker asset modules. The retained translation checker also reports 37 conflicting duplicate translation entries as a non-fatal terminology warning; parity still passes. These existing wording conflicts remain a separate cleanup item.

## Needs review and missing images

The strict user definition of done is **not met**. The audit identifies:

- 3,122 missing applicable car fields.
- 145 missing engine fields.
- 364 missing numeric/dated parts service-life and cost fields.
- **5,880 total field-level research/review tasks**, including existing claims requiring a second matching document.
- **791 missing exact required image slots** across cars, engine families and parts. Slots are not a count of unique image files.

The exact next work is enumerated, with entity IDs, field names, reasons and suggested photo searches:

- [Human-readable completeness report](reports/explorer-completeness.md)
- [Every review task](reports/explorer-needs-review.json)
- [Every missing required image slot](reports/explorer-missing-images.json)
- [Current BMW generations and historical omissions](reports/current-lineup-coverage.md)
- [Part photography manifest](reports/parts-image-manifest.json)

Run `npm run audit:completeness` to refresh these reports. `npm run audit:completeness:strict` exits unsuccessfully while gaps remain. A placeholder, a diagram, generic reference photograph, or unsupported numeric guess never counts as a completed exact photograph or fact.

## Ten further improvements

1. Close the newest current-generation car gaps using two exact-market technical documents per configuration.
2. Commission or license consistent front/rear/interior/engine photography, starting with the most visited cars.
3. Build a visual generation family tree showing how each BMW name evolved.
4. Add opt-in spaced-repetition reminders for the questions a learner finds difficult.
5. Sync new collection cards, service logs and Arcade progress through the existing account backend.
6. Add a carefully moderated global leaderboard with server-validated scoring.
7. Build a market-aware ownership-cost explorer using dated local prices and transparent assumptions.
8. Add curated grille/headlight/interior photo crops for dedicated visual recognition rounds.
9. Publish community dream-garage challenges with share links and source-backed vehicle budgets.
10. Add source review dates, change history and community fact-correction submissions to each specification.
