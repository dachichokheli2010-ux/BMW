# APEX · BMW Explorer

An independent BMW collection and engineering learning platform. This upgrade extends the existing buildless JavaScript application and preserves its catalog, galleries, favorites, comparisons, preferences, recordings, and hosted garage API.

Run locally with Node.js 22 or later:

```sh
npm start
```

Open http://localhost:3000. The local preview uses SQLite for password accounts and keeps favorites, recent models, academy progress, and concept builds in this browser. The Vercel deployment uses Neon Postgres for account and garage sync.

```sh
npm run check
npm run build
```

`check` validates application syntax, catalog/photo integrity, source scope, search behavior, tuning math, learning content, and distinct synthesized engine profiles. `build` produces the existing Worker deployment format in `dist/server`; it is not a static HTML export. Unused research photographs in `_candidates` remain in source and are excluded from runtime packaging. Existing hosting configuration and audience are preserved; no deployment is performed by these commands.

## Vercel account setup

Vercel Postgres is no longer available for new projects. In the Vercel project, install the [Neon integration](https://vercel.com/marketplace/neon) and connect its database to the Production and Preview environments. Make sure the integration provides `DATABASE_URL` or `POSTGRES_URL`, then redeploy. The password sign-in API at `/api/auth/*` and garage sync at `/api/garage` create their required tables on first use. Keep the database URL in Vercel environment settings; never put it in browser code or commit it. Until a database is connected, sign-in reports the setup requirement and guest data continues to work in the current browser.

## Page structure

The homepage is a short discovery page with the retained **More to discover** editorial section. Features have dedicated, reloadable URLs:

- `/models` — the model finder, filters and vehicle details (`?model=f10-m5`).
- `/learn` — Learn & Play, learning road, lessons and progress.
- `/compare` — a comparison workspace for up to three BMWs, with search, grouped specifications, differences, unit selection and share links.
- `/engine-lab` — interactive S63 engine explorer.
- `/tuning-garage` — tuning scenarios and saved builds.
- `/my-garage` — saved models, builds and learning.
- `/parts`, `/electric` and `/about` — retained specialist pages.

Legacy home query and hash bookmarks resolve to their corresponding pages, preserving selected models, parts, lessons, builds and comparison units. Local preview and the hosted Worker share the route map in `public/routes.js`. These are changes to the existing checkout; no live deployment is performed.

The layout references the dedicated selector and specification hierarchy in [Porsche Compare](https://compare.porsche.com/en-AU), the model categories in [BMW's overview](https://www.bmwusa.com/all-bmws.html), and the course-to-concept progression in [Brilliant learning paths](https://brilliant.org/help/features/what-are-learning-paths/).

## Explore

- **Models:** 93 catalog records across M, standard series, SUVs, Z, electric and historic models, including four additional electric-drive variants. Search and filter by engine family, chassis, specification year, body, powertrain, era, and power. Favorites, recent models, photo galleries and comparisons remain available.
- **Global search:** use the header search button or Ctrl/Cmd K. Search vehicles, photographed components, system diagrams, lessons and workspaces. Questions such as “What does an intercooler do?” and comparisons such as “N54 vs N55” resolve to actionable results. Ranking recognizes technical aliases and compact chassis/model queries; typo suggestions are labeled and never silently replace numeric engine codes. Recent queries can be replayed, removed or cleared.
- **Dropdowns:** all single-choice menus share a styled, accessible control with selection checkmarks, option search for long lists, automatic positioning, keyboard navigation and touch targets. The original native controls remain the source of application state. Language selection uses the same system.
- **Navigation & My garage:** mobile navigation has a full menu with direct search and garage access. My garage brings saved models, recent views, saved configurations and learning progress together in one browser-local workspace.
- **Engine lab:** `/engine-lab` opens an original S63 hot-V V8 schematic with 16 selectable components, connected-system information, rotation/zoom, exploded and X-ray views, slowed internals, and five conceptual flow overlays. Keyboard and touch controls are included. Without WebGL, the component guide remains usable.
- **Tuning garage:** `/tuning-garage` starts without a selected car. Nine system controls update a hypothetical build, accessible synthetic dyno, and stock-versus-scenario results. Road/track concept presets and same-model saved-build comparison make the assumptions easier to explore. Builds can be saved, loaded, deleted, exported and imported with strict validation; imported performance claims are recalculated. A simulated dashboard reuses the existing family-specific Web Audio synthesis and stops when hidden.
- **Learn & Play:** `/learn` has 34 sourced lessons and 103 questions across six units, including a complete beginner road with two checkpoints, eight photographed-part lessons, BMW recognition, engine families and three diagnostic simulations. Choice, tap-to-order and tap-to-match questions use validated answers and explanatory retries. Browser-local XP, levels, calendar streaks, achievements, daily challenges, spaced review and collectible cards persist after reload. `/learn?car=f10-m5` opens a model-specific lesson. The original engine-code explorer, history and legacy progress are retained.
- **Inside BMW:** `/parts` retains eight credited component photographs and adds 26 original system guides, including ten guides for electric-drive, charging, battery and recovery systems. The guides are clearly identified as educational diagrams, not BMW-specific fitment. Turbo-type comparisons remain available at `/parts#turbo-types`.

## Accuracy and asset scope

Factory facts, source references, reference photographs and educational representations are labeled separately. Existing catalog facts retain their original market and power units. Expanded records cover eight matching configurations: F10 M5, E92 M3, G80 M3 Competition, G82 M4 Competition, G87 M2, G81 M3 Touring, F80 M3 and E46 M3 CSL. Each record identifies its launch year, market, transmission baseline, original BMW sources and mass convention. US 0–60 mph results are kept separate from 0–100 km/h; missing measurements remain unavailable. Manual/automatic alternatives and provisional launch figures are explicitly identified.

Production-year ranges and every factory engine option have not been reconstructed for all 93 records. The year filter uses the stated specification/model year, rather than an inferred production range. Dimensions in the expanded records use the source's body-width convention. The four added electric variants reuse same-generation exterior references; their photo notes do not claim exact trim or drivetrain identification.

Tuning percentages are editable-concept teaching assumptions, not documented aftermarket gains. Dyno curves are constructed from scalar engine ratings and the relationship between torque, RPM and power; they are not measured factory or tuner curves. Acceleration changes illustrate sensitivity and are not predictions. No compatible aftermarket part numbers or physical fitment are claimed.

The 3D engine, system diagrams and chassis preview are original simplified educational geometry. They do not represent factory CAD, exact packaging, firing/valve timing, service procedures or fluid dynamics. Photographs retain the existing credits and disclosures, including family references that differ from a selected engine revision. Additional high-quality exact component photographs remain a content task.

Interactive sound is synthesized, with different engine family/cylinder/aspiration profiles. The existing creator-hosted recording embeds remain separate. A licensed, multi-RPM recording bank and a verified factory S63 3D asset are not installed.

Account sign-up, sign-in, profile updates and garage sync use the existing validated password API backed by Neon on Vercel. A Neon database must be connected before hosted accounts can be created. Academy accounts do not create online rankings: the leaderboard displays the real current profile and never fabricates other users. Guest rewards are validated in the local session, with duplicate completion rewards prevented, but are not trusted multiplayer scores. The academy content is modular JavaScript in `academy-content.js`.

Primary expanded specification sources:

- [BMW M5 specifications, October 2011](https://www.press.bmwgroup.com/global/article/attachment/T0122682EN/178942)
- [BMW M3 European launch press kit, April 2007](https://www.press.bmwgroup.com/usa/article/attachment/T0017783EN_US/35231)
- [BMW F10 M5 architecture](https://www.press.bmwgroup.com/usa/article/detail/T0114798EN_US/introducing-the-all-new-5th-generation-bmw-m5)

## Code map

`app.js` retains model routing, galleries, engine playback and the original parts dialogs. `catalog.js` assembles the retained data and applies additive `verified-specs.js` enrichment. `platform.js` mounts dedicated pages and lazily loads `engine-lab.js`, `garage.js`, `academy.js` and `personal-garage.js`. `smart-search.js` has a pure search index and accessible search dialog. `dropdowns.js` enhances native selects, and `navigation.js` owns the mobile menu. `system-guide.js` contains sourced component explanations and original diagrams. Each workspace has scoped CSS; `platform.css` and `refinements.css` apply the shared blue/black visual upgrade.

No runtime dependencies were added. Three.js and OrbitControls use the project's existing local vendor files and license. New lessons and workspace copy are English; existing translated catalog behavior is preserved.
