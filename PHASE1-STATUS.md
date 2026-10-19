# Phase 1 implementation and handoff

## Completed in this pass

- Preserved the current buildless JavaScript/Node stack, dark design tokens, existing URLs, account behavior and BMW independence notice.
- Added all **41 profile fields in 8 groups for every one of 93 models**. Every field has an explicit verified, source-linked, unavailable or not-applicable state. The UI exposes source details and specification year, retaining original power/speed units and mass conventions.
- Added **9 verified F10 M5 fields** from BMW's [October 2011 technical table](https://www.press.bmwgroup.com/global/article/attachment/T0122682EN/178942) and [June 2011 launch release](https://www.press.bmwgroup.com/usa/article/detail/T0114798EN_US/introducing-the-all-new-5th-generation-bmw-m5). EU-cycle consumption is explicitly distinguished from WLTP. Existing US 0–60 mph values remain separate from unavailable 0–100 km/h measurements.
- Corrected electric variants inheriting a photo donor's drivetrain, motor/boost descriptions and year context.
- Applied photo eligibility centrally to cards, comparisons, search, saved models and vehicle galleries. Incorrect/uncertain engine variants and unconfirmed manufacturer website permissions stay outside model galleries. Their source records remain reviewable.
- Added `/photos` and `/photos?model=f10-m5` with author, license, original URL, modification notes, model links and the reasons specific images were withheld. Per-photo credits also appear in the viewer and lightbox.
- Retained **160 approved existing WebP originals** and generated smaller responsive variants and blur previews. Main gallery, profile images, collection cards, sources and lightbox have responsive sizes and intrinsic dimensions. Resizing preserves the image composition and original license records; no AI images were created.
- Added exterior/engine lightbox swipe, zoom, bounded pan, keyboard controls, focus restoration, 44px controls and EN/KA/RU interface copy. At normal zoom, native vertical scrolling/browser pinch remain available; custom photo pinch is available after zooming in. See [gallery verification](reports/phase1-gallery-verification.md).
- Replaced the homepage's out-of-scope Unsplash hero with the credited E28 M5 editorial photograph and matching model link. Homepage discovery covers now follow catalog photo eligibility.
- Excluded unapproved manufacturer photo directories, research candidates and the retired Unsplash hero from Worker/Vercel deployment packaging while retaining source assets locally.
- Added `/photos` and the previously missing `/generation-guides` Vercel rewrites.
- Added app-wide authored-dictionary parity checks to `npm run check`, Vercel's check command and `npm run build`'s prebuild hook. Missing/empty KA/RU values or mismatched template parameters fail. The checker is not a claim that all existing English content is translated.

## Files touched

| Area | Files |
| --- | --- |
| Audit and plans | `PHASE0-AUDIT.md`, this file, `reports/backend-audit.md`, `reports/phase-0-translation-audit.md`, `reports/phase-0-translation-inventory.json`, `reports/model-completeness.md`, `reports/model-completeness.json`, `reports/phase1-gallery-verification.md` |
| Catalog and provenance | `public/catalog.js`, `public/model-profiles.js`, `public/model-photo-policy.js`, `public/model-photo-dimensions.js` |
| Model/source UI | `public/model-profile-ui.js`, `public/model-profile-translations.js`, `public/model-profiles.css`, `public/photo-sources.js`, `public/app.js`, `public/platform.js`, `public/collection.js` |
| Gallery and responsive images | `public/gallery-enhancements.js`, `public/gallery-interactions.css`, `public/responsive-photos.js`, `public/responsive-photo-data.js`, `public/images/responsive/`, `public/images/photo-unavailable.svg` |
| Routing and page assets | `public/routes.js`, `public/index.html`, `public/electric.html`, `public/parts.html`, `public/about.html`, `vercel.json` |
| Tooling | `scripts/check-translations.mjs`, `scripts/audit-models.mjs`, `scripts/check-model-profiles.mjs`, `scripts/prepare-model-photos.mjs`, `scripts/build.mjs`, `package.json`, `package-lock.json`, `.vercelignore` |

`sharp` is a development-only photograph resizing tool. The browser application has no new framework or image-generation dependency. Existing uncommitted work was preserved; changes in shared dirty files were not treated as permission to commit unrelated edits.

## Verification

- `npm run check` passes the retained general, Academy, account, backend and PostgreSQL suites plus the new translation/profile checks.
- `npm run build` passes, including the translation and profile prebuild guards.
- `node scripts/check-translations.mjs --self-test` verifies failures for missing/empty locales, nested keys and parameter mismatches. An isolated missing-Russian fixture exits with code 1 without modifying application files.
- `node scripts/check-model-profiles.mjs` passes **8 groups across 93 models**, including evidence/units, EV isolation, rejected engines, real WebP dimensions and every responsive derivative's proportions.
- HTTP smoke checks pass for `/photos?model=f10-m5`, `/models?model=e30-m3` and `/generation-guides` in both the local server and built Worker. The generated asset map excludes the withheld manufacturer/research/Unsplash directories. These are HTTP/package checks, not browser rendering tests.
- `npm run audit:models` regenerates the full per-model gap reports. `npm run audit:models:strict` intentionally fails while content is incomplete. `--json --strict` also fails, so machine-readable output cannot bypass strict mode.
- `npm run audit:translations` regenerates source/line inventories. Counts are review candidates, not browser-confirmed defects; terminology conflicts are reported separately.

To review locally, run `npm start` and open `/models?model=f10-m5`, `/models?model=g80`, `/models?model=u11-ix1-edrive20`, `/models?model=e30-m3` and `/photos?model=f10-m5`. Check source disclosures, missing-photo slots, preserved US measurements, correct front-drive context, gallery controls and language switching. Directly reload `/photos` and `/generation-guides`.

## Still open

- **Content research is not finished:** 99 fields are verified, 843 are source-linked awaiting individual review and **2,378 are unavailable**. No model meets every requested verified-content and required-photo criterion. Missing values remain visibly unavailable instead of invented.
- **Photography remains incomplete:** 91 models have an eligible exterior reference and 6 have a positively matched engine photograph. Missing exact views, dashboard/seats, engines and details are recorded per car. Two legacy attribution-only photos remain excluded under the user's explicit CC BY / CC BY-SA / public-domain list; this does not mean the original attribution license is invalid.
- Manufacturer website photographs require applicable permission evidence before re-enabling. No BMW PressClub terms were interpreted as a universal license for BMW M/Classic website downloads.
- Translation coverage remains incomplete outside authored dictionaries; 36 conflicting duplicate wordings also need terminology cleanup. Phase 6 still needs complete content, metadata, accessible attributes and localized URL/SEO work.
- **Desktop/mobile visual QA, touch behavior, physical iOS/Android checks and Lighthouse are unverified.** Browser access was unavailable; Computer Use stopped because its safety check could not determine the active browser URL. No screenshot, performance score or device pass is claimed.
- Phases 2–7 remain pending. In particular, the full icon family, account/favorites redesign, real password recovery/verification delivery, parts expansion and question-bank expansion have not been represented as complete.
- No deployment was performed. The current live Vercel site is unchanged by this local build.

For later phases, real verification/recovery emails need a delivery provider and sender configuration; Google sign-in needs OAuth configuration if selected. Re-enabling withheld manufacturer photographs needs evidence permitting this site's intended use. No license was silently widened or provider account created during this pass.

The next content pass should work through `reports/model-completeness.md` generation by generation, adding exact primary-source facts and appropriately licensed photographs. Phase 1 should not be signed off as fully researched until that report and the browser checks meet the requested acceptance criteria.
