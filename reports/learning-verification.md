# Learning and garage verification

Date: 20 October 2026. This report describes the local source and checked build artifacts. A Git push does not establish that the live host has deployed or that its environment is configured.

## Mission road and assessments

Learn keeps a winding mission road, checkpoint nodes and prerequisite progression. Mission names stay readable on desktop; the road becomes vertical on narrow screens. The player focuses on the current study material and question, with explicit answer confirmation, first-attempt scoring and explanation review. Existing completed history remains valid. Changed assessments invalidate stale unfinished answers without resetting completed lessons.

The authored assessment bank is applied to the published curriculum. Questions use calculations, plausible misconceptions, operating-point comparisons and constrained diagnosis rather than unrelated distractors. Study cards introduce key ideas and worked examples. Academy teaching and assessments retain English, Georgian and Russian dictionaries.

## Two reward systems

Garage coins are earned by checked Learn, Play and Sounds questions and buy virtual collection cars and packs. No real-money purchase or cash value is offered. A first correct answer without a hint earns one coin; a wrong or hinted first check records zero. Repeating that question on the same UTC day cannot earn another coin. Shared Academy/Arcade question IDs use the same receipt. The combined daily cap is 20 coins.

The Isetta starts the career. Saved collection cards from the older collection remain owned. Daily packs spend earned coins, are limited to one per UTC day, disclose rarity odds and exclude owned cards while uncollected cards remain. Battles compare documented, consistently converted values and state whether a higher or lower value wins. They do not stake coins.

Community credits remain a separate server wallet. A five-question round needs at least four correct answers to award three credits. Limits are nine credits and five started rounds per UTC day. Reloading resumes the active round. A round expires after at most 15 minutes and at UTC midnight. Completion and payment share a transaction; existing wallet balances are preserved.

Academy personal collection credits require at least 80% first-attempt accuracy: two for a lesson, three for perfect accuracy, four for a checkpoint and one for Daily. Repeat reviews earn XP without credits. Historical balances and imported legacy receipts remain compatible.

## Discovery features

- `/spotter`: account-scoped generation sightings, notes, filters, progress, removal and an E46/E90 photo comparison guide. Sightings are personal reports, not proof of ownership or a source of quiz coins.
- `/sounds`: local audio files with exact creator, source and reuse license; a blind listening quiz; MP3/Ogg playback options; no autoplay. Unlicensed or unavailable engine/phase recordings are not substituted with synthesized sounds.
- `/personality`: a five-question entertainment quiz with a shareable result card.
- `/timeline`: sourced 3 Series generation examples, keyboard-accessible controls and explicit gaps where a comparable value is unavailable.
- `/legends`: BMW art, film and motorsport stories with references and image attribution.
- The Ask APEX bubble queries a small backend containing the published catalogue, glossary and lessons. It shows sources and a simple explanation option. It uses deterministic reference lookup and does not need a third-party API key. It does not read private accounts or invent live prices.
- Buyer guides build on the existing catalogue and cited inspection evidence. Running-cost calculations state editable assumptions; evidence labels are not a claim that an individual used car is reliable.

## Persistence and deployment limits

Existing account and Academy synchronization uses the configured backend. Local preview uses SQLite; a configured Vercel deployment uses Neon. New game and spotted records are scoped to the current account **on the current browser**. They are not described as cloud-synced or competitive server scores. Browser storage failures must remain visible, and account switching must not mix records.

Audio licensing documentation is embedded in `public/licensed-audio.js` and displayed next to each recording. Only downloaded, checksum-verified media is listed. The original recordings remain unchanged; any MP3 fallback identifies Wikimedia’s transcode service.

## Verification

Meaningful reducer/API and DOM checks cover first attempts, replay prevention, caps, ownership, pack purchases, card battles, draft restoration, account changes, source-only helper answers, input limits, escaping, audio failure/skip, cleanup and route imports. Full regression, Worker/Vercel builds and final feature checks are recorded with the completed change. DOM simulation checks behavior and authored responsive rules; no real-browser viewport or screenshot audit is claimed when a browser session is unavailable.
