# Phase 2 — custom icons

Added 48 original symbols on one 24-unit grid, with 1.5-unit rounded strokes and `currentColor`. The family includes the requested automotive components, road-style navigation/external arrows, personal controls and loading/offline symbols. New features import the same family.

`mountIcons` replaces visible emoji/navigation/check/star glyphs across dynamically loaded views, preserves complete translation keys, excludes source code/native options and preserves numerical multiplication/minus signs. Known save/compare/search/filter/menu controls use the custom symbols. Empty/loading states receive the same style. Hover/press effects respect reduced motion. Icon-only migrated controls receive accessible labels.

Files: `public/icons.js`, `public/icons.css`, `public/app.js`, the four HTML page shells, the exported `originalText` helper in `preferences.js`, `scripts/check-icons.mjs`, and package scripts. A CSS pseudo-element arrow is replaced with an SVG mask.

Validation: `npm run check:icons` passes for all 48 symbols, complete EN/KA/RU translation-key switching, numeric/source preservation, accessible icon-only controls, idempotent decoration and absence of a self-triggered mutation loop. App syntax and dictionary parity pass. These DOM checks do not measure browser layout; the final visual/device pass remains outstanding.

Manual check: open models, Inside BMW and Learn & Play in each language; inspect the header, cards, filters, answer/achievement states, lightbox controls and loading/empty states. Test reduced-motion preference and keyboard labels.
