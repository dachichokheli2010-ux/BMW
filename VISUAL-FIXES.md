# Motron visual and Vercel repair

## Changes

- Corrected the small compare tray's inherited desktop transform and definite width on phones. Tray removal controls now use SVG icons; add/remove/clear and hidden-state behavior have regression coverage.
- Rebuilt search and comparison overlays with bounded scrolling, wrapping search filters, proper close controls, picker scroll preservation, keyboard/focus recovery, short-screen layouts and transparency fallbacks. Shared close controls in component, garage, glossary and dropdown views use consistent SVGs.
- Added responsive community, submission, friend, shared-garage and admin views. Repaired the footer's conflicting `display:contents!important` rule, light-theme community colors, narrow review images, long owner text and mobile form sizing.

- Removed the Easy/Nerd button, its automatic disclosure behavior, and onboarding mode writes. Technical sections remain ordinary expandable sections.
- Rebuilt the shared glass header with brighter inner edges, adaptive tint, a restrained specular highlight, larger navigation labels and a correctly sized active indicator. Units close on outside clicks/Escape, and the indicator responds to font loading and container resize.
- Unified the mobile navigation breakpoint at 1120px. This removes the gap where the menu button appeared but preferences remained in the wrong place. The menu is now a floating bottom sheet, with a handle and touch dismissal.
- Replaced mobile bottom-tab text glyphs with consistent original SVG icons. Tabs track car/detail/lesson/engine/game routes and reserve safe-area space.
- Corrected the homepage hero's `100vw` plus margins, which visibly overflowed the laptop viewport. It now follows its container and keeps headline, buttons and statistics in normal vertical flow.
- Scoped old generic `header`, `nav` and `footer` layout rules to the actual site chrome. Workspace headers, breadcrumbs and controls no longer inherit the outer header's dimensions, ordering and padding.
- Redesigned narrow comparison cards, engine/parts cards, Arcade cards, badges and garage controls. Tiny fixed text and tightly packed mobile grids are replaced by readable rows/stacks. Garage tabs retain horizontal scrolling where it is useful.
- Changed the phone Academy roadmap to vertical flow so labels cannot be clipped beside the road. Tablet/laptop sidebars move before they squeeze the central content.
- Increased touch targets and iOS form sizes, refined search and menus, and kept light/dark, reduced-motion, reduced-transparency and blur-fallback behavior.
- Removed duplicate large page introductions from specialist pages. Improved engine/part breadcrumbs and active navigation.
- Fixed the comparison tray covering car details and the tray/toast/bottom-tab stacking. Gallery view and selected component survive sharing and Back/Forward navigation.
- Fixed the account menu's broken Favorites destination.
- Fixed the screenshot's oversized car actions and cramped phone title/selector layout. Added compact responsive controls, readable source text and scrolling photo shortcuts.
- Separated the measured header inset from its CSS height, so a desktop measurement no longer prevents the mobile header from shrinking. Refined tint, highlight layers and background gradients.
- Added header-aware question scrolling to Arcade and Academy, with focus preservation and reduced-motion behavior.
- Added individual stories and learning facts to all 93 cars, guides for all 30 engine entries, and separately checked 2019 M8 Competition Coupé/Convertible specifications.
- Added 14 credited Commons engine/drive photos and restored existing family references. Every retained car now has exterior and engine/drive-reference photography. Exact application and interior-image gaps remain audited.
- Expanded creator-hosted 3D exteriors from four to twelve, with loading, timeout, retry and error recovery. Added profile-photo failure recovery.

## Vercel

The previous Vercel command ran checks and published raw `public/`, while the separate Worker build handled asset versioning differently. The new Vercel build publishes `dist/vercel` with a single `/_apex/<release-hash>/` directory for the complete module/style/data graph. Relative imports, dynamic imports, import maps and lazy style URLs all stay in that release. HTML revalidates; fingerprinted assets are immutable. This reduces mixed-version deployments without changing the account backend.

`scripts/check-vercel-build.mjs` verifies the generated output's module graph, CSS, exact filename casing, images and deep-link rewrites. This also catches problems hidden by Windows case-insensitive paths or the local preview's legacy JPG fallback.

The user-supplied Vercel preview requires an authenticated browser session. Direct unauthenticated HTTP requests redirect to Vercel login; those redirects were not treated as Motron asset failures. No live deployment was performed by this task.

## Verification and limits

- The full `npm run check` suite passed, including 37 complete route mounts, 10 experience groups and actual app-entry navigation through all 93 cars and 12 3D entry panels. Final community changes pass 182 backend and 69 UI assertions. These tests use DOM simulation and isolated databases. Arcade Next and Academy Continue have scrolling regressions.
- All 34 public CSS files parse, including the new shared, workspace, car-detail and community styles.
- The Vercel release checker validates 91 JavaScript modules, 33 linked stylesheets, 681 images and 1,358 discovery deep links, plus private and shared-token routes. The Worker build imports its packaged API to verify the backend dependency graph.
- The existing Worker build and the new Vercel build are separate outputs and are checked separately.
- Real browser inspection succeeded for the original laptop/deployed layouts and confirmed the horizontal hero overflow and cramped header. An earlier final recheck was interrupted by a physical Escape key press.
- In this pass browser control stopped when the current URL could not be confirmed. The Computer Use workflow requires stopping app input after control is stopped; no further UI automation was attempted. This does not establish the final mobile/laptop appearance.
- Therefore the final desktop/mobile visual pass remains incomplete. A real-device screenshot pass and a measured Lighthouse score are not claimed. Automated DOM, syntax, asset and route checks do not replace visual verification.

The [Computer Use skill](C:/Users/dachi/.codex/plugins/cache/openai-bundled/computer-use/26.1013.40934/skills/computer-use/SKILL.md) references runtime guidance stating: “If Computer Use reports that the turn ended or that the user stopped Computer Use, stop issuing app input.” Browser input was stopped; the remaining checks used code, local assets and DOM simulation.

## Commands

```sh
npm start
npm run check
npm run build
npm run build:vercel
```

Redeploy the updated checkout to Vercel to publish the repair. Content and exact-photo gaps remain listed in the regenerated completeness reports. See [IMPROVEMENTS.md](IMPROVEMENTS.md) for the full change list and research handoff.
