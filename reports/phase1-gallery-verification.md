# Phase 1 gallery and profile verification

The following source changes were made by the backend audit/test subtask after the Phase 0 report was delivered:

- `public/gallery-enhancements.js`: exterior/engine lightbox; swipe navigation; 100–400% zoom; bounded photo pan; pinch adjustment after zooming; keyboard navigation; focus restoration; failed-image state; author/license/source credits; English, Georgian and Russian controls; responsive main/thumbnail images and blur placeholders.
- `public/gallery-interactions.css`: additional gallery styling, minimum 44px controls, responsive dialog sizing, safe-area bottom padding, focus visibility and reduced-motion behavior.
- `scripts/check-model-profiles.mjs`: eight verification groups covering all 93 profiles, explicit missing fields, provenance/scope/units, checked F10 additions, electric-variant isolation, recorded photo rights, engine matching, intrinsic image dimensions and responsive derivatives.

## Automated results

- `node --check public/gallery-enhancements.js` passed.
- `node scripts/check-model-profiles.mjs` passed all eight groups for 93 catalog models.
- A pure render check returned all 41 profile fields and retained source disclosure markup for F10 M5, G80 M3 and i3 before browser glossary decoration.
- The existing complete `npm run check` baseline passed before Phase 1 changes. The root task owns the final integrated check/build results.

## Browser checks still required

Browser/device tools were unavailable in this session. The gesture, focus and layout behavior below was reviewed in source but is not claimed as tested in a real browser.

1. At 320, 375, 390, 414 and 768px, open `/models?model=e92`, then open its exterior gallery. Confirm the dialog fits the viewport, controls are at least 44px, no horizontal page overflow occurs, and credits remain readable.
2. Swipe left/right at 100%. A vertical gesture should continue scrolling the dialog. Native browser page pinch remains enabled at 100%; the custom photo surface is activated by Zoom in.
3. Zoom in, drag to each edge, and adjust the photo with two fingers. The photograph should remain bounded; Reset returns to 100%. At 100%, swiping and vertical scrolling should work again.
4. Use Tab and the arrow buttons/keyboard to browse. At the first/last photograph, focus should return to the image surface if the previously focused arrow becomes disabled. Arrow keys on a zoom button must not switch photos. At higher zoom, arrow keys on the image pan it.
5. Change photos with Next while the thumbnail strip is below the fold. The dialog must not jump vertically to the thumbnails; only the thumbnail strip should scroll horizontally.
6. Close the dialog after browsing several photographs. Focus should return to the current gallery opener even though the toolbar has rerendered.
7. Switch to Engine on E92 and open its approved engine photograph. Repeat zoom, reset, source link and keyboard checks. F10 M5 should show its explicit unavailable engine-photo state; an F90 engine must not substitute.
8. Change EN → KA → RU between exterior and engine views. Controls should translate without losing the selected photograph. Model or view changes reset zoom state.
9. Simulate an unavailable image URL in developer tools. The visible error state should replace the broken image while the gallery controls remain usable.
10. Verify iOS Safari and Android Chrome touch behavior, orientation/address-bar resizing and reduced-motion mode directly. Confirm source/author/license links open the expected recorded pages.

Responsive files and intrinsic dimensions are checked from actual WebP headers; the tests do not independently certify upstream license terms or factual source content.
