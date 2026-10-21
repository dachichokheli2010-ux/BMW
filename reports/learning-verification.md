# Learning and garage verification

Date: 21 October 2026. This report describes the local source and checked build artifacts. A Git push does not establish that the live host has deployed or that its environment is configured.

## Motron Learn and assessments

Motron Learn replaces the previous Academy sidebar and scenic mission road with a new five-area interface: Dashboard, Tracks, Practice lab, Reference and Your progress. A next-step card gives the dashboard a clear starting point. Seven chapter summaries explain the outcome of each track; mission lists show completed, available and locked activities. The new stylesheet is lazy-loaded and scoped to the Motron interface.

Each track starts open; later missions require the preceding missions in that track. The same access policy applies to track lists, topic and glossary links, direct lesson URLs and recovered drafts. Locked missions explain the prerequisite and offer a route to it. Existing completed lessons remain replayable. Daily challenges and optional practice stay available.

All 42 published activities have individual coaching guides and contextual self-checks, backed by 301 authored English/Georgian/Russian entries. The seven skill tracks have practical outcome summaries. The new concept-to-challenge player uses a concise takeaway recap, with source-linked diagrams and explanations available for deeper study. The player focuses on the current study material and question, with explicit answer confirmation, first-attempt scoring and explanation review. Its phone action bar owns the bottom edge while a lesson is open, preventing the global quick navigation from covering the answer button. The outer workspace no longer adds a duplicate Learn heading. Existing completed history remains valid. Changed assessments invalidate stale unfinished answers without resetting completed lessons. Account-owner changes suspend the player and rebind unfinished drafts before another account can check answers or save progress. Direct lesson links and requested tabs are retained while account data loads.

The authored assessment bank is applied to the published curriculum. Questions use calculations, plausible misconceptions, operating-point comparisons and constrained diagnosis rather than unrelated distractors. Study cards introduce key ideas and worked examples. Academy teaching and assessments retain English, Georgian and Russian dictionaries.

## Two reward systems

Garage coins are earned by checked Learn, Play and Sounds questions and buy virtual collection cars and packs. No real-money purchase or cash value is offered. A first correct answer without a hint earns one coin; a wrong or hinted first check records zero. Repeating that question on the same UTC day cannot earn another coin. Shared Academy/Arcade question IDs use the same receipt. The combined daily cap is 20 coins.

The Isetta starts the career. Saved collection cards from the older collection remain owned. Daily packs spend earned coins, are limited to one per UTC day, disclose rarity odds and exclude owned cards while uncollected cards remain. The draw is saved before a cosmetic rolling-car reel starts. A center marker, deceleration and rarity-colored final card make the reward clear; skip and reduced-motion controls reveal it immediately. Reload recovery uses the same saved card without another charge or draw. Battles compare documented, consistently converted values and state whether a higher or lower value wins. They do not stake coins.

Community credits remain a separate server wallet. A five-question round needs at least four correct answers to award three credits. Limits are nine credits and five started rounds per UTC day. Reloading resumes the active round. A round expires after at most 15 minutes and at UTC midnight. Completion and payment share a transaction; existing wallet balances are preserved.

Academy personal collection credits require at least 80% first-attempt accuracy: two for a lesson, three for perfect accuracy, four for a checkpoint and one for Daily. Repeat reviews earn XP without credits. Historical balances and imported legacy receipts remain compatible.

## Discovery features

- `/spotter`: account-scoped generation sightings, notes, filters, progress, removal and an E46/E90 photo comparison guide. Sightings are personal reports, not proof of ownership or a source of quiz coins.
- `/sounds`: local audio files with exact creator, source and reuse license; a blind listening quiz; MP3/Ogg playback options; no autoplay. Unlicensed or unavailable engine/phase recordings are not substituted with synthesized sounds.
- `/personality`: a five-question entertainment quiz with a shareable result card.
- `/timeline`: sourced 3 Series generation examples, keyboard-accessible controls and explicit gaps where a comparable value is unavailable.
- `/legends`: BMW art, film and motorsport stories with references and image attribution.
- The Ask Motron bubble queries a small backend containing the published catalogue, glossary and lessons. It shows sources and a simple explanation option. It uses deterministic reference lookup and does not need a third-party API key. It does not read private accounts or invent live prices.
- Buyer guides build on the existing catalogue and cited inspection evidence. Running-cost calculations state editable assumptions; evidence labels are not a claim that an individual used car is reliable.

## Persistence and deployment limits

Existing account and Academy synchronization uses the configured backend. Local preview uses SQLite; a configured Vercel deployment uses Neon. New game and spotted records are scoped to the current account **on the current browser**. They are not described as cloud-synced or competitive server scores. Browser storage failures must remain visible, and account switching must not mix records.

Audio licensing documentation is embedded in `public/licensed-audio.js` and displayed next to each recording. Only downloaded, checksum-verified media is listed. The original recordings remain unchanged; any MP3 fallback identifies Wikimedia’s transcode service.

## Verification

Final Motron verification passed: the complete `npm run check` suite inside `npm run build:vercel`, the rebuilt Worker API graph and a built-Worker private-login/analytics smoke check. The new journey regression covers locks, first attempts, replay rewards, recovery, keyboard focus, all three languages, and delayed account switches with separate drafts and coin receipts. All 42 coaching guides, seven track summaries and 301 authored EN/KA/RU entries are checked.

Vercel artifact validation passed for 113 modules, 36 stylesheets, 681 runtime images, 833 asset references and 1,371 deep links. The Worker packages 881 approved assets in 28 modules. Final local HTTP availability passed all 2,132 URLs: 1,371 discovery pages, one private admin entry, 687 images, 61 scripts/styles and 12 licensed audio files. Browser screenshots remain unavailable.

Meaningful reducer/API and DOM checks cover first attempts, replay prevention, caps, ownership, pack purchases, card battles, draft restoration, account changes, source-only helper answers, input limits, escaping, audio failure/skip, cleanup and route imports. Full regression, Worker/Vercel builds and final feature checks are recorded with the completed change. DOM simulation checks behavior and authored responsive rules; no real-browser viewport or screenshot audit is claimed when a browser session is unavailable.

The 21 October audit fixed unsaved Spotter notes lost during filtering, buyer checklist state carried across accounts, hidden cost inputs blocking another powertrain, and newer helper questions overwritten by a pending answer. It also preserves expanded Legends stories and control focus through updates, ignores late personality-sharing results after a restart, and moves sound-quiz focus to feedback. Cross-review added regressions for another tab unlocking an open mission preview and UTC midnight interrupting a pack reveal.

`npm run check` passed the complete regression suite. `npm run build` produced 881 Worker assets in 28 modules. A smoke check against that built Worker verified the mission-access and responsive reel modules, page routes, private admin headers, audio bytes/types and helper response. `npm run build:vercel` reran the complete regression suite and passed release checks for 110 modules, 40 stylesheets, 834 asset references and 1,371 deep links.

The earlier local HTTP verification passed 2,127 URLs: 1,371 discovery pages, one private admin entry, 686 images, 57 scripts/styles and 12 licensed audio files. A separate HTTP smoke check exercised Learn, a lesson URL, Garage, Spotter, the private admin shell and a source-linked helper response. No live-host deployment or browser screenshot pass is implied.
