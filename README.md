# APEX · BMW Explorer

An independent BMW collection and engineering learning platform. This upgrade extends the existing buildless JavaScript application and preserves its catalog, galleries, favorites, comparisons, preferences, recordings, and hosted garage API.

The 20 October repair pass adds direct admin sign-in routing, clear API error messages, safer offline account synchronization, persistent language preferences, and fixes for PostgreSQL migration, mobile navigation and account readability. Photo question cards now show their reference image, answer and credits; glossary deep links follow the selected language. Run `npm run admin:check` to inspect configured owner access without changing accounts. See [the repair verification report](reports/repair-verification.md) for coverage and deployment limits.

## October 2026 expansion

The owners club adds `/community`, `/friends`, `/submit-car`, public `/garage/:token` links and a private `/admin` workspace. Friends use public APEX handles and accepted requests. Garage sharing is opt-in and revocable. Server-verified challenges award credits; a car submission costs 50 credits and stays private until an administrator approves it. The admin workspace includes review evidence, change requests, publication removal, eight database counters and recorded activity. Photos and submissions persist in the account database. Configure server-only administrator access as described in [community setup](server/COMMUNITY.md); no account becomes an admin automatically.

The small compare tray now stays inside the mobile viewport. Search filters wrap, results use one bounded scroll region, and search/comparison dialogs have consistent SVG close buttons, focus behavior and responsive glass styling. The automated suite includes community backend and UI checks, real HTTP account checks, overlay interactions and complete route mounting. Browser visual verification remains incomplete; see [verification limits](VISUAL-FIXES.md).

The local upgrade adds a floating glass header, mobile bottom navigation, three-tap onboarding, display-unit controls, a BMW name decoder, a preference finder, 30 engine/drive-family pages, 182 parts guides, an X-ray diagram, a four-stroke explainer, and an Arcade with 906 questions, 17 modes and 71 unlockable badges. My garage now includes collection cards and sets, a daily card, sourced 0–100 comparisons, dream-garage challenges, a service/reminder log, a specification-year timeline, an illustrative color studio, valuations, backup import/export and a downloadable SVG poster. The original academy, saved models/builds, account API and comparisons remain available.

The visual repair pass removes the Easy/Nerd control entirely. Navigation now has one consistent 1120px collapse breakpoint, a compact glass bottom sheet, SVG bottom tabs, safe-area spacing, and a contained hero. `liquid-glass.css` owns shared navigation/layout; `workspace-polish.css` fixes the specialist workspaces. See [VISUAL-FIXES.md](VISUAL-FIXES.md) for the changes and verification limits.

For Vercel use `npm run build:vercel` (already configured in `vercel.json`). It validates the app and writes **`dist/vercel`**, with one fingerprinted release directory for scripts, styles, data, dynamic imports and lazy-loaded styles. Vercel serves this generated directory instead of raw `public/`. Deploy the updated checkout/configuration to publish these changes. `npm run build` remains the separate Worker build and replaces `dist`; if building both locally, run the Worker build first, then the Vercel build.

New pages: `/start`, `/engines`, `/engines/s58`, `/cars/f10-m5`, `/parts/turbocharger`, `/play`, `/glossary/torque`, `/badges/answers-1`, `/questions/car-f10-code` and `/lessons/first-engine`. Legacy model-query URLs still resolve. New Arcade/collection records are account-scoped **on the current browser**; the existing backend still syncs its original favorites, builds and Academy data. New collection/Arcade data is not promised to sync across devices.

This is a functional expansion, not a completed every-BMW archive. The factual audit still identifies **5,872 review tasks and 766 missing exact required photo slots**. Placeholders, original diagrams and generic reference photos do not count as verified BMW photographs. Read [the delivery report](UPGRADE-REPORT.md), [the completeness report](reports/explorer-completeness.md) and [current-generation omissions](reports/current-lineup-coverage.md) before expanding the catalog. `npm run audit:completeness:strict` intentionally fails until these factual and image gaps are resolved.

```sh
npm run check
npm run build
npm run audit:completeness
npm run audit:completeness:strict
node scripts/check-public-links.mjs --origin http://127.0.0.1:3000
```

`npm run generate:discovery` regenerates the clean route manifest. Set `PUBLIC_ORIGIN` to the real publishing origin to generate absolute `sitemap.xml` and robots sitemap links; no invented production hostname is supplied. Metadata, OpenGraph and Vehicle JSON-LD update in the client. A crawler requiring server-rendered per-vehicle metadata is a follow-up. No Lighthouse score or real-browser mobile/desktop pass is claimed; browser automation was unavailable during final visual verification. DOM integration and local HTTP checks are separate evidence.

### Adding cars, parts, engines and questions

1. **Car:** add a uniquely identified model in the retained catalog data modules and include it in `catalog.js`. Attach exact market, source year, original power units and primary-source URLs. Put configuration-specific checked specifications in `verified-specs.js`, and sourced profile fields in `model-profiles.js`. Do not fill missing values from a similar trim. Run profile and completeness checks; update explicit catalog-size expectations when deliberately adding records. `explorer-data.js` creates its clean car URL and engine application automatically.
2. **Photo:** record author, source page, license and matching vehicle/engine identity in the existing photo manifests. Put the permitted original under `public/images`, update the photo-policy mapping, then run `npm run photos:prepare`. Check the actual image; a working file is not proof that its identity or rights match the record. Rerun the completeness audit and update the missing-image manifest only when the required slot is actually covered.
3. **Engine:** `explorer-data.js` indexes exact catalog engine codes. Add its individually authored introduction and separately evidenced family fields. Keep each application's power/market in its own row. Never replace a family range with one car's output. Run `node scripts/check-explorer-data.mjs`.
4. **Part:** add one individually authored row to the appropriate system in `parts-encyclopedia-data.js`: ID, name, one-sentence job, analogy, location, technical explanation, symptoms and BMW context. Add relevant primary references. Retain qualitative cost/service guidance until dated, market-specific numeric evidence exists. Run `node scripts/check-parts-encyclopedia.mjs --write`; this validates every page and regenerates the photo manifest.
5. **Question:** `play-data.js` generates scoped questions from source-backed catalog fields and the retained curriculum. Add authored trivia through its `add` helper with a unique lowercase slug, answers, correct answer, explanation, primary references and a `learnURL`. Use a specific configuration for a numerical question. Run `node scripts/check-play.mjs` to validate every question and all game modes.
6. **Discovery and final verification:** run `npm run generate:discovery`, `npm run audit:completeness`, `npm run check`, then `npm run build`. With local preview running, run the HTTP link checker. Strict completeness is a separate content release gate and must not be disabled to produce a zero-gap claim.

Run locally with Node.js 24 or later:

```sh
npm start
```

Open http://localhost:3000. Guest data stays in this browser. Signed-in accounts save favorites, builds and academy progress to the server. Local accounts use SQLite unless a Neon connection is configured; Vercel accounts use Neon PostgreSQL.

```sh
npm run check
npm run build
```

`check` validates application syntax, catalog/photo integrity, source scope, search behavior, tuning math, learning content, account isolation, session security, PostgreSQL compatibility and database migration. `build` produces the existing Worker deployment format in `dist/server`; it is not a static HTML export. Unused research photographs in `_candidates` remain in source and are excluded from runtime packaging. Existing hosting configuration and audience are preserved; no deployment is performed by these commands.

## Vercel account setup

Set `DATABASE_URL` in the Vercel project and deploy this checkout. Account endpoints have explicit files under `api/auth/`, `api/account/` and `api/garage.js`. App tables live in the `apex` PostgreSQL schema, preserving manually-created public tables. See [DATABASE.md](DATABASE.md) for the non-destructive setup, diagnostics and deployment checks. `npm run db:check` reads schema metadata; `npm run db:migrate` creates missing app tables. The seven manually created public learning tables are preserved but are not the source of the current JavaScript curriculum.

## Page structure

The homepage is a short discovery page with the retained **More to discover** editorial section. Features have dedicated, reloadable URLs:

- `/models` — the model finder, filters and vehicle details (`?model=f10-m5`).
- `/learn` — Learn & Play, learning road, lessons and progress.
- `/learn?tab=glossary` — searchable automotive definitions in English, Georgian and Russian.
- `/compare` — a comparison workspace for up to three BMWs, with search, grouped specifications, differences, unit selection and share links.
- `/engine-lab` — interactive S63 engine explorer.
- `/tuning-garage` — tuning scenarios and saved builds.
- `/my-garage` — saved models, builds and learning.
- `/account` — registration, login, profile and synchronization status.
- `/parts`, `/electric` and `/about` — retained specialist pages.

Legacy home query and hash bookmarks resolve to their corresponding pages, preserving selected models, parts, lessons, builds and comparison units. Local preview and the hosted Worker share the route map in `public/routes.js`. These are changes to the existing checkout; no live deployment is performed.

The layout references the dedicated selector and specification hierarchy in [Porsche Compare](https://compare.porsche.com/en-AU), the model categories in [BMW's overview](https://www.bmwusa.com/all-bmws.html), and the course-to-concept progression in [Brilliant learning paths](https://brilliant.org/help/features/what-are-learning-paths/).

## Explore

- **Models:** 93 catalog records across M, standard series, SUVs, Z, electric and historic models, including four additional electric-drive variants. Search and filter by engine family, chassis, specification year, body, powertrain, era, and power. Favorites, recent models, photo galleries and comparisons remain available.
- **Global search:** use the header search button or Ctrl/Cmd K. Search vehicles, photographed components, system diagrams, lessons and workspaces. Questions such as “What does an intercooler do?” and comparisons such as “N54 vs N55” resolve to actionable results. Ranking recognizes technical aliases and compact chassis/model queries; typo suggestions are labeled and never silently replace numeric engine codes. Recent queries can be replayed, removed or cleared.
- **Mobile navigation & dropdowns:** a compact, persistent header keeps search, account and navigation within reach. The right-hand drawer has animated opening/closing, grouped links, language/theme controls, scroll restoration and reduced-motion support. Phones and touch devices use native OS selection menus; desktop dropdowns retain option search and keyboard navigation.
- **Navigation & My garage:** mobile navigation has a full menu with direct search and garage access. My garage brings saved models, recent views, saved configurations and learning progress together in one browser-local workspace.
- **Engine lab:** `/engine-lab` opens an original S63 hot-V V8 schematic with 16 selectable components, connected-system information, rotation/zoom, exploded and X-ray views, slowed internals, and five conceptual flow overlays. Keyboard and touch controls are included. Without WebGL, the component guide remains usable.
- **Tuning garage:** `/tuning-garage` starts without a selected car. Nine system controls update a hypothetical build, accessible synthetic dyno, and stock-versus-scenario results. Road/track concept presets and same-model saved-build comparison make the assumptions easier to explore. Builds can be saved, loaded, deleted, exported and imported with strict validation; imported performance claims are recalculated. A silent three-step builder separates powertrain, chassis and review, with Road/Track presets, requirement notes and dyno inspection. Manual revving and generated engine audio are removed.
- **Learn & Play:** `/learn` has 40 sourced activities and 135 questions, including the beginner road, photographed parts, engine families and diagnostic simulations. `/learn?tab=models` opens three BMW M photo rounds: model names, generations and a mixed test, with 20 questions across 10 M cars. Visual hints, an explicit answer check and a photo recap support learning. `/learn?tab=practice` offers sequence, matching and component-photo puzzle rounds; sequences support removal/undo and matching cards show paired letters, numbers and colors. Photo identities appear after an attempt. XP, levels, streaks, spaced review, existing progress and account synchronization are preserved. `/learn?car=f10-m5` opens a model-specific lesson.
- **Inside BMW:** `/parts` retains eight credited component photographs and adds 26 original system guides, including ten guides for electric-drive, charging, battery and recovery systems. The guides are clearly identified as educational diagrams, not BMW-specific fitment. Turbo-type comparisons remain available at `/parts#turbo-types`.

## Accuracy and asset scope

Factory facts, source references, reference photographs and educational representations are labeled separately. Existing catalog facts retain their original market and power units. Expanded records cover ten matching configurations: F10 M5, E92 M3, G80 M3 Competition, G82 M4 Competition, G87 M2, G81 M3 Touring, F80 M3, E46 M3 CSL, F92 M8 Competition Coupé and F91 M8 Competition Convertible. Each record identifies its launch year, market, transmission baseline, original BMW sources and mass convention. US 0–60 mph results are kept separate from 0–100 km/h; missing measurements remain unavailable. Manual/automatic alternatives and provisional launch figures are explicitly identified.

Production-year ranges and every factory engine option have not been reconstructed for all 93 records. The year filter uses the stated specification/model year, rather than an inferred production range. Dimensions in the expanded records use the source's body-width convention. The four added electric variants reuse same-generation exterior references; their photo notes do not claim exact trim or drivetrain identification.

Every retained car now has an individual editorial introduction, two learning notes and buying considerations in `car-stories.js`. The engine directory includes design guides and connected parts for all 30 entries. Source-linked guidance is distinct from checked factory measurements and reliability evidence. Missing fields remain inspectable under “Details still being researched”. The completeness audit still counts these gaps.

`model-photo-policy.js` permits clearly captioned engine-family references alongside exact application photographs. A B25 photograph is not identified as a B30, and an i3 drive-unit reference is not identified as a later iX motor. These references remain exact-photo research tasks in the audit. `engine-reference-assets.js` records author, original URL, license and actual dimensions. `npm run photos:prepare` generates responsive sizes, blur previews and intrinsic dimensions. `three-models.js` contains 12 original creator-hosted exterior embeds; `three-viewer.js` handles deliberate loading, timeout, retry, errors and disposal.

Tuning percentages are editable-concept teaching assumptions, not documented aftermarket gains. Dyno curves are constructed from scalar engine ratings and the relationship between torque, RPM and power; they are not measured factory or tuner curves. Acceleration changes illustrate sensitivity and are not predictions. No compatible aftermarket part numbers or physical fitment are claimed.

The 3D engine, system diagrams and chassis preview are original simplified educational geometry. They do not represent factory CAD, exact packaging, firing/valve timing, service procedures or fluid dynamics. Photographs retain the existing credits and disclosures, including family references that differ from a selected engine revision. Additional high-quality exact component photographs remain a content task.

Manual rev controls and generated engine sound have been removed. Original creator-hosted recordings remain available through an explicit Play button. No factory S63 CAD asset is claimed.

Account sign-up, sign-in, profile updates and garage sync use the existing validated password API backed by Neon on Vercel. A Neon database must be connected before hosted accounts can be created. Academy accounts do not create online rankings: the leaderboard displays the real current profile and never fabricates other users. Guest rewards are validated in the local session, with duplicate completion rewards prevented, but are not trusted multiplayer scores. The academy content is modular JavaScript in `academy-content.js`.

Primary expanded specification sources:

- [BMW M5 specifications, October 2011](https://www.press.bmwgroup.com/global/article/attachment/T0122682EN/178942)
- [BMW M3 European launch press kit, April 2007](https://www.press.bmwgroup.com/usa/article/attachment/T0017783EN_US/35231)
- [BMW F10 M5 architecture](https://www.press.bmwgroup.com/usa/article/detail/T0114798EN_US/introducing-the-all-new-5th-generation-bmw-m5)

## Code map

`app.js` retains model routing, galleries, creator recordings and the original parts dialogs. `catalog.js` assembles the retained data and applies additive `verified-specs.js` enrichment. `platform.js` mounts dedicated pages and lazily loads `engine-lab.js`, `garage.js`, `academy.js` and `personal-garage.js`. `smart-search.js` has a pure search index and accessible search dialog. `dropdowns.js` enhances native selects, and `navigation.js` owns the mobile menu. `system-guide.js` contains sourced component explanations and original diagrams. Each workspace has scoped CSS; `platform.css` and `refinements.css` apply the shared blue/black visual upgrade.

The server uses the Neon driver for PostgreSQL. PGlite is a development-only PostgreSQL regression-test dependency. Three.js and OrbitControls use the project's existing local vendor files and license. Academy teaching copy, questions, diagrams and progress support English, Georgian and Russian. Other specialist workspaces retain their existing translation coverage.

The Academy foundation now includes an 18-term glossary, objectives, optional advanced explanations, related vehicles, account-scoped quiz recovery, configurable rewards and dated achievements. Server saves use a private reward receipt ledger in existing garage JSON; these remain personal learning records rather than verified competitive exam results. See [UPGRADE-ROADMAP.md](UPGRADE-ROADMAP.md) for the six-stage roadmap, deliberate scope choices, files and verification steps.
