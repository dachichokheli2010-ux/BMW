# APEX visual and Vercel repair

## Changes

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

## Vercel

The previous Vercel command ran checks and published raw `public/`, while the separate Worker build handled asset versioning differently. The new Vercel build publishes `dist/vercel` with a single `/_apex/<release-hash>/` directory for the complete module/style/data graph. Relative imports, dynamic imports, import maps and lazy style URLs all stay in that release. HTML revalidates; fingerprinted assets are immutable. This reduces mixed-version deployments without changing the account backend.

`scripts/check-vercel-build.mjs` verifies the generated output's module graph, CSS, exact filename casing, images and deep-link rewrites. This also catches problems hidden by Windows case-insensitive paths or the local preview's legacy JPG fallback.

The user-supplied Vercel preview requires an authenticated browser session. Direct unauthenticated HTTP requests redirect to Vercel login; those redirects were not treated as APEX asset failures. No live deployment was performed by this task.

## Verification and limits

- The full `npm run check` suite passes, including 13 complete page mounts, 10 experience groups and an actual app-entry navigation regression check. These tests use DOM simulation.
- All public CSS parses, including the new shared and workspace styles.
- The Vercel release checker validates 83 JavaScript modules, 30 stylesheets, 596 images and 1,320 discovery deep links. Counts can increase with future content.
- The existing Worker build and the new Vercel build are separate outputs and are checked separately.
- Real browser inspection succeeded for the original laptop/deployed layouts and confirmed the horizontal hero overflow and cramped header. Browser control was then stopped by a physical Escape key press during the final recheck. No further browser automation was attempted.
- Therefore the final desktop/mobile visual pass remains incomplete. A real-device screenshot pass and a measured Lighthouse score are not claimed. Automated DOM, syntax, asset and route checks do not replace visual verification.

## Commands

```sh
npm start
npm run check
npm run build
npm run build:vercel
```

Redeploy the updated checkout to Vercel to publish the repair. Existing catalog research and missing-photo reports are unchanged by these visual fixes.
