# APEX · BMW Explorer

An independent BMW collection and engineering learning platform. This upgrade extends the existing buildless JavaScript application and preserves its catalog, galleries, favorites, comparisons, preferences, recordings, and hosted garage API.

Run locally with Node.js 22 or later:

```sh
npm start
```

Open http://localhost:3000. Local favorites, recent models, academy progress, and concept builds are stored in this browser. The existing authenticated cloud API remains separate and is unavailable in local preview.

```sh
npm run check
npm run build
```

`check` validates application syntax, catalog/photo integrity, source scope, search behavior, tuning math, learning content, and distinct synthesized engine profiles. `build` produces the existing Worker deployment format in `dist/server`; it is not a static HTML export. Unused research photographs in `_candidates` remain in source and are excluded from runtime packaging. Existing hosting configuration and audience are preserved; no deployment is performed by these commands.

## Explore

- **Models:** 89 retained catalog records across M, standard series, SUVs, Z, electric and historic models. Search and filter by engine family, chassis, specification year, body, powertrain, era, and power. Favorites, recent models, photo galleries and comparisons remain available.
- **Global search:** use the header search button or Ctrl/Cmd K. Search vehicles, photographed components, system diagrams, lessons and workspaces. Questions such as “What does an intercooler do?” and comparisons such as “N54 vs N55” resolve to actionable results.
- **Engine lab:** `/#engine-lab` opens an original S63 hot-V V8 schematic with 16 selectable components, connected-system information, rotation/zoom, exploded and X-ray views, slowed internals, and five conceptual flow overlays. Keyboard and touch controls are included. Without WebGL, the component guide remains usable.
- **Tuning garage:** `/#tuning-garage` starts without a selected car. Nine system controls update a hypothetical build, accessible synthetic dyno, and stock-versus-scenario results. Builds can be saved, loaded, deleted and exported. A simulated dashboard reuses the existing family-specific Web Audio synthesis and stops when hidden.
- **Academy:** `/#academy` provides eight subjects at three levels, 24 quizzes, interactive diagrams, local progress, component identification, three diagnostic scenarios, an engine family explorer and BMW history.
- **Inside BMW:** `/parts` retains eight credited component photographs and adds 16 original system guides. Turbo-type comparisons remain available at `/parts#turbo-types`.

## Accuracy and asset scope

Factory facts, source references, reference photographs and educational representations are labeled separately. Existing catalog facts retain their original market and power units. The new expanded records cover only the **F10 M5 October 2011 European M DCT** and **E92 M3 April 2007 European manual launch** configurations. Their acceleration, transmission, dimensions and mass conventions come from matching BMW documents. Other expanded measurements are shown as unavailable.

Production-year ranges and every factory engine option have not been reconstructed for all 89 records. The year filter uses the stated specification/model year, rather than an inferred production range. Dimensions in the expanded records use the source's body-width convention.

Tuning percentages are editable-concept teaching assumptions, not documented aftermarket gains. Dyno curves are constructed from scalar engine ratings and the relationship between torque, RPM and power; they are not measured factory or tuner curves. Acceleration changes illustrate sensitivity and are not predictions. No compatible aftermarket part numbers or physical fitment are claimed.

The 3D engine, system diagrams and chassis preview are original simplified educational geometry. They do not represent factory CAD, exact packaging, firing/valve timing, service procedures or fluid dynamics. Photographs retain the existing credits and disclosures, including family references that differ from a selected engine revision. Additional high-quality exact component photographs remain a content task.

Interactive sound is synthesized, with different engine family/cylinder/aspiration profiles. The existing creator-hosted recording embeds remain separate. A licensed, multi-RPM recording bank and a verified factory S63 3D asset are not installed.

Primary expanded specification sources:

- [BMW M5 specifications, October 2011](https://www.press.bmwgroup.com/global/article/attachment/T0122682EN/178942)
- [BMW M3 European launch press kit, April 2007](https://www.press.bmwgroup.com/usa/article/attachment/T0017783EN_US/35231)
- [BMW F10 M5 architecture](https://www.press.bmwgroup.com/usa/article/detail/T0114798EN_US/introducing-the-all-new-5th-generation-bmw-m5)

## Code map

`app.js` retains model routing, galleries, engine playback and the original parts dialogs. `catalog.js` assembles the retained data and applies additive `verified-specs.js` enrichment. `platform.js` adds the engineering workspace and lazily loads `engine-lab.js`, `garage.js` and `academy.js`. `smart-search.js` has a pure search index and accessible search dialog. `system-guide.js` contains sourced component explanations and original diagrams. Each workspace has scoped CSS; `platform.css` applies the shared blue/black visual upgrade.

No runtime dependencies were added. Three.js and OrbitControls use the project's existing local vendor files and license. New lessons and workspace copy are English; existing translated catalog behavior is preserved.
