# Motron audit — 19 October 2026

Scope: the current local checkout, including its existing uncommitted changes. Application source, routes, API, account synchronization, learning content, catalog assembly, image manifests and existing checks were reviewed in parallel before implementation. Existing work is preserved.

## Verification limits

The baseline `npm run check` passes: 14 general groups, 42 Academy activities / 141 questions, session/recovery and translation checks, 68 backend, 38 account-sync and 24 PostgreSQL checks. Passing these checks does **not** establish complete content, licensing, translation or visual quality.

No browser viewport has passed visual QA in this session. The browser connector exposed no browser; Windows Computer Use then stopped because it could not confidently determine the browser URL. No Lighthouse score, physical-device test or screenshot is claimed. The live Vercel page was also unavailable to the web reader. Findings below are source-confirmed unless explicitly described as a risk.

| Viewport / behavior | Status | Required checks |
| --- | --- | --- |
| 320px, 375px, 390px, 414px, 430px | Unverified in browser | Overflow, header, long KA/RU labels, filters, cards, dialogs, 44px targets |
| Tablet portrait / landscape | Unverified in browser | Header breakpoint, navigation, grids, modal height |
| Desktop | Source review only | Search, route entry/reload, focus, galleries, menus |
| iOS Safari | Unverified on device | Keyboard/input zoom, safe areas, dynamic address bar, back navigation, pinch |
| Android Chrome | Unverified on device | Keyboard, back navigation, touch/scroll conflicts, dialogs |
| Lighthouse mobile | Not run | Performance ≥85; accessibility ≥95 |

## Confirmed findings

### Model content and photographs — Phase 1 priority

1. The catalog contains **93 models**, including **16 electric models**. Every model lacks a complete structured profile. Only **8** have expanded source-specific specification records in `public/verified-specs.js`; **7** have metric dimensions / 0–100 km/h / top speed. Do not convert a US 0–60 mph measurement into a purported 0–100 measurement.
2. All 93 lack one or more requested history, production-range, chassis, running-cost, ownership, fun-fact and generation-relationship fields. Existing short descriptions are not complete histories. See `reports/model-completeness.md` and its JSON companion for every model and field.
3. **70** have no engine photograph. The other **23** share **13** assets; presence does not establish correct engine identity. `models.js` explicitly identifies M54B25 references for M54B30 cars and an F90 S63 installation for the F10 M5. The S54 family gallery includes a CSL engine for a standard M3. These must not be presented as fitted-engine photographs.
4. Current assembled exterior galleries contain **209 entries / 203 distinct assets**. **31 models** have only a hero. Label-based coverage is 25 side, 62 rear, 4 straight front and 20 interior; dashboard/seats and wheel/detail coverage are not established. These are source-label counts, not an independent visual identification.
5. **99 heritage entries across 29 models** come from BMW M / BMW Classic pages with all-rights-reserved credit. Generic PressClub links do not demonstrate permission for those separate website assets. BMW's [PressClub terms](https://www.press.bmwgroup.com/global/info/legal) restrict use to press purposes and recognize additional third-party rights. Until permission is established, exclude these from the approved photo list and retain their metadata for review. Do not claim the terms grant a general image license.
6. A homepage Unsplash photograph falls outside the user's permitted source list (`editorial-credits.js`). Phase 1 must use an approved catalog photo or a placeholder.
7. `app.js:46` suppresses Commons/exact-angle entries when an official gallery exists. It also creates the primary engine entry without its individual credit. `app.js:95` then falls back to the complete credits list instead of identifying that engine image.
8. Only 67 of 209 gallery records carry image dimensions; rendered main/gallery images omit intrinsic width/height, responsive `srcset` and blur placeholders. WebP conversion already exists for many images.
9. `gallery-enhancements.js` supplies thumbnails and keyboard navigation, but no lightbox swipe or zoom. Only the base exterior stage handles a one-finger swipe (`app.js:74–77`). Engine zoom buttons/panning exist; pinch behavior remains unverified.
10. Electric variant assembly spreads the complete reference car (`catalog.js`), allowing front-drive eDrive20 variants to inherit AWD/dual-motor details, power labels and unrelated year context. Share photo data only, never a reference car's specifications.

### Translation

There are **1,684 unique registered English keys** across the existing dictionaries. Authored rows have nonempty Georgian/Russian values and matching parameter placeholders. This says nothing about strings that never enter a dictionary.

- `preferences.js` walks `document.body`; document titles/meta descriptions remain outside that traversal. Its attribute list excludes `alt` and `aria-description`.
- Model descriptions, subtitles, image notes and market strings are broadly English. All 85 present model photo notes lack dictionary entries in the existing complete dictionary set.
- `system-guide.js` has 26 guides; `data.js` has 18 mechanical parts, 11 lessons, 4 missions and 10 upgrades. Significant legacy content remains untranslated. The eight photographed `parts.js` records do have registered translations.
- 34 English keys have conflicting duplicate translations across modules, making wording depend on feature load order.
- `routes.js` has no `/ka/` or `/ru/` route handling; localized URLs and `hreflang` are absent. Language persistence and `<html lang>` updates already exist and should be preserved.
- Existing checks cover selected Academy/engine/retention dictionaries, rather than all application dictionary shapes.

The detailed source/line inventory is in `reports/phase-0-translation-audit.md` and `reports/phase-0-translation-inventory.json`. The new parity check must fail on missing/empty translations and inconsistent template placeholders, while reporting hardcoded content separately. A passing parity check must never be described as complete app translation.

### Navigation, accounts and learning

- `/generation-guides` exists in the shared route map but has no Vercel rewrite. Direct entry/reload differs between hosting and local preview.
- Garage backup's legacy lesson whitelist omits `drivetrain-layouts` and `m-performance`, dropping their progress during import. Backup build identifiers/names are less strict than server validation, so an import can be accepted locally and rejected during account sync.
- The Academy defines the `powertrains` learning path, but progress restoration omits it and returns to `basics` after reload.
- Answer order is determined when curriculum is created rather than randomized per session. The current bank has 141 questions, below the requested 300+, and requested timed/audio/Quick 10 modes are incomplete or absent.
- Forgot/reset password, email verification and Google sign-in are absent. Existing password hashing, session isolation, rate limiting and origin checks have regression coverage. Email delivery/provider configuration is needed for real verification/reset delivery.
- Sign-up returns an email-specific conflict for an existing address (`server/api.js:108–111`), contrary to the requested account-enumeration protection. The existing green auth tests do not establish compliance with that requirement.
- Native `<dialog>` navigation already provides focus containment/Escape handling and the mobile drawer locks background scroll. Keep these behaviors; inspect route-change closure and actual touch behavior in the outstanding browser pass.

See `reports/backend-audit.md` for detailed references and reproductions.

### Mobile/accessibility/performance risks requiring measurement

- Several stylesheet rules specify 32–42px controls. Later shared/mobile rules overlap, so computed sizes must be measured before listing any particular element as a confirmed undersized target.
- `mobile.css` forces common text/search/email/password inputs to 16px on phones; do not claim account inputs cause iOS zoom solely from the earlier 12px account rule. Number/range/native-select behavior still requires inspection.
- Account name/profile-name fields omit the explicit `type` attribute, so `[type=text]` does not match them. Their earlier 12px account styling is a source-confirmed gap in the mobile 16px override; actual iOS keyboard behavior remains untested.
- Some part dialogs retain `vh` max-height rules. Test keyboard/address-bar resizing and replace where dynamic height is necessary.
- Three.js and specialist workspace code are loaded lazily in parts of the app; several workspace stylesheets are eager. Measure network/CPU and layout shift before claiming a performance budget.
- Unknown routes return plain text, rather than the requested branded accessible 404. Offline experience and general error boundaries need later work.

## Ordered implementation plan

1. **Phase 0:** retain this report, generate the full per-model/translation inventories and add a translation parity guard with a deliberate failure self-test. Report remaining browser QA explicitly.
2. **Phase 1:** add a complete, additive model-profile schema, per-field provenance and unavailable states; prevent EV fact inheritance; quarantine rights/identity-unverified photographs; add a permanent sources route, profile display, gallery touch/zoom improvements and a completeness validator. Research and add genuine missing material only when identity, rights and source context can be verified.
3. **Phase 2:** consolidate the existing SVGs into the requested original icon family and remove UI glyphs with reduced-motion behavior.
4. **Phase 3:** improve header/favorites/account flows, fix import discrepancies, and add real reset/verification delivery using configured provider credentials.
5. **Phases 4–6:** expand sourced parts and learning content, then finish all KA/RU content and localized routing/metadata. Accuracy takes priority over generated volume.
6. **Phase 7:** resolve remaining audited issues, run the full viewport matrix on available browsers/devices and measure Lighthouse. Do not declare this phase complete from source inspection.

## Phase 1 acceptance and current limits

An unavailable slot is an honest fallback, **not** a completed research task. The validator lists gaps per car and can fail in strict content mode. Existing sources are labeled source-linked unless the exact configuration has an expanded verified record; source dates and model years are distinguished. No new photos, licenses, facts, performance figures or publication years are invented. Existing URLs and the “Not affiliated with BMW AG” notice remain.
