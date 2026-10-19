# Phase 0 translation audit

All exported translation modules and private plain EN/KA/RU objects are checked. The source inventory lists source-copy candidates, not browser-verified defects or semantic translation completeness. Dynamic templates need manual review; factory names, URLs, identifiers and legal attribution may intentionally remain unchanged. Source line numbers refer to the audit snapshot.

Authored dictionary parity: PASS. 1870 rows; 1801 unique English keys; 23 locale-object dictionaries. 36 conflicting duplicate English entries are recorded separately. Passing parity does not mean the application is fully translated.

Scanned 70 source files. Found 7613 source-copy candidates, including 4223 untranslated candidates after identifier/license exclusions. All candidates, including covered strings and review classifications, are in phase-0-translation-inventory.json.

## Confirmed architectural gaps

- public/preferences.js visits document.body and only aria-label/title/placeholder attributes; page metadata, image alt, aria-description and aria-valuetext are not translated through that path.
- public/routes.js has no locale URL prefixes; no hreflang alternates are authored in the HTML pages.
- Global English source text is used as dictionary identity. Conflicting definitions can change terminology after a feature dictionary loads.
- Dictionary parity checks cannot detect prose that was never added to a dictionary. Treat this source inventory and per-route browser tests as additional checks.
- Numeric/date formatting is inconsistent: garage.js and tuning-workbench.js force English; personal-garage.js uses browser locale rather than the selected application language.

## Confirmed source findings

- public/preferences.js:687 — Only aria-label, title and placeholder are visited; alt, aria-description and aria-valuetext are omitted.
- public/preferences.js:744 — Translation starts at document.body. Head titles and meta descriptions are excluded.
- public/index.html:3 — Engine family, All engines, Chassis / generation and All source years have no authored target-language keys.
- public/index.html:17 — The comparison-tray instruction has no authored target-language key.
- public/account.js:23 — Auth/account story, sign-in and profile prose are mostly outside the authored dictionaries.
- public/account.js:76 — Sign-up validation messages have no authored Georgian or Russian entries.
- public/smart-search.js:261 — Search result counts, related suggestions and empty-result templates are assembled from English fragments.
- public/viewer.js:18 — The 3D part selection accessible label is assembled as English Select + part text.
- public/system-guide.js:8 — System encyclopedia component names, descriptions, connections and failure notes mostly lack dictionary entries.
- public/engine-lab.js:6 — The engine-lab dictionary covers a selected UI subset; most inspector area/text/detail content is still English.
- public/garage.js:12 — Garage number formatting forces English regardless of the selected application language.
- public/tuning-workbench.js:8 — Workbench number formatting forces English regardless of the selected application language.
- public/personal-garage.js:211 — Saved-build dates use browser locale instead of the selected application language.
- public/platform.js:67 — Route titles are assigned as English prose and do not subscribe to language changes.

Browser interaction, viewport coverage and screen-reader behavior were not tested by this script.

## Source inventory by file

| File | Candidates | Untranslated candidates |
| --- | ---: | ---: |
| public/about.html | 176 | 21 |
| public/academy-achievements.js | 18 | 2 |
| public/academy-content.js | 248 | 17 |
| public/academy-glossary.js | 135 | 56 |
| public/academy-links.js | 1 | 1 |
| public/academy-recognition.js | 34 | 5 |
| public/academy-state.js | 15 | 6 |
| public/academy-teaching.js | 42 | 0 |
| public/academy-ui.js | 370 | 81 |
| public/academy.js | 451 | 23 |
| public/account-sync.js | 43 | 37 |
| public/account.js | 95 | 92 |
| public/app.js | 88 | 53 |
| public/catalog.js | 7 | 3 |
| public/collection.js | 85 | 25 |
| public/comparison.js | 128 | 77 |
| public/data.js | 213 | 190 |
| public/dropdowns.js | 33 | 30 |
| public/editorial-credits.js | 10 | 7 |
| public/electric-model-variants.js | 60 | 44 |
| public/electric.html | 177 | 27 |
| public/engine-lab.js | 190 | 142 |
| public/exact-views.js | 47 | 37 |
| public/exploded.js | 64 | 53 |
| public/extended-models.js | 607 | 423 |
| public/galleries.js | 254 | 192 |
| public/gallery-enhancements.js | 37 | 16 |
| public/garage.js | 56 | 53 |
| public/generation-guide-sources.js | 14 | 11 |
| public/generation-guides.js | 34 | 0 |
| public/index.html | 210 | 23 |
| public/marketplaces.js | 70 | 37 |
| public/model-photo-policy.js | 14 | 5 |
| public/model-profile-ui.js | 23 | 6 |
| public/model-profiles.js | 77 | 32 |
| public/models.js | 513 | 380 |
| public/navigation.js | 37 | 10 |
| public/new-models.js | 155 | 124 |
| public/next-models.js | 596 | 427 |
| public/official-heritage.js | 693 | 475 |
| public/parts.html | 176 | 21 |
| public/parts.js | 158 | 8 |
| public/personal-garage.js | 140 | 91 |
| public/photo-sources.js | 23 | 3 |
| public/platform.js | 111 | 89 |
| public/recordings.js | 68 | 65 |
| public/responsive-photos.js | 6 | 6 |
| public/smart-search.js | 97 | 91 |
| public/system-guide.js | 313 | 285 |
| public/three-models.js | 9 | 5 |
| public/tuning-review.js | 24 | 24 |
| public/tuning-workbench.js | 208 | 194 |
| public/turbo-types.js | 102 | 49 |
| public/verified-specs.js | 49 | 42 |
| public/viewer.js | 9 | 7 |

## Untranslated candidates requiring review

Factory model names, engine codes, original author/license names and units should remain intact where appropriate. Dynamic fragments can be translated through a complete template even when an individual fragment has no key. The list below does not claim every candidate is a visible defect.

### public/about.html

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | meta-content | About APEX, an independent BMW explorer with clear factory sources and reference labels. |
| 1 | visible-text | APEX — About |
| 1 | meta-content | width=device-width,initial-scale=1 |
| 2 | visible-text | English |
| 2 | aria-label | Switch color theme |
| 3 | visible-text | 200+ hp |
| 3 | visible-text | 300+ hp |
| 3 | visible-text | 400+ hp |
| 3 | visible-text | 500+ hp |
| 3 | visible-text | 600+ hp |
| 3 | visible-text | All engines |
| 3 | visible-text | All source years |
| 3 | visible-text | APEX is not affiliated with BMW. Original recordings identify their source and note model or exhaust differences. 3D exteriors are creator models, not factory CAD or verified mechanical internals. |
| 3 | visible-text | Chassis / generation |
| 3 | visible-text | Engine family |
| 6 | alt | Selected BMW exterior |
| 8 | alt | Selected engine family |
| 15 | visible-text | Original |
| 15 | visible-text | Original creator recordings contain real car audio. Model and exhaust differences are noted above. |
| 15 | visible-text | recordings. |
| 17 | visible-text | Choose up to 3 |

### public/academy-achievements.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | literal | T12:00:00Z |
| 9 | literal | T12:00:00Z |

### public/academy-content.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 10 | literal | US DOE · gasoline vehicle systems |
| 16 | literal | BMW · F10 M5 technical data |
| 64 | literal | Existing catalog photograph. |
| 66 | literal | BMW factory reference |
| 66 | literal | engine family. |
| 66 | literal | uses the |
| 68 | literal | . Other vehicles sharing its generation code may use different engines. |
| 68 | literal | configuration? |
| 68 | literal | The specific |
| 68 | literal | Which engine family powers this documented |
| 76 | literal | is an inline-six family: six cylinders in one row. |
| 76 | literal | The |
| 76 | literal | use? |
| 76 | literal | What cylinder arrangement does the |
| 77 | literal | 2011 BMW 135i |
| 77 | literal | 2011–2012 BMW 335is |
| 77 | literal | 2016 BMW 340i / 740i |

### public/academy-glossary.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 5 | literal | BMW · variable cam timing and valve lift |
| 6 | literal | BMW · F10 M5 engine and drivetrain |
| 7 | literal | BMW · M3 CS and M xDrive |
| 8 | literal | U.S. Department of Energy · combustion basics |
| 9 | literal | Motorservice · engine bearing fundamentals (PDF) |
| 10 | literal | Garrett · turbocharger basics |
| 11 | literal | Garrett · wastegate and blow-off valve functions |
| 12 | literal | Garrett · charge-air cooling |
| 13 | literal | NASA · power and work |
| 14 | literal | NIST · mechanical and metric horsepower |
| 15 | literal | NASA · torque and rotation |
| 16 | literal | ZF · dual-clutch operating principle (PDF) |
| 17 | literal | Bosch · engine control unit |
| 25 | literal | double vanos |
| 25 | literal | variable camshaft timing |
| 29 | literal | valve lift |
| 29 | literal | variable valve lift |
| 33 | literal | all wheel drive |
| 37 | literal | final drive |
| 41 | literal | crank shaft |
| 45 | literal | cam shaft |
| 49 | literal | con rod |
| 53 | literal | big end bearing |
| 53 | literal | conrod bearings |
| 53 | literal | rod bearing |
| 57 | literal | charge air cooler |
| 57 | literal | charge-air cooler |
| 61 | literal | boost control valve |
| 61 | literal | waste gate |
| 65 | literal | boost pressure |
| 65 | literal | manifold pressure |
| 73 | literal | lb ft |
| 73 | literal | N m |
| 73 | literal | Nm |
| 77 | literal | double clutch |
| 77 | literal | dual clutch |
| 77 | literal | M DCT |
| 81 | literal | electronic control unit |
| 81 | literal | engine control unit |
| 81 | literal | engine management |
| 85 | literal | limited slip |
| 85 | literal | M differential |
| 89 | literal | twin scroll |
| 93 | literal | engine speed |
| 93 | literal | rev min |
| 93 | literal | revolutions per minute |
| 114 | literal / f22 | BMW M235i Coupé · F22 |
| 114 | literal / e92 | BMW M3 · E92 |
| 114 | literal / f80 | BMW M3 · F80 |
| 114 | literal / g80-m3-cs | BMW M3 CS · G80 CS |
| 114 | literal / f10-m5 | BMW M5 · F10 |
| 176 | literal | A glossary root is required. |
| 222 | literal | Escape |
| 223 | literal | Tab |
| 234 | literal | A glossary container is required. |
| 248 | literal | [data-glossary-clear],[data-glossary-reset] |

### public/academy-links.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 6 | literal | .ac-player-body p |

### public/academy-recognition.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 31 | literal | The source identifies the pictured catalog car as |
| 31 | literal / explanation | This is the BMW |
| 31 | literal | Which generation is this BMW |
| 40 | literal / label | BMW · |
| 40 | literal / label | BMW · documented model |

### public/academy-state.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 5 | literal | T12:00:00Z |
| 6 | literal | T12:00:00Z |
| 77 | literal | daily: |
| 77 | literal / day | lesson: |
| 77 | literal | review: |
| 87 | literal | unit: |

### public/academy-ui.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 17 | literal / glossary | Aa |
| 28 | literal | mountAcademy requires a container. |
| 40 | literal | -unfinished: |
| 47 | literal | Documented catalog configuration |
| 51 | literal / label | BMW · documented vehicle source |
| 51 | literal | is an application clue, not a guarantee of one engine. Always distinguish the model, trim, production details and market. |
| 51 | literal / title | Learn this car: |
| 52 | literal | Battery-electric propulsion |
| 52 | literal | configuration? |
| 52 | literal | Only diesel combustion |
| 52 | literal | Only petrol combustion |
| 52 | literal | The catalog identifies this application as |
| 52 | literal / explanation | This catalog configuration is a battery-electric vehicle. Its drive motors use electrical energy stored in a battery. |
| 52 | literal / prompt | What kind of propulsion does this documented model use? |
| 52 | literal / prompt | Which engine code is documented for this |
| 53 | literal | A wheel size identifies its generation |
| 53 | literal | An engine code is its generation |
| 53 | literal | generation. Engine families, wheel specifications and generation codes serve different purposes. |
| 53 | literal / explanation | This catalog model is part of the |
| 53 | literal / prompt | Which generation belongs to this documented model? |
| 54 | literal / prompt | Could another trim in the same generation have a different powertrain? |
| 54 | literal | No, all generations have one engine |
| 54 | literal / explanation | One generation can include several trims, engine variants and drivetrain configurations. Read the source for the exact model and market. |
| 54 | literal | Only the paint changes |
| 54 | literal | Yes, check the specific application |
| 83 | literal | &lt;/button&gt;&lt;/div&gt;&lt;/div&gt; |
| 87 | literal | &lt;/div&gt;&lt;/section&gt; |
| 87 | literal | &lt;/li&gt; |
| 87 | literal | &lt;/ul&gt;&lt;/section&gt; |
| 91 | literal | &lt;/p&gt; |
| 91 | literal | &lt;/section&gt; |
| 91 | literal | &lt;a href="/models?model= |
| 100 | literal | aria-current="page" |
| 104 | dynamic visible-text | {value12} XP |
| 104 | literal | daily: |
| 104 | literal | XP to level |
| 109 | dynamic dynamic-template | C{value1} {value2} {value3} {value4} {value5} {value6} |
| 109 | dynamic dynamic-template | M{value1} {value2} |
| 110 | literal | , complete the previous lesson to unlock |
| 110 | literal | , completed |
| 117 | literal | PHOTOS / |
| 119 | literal | A ↔ B |
| 123 | literal | questions ready for another look. |
| 126 | literal | T12:00:00 |
| 128 | literal | daily: |
| 131 | literal | " aria-label=" |
| 131 | literal | " max=" |
| 131 | literal | "&gt;&lt;/progress&gt; |
| 131 | literal | &lt;/article&gt; |
| 131 | literal | &lt;/div&gt; |
| 131 | literal | &lt;/p&gt; |
| 131 | literal | &lt;/strong&gt;&lt;/div&gt;&lt;progress value=" |
| 131 | literal | &lt;article class=" |
| 132 | dynamic visible-text | {value5} XP |
| 133 | literal | : learning activity complete |
| 148 | dynamic visible-text | : {value2} XP · |
| 148 | dynamic visible-text | : +{value4} XP{value5} |
| 148 | dynamic visible-text | {value3} XP |
| 148 | literal | &lt;/span&gt;: + |
| 148 | literal | GUIDED LESSON |
| 148 | literal | LEARN / |
| 151 | literal | &lt;/b&gt; |
| 156 | literal | Now choose the role for |
| 158 | dynamic visible-text | · +{value2} XP |
| 158 | dynamic visible-text | {value15} XP |
| 162 | literal | .ac-player .ac-photo-frame img |
| 166 | literal | .ac-player .ac-photo-frame img |
| 174 | dynamic dynamic-template | [data-ac-focus="{value1}"] |
| 195 | dynamic dynamic-template | [data-ac="step"][data-value="{value1}"] |
| 197 | dynamic dynamic-template | [data-ac="answer"][data-value="{value1}"] |
| 204 | literal | (prefers-reduced-motion:reduce) |
| 210 | literal | is now in your learning garage. |
| 215 | literal | [data-ac="order"]:not(:disabled) |
| 216 | literal | [data-ac="match-right"]:not(:disabled) |
| 217 | literal | [data-ac="match-left"]:not(.is-matched):not(:disabled) |
| 218 | literal | [data-ac="order"]:not(:disabled),[data-ac="match-left"]:not(:disabled) |
| 226 | literal | input,select,textarea,[contenteditable] |
| 228 | literal | [data-ac="answer"]:not(:disabled) |
| 230 | literal | ArrowDown |
| 230 | literal | ArrowUp |
| 232 | literal | &lt;/div&gt; |

### public/academy.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 6 | literal | US Department of Energy · combustion basics |
| 7 | literal | Garrett · how a turbo works |
| 8 | literal | ZF · torque converters |
| 9 | literal | HELLA · engine cooling |
| 10 | literal | ZF · how dampers work |
| 11 | literal | Bosch · stability control |
| 12 | literal | US Department of Energy · electric drive |
| 13 | literal | BMW Group · company history |
| 14 | literal | BMW M · M1 engine history |
| 15 | literal | BMW M · M5 generation history |
| 16 | literal | BMW · 30 years of the M3 |
| 17 | literal | BMW · seventh-generation M5 |
| 18 | literal | BMW · 2011 135i / N55 |
| 19 | literal | BMW · N54 and N55 applications |
| 20 | literal | BMW · B58 in the 340i and 740i |
| 21 | literal | BMW · fifth-generation M5 / S63 |
| 22 | literal | BMW · M3 CS and M xDrive |
| 57 | literal | Garrett · variable geometry |
| 113 | literal | ZF · adaptive damping |
| 206 | literal | class="ac-flow" |
| 211 | literal | Four-stroke cylinder: |
| 219 | literal | : 1 • ideal torque × |
| 223 | literal | engine family schematic |

### public/account-sync.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 17 | literal | Browser storage is unavailable. Local changes may not be saved. |
| 50 | literal | Checking your account… |
| 77 | literal / Accept | application/json |
| 77 | literal | Content-Type |
| 77 | literal | X-CSRF-Token |
| 79 | literal | The account service is unavailable. Please try again. |
| 80 | literal | Your request could not be completed. |
| 82 | literal | AbortError |
| 82 | literal | The account service took too long to respond. Please try again. |
| 95 | literal | Guest mode · saved in this browser. |
| 101 | literal | Opening your account garage… |
| 109 | literal | Your account changed on another device. Choose which version to keep. |
| 110 | literal | Your changes are waiting to sync. |
| 111 | literal | Your garage is up to date. |
| 114 | literal | Your session ended. Sign in again to sync. |
| 118 | literal | Could not reach your saved garage. |
| 118 | literal | Retry before making account changes. |
| 118 | literal | Your last account copy is available. |
| 127 | literal | Your account changed on another device. Choose which version to keep. |
| 128 | literal | Saving your changes… |
| 132 | literal | Saving your garage… |
| 136 | literal | Saving your latest changes… |
| 136 | literal | Your garage is up to date. |
| 141 | literal | Your garage is up to date. |
| 142 | literal | Your account changed on another device. Review the two versions in Account. |
| 144 | literal | Your session ended. Sign in again to sync. |
| 146 | literal | Changes are saved on this device. Waiting for the account service to reconnect. |
| 151 | literal | Reconnecting to your account… |
| 152 | literal | The account service is unavailable. You can keep exploring and try again. |
| 155 | literal | Please wait for the current request. |
| 156 | literal | Use Sign in with ChatGPT to continue. |
| 164 | literal | Signed out. Your guest garage has been restored. |
| 167 | literal | Sign in first to import your guest garage. |
| 168 | literal | Resolve the sync conflict before importing. |
| 169 | literal | Saving your imported garage… |
| 174 | literal | The account version is now open on this device. |
| 176 | literal | Choose the account version or this device’s version. |

### public/account.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 14 | visible-text | Sign in |
| 15 | literal | Account |
| 15 | literal | Open your account · |
| 15 | literal | Sign in |
| 15 | literal / message | Sign in or create an account |
| 20 | literal | Account needs a container. |
| 23 | dynamic visible-text | A garage that goes with you. |
| 23 | dynamic visible-text | A place for the BMWs you love and everything you learn along the way. |
| 23 | dynamic visible-text | APEX / YOUR ACCOUNT |
| 23 | dynamic visible-text | Built around you |
| 23 | dynamic visible-text | Choose what to bring into your account after signing in. |
| 23 | dynamic visible-text | Completed lessons, XP, and progress stay together. |
| 23 | dynamic visible-text | Everywhere. |
| 23 | dynamic visible-text | Keep exploring as a guest {value1} |
| 23 | dynamic visible-text | Pick up your learning. |
| 23 | dynamic visible-text | Saved BMWs and tuning builds, ready on your next device. |
| 23 | dynamic visible-text | Your collection. |
| 23 | dynamic visible-text | Your curiosity. |
| 23 | dynamic visible-text | Your guest garage is safe. |
| 26 | visible-text | Try again |
| 30 | dynamic visible-text | at home. |
| 30 | dynamic visible-text | Explore the academy first {value4} |
| 30 | dynamic visible-text | Make yourself |
| 30 | dynamic visible-text | ONE ACCOUNT. A WORLD TO EXPLORE. |
| 30 | dynamic visible-text | Sign in with ChatGPT {value2} |
| 30 | dynamic visible-text | Sign in with your ChatGPT account to keep your garage and learning progress together. |
| 30 | dynamic visible-text | Use the account you already have. Your guest garage stays separate until you choose to import it. |
| 32 | dynamic aria-label | Account access |
| 32 | literal | Already part of the garage? |
| 32 | literal | Build your collection. Keep your progress. Follow your curiosity. |
| 32 | dynamic visible-text | Create account |
| 32 | literal | Create an account |
| 32 | literal | Create my account |
| 32 | dynamic visible-text | Email address |
| 32 | literal | First time here? |
| 32 | literal | GOOD TO SEE YOU AGAIN |
| 32 | dynamic visible-text | Password |
| 32 | dynamic visible-text | Show |
| 32 | dynamic aria-label | Show password |
| 32 | dynamic visible-text | Sign in |
| 32 | literal | Sign in |
| 32 | literal | START YOUR NEXT CHAPTER |
| 32 | literal | Use at least 12 characters. A memorable passphrase works well. |
| 32 | literal | Use the password you chose when creating your account. |
| 32 | dynamic placeholder | What should we call you? |
| 32 | dynamic placeholder | you@example.com |
| 32 | literal | Your email is used to sign in. Your guest data is only imported when you choose. |
| 32 | literal | Your garage and next lesson are waiting for you. |
| 32 | dynamic visible-text | Your name |
| 32 | literal | Your session stays signed in on this browser. Sign out when using a shared device. |
| 36 | dynamic visible-text | {value1} saved BMWs · {value2} builds · {value3} completed lessons |
| 36 | dynamic visible-text | Another device saved a different garage. This device’s changes are held until you choose a version. Replacing a version affects favorites, builds, and learning together. |
| 36 | dynamic visible-text | BRING YOUR IDEAS WITH YOU |
| 36 | visible-text | Connected with ChatGPT |
| 36 | visible-text | Edit name |
| 36 | dynamic visible-text | Good to have |
| 36 | dynamic visible-text | Import guest garage {value5} |
| 36 | dynamic visible-text | Lessons complete |
| 36 | dynamic visible-text | Open my garage {value10} |
| 36 | dynamic visible-text | Save this device’s version |
| 36 | dynamic visible-text | Saved BMWs |
| 36 | dynamic visible-text | Sign out {value2} |
| 36 | visible-text | Sign out ↗ |
| 36 | dynamic visible-text | Tuning builds |
| 36 | dynamic visible-text | Two versions. Your choice. |
| 36 | dynamic visible-text | Use account version |
| 36 | dynamic visible-text | What gets imported? |
| 36 | dynamic visible-text | you, |
| 36 | dynamic visible-text | YOUR APEX ACCOUNT |
| 36 | visible-text | Your guest garage is separate. Signing out brings you back to your guest data on this browser. |
| 36 | dynamic visible-text | Your guest garage is still here. |
| 36 | dynamic visible-text | Your name |
| 36 | dynamic aria-label | Your saved account data |
| 50 | literal | form button[type="submit"], [data-account-action="logout"], [data-account-action="cloud"], [data-account-action="local"] |
| 55 | literal | This request could not be completed. Please try again. |
| 59 | dynamic dynamic-template | [data-account-mode="{value1}"][role="tab"] |
| 61 | literal | Hide |
| 61 | literal | Hide password |
| 61 | literal | Show |
| 61 | literal | Show password |
| 68 | dynamic dynamic-template | [data-account-mode="{value1}"][role="tab"] |
| 68 | literal | [role="tab"][data-account-mode] |
| 68 | literal | ArrowLeft |
| 68 | literal | ArrowRight |
| 68 | literal | End |
| 70 | literal | [data-account-auth],[data-account-name-form] |
| 72 | literal | Enter your name. |
| 72 | literal | Your name has been updated. |
| 76 | literal | Enter your name to create an account. |
| 77 | literal | Enter a valid email address. |
| 78 | literal | Enter your password. |
| 78 | literal | Use a password between 12 and 128 characters. |

### public/app.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 24 | literal | [data-model-total],[data-m-total] |
| 34 | literal | noopener noreferrer |
| 42 | literal | #dialogbody h2 |
| 42 | literal | BMW details |
| 50 | literal | ?model= |
| 50 | literal | .machine-bar&gt;div&gt;span |
| 50 | literal | &part= |
| 50 | literal | &view=engine |
| 50 | literal | &lt;/small&gt; |
| 50 | literal | BATTERY ENERGY |
| 50 | literal | DRIVE LAYOUT |
| 50 | literal | Explore electric systems |
| 56 | literal | · &lt;a href=" |
| 56 | literal | " target="_blank" rel="noopener noreferrer"&gt; |
| 56 | literal | &lt;/a&gt; |
| 59 | literal | A verified |
| 59 | literal | photograph is not available. Component explanations remain available. |
| 61 | literal | Loading |
| 68 | dynamic aria-label | View {value2} photograph |
| 69 | literal | Left side |
| 69 | literal | Right side |
| 69 | literal | Straight front |
| 69 | literal | Straight rear |
| 71 | literal | · unavailable |
| 72 | literal | / 6. Reference angles are labeled individually below. |
| 72 | literal | Verified exact angles: |
| 77 | literal | ArrowLeft |
| 77 | literal | ArrowRight |
| 82 | dynamic dynamic-template | translate({value1}px,{value2}px) scale({value3}) |
| 85 | literal | 3D model by |
| 85 | literal | Creator-built exterior, not factory CAD. |
| 85 | dynamic dynamic-template | url("{value1}"),url("{value2}") |
| 86 | literal | ?autostart=1 |
| 88 | literal | Engine-family reference. Exact car, model year or exhaust configuration may differ. |
| 88 | literal / note | No matching original recording has been verified. No generic audio is substituted. |
| 88 | literal | Published by |
| 89 | literal | #recordingplayer iframe |
| 99 | dynamic visible-text | Original creator model |
| 99 | dynamic visible-text | Original photograph and license |
| 103 | literal / status | Choose a BMW from the collection. |
| 103 | literal / audio | Original creator recordings available separately |
| 103 | literal / description | Read selected BMW, factory facts and photograph angle. |
| 103 | literal | Unknown BMW model |
| 115 | literal | translateY(0) |
| 120 | literal | (max-width:1100px) |
| 124 | dynamic dynamic-template | translateY({value1}px) |
| 138 | dynamic aria-label | Learn about {value2} |
| 139 | literal | photographed components |
| 141 | dynamic visible-text | {value1} / COMPONENT GUIDE |
| 141 | dynamic visible-text | {value14}. The displayed adaptation retains the photograph’s stated license. |
| 141 | dynamic visible-text | Photo by {value11} |
| 145 | literal | Enter |
| 145 | literal | Escape |

### public/catalog.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 28 | dynamic dynamic-template | Missing photo reference for {value1}. |
| 38 | literal | No matching, licensed exterior photograph is available. |
| 39 | literal | No verified photograph of the selected model’s engine or powertrain is available. |

### public/collection.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 13 | literal | M SERIES |
| 21 | literal | BMW i |
| 24 | literal | BMW i |
| 26 | literal | Series |
| 33 | literal | 3d |
| 37 | literal | &lt;/option&gt; |
| 46 | literal | 3d |
| 48 | literal | BMW M M cars performance |
| 48 | literal | electric ev |
| 55 | literal | (max-width: 650px) 45vw, (max-width: 1100px) 45vw, 30vw |
| 55 | literal | &lt;/span&gt; |
| 71 | literal | #searchempty h3 |
| 72 | literal | #searchempty p |
| 88 | literal | ?compare= |
| 104 | literal | #detail-save span |
| 113 | literal | (prefers-reduced-motion: reduce) |
| 118 | dynamic dynamic-template | [data-save="{value1}"] |
| 119 | literal | [data-compare],[data-uncompare] |
| 120 | dynamic dynamic-template | [data-compare="{value1}"] |
| 130 | literal | Enter |
| 130 | literal | Escape |
| 144 | literal | #browse3d span |
| 146 | literal | 3d |
| 163 | literal | #dialogbody input |
| 165 | literal | input,select,textarea,[contenteditable=true] |

### public/comparison.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 35 | literal | Nm |
| 71 | literal | M SERIES |
| 76 | dynamic dynamic-template | {value1} kWh {value2} |
| 77 | dynamic dynamic-template | {value1} kWh {value2} |
| 82 | dynamic dynamic-template | {value1} mph |
| 83 | dynamic dynamic-template | {value1} km/h |
| 86 | dynamic dynamic-template | {value1}Mm |
| 103 | literal / name | Power & powertrain |
| 104 | dynamic dynamic-template / secondary | {value1} kW |
| 113 | literal / name | Performance |
| 114 | literal / unit | kW/t |
| 116 | literal / name | 0–100 km/h |
| 117 | dynamic dynamic-template / missing | {value1} s |
| 117 | literal / name | 0–60 mph |
| 118 | literal / name | Top speed |
| 119 | literal / name | Speed limitation / options |
| 121 | literal / name | Size & body |
| 123 | literal / name | Mass |
| 124 | literal / name | Mass convention |
| 125 | literal / name | Length / width / height |
| 126 | literal / name | Wheelbase |
| 128 | literal / name | Specification & sources |
| 131 | literal / name | Factory power / torque |
| 134 | literal / name | Combustion engine torque |
| 151 | literal | Model, chassis or engine |
| 160 | literal | {count} models found |
| 160 | literal | Already selected |
| 160 | literal | Browse all {count} models |
| 160 | literal | No BMWs match your search. Try a model such as M3, a chassis such as F10, or an engine such as N55. |
| 160 | literal | Popular picks first |
| 165 | literal | BUILD YOUR SHORTLIST |
| 165 | literal | Close model picker |
| 165 | literal | Filter models |
| 165 | literal | Find a replacement. |
| 165 | literal | REFINE YOUR SHORTLIST |
| 165 | literal | Search M3, F10, N55… |
| 165 | literal | Search models to compare |
| 165 | literal | Which BMW is next? |
| 169 | literal / subtitle | Same engine. Different character. |
| 170 | literal / title | Three eras of M5 |
| 170 | literal / subtitle | V10, V8 and a new generation. |
| 171 | literal / subtitle | Two approaches to the everyday. |
| 173 | literal | CURATED COMPARISONS |
| 173 | literal | Start with a good rivalry. |
| 180 | dynamic dynamic-template | class="cmp-missing" aria-label="{value1}" |
| 180 | literal | Explore further |
| 180 | literal | Factory specifications for your selected BMWs |
| 180 | literal | Model specification comparison |
| 180 | literal | Swipe to compare |
| 180 | literal | The details that make the difference. |
| 184 | literal | {count} / 3 selected |
| 184 | literal | A note on these figures |
| 184 | literal | Add a second BMW to see what sets them apart. |
| 184 | literal | class="is-filled" |
| 184 | literal | Differences only |
| 184 | literal | Find what sets them apart. Compare up to three BMWs, from their engines to the finer details. |
| 184 | dynamic visible-text | hp · lb-ft |
| 184 | literal | Photos are generation references and may show a different year, trim or market. |
| 184 | dynamic visible-text | PS · Nm |
| 184 | literal | Share |
| 184 | literal | Side by side. |
| 184 | literal | THE COMPARISON GARAGE |
| 184 | literal | These listed specifications match. Turn off Differences only to see every figure. |
| 184 | literal | Your shortlist. |
| 192 | literal | dialog .comparison-v2 |
| 206 | literal | (prefers-reduced-motion: reduce) |
| 211 | literal | Clipboard unavailable |
| 222 | literal | dialog .comparison-v2 |
| 236 | dynamic dynamic-template | [data-cmp-pick="{value1}"] |
| 241 | dynamic dynamic-template | [data-cmp-pick="{value1}"] |
| 246 | dynamic dynamic-template | [data-cmp-units="{value1}"] |
| 247 | literal | [data-cmp-share],[data-cmp-copy] |
| 248 | dynamic dynamic-template | [data-cmp-filter="{value1}"] |
| 261 | dynamic dynamic-template | [data-cmp-pick="{value1}"] |
| 261 | literal | Escape |
| 262 | literal | [data-cmp-choose]:not(:disabled) |
| 262 | literal | ArrowDown |

### public/data.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 4 | literal / difficulty | Advanced |
| 4 | literal / upgrade | Calibration, airflow and thermal management must be considered together. |
| 4 | literal / purpose | Converts fuel energy into torque at the crankshaft. |
| 4 | literal / location | Longitudinally mounted in the front engine bay. |
| 4 | literal / factory | N55B30M0 · 2,979 cm³ · 6 cylinders · 24 valves · 300 hp. |
| 4 | literal / symptoms | Rough running, unusual noise or reduced performance can have many causes. Read fault codes and test before replacing parts. |
| 5 | literal / symptoms | A clogged filter can restrict airflow. Leaks after air measurement can contribute to running problems. |
| 5 | literal / upgrade | A compatible intake can change induction sound. More noise is not evidence of more power. |
| 5 | literal / name | Air intake / air filter |
| 5 | literal / factory | Filtered intake feeding a single twin-scroll turbocharger. |
| 5 | literal / difficulty | Introductory |
| 5 | literal / how | Outside air passes through a filter before entering the compressor. The factory system balances filtration, restriction, noise and packaging. |
| 5 | literal / purpose | Supplies filtered air to the engine. |
| 5 | literal / location | Upstream of the turbocharger compressor. |
| 6 | literal / upgrade | A larger compatible turbo needs matching control, fueling, cooling and calibration. More flow capacity can increase lag. |
| 6 | literal / how | Exhaust spins a turbine connected to a compressor by a shaft. Two exhaust passages feed ONE turbine. “Twin-scroll” does not mean two turbochargers. A wastegate helps control turbine drive. |
| 6 | literal / difficulty | Expert |
| 6 | literal / symptoms | Low boost may be caused by leaks or control faults, not only the turbo. Smoke and unusual noise also need diagnosis. |
| 6 | literal / factory | ONE single twin-scroll turbocharger. Boost pressure is not specified by the cited factory sheet. |
| 6 | literal / name | Twin-scroll turbocharger |
| 6 | literal / purpose | Uses exhaust energy to compress the intake air. |
| 7 | literal / symptoms | A leak can cause underboost. Heat soak may reduce repeatable performance without producing a fault code. |
| 7 | literal / factory | Air-to-air charge cooling in the N55 intake path. |
| 7 | literal / name | Charge-air intercooler |
| 7 | literal / how | Compressing air heats it. Heat moves from the charge air through the cooler to outside air. Cooler charge air can reduce thermal stress and help preserve performance during repeated load. |
| 7 | literal / location | In the front airflow path, between compressor and intake. |
| 7 | literal / difficulty | Intermediate |
| 7 | literal / purpose | Removes heat from compressed intake air. |
| 8 | literal / upgrade | A compatible replacement can improve durability. Pipe material by itself does not guarantee a power increase. |
| 8 | literal / purpose | Carries compressed air toward the intake manifold. |
| 8 | literal / name | Charge pipe |
| 8 | literal / difficulty | Intermediate |
| 8 | literal / location | Pressurized intake route downstream of the charge-air cooler. |
| 8 | literal / how | Sealed pipework transports boost pressure. Couplings and sensors must remain correctly connected. A crack allows air to escape before it reaches the cylinders. |
| 8 | literal / symptoms | Underboost, hissing, loss of power or a disconnected coupling. Confirm with inspection and an appropriate leak test. |
| 9 | literal / upgrade | A compatible emissions-compliant cat-back changes sound. Do not assume it produces a particular power gain. |
| 9 | literal / name | Exhaust system |
| 9 | literal / factory | Factory catalyst and silenced exhaust. Geometry here is schematic. |
| 9 | literal / location | From the engine and turbocharger to the rear outlets. |
| 9 | literal / difficulty | Intermediate |
| 9 | literal / symptoms | Leaks, rattles, emissions faults or unusual noise. A catalyst problem should be diagnosed before parts are changed. |
| 9 | literal / purpose | Routes combustion gases, treats emissions and controls sound. |
| 9 | literal / how | The catalyst treats pollutants. Pipework and silencers manage pressure losses and noise. Exhaust restriction interacts with turbocharger operation. |
| 10 | literal / upgrade | Address faults first. More thermal capacity is useful only when it solves the actual heat-management problem. |
| 10 | literal / difficulty | Advanced |
| 10 | literal / purpose | Controls engine temperature. |
| 10 | literal / how | Coolant absorbs engine heat. The pump circulates it and the radiator transfers heat to ambient air. Temperature control is separate from charge-air cooling. |
| 10 | literal / location | Coolant circuit linking the engine, pump and front radiator. |
| 10 | literal / name | Engine cooling system |
| 10 | literal / symptoms | Overheating, coolant loss or abnormal temperature requires diagnosis. Stop running an overheated engine. |
| 11 | literal / factory | 8HP45 · eight forward gears · 3.077 final-drive ratio in the cited 535i specification. |
| 11 | literal / name | 8HP45 automatic transmission |
| 11 | literal / how | A torque converter and internal gearsets transfer engine torque through eight forward ratios. The output shaft sends torque to the propeller shaft. |
| 11 | literal / difficulty | Advanced |
| 11 | literal / location | Immediately behind the engine, along the center tunnel. |
| 11 | literal / symptoms | Slipping, harsh shifts or delayed engagement have multiple possible causes. Fluid condition, faults and adaptations need assessment. |
| 11 | literal / upgrade | Torque capacity, heat and calibration matter. More engine torque is not automatically safe for the transmission. |
| 11 | literal / purpose | Uses different gear ratios to match torque and road speed. |
| 12 | literal / difficulty | Advanced |
| 12 | literal / location | Center tunnel to rear differential and rear half-shafts. |
| 12 | literal / upgrade | Differential and mount choices change traction and noise. Exact compatibility must be checked. |
| 12 | literal / name | Propeller shaft & differential |
| 12 | literal / factory | Rear-wheel-drive layout. This lab does not depict the xDrive front drivetrain. |
| 12 | literal / how | The propeller shaft drives the rear differential. The differential allows different rear-wheel speeds in corners, with half-shafts carrying torque to each wheel. |
| 12 | literal / purpose | Transfers gearbox output to the driven rear wheels. |
| 12 | literal / symptoms | Vibration, clunks or whining need inspection of mounts, joints and bearings. |
| 13 | literal / location | Between wheel carriers and the body at all four corners. |
| 13 | literal / purpose | Controls wheel movement and balances comfort, grip and stability. |
| 13 | literal / difficulty | Intermediate |
| 13 | literal / upgrade | Matched dampers, suitable tires and alignment can improve control without changing engine output. |
| 13 | literal / how | Springs support weight and dampers resist motion. Links constrain wheel position. Alignment and tire contact are central to handling. |
| 13 | literal / system | Suspension |
| 13 | literal / name | Suspension assemblies |
| 13 | literal / symptoms | Uneven tire wear, knocking or poor control may result from worn joints, damping, tires or alignment. |
| 14 | literal / upgrade | Appropriate pads, sound fluid and tires come first. Bigger brakes do not guarantee shorter single-stop distances. |
| 14 | literal / location | At the wheel hubs. |
| 14 | literal / purpose | Convert vehicle kinetic energy into heat to slow the car. |
| 14 | literal / how | Hydraulic pressure forces caliper pads against discs. Ventilation helps manage disc temperature. Tires determine how much braking force reaches the road. |
| 14 | literal / difficulty | Intermediate |
| 14 | literal / symptoms | Pulling, vibration, a soft pedal or grinding needs inspection. Brake fade can indicate excessive temperature. |
| 14 | literal / name | Ventilated disc brakes |
| 15 | literal / how | A rack-and-pinion mechanism translates steering input into lateral rack movement. Tie rods transmit movement to the wheel carriers. |
| 15 | literal / difficulty | Advanced |
| 15 | literal / purpose | Changes the angle of the front wheels. |
| 15 | literal / location | Front axle area, connecting to the steered wheel carriers. |
| 15 | literal / upgrade | Maintain joints and alignment before changing steering hardware. |
| 15 | literal / symptoms | Play, knocks or inconsistent assistance require diagnosis and alignment checks. |
| 15 | literal / factory | Rack-and-pinion · 17.1 steering ratio in the cited 535i specification. Optional systems vary. |
| 15 | literal / system | Steering |
| 15 | literal / name | Steering rack |
| 16 | literal / symptoms | Charging warnings or a weak battery can involve the alternator, battery, belt or wiring. Test the charging system. |
| 16 | literal / factory | Engine-driven charging system. Exact amperage is not verified in this lab. |
| 16 | literal / purpose | Generates electricity while the engine runs. |
| 16 | literal / difficulty | Intermediate |
| 16 | literal / how | The engine drives a generator through a belt. A regulator manages output so electrical consumers and the battery can be supplied. |
| 17 | literal / name | 12-volt battery |
| 17 | literal / factory | 12-volt electrical system. Exact capacity and battery type require vehicle-specific verification. |
| 17 | literal / upgrade | Correct sizing, specification and replacement registration matter. |
| 17 | literal / difficulty | Intermediate |
| 17 | literal / symptoms | Slow cranking or intermittent electrical faults may involve charge state, battery health or parasitic draw. |
| 17 | literal / how | Stored chemical energy powers the starter and electronics. The charging system replenishes it. Battery condition affects low-voltage behavior. |
| 17 | literal / purpose | Stores electrical energy and supports engine starting. |
| 18 | literal / symptoms | A fault code describes a detected condition, not necessarily a failed control unit. |
| 18 | literal / upgrade | Calibration must match fuel, hardware and engine condition. Greater demand can reduce thermal or mechanical margins. |
| 18 | literal / purpose | Coordinates fuel, ignition, valve control and boost control. |
| 18 | literal / name | DME / engine control unit |
| 18 | literal / difficulty | Expert |
| 18 | literal / factory | MEVD 17.2.6 engine management in the MY2015 535i technical sheet. |
| 19 | literal / how | A fuel pump supplies high pressure. The DME commands injectors to meter fuel into each cylinder. Increasing air demand requires sufficient fuel delivery. |
| 19 | literal / name | Direct fuel injection |
| 19 | literal / difficulty | Expert |
| 19 | literal / upgrade | Fuel capacity and calibration must support any increased airflow. Do not choose parts by claimed peak horsepower alone. |
| 19 | literal / factory | High-precision direct injection. Plumbing and injector geometry are schematic. |
| 19 | literal / location | High-pressure supply and injectors feeding the cylinders. |
| 19 | literal / purpose | Meters fuel directly into the combustion chambers. |
| 20 | literal / how | Combustion pressure pushes pistons. Connecting rods transmit force to the crankshaft. Sealing, lubrication and heat control are essential. |
| 20 | literal / symptoms | Compression loss, oil consumption or unusual internal noise requires measured diagnosis. |
| 20 | literal / difficulty | Expert |
| 20 | literal / location | Inside the six cylinders of the engine block. |
| 20 | literal / upgrade | Internal changes require precision machining, assembly and calibration. This lab does not certify build limits. |
| 20 | literal / name | Pistons & connecting rods |
| 20 | literal / factory | Six cylinders · 84 mm bore · 89.6 mm stroke · 10.2:1 compression ratio. |
| 20 | literal / purpose | Translate cylinder pressure into crankshaft torque. |
| 21 | literal / symptoms | Bearing-related noises or oil-pressure concerns need immediate professional assessment. |
| 21 | literal / purpose | Converts reciprocating piston motion into rotation. |
| 21 | literal / upgrade | Engine-internal work requires measured clearances and a complete build plan. |
| 21 | literal / difficulty | Expert |
| 21 | literal / location | Lower engine block, below the pistons. |
| 21 | literal / how | Offset crank journals receive force from the connecting rods. Bearings support the shaft, and lubrication reduces friction and wear. |
| 24 | literal / why | Flow, filtration and inlet-air temperature matter more than volume alone. |
| 24 | literal / effect | More audible induction. No verified horsepower gain. |
| 24 | literal / name | Performance intake |
| 25 | literal / effect | More pronounced exhaust character. Factory catalyst remains. |
| 25 | literal / name | Sport cat-back exhaust |
| 25 | literal / why | This scenario changes silencers, not emissions equipment. A dyno is needed to quantify output. |
| 26 | literal / why | A cooler can help maintain performance under repeated load. It does not create a fixed horsepower bonus. |
| 26 | literal / name | Larger charge-air cooler |
| 26 | literal / effect | More thermal headroom in the teaching model. |
| 27 | literal / why | A pressure-tight replacement can address a weak pipe. Material alone does not increase horsepower. |
| 27 | literal / effect | Durability-focused replacement in the teaching model. |
| 27 | literal / name | Reinforced charge pipe |
| 28 | literal / why | A healthy factory cooling system is the baseline for a performance build. This is service, not a larger radiator installation. |
| 28 | literal / name | Cooling service & inspection |
| 28 | literal / effect | Resolves maintenance needs in the scenario. |
| 29 | literal / name | Conservative calibration |
| 29 | literal / why | Fuel quality, calibration and engine condition determine real results. The lab does not invent a dyno figure. |
| 30 | literal / effect | Higher airflow capacity with extra support requirements. |
| 30 | literal / name | Higher-flow turbo concept |
| 30 | literal / why | Needs matching F10 hardware, wastegate controls, fuel delivery, cooling and professional calibration. Exact kit compatibility is NOT verified. |
| 31 | literal / name | Fuel-delivery support concept |
| 31 | literal / why | Pump and injector suitability must be verified by the tuner. Capacity alone does not add horsepower. |
| 31 | literal / effect | Supports demand when correctly specified. |
| 32 | literal / effect | Better control in the handling scenario. |
| 32 | literal / why | Correct matching and alignment matter. Engine output remains unchanged. |
| 32 | literal / name | Matched dampers & alignment |
| 33 | literal / why | Choose pads for the actual use and retain road-suitable behavior. This is not a larger brake-kit installation. |
| 33 | literal / name | Pads, fluid & brake inspection |
| 33 | literal / effect | Service and temperature suitability in the scenario. |
| 36 | literal / title | Car basics |
| 36 | literal / question | Find the component that generates engine torque. |
| 37 | literal / title | Engine basics |
| 37 | literal / question | Find the N55’s single turbocharger. |
| 37 | literal / lesson | The N55 is an inline-six, not a V6. It uses ONE twin-scroll turbocharger. Twin-scroll means two exhaust passages feeding one turbine, not a pair of turbochargers. |
| 38 | literal / lesson | Air travels through the intake, turbo compressor, charge-air cooler and intake manifold. Compression heats the air. Fuel is injected directly into the cylinders, and the DME coordinates the combustion process. |
| 38 | literal / question | Find the component that cools compressed intake air. |
| 38 | literal / title | Intake & fuel |
| 39 | literal / question | Find the engine coolant radiator. |
| 40 | literal / question | Find the assembly immediately behind the engine that changes gear ratios. |
| 40 | literal / lesson | The selected 535i has an 8HP45 eight-speed automatic. Gear ratios trade road speed for wheel torque. The transmission sends rotation through the propeller shaft and rear differential to the rear wheels. |
| 41 | literal / question | Find a spring and damper assembly. |
| 41 | literal / title | Suspension |
| 42 | literal / question | Find a brake disc. |
| 43 | literal / question | Find the alternator. |
| 43 | literal / lesson | The battery stores electrical energy. The alternator generates electricity while the engine runs. A flat battery may indicate battery age, charging trouble or an unwanted electrical draw. |
| 44 | literal / title | Advanced engine internals |
| 44 | literal / question | Find the pistons inside the engine. |
| 44 | literal / lesson | Pressure pushes each piston. A connecting rod transfers force to the crankshaft. The N55 has six cylinders in one line. The internal animation here shows the relationship, not exact crank phasing or clearances. |
| 45 | literal / title | Diagnostics |
| 45 | literal / question | Find the charge pipe, one possible source of a boost leak. |
| 45 | literal / lesson | Loss of boost can come from a leak, control problem or turbo fault. First identify conditions, read faults and inspect relevant connections. A code alone is not a replacement instruction. |
| 46 | literal / question | Find the control unit whose calibration coordinates engine demand. |
| 46 | literal / title | Tuning fundamentals |
| 49 | literal / brief | Prepare an F10 535i for repeatable performance. Prioritize health, charge-air cooling and a pressure-tight intake path. |
| 49 | literal / title | Reliable performance |
| 50 | literal / title | A better daily driver |
| 50 | literal / brief | Build a healthy, predictable daily driver. Start with cooling service and brake condition, and avoid a higher-flow turbo. |
| 51 | literal / title | Control before power |
| 51 | literal / brief | Improve handling and braking without modifying the engine. Choose matched damping/alignment and brake service. |
| 52 | literal / brief | A car loses power under load and has a hissing noise. Inspect the charge-air path before blaming the turbo. |
| 52 | literal / title | The missing boost |

### public/dropdowns.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 8 | literal | (max-width:760px), (pointer:coarse) |
| 10 | visible-text | ↑ ↓ navigate · Enter select |
| 10 | aria-label | Close options |
| 10 | placeholder | Find an option… |
| 10 | visible-text | No matching options. Try a shorter search. |
| 10 | aria-label | Search options |
| 12 | literal | Choose an option |
| 15 | literal | Choose an option |
| 16 | literal | Choose an option |
| 29 | literal | select:not([multiple]):not([data-native-select]) |
| 40 | literal | ArrowDown |
| 40 | literal | ArrowUp |
| 40 | literal | End |
| 42 | literal | Escape |
| 62 | literal | .asp-heading&gt;span |
| 71 | literal | :popover-open |
| 84 | literal | .asp-footer&gt;span |
| 87 | literal | ArrowDown |
| 87 | literal | End |
| 91 | literal | ArrowDown |
| 91 | literal | ArrowUp |
| 91 | literal | End |
| 91 | literal | Enter |
| 91 | literal | Escape |
| 91 | literal | Tab |
| 92 | literal | .asp-heading button |
| 94 | literal | Enter |
| 94 | literal | Escape |
| 94 | literal | Tab |
| 100 | literal | select,.apex-select |

### public/editorial-credits.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | literal / author | Alexander-93 |
| 1 | literal / author | Amir Hosseini |
| 1 | literal / label | BMW i7 xDrive60 1X7A7474.jpg |
| 1 | literal / label | BMW M4 at sunset |
| 1 | literal / author | Jaredtown |
| 1 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 1 | literal / license | Unsplash License |

### public/electric-model-variants.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | literal | Battery-electric drive with a high-voltage battery, electric motor and fixed-ratio drive. Exact equipment and battery capacity vary by market and model year. |
| 3 | literal / title | Electric drive |
| 3 | literal / name | Overview |
| 4 | literal / title | High-voltage battery |
| 4 | literal / text | The traction battery stores electrical energy for the electric drive. Usable capacity depends on the selected specification and is listed separately from gross capacity where BMW publishes both. |
| 5 | literal / title | Recover energy while slowing down |
| 5 | literal / text | The drive motor can act as a generator during deceleration. The friction brakes remain essential, and energy recovery depends on operating conditions. |
| 6 | literal / text | A fixed-ratio transmission transfers electric-motor output to the driven wheels. The BMW drive configuration shown is specific to the model and market listed. |
| 6 | literal / title | Fixed-ratio drive |
| 6 | literal / name | Gearing |
| 11 | literal / generation | BMW i / G26 |
| 11 | literal / name | BMW i4 eDrive35 |
| 11 | literal / title | i4 eDrive35 |
| 12 | literal / subtitle | Single rear electric motor and fixed-ratio drive. |
| 13 | literal / shortLayout | ELECTRIC / REAR-WHEEL DRIVE |
| 14 | literal / induction | Electric drive |
| 14 | literal / torqueUnit | Nm |
| 15 | literal / market | 2024 BMW i4 update (German-market figures) |
| 18 | literal / photoNote | G26 i4 body-style reference. This photograph does not verify the eDrive35 trim, battery or market. |
| 21 | literal / generation | BMW i / G26 |
| 21 | literal / name | BMW i4 xDrive40 |
| 21 | literal / title | i4 xDrive40 |
| 22 | literal / subtitle | Dual-motor all-wheel drive with a 295 kW system output and 600 Nm peak torque. |
| 23 | literal / shortLayout | ELECTRIC / ALL-WHEEL DRIVE |
| 24 | literal / induction | Electric drive |
| 24 | literal / torqueUnit | Nm |
| 25 | literal / market | 2024 BMW i4 update (German-market figures) |
| 28 | literal / photoNote | G26 i4 body-style reference. This photograph does not verify the xDrive40 trim, battery or market. |
| 31 | literal / generation | BMW i / U11 |
| 31 | literal / name | BMW iX1 eDrive20 |
| 31 | literal / title | iX1 eDrive20 |
| 32 | literal / subtitle | Single front electric motor, front-wheel drive and a 64.7 kWh usable battery. |
| 33 | literal / shortLayout | ELECTRIC / FRONT-WHEEL DRIVE |
| 34 | literal / induction | 64.7 kWh usable |
| 34 | literal / torqueUnit | Nm |
| 35 | literal / market | 2023 BMW iX1 eDrive20 (Slovakia) |
| 41 | literal / generation | BMW i / U10 |
| 41 | literal / name | BMW iX2 eDrive20 |
| 41 | literal / title | iX2 eDrive20 |
| 42 | literal / subtitle | Single front electric motor, front-wheel drive and a 64.78 kWh usable battery. |
| 43 | literal / shortLayout | ELECTRIC / FRONT-WHEEL DRIVE |
| 44 | literal / induction | 64.78 kWh usable |
| 44 | literal / torqueUnit | Nm |
| 45 | literal / market | 2024 BMW iX2 eDrive20 (German-market figures) |

### public/electric.html

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | visible-text | APEX — Electric BMWs |
| 1 | meta-content | Explore BMW electric cars and SUVs, model photographs, factory specifications and electric powertrain explanations. |
| 1 | meta-content | width=device-width,initial-scale=1 |
| 2 | visible-text | English |
| 2 | aria-label | Switch color theme |
| 3 | visible-text | 200+ hp |
| 3 | visible-text | 300+ hp |
| 3 | visible-text | 400+ hp |
| 3 | visible-text | 500+ hp |
| 3 | visible-text | 600+ hp |
| 3 | visible-text | All engines |
| 3 | visible-text | All source years |
| 3 | visible-text | APEX is not affiliated with BMW. Original recordings identify their source and note model or exhaust differences. 3D exteriors are creator models, not factory CAD or verified mechanical internals. |
| 3 | visible-text | BMW / ELECTRIC |
| 3 | visible-text | Chassis / generation |
| 3 | visible-text | Engine family |
| 6 | alt | Selected BMW exterior |
| 8 | alt | Selected engine family |
| 9 | visible-text | ELECTRIC DRIVE |
| 9 | visible-text | Explore the powertrain |
| 10 | visible-text | ELECTRIC SYSTEMS |
| 14 | visible-text | BATTERY / GROSS |
| 14 | visible-text | DRIVE LAYOUT |
| 15 | visible-text | Original |
| 15 | visible-text | Original creator recordings contain real car audio. Model and exhaust differences are noted above. |
| 15 | visible-text | recordings. |
| 17 | visible-text | Choose up to 3 |

### public/engine-lab.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 7 | literal / area | Inside the V, above the crankcase |
| 7 | literal / detail | The F10 M5 places both turbochargers between the cylinder banks. Short inboard exhaust paths help response. Wheel speeds and housing shapes here are illustrative. |
| 7 | literal / tags | turbo boost compressor turbine hot v twinpower |
| 8 | literal / tags | engine cylinder crankcase 90 degree v8 s63 s63tu s63tü |
| 8 | literal / text | The block locates the cylinders, supports the crankshaft and carries coolant and oil passages. |
| 8 | literal / area | The central structure, with two banks of four cylinders |
| 9 | literal / tags | combustion four stroke piston rings internals |
| 9 | literal / name | Eight pistons |
| 9 | literal / text | Expanding combustion gas pushes the pistons down their bores. Each piston completes intake, compression, power and exhaust strokes. |
| 9 | literal / area | One inside each cylinder |
| 10 | literal / area | Between each piston and a crankshaft journal |
| 10 | literal / name | Connecting rods |
| 10 | literal / tags | conrod connecting rod internals bearing |
| 10 | literal / text | The rods transfer force between pistons and crankshaft while their angle changes during rotation. |
| 11 | literal / detail | A V8 crankshaft includes journals, counterweights and oil drillings. The exposed shaft illustrates the mechanism, without reproducing the production crankshaft or balance design. |
| 11 | literal / tags | crank torque output crossplane bearing |
| 11 | literal / area | Low in the block, along the engine centreline |
| 11 | literal / text | Offset journals turn the pistons’ reciprocating motion into rotating output. |
| 12 | literal / area | Above the two cylinder banks |
| 12 | literal / tags | cylinder head combustion spark plug ports |
| 12 | literal / name | Cylinder heads |
| 12 | literal / detail | In this hot-V arrangement the exhaust exits toward the centre and intake air enters from the outside. Transparent mode helps reveal the simplified internal arrangement. |
| 12 | literal / text | The heads form the tops of the combustion chambers and contain ports, valves, spark plugs and injectors. |
| 13 | literal / tags | cam dohc double vanos valve timing |
| 13 | literal / name | Camshafts |
| 13 | literal / text | Rotating cam lobes operate the valve mechanisms. The four-stroke cycle requires one camshaft revolution for every two crankshaft revolutions. |
| 13 | literal / area | Two over each cylinder bank |
| 14 | literal / area | In the cylinder heads, above each combustion chamber |
| 14 | literal / text | Intake valves admit air and exhaust valves release spent gas. VALVETRONIC varies intake valve lift to help control engine load. |
| 14 | literal / detail | The model shows four valves per cylinder and exaggerated valve movement. It does not reproduce the eccentric shaft, intermediate levers or a calibrated valve event schedule. |
| 14 | literal / tags | valvetronic valve lift intake exhaust poppet |
| 15 | literal / name | Cross-bank exhaust manifold |
| 15 | literal / tags | exhaust manifold hot v crossbank crossover scroll gas |
| 15 | literal / area | Inboard of the heads, inside the V |
| 15 | literal / text | The manifold routes exhaust pulses from both cylinder banks to the twin-scroll turbines. |
| 16 | literal / tags | air filter intake boost charge pipe throttle |
| 16 | literal / area | Around the outside of the banks and into the compressors |
| 16 | literal / text | Filtered air enters the compressors, passes through charge-air coolers and then travels to the intake ports. |
| 17 | literal / name | Air-to-liquid charge coolers |
| 17 | literal / text | Compression heats the air. A liquid-cooled heat exchanger removes some of that heat before the air enters the engine. |
| 17 | literal / area | In the compressed-air path before the intake ports |
| 17 | literal / tags | intercooler charge air water liquid cooler heat exchanger |
| 17 | literal / detail | The F10 M5 uses air-to-liquid charge cooling. This model separates the cooler cores for clarity and draws a conceptual coolant circuit, without reproducing the actual hose network. |
| 18 | literal / name | Direct fuel injection |
| 18 | literal / tags | fuel injector direct injection petrol gasoline rail high precision |
| 18 | literal / text | High-pressure injectors spray fuel directly into the cylinders, where the air and fuel mixture is ignited by spark plugs. |
| 19 | literal / area | Around the block, heads, turbos and heat exchangers |
| 19 | literal / text | Circulating coolant carries heat to heat exchangers, where it can be released to the air. |
| 19 | literal / tags | coolant radiator water pump thermostat heat temperature |
| 19 | literal / name | Cooling circuit |
| 19 | literal / detail | Real engines use multiple branches and controlled thermal circuits. The teal routes are conceptual and intentionally omit the exact F10 M5 plumbing and control strategy. |
| 20 | literal / text | A pump draws oil from the sump and supplies loaded surfaces, including crank bearings, cams and turbo bearings. |
| 20 | literal / tags | oil lubrication sump wet pump bearing filter |
| 20 | literal / name | Oil supply & sump |
| 20 | literal / detail | The F10 M5 uses wet-sump lubrication adapted for high lateral loads. The amber paths show the principle of oil supply and return, not the engine’s production gallery layout. |
| 21 | literal / area | At the front of the engine |
| 21 | literal / detail | The displayed chain loops and sprockets are a schematic of the drive relationship. They do not show the production chain path, tensioners or workshop timing marks. |
| 21 | literal / text | The timing drive maintains the relationship between crankshaft and camshafts so the valves and pistons move in sequence. |
| 21 | literal / tags | timing chain sprocket front pulley |
| 21 | literal / name | Timing drive |
| 22 | literal / area | At the rear of the crankshaft, facing the transmission |
| 22 | literal / tags | flywheel transmission gearbox dct clutch output |
| 22 | literal / name | Output flywheel |
| 22 | literal / text | The engine’s rotating output passes to the transmission through its coupling assembly. |
| 22 | literal / detail | The rear disc marks the engine-to-transmission interface. Its geometry is symbolic and does not reproduce an M DCT clutch or flywheel assembly. |
| 37 | literal / text | Air: filter → compressor → air-to-liquid charge cooler → outer intake ports. |
| 38 | literal / text | Exhaust: inner exhaust ports → cross-bank manifold → twin-scroll turbines → exhaust outlet. |
| 39 | literal / text | Cooling: heat exchanger → engine and turbo cooling branches → heat exchanger. Conceptual circuit. |
| 40 | literal / text | Lubrication: sump and pump → crank bearings, cams and turbo bearings → return to sump. |
| 41 | literal / text | Fuel: supply → high-pressure rails → direct injectors → combustion chambers. |
| 47 | literal | mountEngineLab requires a DOM element. |
| 49 | literal | (prefers-reduced-motion: reduce) |
| 56 | dynamic dynamic-template | engine-lab-{value1} |
| 60 | dynamic visible-text | EDUCATIONAL 3D MODEL |
| 60 | dynamic visible-text | ENGINEERING, REVEALED |
| 60 | dynamic visible-text | F10 M5 · 90° V8 · hot-V twin turbo |
| 60 | dynamic visible-text | Inside the |
| 62 | dynamic aria-label | Engine view controls |
| 63 | dynamic visible-text | Animate internals |
| 63 | dynamic visible-text | Explode view |
| 63 | dynamic visible-text | Reset view |
| 63 | dynamic visible-text | X-ray |
| 65 | dynamic visible-text | Motion speed |
| 65 | dynamic aria-label | Slowed educational animation speed |
| 68 | dynamic visible-text | 3D rendering is unavailable on this device. Explore every component and its connections using the list and details below. |
| 68 | dynamic visible-text | 90° V8 / 8 CYLINDERS |
| 68 | dynamic visible-text | STARTING VIEWER |
| 69 | dynamic aria-label | Component information |
| 69 | dynamic visible-text | COMPONENT INSPECTOR |
| 69 | dynamic visible-text | CONNECTED TO |
| 69 | dynamic visible-text | Engineering notes |
| 69 | dynamic visible-text | Zoom to component ↗ |
| 70 | dynamic visible-text | Cooling circuit |
| 70 | dynamic visible-text | Fuel injection |
| 70 | dynamic visible-text | Intake air |
| 70 | dynamic visible-text | Lubrication circuit |
| 70 | dynamic visible-text | No flow overlay |
| 70 | dynamic visible-text | Select a flow to follow its path. All routes are conceptual. |
| 70 | dynamic aria-label | Show an educational fluid flow path |
| 70 | dynamic visible-text | Trace a system |
| 71 | dynamic aria-label | Engine components |
| 71 | dynamic visible-text | Find a component |
| 71 | dynamic visible-text | No matching component. Try a part name or system. |
| 71 | dynamic placeholder | Try “turbo”, “valves” or “oil”… |
| 72 | dynamic visible-text | Architecture source: BMW PressClub ↗ |
| 72 | dynamic visible-text | Slowed motion · illustrative valve timing and firing sequence |
| 89 | dynamic dynamic-template | Inspect {value1} |
| 120 | literal | .el-technical p |
| 122 | literal | .el-model-specific p |
| 123 | literal | .el-model-specific a |
| 124 | literal | .el-connections &gt; div |
| 130 | dynamic dynamic-template | {value1} selected. {value2} connected components. |
| 150 | dynamic dynamic-template | [data-action="{value1}"] |
| 151 | dynamic dynamic-template | #{value1}-flow |
| 151 | dynamic dynamic-template | #{value1}-speed |
| 151 | literal | Animate internals |
| 154 | literal | Select a flow to follow its path. All routes are conceptual. |
| 155 | dynamic dynamic-template | #{value1}-search |
| 166 | dynamic dynamic-template | {value1} component{value2} |
| 188 | dynamic dynamic-template | [data-action="{value1}"] |
| 191 | literal | Animate internals |
| 191 | literal | Pause internals |
| 195 | dynamic dynamic-template | #{value1}-flow |
| 196 | literal | Exploded view separates the components. Choose a flow to reassemble and trace its system. |
| 203 | dynamic dynamic-template | #{value1}-search |
| 204 | dynamic dynamic-template | #{value1}-search |
| 204 | literal | Enter |
| 205 | dynamic dynamic-template | #{value1}-speed |
| 206 | dynamic dynamic-template | #{value1}-flow |
| 212 | literal | Select a flow to follow its path. All routes are conceptual. |
| 218 | dynamic dynamic-template | [data-action="{value1}"] |
| 220 | dynamic dynamic-template | #{value1}-speed |
| 381 | literal | ArrowDown |
| 381 | literal | ArrowLeft |
| 381 | literal | ArrowRight |
| 381 | literal | ArrowUp |
| 389 | literal | 3D CONTEXT LOST |
| 390 | literal | LIVE 3D |
| 391 | literal | IntersectionObserver |
| 392 | literal / rootMargin | 120px |
| 447 | literal | Engine lab 3D unavailable: |
| 449 | literal | COMPONENT GUIDE |

### public/exact-views.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | literal / caption | 2014 F15 X5 xDrive35i, centered front face. |
| 1 | literal / author | Alexander Migl |
| 1 | literal / label | BMW 3-Series (52823659926).jpg |
| 1 | literal / label | BMW F90 M5 British Racing Green (1).jpg |
| 1 | literal / label | BMW M3 Competition (G80) IMG 3964.jpg |
| 1 | literal / label | BMW M3 SMG Convertible - Flickr - The Car Spy (20).jpg |
| 1 | literal / label | Bmw m3 v8 e92 seite.jpg |
| 1 | literal / label | BMW M5 E60 side.JPG |
| 1 | literal / label | BMW M5 F90 without licence plate (rear).jpg |
| 1 | literal / author | Damian B Oh |
| 1 | literal / author | Elveres |
| 1 | literal / label | Front View - 2014 BMW X5 xDrive 35i (15020423346).jpg |
| 1 | literal / author | JanST |
| 1 | literal / author | Jason Lawrence from New York |
| 1 | literal / angle | Left profile |
| 1 | literal / author | Martin Schütz |
| 1 | literal / author | Michael Sheehan |
| 1 | literal / angle | Right profile |
| 1 | literal / angle | Straight front |
| 1 | literal / angle | Straight rear |
| 1 | literal / author | The Car Spy |
| 2 | literal / author | Alexander Migl |
| 2 | literal / label | BMW 3-Series (52823659926).jpg |
| 2 | literal / label | BMW F90 M5 British Racing Green (1).jpg |
| 2 | literal / label | BMW M3 Competition (G80) IMG 3964.jpg |
| 2 | literal / label | BMW M3 SMG Convertible - Flickr - The Car Spy (20).jpg |
| 2 | literal / label | Bmw m3 v8 e92 seite.jpg |
| 2 | literal / label | BMW M5 E60 side.JPG |
| 2 | literal / label | BMW M5 F90 without licence plate (rear).jpg |
| 2 | literal / author | Damian B Oh |
| 2 | literal / author | Elveres |
| 2 | literal / label | Front View - 2014 BMW X5 xDrive 35i (15020423346).jpg |
| 2 | literal / author | JanST |
| 2 | literal / author | Jason Lawrence from New York |
| 2 | literal / author | Martin Schütz |
| 2 | literal / author | Michael Sheehan |
| 2 | literal / author | The Car Spy |

### public/exploded.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 3 | literal / reference | F10 535i · N55 catalogue reference. Production year and hardware revisions may differ from the selected car. |
| 4 | literal | Close manufacturing openings in the cylinder head. |
| 4 | literal | Cover lids |
| 4 | literal | Dowels |
| 4 | literal | Exhaust bearing ledge |
| 4 | literal | Houses the combustion chambers and valve gear above the cylinder block. |
| 4 | literal | Locate the adjoining components accurately. |
| 4 | literal | Supports the exhaust camshaft. |
| 5 | literal | Connecting-rod bearing shells |
| 5 | literal | Converts the connecting rods’ motion into rotation. |
| 5 | literal / title | Crankshaft & bearings |
| 5 | literal | Main bearing shells |
| 5 | literal | Support the connecting rods at the crankshaft journals. |
| 5 | literal | Support the crankshaft in the block on a film of oil. |
| 6 | literal / reference | E92 M3 · S65 catalogue reference. Check the source for production dates and part-number alternatives. |
| 7 | literal / title | Cylinder heads |
| 8 | literal | Connecting-rod bearings |
| 8 | literal / title | Crankshaft & bearings |
| 8 | literal | Main / guide bearings |
| 8 | literal | Receives torque from the eight connecting rods. |
| 8 | literal | Separate the connecting rods from the crankshaft journals. |
| 8 | literal | Support rotation and locate the crankshaft axially. |
| 9 | literal | Moves inside its cylinder and transfers combustion force. |
| 9 | literal | Piston rings |
| 9 | literal / title | Pistons & rings |
| 9 | literal | Retains the piston pin. |
| 9 | literal | Seal combustion pressure and help control oil at the cylinder wall. |
| 9 | literal | Snap ring |
| 12 | literal / reference | E92 335i · N54 European April 2008 catalogue reference. Production dates and market differ from some selections. |
| 13 | literal / reference | E46 330i · M54 June 2004 catalogue reference. The E60 installation differs. Use the source for the numbered part descriptions. |
| 14 | literal / title | Cylinder heads |
| 14 | literal / reference | E39 M5 · S62 May 2003 US catalogue reference. Market and production date may differ. |
| 15 | literal / title | Cylinder heads |
| 15 | literal / reference | F10 M5 · S63N / S63B44T0 catalogue reference. This differs from the later F90 revision. |
| 18 | literal / title | Cylinder heads |
| 18 | literal / reference | E60 M5 · S85 July 2004 US catalogue reference. Part revisions and market may differ. |
| 20 | literal / title | Cylinder heads |
| 22 | literal / reference | 2019 G20 330i · B48D European catalogue reference. The museum photograph shows an earlier B48 family exhibit. |
| 22 | literal | Actuator |
| 22 | literal | Bearing shells |
| 22 | literal | Connecting rods |
| 22 | literal | Head gasket |
| 22 | literal | Houses the valve gear and combustion chambers. |
| 22 | literal | Link the pistons to the crankshaft. |
| 22 | literal | Measures coolant / oil temperature for the control system. |
| 22 | literal | Operates the variable valve-lift mechanism. |
| 22 | literal | Piston rings |
| 22 | literal / title | Pistons & connecting rods |
| 22 | literal | Seal pressure and control oil at the cylinder wall. |
| 22 | literal | Seals the joint between the cylinder head and the block. |
| 22 | literal | Support the rods on the crankshaft journals with a film of oil. |
| 22 | literal | Temperature sensor |
| 22 | literal | Transfers combustion force to the connecting rod. |

### public/extended-models.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 9 | literal / label | BMW M1 (E26) front high.jpg |
| 10 | literal / author | Mr.choppers |
| 15 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 17 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 24 | literal / label | BMW 1M Coupé (front).jpg |
| 25 | literal / author | Toffguy |
| 30 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 32 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 39 | literal / label | BMW M2 Competition (F87) front.jpg |
| 40 | literal / author | Tokumeigakarinoaoshima |
| 45 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 47 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 54 | literal / label | 2024 BMW M2 G87, front left, 05-31-2024.jpg |
| 55 | literal / author | Ethan Llamas |
| 60 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 62 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 69 | literal / label | BMW M3 E30 front 20090514.jpg |
| 70 | literal / author | Rudolf Stricker |
| 72 | literal / license | Attribution |
| 75 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 77 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 87 | literal / license | CC0 |
| 90 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 92 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 99 | literal / label | 2021 BMW M4 Competition Automatic 3.0 Front.jpg |
| 100 | literal / author | Vauxford |
| 105 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 107 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 115 | literal / author | Jaredtown |
| 120 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 122 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 129 | literal / label | BMW M5 E34 (14258796924).jpg |
| 135 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 144 | literal / label | BMW M5 (G90) Washington DC Metro Area, USA.jpg |
| 145 | literal / author | OWS Photography |
| 150 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 152 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 159 | literal / label | BMW M635 CSi (2467445918-crop-retouched).jpg |
| 165 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 167 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 175 | literal / author | Handelsgeselschaft |
| 180 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 182 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 189 | literal / label | BMW M6 (F13) front.jpg |
| 190 | literal / author | Alexandre Prévot from Nancy, France |
| 195 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 197 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 204 | literal / label | 2019 BMW M8 Competition Front.jpg |
| 205 | literal / author | Vauxford |
| 210 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 212 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 219 | literal / label | BMW Z3 M Roadster (E36 7, 2000) (52226832477).jpg |
| 220 | literal / author | Charles from Port Chester, New York |
| 225 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 234 | literal / label | BMW Z4 M Roadster front.jpg |
| 235 | literal / author | Oxyman |
| 240 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 242 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 249 | literal / label | 2019 BMW X3 M Competition Automatic 3.0 Front.jpg |
| 250 | literal / author | Vauxford |
| 255 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 257 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 264 | literal / label | 2019 BMW X4 M Competition Automatic 3.0 Front.jpg |
| 265 | literal / author | Vauxford |
| 270 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 272 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 279 | literal / label | BMW X5 M Competition (G05) front.jpg |
| 280 | literal / author | Tokumeigakarinoaoshima |
| 285 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 287 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 294 | literal / label | BMW G06 X6 M Competition Mineral White Metallic (1).jpg |
| 295 | literal / author | Damian B Oh |
| 300 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 309 | literal / label | BMW XM (2025) Front, Cape Town.jpg |
| 310 | literal / author | Husskeyy |
| 315 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 317 | literal / photoNote | G09 XM photographed as a 2025 model. Equipment, model year and market may differ from the selected 2023 factory specification. |
| 324 | literal / label | BMW M135i xDrive (F40) at BMW Welt - front right view (cropped).jpg |
| 325 | literal / author | NaBUru38 |
| 330 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 332 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 339 | literal / label | 2023 BMW 230i M Sport Auto.jpg |
| 340 | literal / author | Calreyn88 |
| 342 | literal / license | CC0 |
| 345 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 347 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 354 | literal / label | 2021 BMW 430i xDrive Coupe in BMW Individual Dravit Grey metallic, Front Left, 08-02-2023.jpg |
| 355 | literal / author | Elise240SX |
| 360 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 362 | literal / photoNote | G22 430i xDrive Coupe exterior reference, photographed as a 2021 model. All-wheel-drive trim, equipment and market may differ from the selected 430i factory specification. |
| 369 | literal / label | BMW 530i (G30) Washington DC Metro Area, USA (2).jpg |
| 370 | literal / author | OWS Photography |
| 375 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 377 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 384 | literal / label | BMW 640i GT (G32) Washington DC Metro Area, USA.jpg |
| 385 | literal / author | OWS Photography |
| 390 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 392 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 399 | literal / label | BMW 740i (G11) front.jpg |
| 400 | literal / author | Tokumeigakarinoaoshima |
| 405 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 407 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 414 | literal / label | BMW M850i xDrive (G15) front.jpg |
| 415 | literal / author | Tokumeigakarinoaoshima |
| 420 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 422 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 429 | literal / label | 2018 BMW X2 xDrive28i front 10.6.18.jpg |
| 430 | literal / author | Kevauto |
| 435 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 437 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 444 | literal / label | BMW Z4 M40i (G29) front.jpg |
| 445 | literal / author | Tokumeigakarinoaoshima |
| 450 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 452 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 459 | literal / label | BMW i8 front (21038420335).jpg |
| 460 | literal / author | Zytonits |
| 465 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 467 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 474 | literal / label | 2023-04 BMW iX1 U11 front view.jpg |
| 475 | literal / author | Wikisympathisant |
| 480 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 489 | literal / label | BMW iX2 xDrive30 M Sport (U10) front.jpg |
| 490 | literal / author | Tokumeigakarinoaoshima |
| 495 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 497 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 504 | literal / label | BMW i5 eDrive40 M Sport (G60) front.jpg |
| 505 | literal / author | Tokumeigakarinoaoshima |
| 510 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 512 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 519 | literal / label | BMW i7 xDrive60 1X7A7474.jpg |
| 520 | literal / author | Alexander-93 |
| 525 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 527 | literal / photoNote | Exterior reference for this model generation. Photographed year, equipment and market may differ from the factory specification shown. |
| 569 | literal | Two exhaust-driven turbochargers compress the intake air. Charge-air cooling removes heat added during compression. |
| 571 | literal | One exhaust-driven turbocharger compresses the intake air. Charge-air cooling then reduces the temperature before the air reaches the cylinders. |
| 572 | literal | Intake air enters without a turbocharger. Engine breathing, valve timing and engine speed shape the way torque builds. |
| 574 | literal / torqueUnit | Nm |
| 575 | literal / imageNote | A verified engine photograph for this selected installation is not yet available. Explore the factory powertrain explanations below. |
| 576 | literal | Twin-scroll turbo |
| 581 | dynamic dynamic-template / car | images/expanded/{value1}.webp |
| 586 | literal / name | Overview |
| 587 | literal | Breathing |
| 587 | literal | Natural aspiration |
| 587 | literal | Turbo |
| 587 | literal | Two turbochargers |
| 588 | literal / name | Drive |
| 589 | literal / name | Hybrid |
| 589 | literal / title | Understand the system figures |
| 590 | literal / name | Factory facts |
| 597 | literal / market | 1978 European road-car specification |
| 597 | literal / shortLayout | 3.5 L / INLINE-SIX |
| 597 | literal / layout | Inline-six |
| 597 | literal / generation | M SERIES / E26 |
| 597 | literal / driveNote | The engine sits behind the cabin and drives the rear wheels through a five-speed manual gearbox. This entry describes the road car, whose output differs from Procar racing versions. |
| 597 | literal / subtitle | The original M supercar. A mid-mounted straight-six. |
| 597 | literal / description | The road-going M1 pairs a 3,453 cm³ six-cylinder with a mid-engine layout. Its M88 uses four valves per cylinder, individual intake throttles and dry-sump lubrication. |
| 598 | literal / series | 1M |
| 598 | literal / market | 2011 European specification · 450 Nm nominal |
| 598 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 598 | literal / driveNote | A six-speed manual gearbox sends torque to the rear axle through an M differential lock. Its compact body brought M engineering into the first-generation 1 Series Coupé. |
| 598 | literal / name | BMW 1 Series M Coupé |
| 598 | literal / subtitle | Compact dimensions. Twin turbos. Six-speed manual. |
| 598 | literal / layout | Inline-six |
| 598 | literal / generation | M SERIES / E82 |
| 599 | literal / market | 2018 European launch specification |
| 599 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 599 | literal / layout | Inline-six |
| 599 | literal / generation | M SERIES / F87 |
| 599 | literal / subtitle | The compact M car, powered by the twin-turbo S55. |
| 599 | literal / description | The M2 Competition uses the S55 3.0-litre six-cylinder with two turbochargers, replacing the original M2’s N55 engine. Its cooling and oil supply are adapted for demanding driving. |
| 599 | literal / driveNote | The rear-drive layout is paired with a standard six-speed manual gearbox or an optional seven-speed M dual-clutch transmission. An Active M Differential manages rear-axle locking. |
| 600 | literal / market | 2023 European launch specification · 460 PS |
| 600 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 600 | literal / subtitle | A new generation of compact, rear-driven M performance. |
| 600 | literal / layout | Inline-six |
| 600 | literal / generation | M SERIES / G87 |
| 600 | literal / driveNote | The engine drives the rear wheels through an eight-speed M Steptronic transmission or optional six-speed manual. An electronically controlled Active M Differential supports traction. |
| 601 | literal / market | 1986 European 200 PS specification |
| 601 | literal / shortLayout | 2.3 L / INLINE-FOUR |
| 601 | literal / layout | Inline-four |
| 601 | literal / generation | M SERIES / E30 |
| 601 | literal / description | The first M3’s 2,302 cm³ S14 has four cylinders and four valves per cylinder. Its compact, naturally aspirated design reflects the car’s touring-car homologation origins. |
| 601 | literal / subtitle | The four-cylinder origin of an M legend. |
| 602 | literal / market | 1992 European 3.0-litre specification |
| 602 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 602 | literal / driveNote | A five-speed manual transmission sends torque to the rear wheels. The later European 3.2-litre model added Double VANOS and different power and torque ratings. |
| 602 | literal / name | BMW M3 3.0 Coupé |
| 602 | literal / layout | Inline-six |
| 602 | literal / generation | M SERIES / E36 |
| 602 | literal / description | The European 3.0-litre M3 uses the naturally aspirated S50B30 with individual throttles and VANOS inlet-camshaft adjustment. This is distinct from the lower-output North American powertrain. |
| 602 | literal / subtitle | The M3 becomes a straight-six. |
| 603 | literal / market | 2021 European rear-wheel-drive launch specification |
| 603 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 603 | literal / subtitle | 510 PS. Twin-turbo six. An unmistakable silhouette. |
| 603 | literal / name | BMW M4 Competition Coupé |
| 603 | literal / layout | Inline-six |
| 603 | literal / generation | M SERIES / G82 |
| 603 | literal / driveNote | This entry is the rear-wheel-drive Competition Coupé with an eight-speed M Steptronic transmission. M xDrive versions and later facelifts are separate factory specifications. |
| 603 | literal / description | Two mono-scroll turbochargers supply the 3.0-litre S58 six-cylinder. A dedicated cooling system and M-specific oil supply support sustained high-load use. |
| 604 | literal / market | 1985 European 286 PS specification |
| 604 | literal / shortLayout | 3.5 L / INLINE-SIX |
| 604 | literal / driveNote | A five-speed manual gearbox and rear-wheel drive complete the original M5 formula. The North American S38-powered model has a different factory output. |
| 604 | literal / layout | Inline-six |
| 604 | literal / generation | M SERIES / E28 |
| 604 | literal / description | The first M5 adapts the M1-derived, 3,453 cm³ six-cylinder to a four-door sedan. The European M88/3 uses natural aspiration and a four-valve cylinder head. |
| 604 | literal / subtitle | The first M5. Motorsport engineering in a discreet sedan. |
| 605 | literal / market | 1988 European launch specification · 3,535 cm³ |
| 605 | literal / shortLayout | 3.5 L / INLINE-SIX |
| 605 | literal / subtitle | A hand-built six-cylinder chapter in M5 history. |
| 605 | literal / layout | Inline-six |
| 605 | literal / generation | M SERIES / E34 |
| 605 | literal / driveNote | The front-mounted engine drives the rear wheels through a five-speed manual gearbox. The E34 continued the M5’s restrained sedan profile while improving its performance. |
| 606 | literal / market | 2024 launch specification · combined hybrid system figures |
| 606 | literal / shortLayout | 4.4 L V8 / PLUG-IN HYBRID |
| 606 | literal / subtitle | 727 PS and 1,000 Nm combined. The plug-in hybrid M5. |
| 606 | literal / driveNote | An eight-speed M Steptronic transmission and M xDrive distribute the hybrid system’s drive torque. A rechargeable high-voltage battery also enables electric-only driving. |
| 606 | literal / generation | M SERIES / G90 |
| 606 | literal / drivetrain | M xDrive all-wheel drive |
| 606 | literal / code | S68 + eDrive |
| 606 | literal / hybridNote | The petrol engine and electric motor reach their peaks at different operating points. Combined system output is the factory-rated capability of the coordinated drivetrain, not the sum of both individual peak ratings. The engine sound mode illustrates the V8 only. |
| 606 | literal / layout | V8 + electric motor |
| 607 | literal / market | 1986 UK historic-fleet specification · non-catalyst |
| 607 | literal / shortLayout | 3.5 L / INLINE-SIX |
| 607 | literal / layout | Inline-six |
| 607 | literal / generation | M SERIES / E24 |
| 607 | literal / driveNote | The front-mounted straight-six works with a five-speed manual gearbox and rear-wheel drive. The related North American M6 used a different engine specification. |
| 607 | literal / description | The M635CSi gives the E24 luxury coupé a 3,453 cm³ M88 six-cylinder with twin overhead camshafts and 24 valves. These figures describe the non-catalyst European version. |
| 607 | literal / subtitle | The sharknose grand tourer with an M88 heart. |
| 608 | literal / market | 2005 European launch specification |
| 608 | literal / shortLayout | 5.0 L / NATURALLY ASPIRATED V10 |
| 608 | literal / subtitle | A carbon roof above. A naturally aspirated V10 ahead. |
| 608 | literal / driveNote | At launch, a seven-speed SMG automated manual transmission delivered torque to the rear axle. The roof uses carbon-fibre-reinforced plastic to reduce mass high in the body. |
| 608 | literal / name | BMW M6 Coupé |
| 608 | literal / generation | M SERIES / E63 |
| 608 | literal / description | The E63 M6 uses a 5.0-litre S85 V10 with individual throttles. Its naturally aspirated powertrain makes peak power high in the rev range and brings a very different character from later turbocharged M6 models. |
| 609 | literal / market | 2012 European launch specification · standard M6 |
| 609 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 609 | literal / driveNote | A seven-speed M dual-clutch transmission and Active M Differential deliver drive to the rear wheels. Competition Package versions have different power ratings. |
| 609 | literal / name | BMW M6 Coupé |
| 609 | literal / generation | M SERIES / F13 |
| 609 | literal / description | The F13 M6 replaces the previous generation’s V10 with a 4.4-litre twin-turbo V8. The engine combines direct injection, Valvetronic and turbochargers packaged within the cylinder banks. |
| 609 | literal / subtitle | The M6 moves to a twin-turbo V8. |
| 610 | literal / market | 2019 European launch specification · Competition |
| 610 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 610 | literal / subtitle | 625 PS. M xDrive. Grand touring with an M edge. |
| 610 | literal / description | A 4.4-litre V8 with two turbochargers supplies the M8 Competition. The compressors sit inside the V, while separate cooling circuits manage engine and charge-air temperatures. |
| 610 | literal / name | BMW M8 Competition Coupé |
| 610 | literal / generation | M SERIES / F92 |
| 610 | literal / drivetrain | M xDrive all-wheel drive |
| 610 | literal / driveNote | The eight-speed M Steptronic transmission, M xDrive and Active M Differential work together to deliver the V8’s torque. This is the two-door Competition Coupé, rather than the Gran Coupé. |
| 611 | literal / market | 1997 European S50 specification |
| 611 | literal / shortLayout | 3.2 L / INLINE-SIX |
| 611 | literal / driveNote | A five-speed manual transmission sends power to the rear wheels. A long bonnet, rearward seating position and compact two-seat body define this open-top M model. |
| 611 | literal / subtitle | A small roadster. A full-strength European M straight-six. |
| 611 | literal / layout | Inline-six |
| 611 | literal / generation | M SERIES / E36/7 |
| 611 | literal / description | The early European M Roadster uses the 3,201 cm³ S50B32 straight-six from the contemporary M3. Its 321 PS specification differs from both the early US S52 version and the later S54 model. |
| 612 | literal / market | 2006 European specification |
| 612 | literal / shortLayout | 3.2 L / INLINE-SIX |
| 612 | literal / layout | Inline-six |
| 612 | literal / generation | M SERIES / E85 |
| 612 | literal / subtitle | Six cylinders, six manual gears and an open sky. |
| 612 | literal / description | The Z4 M Roadster combines the 3,246 cm³ S54 six-cylinder with natural aspiration and an 8,000 rpm engine-speed ceiling. It shares its engine family with the E46 M3. |
| 613 | literal / market | 2019 European launch specification · 600 Nm |
| 613 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 613 | literal / driveNote | An eight-speed M Steptronic gearbox, rear-biased M xDrive and an Active M Differential bring the M powertrain to the X3’s taller, five-door body. |
| 613 | literal / layout | Inline-six |
| 613 | literal / generation | M SERIES / F97 |
| 613 | literal / drivetrain | M xDrive all-wheel drive |
| 614 | literal / market | 2019 European launch specification · 600 Nm |
| 614 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 614 | literal / layout | Inline-six |
| 614 | literal / generation | M SERIES / F98 |
| 614 | literal / drivetrain | M xDrive all-wheel drive |
| 614 | literal / driveNote | M xDrive, an Active M Differential and an eight-speed M Steptronic transmission deliver drive beneath the X4’s sloping roofline. Later model-year torque ratings differ. |
| 614 | literal / description | The X4 M Competition shares its twin-turbo 3.0-litre S58 with the X3 M Competition. This entry records the original 510 PS and 600 Nm factory specification. |
| 614 | literal / subtitle | The X4 silhouette, backed by a 510 PS M straight-six. |
| 615 | literal / market | 2020 European launch specification · before mild hybrid |
| 615 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 615 | literal / driveNote | An eight-speed M Steptronic gearbox, M xDrive and an Active M Differential send drive to the wheels. The 2023 facelift introduced a different engine generation with 48-volt assistance. |
| 615 | literal / generation | M SERIES / F95 |
| 615 | literal / drivetrain | M xDrive all-wheel drive |
| 615 | literal / description | The original F95 Competition uses a twin-turbo 4.4-litre S63 V8. Its 625 PS output is delivered with M-specific cooling, chassis tuning and an all-wheel-drive system. |
| 615 | literal / subtitle | The X5, with 625 PS of twin-turbo M V8 power. |
| 616 | literal / market | 2020 European launch specification · before mild hybrid |
| 616 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 616 | literal / subtitle | A dramatic roofline and a twin-turbo M V8. |
| 616 | literal / generation | M SERIES / F96 |
| 616 | literal / drivetrain | M xDrive all-wheel drive |
| 616 | literal / driveNote | The eight-speed M Steptronic transmission, M xDrive and Active M Differential are paired with the X6’s coupé-like SUV body. Later S68 mild-hybrid models are different specifications. |
| 616 | literal / description | The pre-facelift F96 X6 M Competition has a 4.4-litre S63 twin-turbo V8. Its 625 PS and 750 Nm match the corresponding X5 M Competition launch specification. |
| 617 | literal / market | 2023 European launch specification · combined system figures |
| 617 | literal / shortLayout | 4.4 L V8 / PLUG-IN HYBRID |
| 617 | literal / subtitle | 653 PS combined. V8 power meets a rechargeable battery. |
| 617 | literal / hybridNote | A rechargeable battery powers the motor integrated into the eight-speed transmission. Engine and motor peaks do not simply add together. The Label, 50e and later versions have different powertrain ratings. |
| 617 | literal / generation | M SERIES / G09 |
| 617 | literal / drivetrain | M xDrive all-wheel drive |
| 617 | literal / code | S68 + eDrive |
| 617 | literal / driveNote | The hybrid drive system sends power through M xDrive. Electric assistance and electric-only operation distinguish this model from a conventional V8 SUV. |
| 617 | literal / layout | V8 + electric motor |
| 618 | literal / generation | 1 SERIES / F40 |
| 618 | literal / shortLayout | 2.0 L / INLINE-FOUR |
| 618 | literal / market | 2019 European launch specification |
| 618 | literal / subtitle | A 306 PS turbocharged performance hatch. |
| 618 | literal / driveNote | An eight-speed Steptronic Sport transmission and a front-axle Torsen limited-slip differential work with xDrive. M135i is an M Performance model within the 1 Series. |
| 618 | literal / name | BMW M135i xDrive |
| 618 | literal / layout | Inline-four |
| 618 | literal / description | The F40 M135i uses a transversely mounted 2.0-litre four-cylinder turbo engine. Its layout and all-wheel-drive system mark a new direction for the 1 Series performance hatchback. |
| 618 | literal / drivetrain | xDrive all-wheel drive |
| 619 | literal / generation | 2 SERIES / G42 |
| 619 | literal / shortLayout | 2.0 L / INLINE-FOUR |
| 619 | literal / market | 2022 US specification |
| 619 | literal / subtitle | A compact, rear-driven coupé with a turbocharged four. |
| 619 | literal / driveNote | An eight-speed Sport automatic transmission sends drive to the rear axle. This entry describes the 230i, rather than the six-cylinder M240i or the separate M2. |
| 619 | literal / name | BMW 230i Coupé |
| 619 | literal / layout | Inline-four |
| 619 | literal / description | The G42 230i’s 2.0-litre four-cylinder turbo engine produces 255 US horsepower and 295 lb-ft. This compact coupé keeps a longitudinal powertrain and rear-wheel-drive architecture. |
| 620 | literal / shortLayout | 2.0 L / INLINE-FOUR |
| 620 | literal / market | 2021 US launch specification · 294 lb-ft in BMW release |
| 620 | literal / generation | 4 SERIES / G22 |
| 620 | literal / subtitle | A low-slung two-door interpretation of the 4 Series. |
| 620 | literal / name | BMW 430i Coupé |
| 620 | literal / layout | Inline-four |
| 620 | literal / description | The 2021 US launch release rates the G22 430i’s B46 2.0-litre four-cylinder at 255 hp and 294 lb-ft. Its single twin-scroll turbo is paired with direct injection and variable valve control. |
| 620 | literal / driveNote | This is the rear-wheel-drive 430i two-door Coupé with an eight-speed automatic transmission. The 430i xDrive adds all-wheel drive, while the M440i uses a six-cylinder engine. |
| 621 | literal / shortLayout | 2.0 L / INLINE-FOUR |
| 621 | literal / market | 2017 US launch specification |
| 621 | literal / generation | 5 SERIES / G30 |
| 621 | literal / subtitle | Executive comfort powered by a modern turbocharged four. |
| 621 | literal / layout | Inline-four |
| 621 | literal / description | The G30 530i uses a 2.0-litre turbocharged four-cylinder with direct injection, Valvetronic and Double VANOS. Its US launch ratings are 248 hp and 258 lb-ft. |
| 622 | literal / market | 2017 European launch specification · rear-wheel drive |
| 622 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 622 | literal / generation | 6 SERIES / G32 |
| 622 | literal / subtitle | A straight-six grand tourer with a practical liftback. |
| 622 | literal / layout | Inline-six |
| 622 | literal / description | The 640i Gran Turismo uses a 3.0-litre turbocharged straight-six rated at 340 PS and 450 Nm. A large tailgate and flexible rear-seat backrest distinguish it from a conventional sedan. |
| 623 | literal / market | 2015 European launch specification · G11 |
| 623 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 623 | literal / generation | 7 SERIES / G11 |
| 623 | literal / layout | Inline-six |
| 623 | literal / subtitle | Straight-six refinement in BMW’s flagship sedan. |
| 623 | literal / description | The sixth-generation 740i uses a 2,998 cm³ turbocharged straight-six. The new engine family combines a twin-scroll turbocharger, direct injection, Valvetronic and Double VANOS. |
| 624 | literal / market | 2019 US launch specification |
| 624 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 624 | literal / generation | 8 SERIES / G15 |
| 624 | literal / name | BMW M850i xDrive Coupé |
| 624 | literal / description | The G15 M850i combines a 4,395 cm³ N63 V8 with two turbochargers. The US launch specification produces 523 hp and 553 lb-ft in a four-seat grand-touring coupé. |
| 624 | literal / subtitle | The return of the 8 Series, powered by a 523 hp V8. |
| 624 | literal / drivetrain | xDrive all-wheel drive |
| 625 | literal / shortLayout | 2.0 L / INLINE-FOUR |
| 625 | literal / market | 2018 US launch specification |
| 625 | literal / subtitle | A compact X model with a lower, more athletic silhouette. |
| 625 | literal / driveNote | An eight-speed automatic transmission works with xDrive all-wheel drive. This F39 generation is distinct from the larger U10 X2 and its fully electric iX2 counterpart. |
| 625 | literal / name | BMW X2 xDrive28i |
| 625 | literal / layout | Inline-four |
| 625 | literal / description | The first-generation X2 xDrive28i has a transversely mounted 2.0-litre turbocharged four-cylinder. Its US specification is rated at 228 hp and 258 lb-ft. |
| 625 | literal / drivetrain | xDrive all-wheel drive |
| 626 | literal / market | 2020 US launch specification · automatic |
| 626 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 626 | literal / subtitle | A turbocharged straight-six, an open roof and two seats. |
| 626 | literal / layout | Inline-six |
| 626 | literal / driveNote | The launch model pairs rear-wheel drive with an eight-speed Sport automatic transmission. Later manual-transmission offerings are separate specifications. The M40i is an M Performance roadster. |
| 626 | literal / description | The US-market G29 Z4 M40i uses a turbocharged 3.0-litre straight-six rated at 382 hp and 369 lb-ft. European launch output differs from this selected US specification. |
| 626 | literal / generation | Z SERIES / G29 |
| 627 | literal / shortLayout | 1.5 L INLINE-THREE / PLUG-IN HYBRID |
| 627 | literal / market | 2014 European launch specification · combined system figures |
| 627 | literal / subtitle | 362 PS combined. A three-cylinder hybrid sports car. |
| 627 | literal / code | B38 + eDrive |
| 627 | literal / generation | BMW i / I12 |
| 627 | literal / name | BMW i8 Coupé |
| 627 | literal / drivetrain | Hybrid all-wheel drive |
| 627 | literal / layout | Inline-three + electric motor |
| 627 | literal / induction | Single turbo + electric drive |
| 627 | literal / description | The original i8 combines a mid-mounted 1.5-litre turbocharged three-cylinder petrol engine with a front electric motor. Its 362 PS and 570 Nm headline figures describe the combined hybrid system. |
| 627 | literal / hybridNote | The petrol engine alone develops 231 PS and 320 Nm. It drives the rear wheels, while the main electric motor drives the front wheels. A rechargeable battery supplies electric energy. Later 374 PS models have a different battery and system output. |
| 632 | literal / torqueUnit | Nm |
| 635 | literal / imageNote | A verified powertrain inspection photograph is not yet available for this selected vehicle. Explore the electrical-system explanations below. |
| 636 | dynamic dynamic-template / induction | {value1} kWh usable |
| 637 | dynamic dynamic-template / car | images/expanded/{value1}.webp |
| 638 | dynamic dynamic-template / photoNote | {value1} electric-vehicle exterior reference. Exact model year, equipment and market may differ. |
| 642 | dynamic dynamic-template / title | {value1} kWh usable energy |
| 642 | dynamic dynamic-template / text | The underfloor lithium-ion battery has {value1} kWh of usable energy in this specification. Usable capacity is the energy available within the operating window, distinct from gross capacity. |
| 643 | literal / title | Recover energy during deceleration |
| 644 | literal / name | Factory facts |
| 650 | literal / generation | BMW i / U11 |
| 650 | literal / name | BMW iX1 xDrive30 |
| 650 | literal / layout | Dual-motor all-wheel drive |
| 650 | literal / shortLayout | ELECTRIC / ALL-WHEEL DRIVE |
| 650 | literal / drivetrain | Electric all-wheel drive |
| 650 | literal / market | November 2022 European specification · temporary boost included |
| 650 | literal / motorTitle | One electric motor on each axle |
| 650 | literal / subtitle | Two electric motors. Compact dimensions. 230 kW with boost. |
| 650 | literal / description | Two electrically excited synchronous drive units coordinate the front and rear axles. Their combined factory output reaches 230 kW including temporary boost, with 494 Nm of system torque. |
| 651 | literal / market | 2024 European launch specification · temporary boost included |
| 651 | literal / subtitle | A coupé-shaped electric X model with two driven axles. |
| 651 | literal / generation | BMW i / U10 |
| 651 | literal / name | BMW iX2 xDrive30 |
| 651 | literal / layout | Dual-motor all-wheel drive |
| 651 | literal / shortLayout | ELECTRIC / ALL-WHEEL DRIVE |
| 651 | literal / drivetrain | Electric all-wheel drive |
| 651 | literal / motorTitle | Electric drive at both axles |
| 651 | literal / description | The iX2 xDrive30 has one integrated electric drive unit at the front and another at the rear. The coordinated system is rated at 230 kW including temporary boost and 494 Nm. |
| 652 | literal / market | 2023 European launch specification · Sport / boost peak figures |
| 652 | literal / description | A current-excited synchronous motor drives the rear wheels. The launch specification reaches 250 kW in My Mode SPORT and up to 430 Nm with Sport Boost or Launch Control. |
| 652 | literal / motorTitle | A rear-mounted electric drive unit |
| 652 | literal / generation | BMW i / G60 |
| 652 | literal / name | BMW i5 eDrive40 |
| 652 | literal / specNote | BMW lists 230 kW outside the SPORT peak setting, and 400 Nm without Sport Boost or Launch Control. The headline 250 kW and 430 Nm describe those peak settings. The 81.2 kWh figure is usable battery energy. |
| 652 | literal / shortLayout | ELECTRIC / REAR-WHEEL DRIVE |
| 652 | literal / drivetrain | Electric rear-wheel drive |
| 652 | literal / subtitle | Rear-wheel-drive electric performance, in a 5 Series sedan. |
| 652 | literal / layout | Single-motor rear-wheel drive |
| 653 | literal / market | April 2022 European launch data · provisional factory figures |
| 653 | literal / generation | BMW i / G70 |
| 653 | literal / name | BMW i7 xDrive60 |
| 653 | literal / motorTitle | Coordinated front and rear electric motors |
| 653 | literal / layout | Dual-motor all-wheel drive |
| 653 | literal / shortLayout | ELECTRIC / ALL-WHEEL DRIVE |
| 653 | literal / drivetrain | Electric all-wheel drive |
| 653 | literal / specNote | The battery energy shown is 101.7 kWh net in the April 2022 BMW specification. Front and rear motor peaks differ from combined system output. These launch figures are separate from later model-year revisions and other i7 variants. |
| 653 | literal / subtitle | The electric 7 Series. Two motors and 400 kW combined. |
| 653 | literal / description | The i7 xDrive60 pairs electrically excited synchronous motors at the front and rear. BMW’s launch data gives a combined 400 kW and 745 Nm from its electric all-wheel-drive system. |

### public/galleries.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 6 | literal / title | BMW M5 (F90) Washington DC Metro Area, USA (1).webp |
| 7 | literal / angle | Front three-quarter |
| 10 | literal / label | BMW M5 (F90) Washington DC Metro Area, USA (1).webp |
| 11 | literal / author | OWS Photography |
| 19 | literal / title | BMW M5 F90 without licence plate (rear).webp |
| 23 | literal / label | BMW M5 F90 without licence plate (rear).webp |
| 24 | literal / author | Elveres |
| 34 | literal / title | BMW 535i (F10) Washington DC Metro Area, USA.webp |
| 35 | literal / angle | Front three-quarter |
| 38 | literal / label | BMW 535i (F10) Washington DC Metro Area, USA.webp |
| 39 | literal / author | OWS Photography |
| 47 | literal / title | BMW 535i (F10) Washington DC Metro Area, USA (1).webp |
| 48 | literal / angle | Elevated front three-quarter |
| 51 | literal / label | BMW 535i (F10) Washington DC Metro Area, USA (1).webp |
| 52 | literal / author | OWS Photography |
| 60 | literal / title | BMW 535i F10 (14107756703).webp |
| 61 | literal / angle | Side profile |
| 62 | literal / caption | BMW 535i F10, side profile. |
| 64 | literal / label | BMW 535i F10 (14107756703).webp |
| 75 | literal / title | BMW M3 E92 Coupe Silverstone with Black roof 01.webp |
| 76 | literal / angle | Front three-quarter |
| 79 | literal / label | BMW M3 E92 Coupe Silverstone with Black roof 01.webp |
| 80 | literal / author | Ethan Llamas |
| 88 | literal / title | BMW M3 E92 Coupe Silverstone with Black roof 02.webp |
| 89 | literal / angle | Rear three-quarter |
| 92 | literal / label | BMW M3 E92 Coupe Silverstone with Black roof 02.webp |
| 93 | literal / author | Ethan Llamas |
| 103 | literal / title | 2014 BMW 435i Coupé xDrive (rear left).webp |
| 104 | literal / angle | Rear-left |
| 107 | literal / label | 2014 BMW 435i Coupé xDrive (rear left).webp |
| 108 | literal / author | Mr.choppers |
| 118 | literal / title | BMW M235i Coupé (F22) rear.JPG |
| 119 | literal / angle | Rear three-quarter |
| 122 | literal / label | BMW M235i Coupé (F22) rear.JPG |
| 123 | literal / author | Tokumeigakarinoaoshima |
| 125 | literal / license | CC0 |
| 134 | literal / angle | Rear three-quarter |
| 138 | literal / author | Pixabay |
| 140 | literal / license | CC0 |
| 148 | literal / title | Rear View - 2014 BMW X5 xDrive 35i (15043065122).webp |
| 152 | literal / label | Rear View - 2014 BMW X5 xDrive 35i (15043065122).webp |
| 153 | literal / author | Michael Sheehan |
| 163 | literal / title | BMW M5 (E60) rear.webp |
| 164 | literal / angle | Rear three-quarter |
| 167 | literal / label | BMW M5 (E60) rear.webp |
| 168 | literal / author | M.rJirapat |
| 178 | literal / title | Rear - 2015 BMW M3 (16006230155).webp |
| 182 | literal / label | Rear - 2015 BMW M3 (16006230155).webp |
| 183 | literal / author | Michael Sheehan |
| 193 | literal / title | BMW M4 (United States) rear view 02.webp |
| 194 | literal / angle | Rear three-quarter |
| 197 | literal / label | BMW M4 (United States) rear view 02.webp |
| 198 | literal / author | Jason Lawrence |
| 208 | literal / title | BMW M3 Competition M xDrive (G80) rear.webp |
| 212 | literal / label | BMW M3 Competition M xDrive (G80) rear.webp |
| 213 | literal / author | Tokumeigakarinoaoshima |
| 223 | literal / title | BMW M3 E46 Cabrio side.JPG |
| 224 | literal / angle | Side-rear three-quarter |
| 227 | literal / label | BMW M3 E46 Cabrio side.JPG |
| 228 | literal / author | Grgo Tran Alpeza |
| 238 | literal / title | BMW 640i rear, Dongguan, China 10 May 2024.webp |
| 239 | literal / angle | Rear three-quarter |
| 242 | literal / label | BMW 640i rear, Dongguan, China 10 May 2024.webp |
| 255 | literal / title | BMW N55 engine 2013.webp |
| 256 | literal / angle | Top / engine bay |
| 259 | literal / label | BMW N55 engine 2013.webp |
| 260 | literal / author | Avolutions |
| 268 | literal / title | BMW Emblem on Engine - 2013 BMW X5 xdrive 35i (9712368076).webp |
| 269 | literal / angle | Engine-cover close-up |
| 272 | literal / label | BMW Emblem on Engine - 2013 BMW X5 xdrive 35i (9712368076).webp |
| 273 | literal / author | Michael Sheehan |
| 283 | literal / title | BMW S65 engine, front.webp |
| 285 | literal / caption | S65 standalone engine-family display · front. Not the installed E92 engine bay. |
| 287 | literal / label | BMW S65 engine, front.webp |
| 288 | literal / author | Mr.choppers |
| 296 | literal / title | BMW S65 engine, front right.webp |
| 297 | literal / angle | Side / front-right |
| 298 | literal / caption | S65 standalone engine-family display · front-right. Not the installed E92 engine bay. |
| 300 | literal / label | BMW S65 engine, front right.webp |
| 301 | literal / author | Mr.choppers |
| 309 | literal / title | BMW S65 engine, rear left.webp |
| 310 | literal / angle | Rear-left |
| 311 | literal / caption | S65 standalone engine-family display · rear-left. Not the installed E92 engine bay. |
| 313 | literal / label | BMW S65 engine, rear left.webp |
| 314 | literal / author | Mr.choppers |
| 324 | literal / title | BMW S63, Techno-Classica 2018, Essen (IMG 0053).webp |
| 325 | literal / angle | Top / family reference |
| 328 | literal / label | BMW S63, Techno-Classica 2018, Essen (IMG 0053).webp |
| 329 | literal / author | Matti Blume |
| 339 | literal / title | 2023-04-08 BMW S58 straight-6-engine.webp |
| 340 | literal / angle | Front display |
| 341 | literal / caption | S58 standalone engine display · front display. Surrounding vehicle components are absent. |
| 343 | literal / label | 2023-04-08 BMW S58 straight-6-engine.webp |
| 344 | literal / author | Wikisympathisant |
| 352 | literal / title | 2023-04-08 BMW S58 straight-6-engine 2nd-view.webp |
| 353 | literal / angle | Front-side display |
| 354 | literal / caption | S58 standalone engine display · front-side display. Surrounding vehicle components are absent. |
| 356 | literal / label | 2023-04-08 BMW S58 straight-6-engine 2nd-view.webp |
| 357 | literal / author | Wikisympathisant |
| 367 | literal / title | BMW S54 B32HP engine in BMW-Museum in Munich, Bayern.JPG |
| 368 | literal / angle | Side / CSL reference |
| 371 | literal / label | BMW S54 B32HP engine in BMW-Museum in Munich, Bayern.JPG |
| 372 | literal / author | Jiří Sedláček |
| 382 | literal / title | BMW V10 Motor 4 Seiten noBG 01.webp |
| 383 | literal / angle | Side / four-view composite |
| 386 | literal / label | BMW V10 Motor 4 Seiten noBG 01.webp |
| 387 | literal / author | Auge=mit |
| 397 | literal / title | 2014 Canadian International AutoShow (12831710323).webp |
| 398 | literal / angle | Engine bay, front three-quarter |
| 401 | literal / label | 2014 Canadian International AutoShow (12831710323).webp |
| 402 | literal / author | Kalvin Chan |
| 412 | literal / label | BMW N55 engine 2013.webp |
| 413 | literal / author | Avolutions |
| 419 | literal / label | BMW Emblem on Engine - 2013 BMW X5 xdrive 35i (9712368076).webp |
| 420 | literal / author | Michael Sheehan |
| 426 | literal / label | BMW S65 engine, front.webp |
| 427 | literal / author | Mr.choppers |
| 433 | literal / label | BMW S65 engine, front right.webp |
| 434 | literal / author | Mr.choppers |
| 440 | literal / label | BMW S65 engine, rear left.webp |
| 441 | literal / author | Mr.choppers |
| 447 | literal / label | BMW S63, Techno-Classica 2018, Essen (IMG 0053).webp |
| 448 | literal / author | Matti Blume |
| 454 | literal / label | 2023-04-08 BMW S58 straight-6-engine.webp |
| 455 | literal / author | Wikisympathisant |
| 461 | literal / label | 2023-04-08 BMW S58 straight-6-engine 2nd-view.webp |
| 462 | literal / author | Wikisympathisant |
| 468 | literal / label | BMW M5 (F90) Washington DC Metro Area, USA (1).webp |
| 469 | literal / author | OWS Photography |
| 475 | literal / label | BMW M5 F90 without licence plate (rear).webp |
| 476 | literal / author | Elveres |
| 482 | literal / label | BMW 535i (F10) Washington DC Metro Area, USA.webp |
| 483 | literal / author | OWS Photography |
| 489 | literal / label | BMW 535i (F10) Washington DC Metro Area, USA (1).webp |
| 490 | literal / author | OWS Photography |
| 496 | literal / label | BMW M3 E92 Coupe Silverstone with Black roof 01.webp |
| 497 | literal / author | Ethan Llamas |
| 503 | literal / label | BMW M3 E92 Coupe Silverstone with Black roof 02.webp |
| 504 | literal / author | Ethan Llamas |
| 510 | literal / label | 2014 BMW 435i Coupé xDrive (rear left).webp |
| 511 | literal / author | Mr.choppers |
| 517 | literal / label | BMW M235i Coupé (F22) rear.JPG |
| 518 | literal / author | Tokumeigakarinoaoshima |
| 520 | literal / license | CC0 |
| 525 | literal / author | Pixabay |
| 527 | literal / license | CC0 |
| 531 | literal / label | Rear View - 2014 BMW X5 xDrive 35i (15043065122).webp |
| 532 | literal / author | Michael Sheehan |
| 538 | literal / label | BMW M5 (E60) rear.webp |
| 539 | literal / author | M.rJirapat |
| 545 | literal / label | Rear - 2015 BMW M3 (16006230155).webp |
| 546 | literal / author | Michael Sheehan |
| 552 | literal / label | BMW M4 (United States) rear view 02.webp |
| 553 | literal / author | Jason Lawrence |
| 559 | literal / label | BMW M3 Competition M xDrive (G80) rear.webp |
| 560 | literal / author | Tokumeigakarinoaoshima |
| 566 | literal / label | BMW M3 E46 Cabrio side.JPG |
| 567 | literal / author | Grgo Tran Alpeza |
| 573 | literal / label | BMW 640i rear, Dongguan, China 10 May 2024.webp |
| 580 | literal / label | BMW 535i F10 (14107756703).webp |
| 587 | literal / label | BMW S54 B32HP engine in BMW-Museum in Munich, Bayern.JPG |
| 588 | literal / author | Jiří Sedláček |
| 594 | literal / label | BMW V10 Motor 4 Seiten noBG 01.webp |
| 595 | literal / author | Auge=mit |
| 601 | literal / label | 2014 Canadian International AutoShow (12831710323).webp |
| 602 | literal / author | Kalvin Chan |
| 610 | literal / label | 2019 BMW 330i M Sport 2.0 Rear.jpg |
| 610 | literal / license | Attribution |
| 610 | literal / label | BMW 330i E46 (5967804586).jpg |
| 610 | literal / label | BMW 330i M-Sportpaket rear.jpg |
| 610 | literal / label | BMW 335i E90 (6819460116).jpg |
| 610 | literal / label | BMW 335i, Rear Left, 06-10-2021.jpg |
| 610 | literal / label | BMW 530i (E60) Facelift 20090615 rear.JPG |
| 610 | literal / label | BMW G80 M3 Competition BMW Individual Tanzanite Blue Metallic (1).jpg |
| 610 | literal / label | Bmw m3 v8 e92.jpg |
| 610 | literal / label | BMW M5 (F10) rear.JPG |
| 610 | literal / license | CC0 |
| 610 | literal / author | Damian B Oh |
| 610 | literal / angle | Elevated three-quarter |
| 610 | literal / author | M 93 |
| 610 | literal / author | Mortl |
| 610 | literal / author | Neef - 2 |
| 610 | literal / angle | Rear three-quarter |
| 610 | literal / angle | Side / rear three-quarter |
| 610 | literal / author | SsmIntrigue |
| 610 | literal / author | Tokumeigakarinoaoshima |
| 610 | literal / author | Vauxford |
| 613 | literal / license | Attribution |
| 613 | literal / label | BMW 535i (F10) rear 20100425.jpg |
| 613 | literal / caption | BMW F10 535i rear reference. Photographed year and market differ from the 2015 US factory facts. |
| 613 | literal / author | M 93 |
| 613 | literal / angle | Rear three-quarter |

### public/gallery-enhancements.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 10 | literal | &lt;/svg&gt; |
| 11 | literal | (max-width: 700px) 100vw, 1180px |
| 43 | literal | 110px |
| 50 | dynamic dynamic-template | translate({value1}px,{value2}px) scale({value3}) |
| 67 | literal | [data-lightbox-index].active |
| 84 | literal | input,textarea,select,[contenteditable],a,[data-lightbox-control] |
| 86 | literal | ArrowDown |
| 86 | literal | ArrowLeft |
| 86 | literal | ArrowRight |
| 86 | literal | ArrowUp |
| 87 | literal | ArrowDown |
| 87 | literal | ArrowLeft |
| 87 | literal | ArrowRight |
| 87 | literal | ArrowUp |
| 88 | literal | ArrowLeft |
| 88 | literal | ArrowRight |

### public/garage.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 18 | literal | Advanced calibration scenario |
| 18 | literal | Factory calibration |
| 18 | literal | Mild calibration scenario |
| 19 | literal | Factory turbo system |
| 19 | literal | High-flow turbo concept |
| 19 | literal | Larger turbo concept |
| 20 | literal | Factory charge cooling |
| 20 | literal | Larger charge-cooler concept |
| 21 | literal | Factory intake |
| 21 | literal | High-flow intake concept |
| 22 | literal | Factory exhaust |
| 22 | literal | Full exhaust concept |
| 22 | literal | Rear exhaust concept |
| 23 | literal | Factory suspension |
| 23 | literal | Road spring concept |
| 23 | literal | Track coilover concept |
| 24 | literal | Bright silver finish |
| 24 | literal | Factory finish |
| 24 | literal | Graphite finish |
| 24 | literal | Satin bronze finish |
| 25 | literal | Factory brakes |
| 25 | literal | Road pad concept |
| 25 | literal | Track brake concept |
| 26 | literal | Clutch / cooling concept |
| 26 | literal | Factory transmission |
| 26 | literal | Shift calibration concept |
| 28 | literal / intercooler | Charge-air cooling |
| 28 | literal / ecu | ECU calibration |
| 28 | literal / exhaust | Exhaust system |
| 28 | literal / intake | Intake system |
| 28 | literal / suspension | Suspension |
| 28 | literal / turbo | Turbochargers |
| 28 | literal / wheels | Wheel finish |
| 30 | literal / ecu | Calibration hypotheses change the assumed output. No tuner, fuel grade or engine safety limit has been validated. |
| 31 | literal / turbo | A larger compressor may increase airflow but also changes response and supporting requirements. Physical fitment is not verified. |
| 32 | literal / intercooler | Charge cooling can help manage intake temperature. The small assumed gain is a scenario input, not a guaranteed peak-power improvement. |
| 33 | literal / intake | A different intake may change restriction and sound. Real results depend on the original system and calibration. |
| 34 | literal / exhaust | Flow, sound and catalyst configuration vary. No real exhaust product or measured gain is represented. |
| 35 | literal / suspension | Changes the educational chassis preview. No engine-power gain, exact ride height or handling result is assumed. |
| 36 | literal / wheels | Changes the preview finish and saved build. Wheel fitment, diameter, tyre grip and mass have not been verified. |
| 38 | literal / transmission | Records a transmission concept. No shift-time, compatibility or acceleration benefit is invented. |
| 47 | dynamic dynamic-template | {value1}\n{value2}\n{value3} |
| 54 | dynamic dynamic-template | Import between 1 and {value1} builds at a time. |
| 57 | dynamic dynamic-template | Build {value1}: {value2} |
| 58 | literal | expected a JSON build object. |
| 59 | literal | this file version is not supported. Export a version 1 garage build. |
| 60 | literal | the model is not a supported combustion vehicle in this library. |
| 61 | literal | the build name must contain 1–80 characters. |
| 62 | literal | a configuration object is required. |
| 63 | literal | the configuration contains an unknown option. |
| 66 | dynamic dynamic-template | choose a supported value for {value1}. |
| 69 | literal | turbo or charge-cooler upgrades are unavailable for this naturally aspirated model. |
| 80 | literal | n·m |

### public/generation-guide-sources.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 5 | literal / label | AAMVA · NMVTIS for consumers |
| 9 | literal / label | NHTSA · vPIC VIN decoder |
| 15 | literal / label | AAMVA · NMVTIS for consumers |
| 19 | literal / label | NICB · VINCheck coverage |
| 23 | literal / label | NHTSA · Recalls |
| 29 | literal / label | GOV.UK · Check MOT history |
| 33 | literal / label | EUR-Lex · Directive 2014/45/EU |
| 37 | literal / label | European Commission · Registration abroad |
| 43 | literal / label | Georgia Revenue Service · Vehicle clearance |
| 47 | literal / label | Georgian MIA Service Agency |
| 51 | literal / label | PTI Georgia · Technical inspection |

### public/index.html

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | visible-text | APEX — BMW Explorer |
| 1 | meta-content | Explore BMW models, compare factory specifications, discover engines in 3D, build tuning scenarios, and learn automotive engineering. |
| 1 | meta-content | width=device-width,initial-scale=1 |
| 2 | visible-text | English |
| 2 | aria-label | Switch color theme |
| 3 | visible-text | 200+ hp |
| 3 | visible-text | 300+ hp |
| 3 | visible-text | 400+ hp |
| 3 | visible-text | 500+ hp |
| 3 | visible-text | 600+ hp |
| 3 | visible-text | All engines |
| 3 | visible-text | All source years |
| 3 | visible-text | APEX is not affiliated with BMW. Original recordings identify their source and note model or exhaust differences. 3D exteriors are creator models, not factory CAD or verified mechanical internals. |
| 3 | visible-text | Chassis / generation |
| 3 | visible-text | Engine family |
| 6 | alt | Selected BMW exterior |
| 8 | alt | Selected engine family |
| 15 | visible-text | Original |
| 15 | visible-text | Original creator recordings contain real car audio. Model and exhaust differences are noted above. |
| 15 | visible-text | recordings. |
| 16 | alt | Black BMW M5 E28 in warm evening light |
| 16 | alt | White BMW i7 xDrive60 electric luxury sedan |
| 17 | visible-text | Choose up to 3 |

### public/marketplaces.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 34 | literal | 1M |
| 38 | literal | 3.0 CSL |
| 41 | literal | 1-series-m |
| 41 | literal | 1M |
| 43 | literal | 640i-gran-coupe |
| 44 | literal | 640i-gran-turismo |
| 50 | literal | 1M |
| 50 | literal | 3.0 CSL |
| 52 | literal | 6er |
| 54 | literal | 3.0 CSL |
| 55 | literal | 4er |
| 62 | literal | 1M |
| 62 | literal | 2002 turbo |
| 62 | literal | 230i |
| 62 | literal | 3.0 CSL |
| 63 | literal | m-series/ |
| 64 | literal | m-series/ |
| 65 | literal | xseries/ |
| 66 | literal | xseries/xm |
| 67 | literal | zseries/ |
| 68 | literal | i-series/ |
| 69 | literal | -series/ |
| 74 | literal | A BMW model is required. |
| 77 | dynamic dynamic-template | BMW {value1}{value2} |
| 83 | literal / provider | MyAuto.ge |
| 88 | literal | 2002 turbo |
| 89 | literal / provider | Auto.ge |
| 89 | dynamic dynamic-template | BMW {value1} |
| 93 | literal / provider | Avito Auto |
| 93 | literal / query | BMW M1 · E26 |
| 94 | literal / provider | Auto.ru |
| 97 | literal / provider | Autotrader |
| 97 | dynamic dynamic-template | BMW {value1} |
| 103 | literal / Touring | Wagon |
| 104 | dynamic dynamic-template / _nkw | BMW {value1} |
| 104 | dynamic dynamic-template / query | BMW {value1}{value2} |
| 104 | literal / provider | eBay Motors |

### public/model-photo-policy.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 46 | literal | commons.wikimedia.org |
| 56 | literal | Exterior reference |
| 112 | literal | No matching, licensed detail photograph has been identified. |
| 112 | literal | No matching, licensed photograph with this view identified is available. |
| 112 | literal | No verified photograph of the selected model’s engine or powertrain is available. |

### public/model-profile-ui.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 19 | literal | : 0–60 mph: |
| 19 | literal | " target="_blank" rel="noopener noreferrer"&gt; |
| 19 | literal | &lt;/a&gt;&lt;/p&gt; |
| 19 | literal | s &lt;a href=" |
| 27 | literal | (max-width: 600px) 45vw, 22vw |
| 27 | literal | &lt;/span&gt; |

### public/model-profiles.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 43 | literal / title | BMW M5 technical specifications valid October 2011 |
| 44 | literal / title | BMW M5 launch release, 22 June 2011 |
| 49 | literal / locator | page 1, tank capacity |
| 50 | literal / unit | L/100 km |
| 50 | literal / locator | page 2, combined consumption |
| 51 | literal / note | Combined emissions for the 2011 European specification and its contemporary test cycle. |
| 51 | literal / unit | g/km |
| 51 | literal / locator | page 2, CO₂ emissions |
| 52 | literal / value | Front: double-track-control-arm axle. Rear: Integral-V multi-arm axle. |
| 52 | literal / locator | page 1, chassis |
| 53 | literal / locator | page 1, brakes |
| 54 | literal / value | Front: 9J × 19 wheels, 265/40 R19 102Y tyres. Rear: 10J × 19 wheels, 295/35 R19 104Y tyres. |
| 54 | literal / locator | page 1, tyres and rims |
| 55 | literal / value | BMW announced the fifth-generation M5 in June 2011. This profile describes the 2011 European launch specification. |
| 56 | literal / value | The two turbochargers sit between the V8’s cylinder banks, an arrangement often called a hot-V. |
| 57 | literal / value | Active M Differential. |
| 71 | literal | Overview |
| 73 | literal | Displacement |
| 73 | literal | Engine layout |
| 76 | literal | Wheelbase |
| 77 | literal | 0–100 km/h |
| 77 | literal | Fuel consumption |
| 77 | literal | Top speed |
| 78 | literal | Charging |
| 78 | literal | Electric range |
| 79 | literal | Suspension |
| 92 | literal | BMW factory reference |
| 112 | literal / unit | cm³ |
| 114 | literal | Combined system torque where the catalogue identifies a hybrid system rating. |
| 114 | literal | Nm |
| 116 | literal / note | Engine-only rating, separate from combined hybrid system power. |
| 124 | literal | km/h |

### public/models.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 6 | literal / generation | 5 SERIES / F10 |
| 7 | literal / subtitle | A straight-six. A single turbo. Pure BMW. |
| 9 | literal / layout | Inline-six |
| 10 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 15 | literal / induction | Twin-scroll turbo |
| 16 | literal / market | 2015 US specification |
| 20 | literal / description | A 2,979 cm³ inline-six with one twin-scroll turbocharger, direct injection and Valvetronic. |
| 28 | literal / name | Overview |
| 29 | literal / title | Six cylinders. One straight line. |
| 30 | literal / text | The N55’s six cylinders share one crankshaft. In this F10 specification, the engine is mounted longitudinally and sends torque to the rear wheels. |
| 33 | literal / name | Turbo |
| 34 | literal / title | Twin-scroll is not twin-turbo. |
| 35 | literal / text | One turbocharger has two exhaust passages feeding its turbine. Exhaust energy spins the compressor, which supplies pressurized intake air. The turbo is largely hidden by surrounding hardware in this reference photograph. |
| 39 | literal / title | Air in. Heat out. |
| 40 | literal / text | Filtered air enters the compressor, then passes through charge-air cooling before reaching the intake manifold. The intercooler cools the air heated by compression. |
| 43 | literal / name | Valves |
| 44 | literal / title | Valvetronic & VANOS. |
| 54 | literal / generation | M SERIES / E92 |
| 55 | literal / subtitle | Eight cylinders. No turbos. 8,400 rpm. |
| 58 | literal / shortLayout | 4.0 L / NATURALLY ASPIRATED V8 |
| 62 | literal / torqueUnit | Nm |
| 67 | literal / imageNote | S65B40 reference photographed in a 2008 M3 Coupé. |
| 68 | literal / description | A 3,999 cm³, naturally aspirated V8. Eight individual throttle butterflies and Double VANOS give it a very different character from the turbocharged engines. |
| 76 | literal / name | Overview |
| 77 | literal / title | The high-revving V8. |
| 78 | literal / text | The S65 has two banks of four cylinders. BMW quotes 309 kW, equivalent to approximately 420 metric horsepower (PS), and a maximum engine speed of 8,400 rpm. |
| 82 | literal / title | Individual throttles. |
| 83 | literal / text | Each cylinder has its own throttle butterfly. The large intake plenum covers much of this hardware, so the throttles are not directly visible in this engine-bay photograph. |
| 86 | literal / name | Valves |
| 87 | literal / title | Double VANOS. |
| 88 | literal / text | Variable camshaft timing helps the engine breathe across its operating range. The S65 does not use the N55’s Valvetronic intake-lift system. |
| 92 | literal / title | No turbocharger in the path. |
| 93 | literal / text | This engine draws its air without a turbocharger. The simulator therefore removes the turbo whistle and emphasizes the induction and high-revving engine layers. |
| 102 | literal / generation | M SERIES / F90 |
| 103 | literal / subtitle | Twin-turbo V8. M xDrive. Effortless force. |
| 106 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 111 | literal / induction | Twin-turbo |
| 112 | literal / market | 2018 US base specification |
| 115 | literal / imageNote | F90 M5 First Edition engine reference. Specification shown is the 2018 US base M5, not Competition. |
| 116 | literal / description | A 4.4-liter twin-turbo V8 paired with an eight-speed M Steptronic transmission and M xDrive. |
| 124 | literal / name | Overview |
| 125 | literal / title | Torque across the rev range. |
| 126 | literal / text | BMW rates the 2018 US M5 at 600 hp and 553 lb-ft. M xDrive sends that torque through a configurable all-wheel-drive system. These figures do not describe every F90 special edition. |
| 129 | literal / name | Turbos |
| 130 | literal / title | Two twin-scroll turbochargers. |
| 135 | literal / title | High-pressure direct injection. |
| 136 | literal / text | Fuel is injected directly into the combustion chambers. BMW’s launch information describes a maximum injection pressure of 350 bar for this revision. |
| 140 | literal / title | Airflow brings heat with it. |
| 141 | literal / text | Compression and sustained engine load generate heat. Charge-air and engine cooling control different temperatures. The engine photograph shows only part of those systems. |
| 148 | literal / name | BMW M235i Coupé |
| 150 | literal / generation | 2 SERIES / F22 |
| 151 | literal / subtitle | The turbocharged straight-six, in a different shape. |
| 153 | literal / layout | Inline-six |
| 154 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 159 | literal / induction | Twin-scroll turbo |
| 160 | literal / market | 2014 US specification |
| 163 | literal / imageNote | N55 engine-family reference in a 2013 X5. Covers, tuning and engine-bay packaging differ in this model. |
| 164 | literal / description | A 2,979 cm³ inline-six with one twin-scroll turbocharger, direct injection and Valvetronic. |
| 172 | literal / name | Overview |
| 173 | literal / title | Same family. Different application. |
| 174 | literal / text | This model uses a longitudinal 3.0-liter N55 inline-six. Its factory output and vehicle configuration are specific to the model and market shown. |
| 177 | literal / name | Turbo |
| 178 | literal / title | Twin-scroll is not twin-turbo. |
| 179 | literal / text | One turbocharger has two exhaust passages feeding its turbine. Exhaust energy spins the compressor, which supplies pressurized intake air. The turbo is largely hidden by surrounding hardware in this reference photograph. |
| 183 | literal / title | Air in. Heat out. |
| 184 | literal / text | Filtered air enters the compressor, then passes through charge-air cooling before reaching the intake manifold. The intercooler cools the air heated by compression. |
| 187 | literal / name | Valves |
| 188 | literal / title | Valvetronic & VANOS. |
| 196 | literal / name | BMW 435i Coupé |
| 198 | literal / generation | 4 SERIES / F32 |
| 199 | literal / subtitle | The turbocharged straight-six, in a different shape. |
| 201 | literal / layout | Inline-six |
| 202 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 207 | literal / induction | Twin-scroll turbo |
| 208 | literal / market | 2014 US specification |
| 211 | literal / imageNote | N55 engine-family reference in a 2013 X5. Covers, tuning and engine-bay packaging differ in this model. |
| 212 | literal / description | A 2,979 cm³ inline-six with one twin-scroll turbocharger, direct injection and Valvetronic. |
| 220 | literal / name | Overview |
| 221 | literal / title | Same family. Different application. |
| 222 | literal / text | This model uses a longitudinal 3.0-liter N55 inline-six. Its factory output and vehicle configuration are specific to the model and market shown. |
| 225 | literal / name | Turbo |
| 226 | literal / title | Twin-scroll is not twin-turbo. |
| 227 | literal / text | One turbocharger has two exhaust passages feeding its turbine. Exhaust energy spins the compressor, which supplies pressurized intake air. The turbo is largely hidden by surrounding hardware in this reference photograph. |
| 231 | literal / title | Air in. Heat out. |
| 232 | literal / text | Filtered air enters the compressor, then passes through charge-air cooling before reaching the intake manifold. The intercooler cools the air heated by compression. |
| 235 | literal / name | Valves |
| 236 | literal / title | Valvetronic & VANOS. |
| 244 | literal / name | BMW 640i Gran Coupé |
| 246 | literal / generation | 6 SERIES / F06 |
| 247 | literal / subtitle | The turbocharged straight-six, in a different shape. |
| 249 | literal / layout | Inline-six |
| 250 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 255 | literal / induction | Twin-scroll turbo |
| 256 | literal / market | 2013 US specification |
| 259 | literal / imageNote | N55 engine-family reference in a 2013 X5. Covers, tuning and engine-bay packaging differ in this model. |
| 260 | literal / description | A 2,979 cm³ inline-six with one twin-scroll turbocharger, direct injection and Valvetronic. |
| 268 | literal / name | Overview |
| 269 | literal / title | Same family. Different application. |
| 270 | literal / text | This model uses a longitudinal 3.0-liter N55 inline-six. Its factory output and vehicle configuration are specific to the model and market shown. |
| 273 | literal / name | Turbo |
| 274 | literal / title | Twin-scroll is not twin-turbo. |
| 275 | literal / text | One turbocharger has two exhaust passages feeding its turbine. Exhaust energy spins the compressor, which supplies pressurized intake air. The turbo is largely hidden by surrounding hardware in this reference photograph. |
| 279 | literal / title | Air in. Heat out. |
| 280 | literal / text | Filtered air enters the compressor, then passes through charge-air cooling before reaching the intake manifold. The intercooler cools the air heated by compression. |
| 283 | literal / name | Valves |
| 284 | literal / title | Valvetronic & VANOS. |
| 292 | literal / name | BMW X3 xDrive35i |
| 294 | literal / generation | X SERIES / F25 |
| 295 | literal / subtitle | The turbocharged straight-six, in a different shape. |
| 297 | literal / layout | Inline-six |
| 298 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 303 | literal / induction | Twin-scroll turbo |
| 304 | literal / market | 2011 US specification |
| 308 | literal / description | A 2,979 cm³ inline-six with one twin-scroll turbocharger, direct injection and Valvetronic. |
| 316 | literal / name | Overview |
| 317 | literal / title | Same family. Different application. |
| 318 | literal / text | This model uses a longitudinal 3.0-liter N55 inline-six. Its factory output and vehicle configuration are specific to the model and market shown. |
| 321 | literal / name | Turbo |
| 322 | literal / title | Twin-scroll is not twin-turbo. |
| 323 | literal / text | One turbocharger has two exhaust passages feeding its turbine. Exhaust energy spins the compressor, which supplies pressurized intake air. The turbo is largely hidden by surrounding hardware in this reference photograph. |
| 327 | literal / title | Air in. Heat out. |
| 328 | literal / text | Filtered air enters the compressor, then passes through charge-air cooling before reaching the intake manifold. The intercooler cools the air heated by compression. |
| 331 | literal / name | Valves |
| 332 | literal / title | Valvetronic & VANOS. |
| 340 | literal / name | BMW X5 xDrive35i |
| 342 | literal / generation | X SERIES / F15 |
| 343 | literal / subtitle | The turbocharged straight-six, in a different shape. |
| 345 | literal / layout | Inline-six |
| 346 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 351 | literal / induction | Twin-scroll turbo |
| 352 | literal / market | 2014 US specification |
| 356 | literal / description | A 2,979 cm³ inline-six with one twin-scroll turbocharger, direct injection and Valvetronic. |
| 364 | literal / name | Overview |
| 365 | literal / title | Same family. Different application. |
| 366 | literal / text | This model uses a longitudinal 3.0-liter N55 inline-six. Its factory output and vehicle configuration are specific to the model and market shown. |
| 369 | literal / name | Turbo |
| 370 | literal / title | Twin-scroll is not twin-turbo. |
| 371 | literal / text | One turbocharger has two exhaust passages feeding its turbine. Exhaust energy spins the compressor, which supplies pressurized intake air. The turbo is largely hidden by surrounding hardware in this reference photograph. |
| 375 | literal / title | Air in. Heat out. |
| 376 | literal / text | Filtered air enters the compressor, then passes through charge-air cooling before reaching the intake manifold. The intercooler cools the air heated by compression. |
| 379 | literal / name | Valves |
| 380 | literal / title | Valvetronic & VANOS. |
| 390 | literal / generation | M SERIES / E46 |
| 392 | literal / subtitle | A 3.2-liter naturally aspirated inline-six. |
| 394 | literal / layout | Inline-six |
| 395 | literal / shortLayout | 3.2 L / INLINE-SIX |
| 399 | literal / torqueUnit | Nm |
| 404 | literal / imageNote | S54B32 reference photographed in a 2007 Z4 M Coupé. Installation and engine-bay packaging differ from the E46 convertible. |
| 405 | literal / description | A 3.2-liter naturally aspirated inline-six. Individual throttle butterflies and variable camshaft timing define the S54. |
| 413 | literal / name | Overview |
| 414 | literal / title | The naturally aspirated six. |
| 419 | literal / title | Six individual throttles. |
| 420 | literal / text | Each cylinder has its own throttle butterfly. An intake plenum supplies air to the individual runners. |
| 423 | literal / name | Valves |
| 424 | literal / title | Double VANOS. |
| 425 | literal / text | Variable timing adjusts both intake and exhaust camshafts. This engine does not use Valvetronic. |
| 429 | literal / title | Breathing without boost. |
| 430 | literal / text | There is no turbocharger. Exhaust gases flow through the exhaust system, where mufflers reduce sound energy. |
| 438 | literal / generation | M SERIES / E60 |
| 440 | literal / subtitle | A 5.0-liter naturally aspirated V10. |
| 443 | literal / shortLayout | 5.0 L / V10 |
| 447 | literal / torqueUnit | Nm |
| 453 | literal / description | A 5.0-liter naturally aspirated V10. Ten cylinders and a high-revving design give the S85 its distinctive architecture. |
| 461 | literal / name | Overview |
| 462 | literal / title | Ten cylinders. Two banks. |
| 463 | literal / text | The S85 has two banks of five cylinders, 4,999 cm³ displacement and a European full-output rating of 373 kW, approximately 507 PS. |
| 467 | literal / title | Individual throttle control. |
| 468 | literal / text | Ten throttle butterflies meter air to the cylinders. This is a naturally aspirated engine, with no turbocharger compressing the intake air. |
| 472 | literal / title | Built to rev. |
| 476 | literal / name | Modes |
| 477 | literal / title | Full output is selectable. |
| 478 | literal / text | The E60 M5 starts in its reduced-output P400 program. The figures shown are for full output, not the startup program. This audio simulator does not reproduce those power modes. |
| 486 | literal / generation | M SERIES / F80 |
| 488 | literal / subtitle | A 3.0-liter twin-turbo inline-six. |
| 490 | literal / layout | Inline-six |
| 491 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 496 | literal / induction | Twin-turbo |
| 497 | literal / market | 2015 US base specification |
| 501 | literal / description | A 3.0-liter twin-turbo inline-six. The S55 combines direct injection, Valvetronic and Double VANOS. |
| 509 | literal / name | Overview |
| 510 | literal / title | The M straight-six returns. |
| 511 | literal / text | The S55 is a longitudinal 3.0-liter inline-six. The 2015 US base M3 and M4 share the 425 hp and 406 lb-ft factory rating. |
| 514 | literal / name | Turbos |
| 515 | literal / title | Two turbochargers. |
| 516 | literal / text | Two mono-scroll turbochargers compress intake air. TwinPower Turbo is a BMW technology name, not a universal statement about turbo count. |
| 520 | literal / title | Water-to-air charge cooling. |
| 521 | literal / text | A charge-air cooler transfers heat from compressed intake air to a separate coolant circuit before the air reaches the engine. |
| 524 | literal / name | Valves |
| 525 | literal / title | Lift and timing. |
| 526 | literal / text | Valvetronic varies intake-valve lift. Double VANOS changes camshaft timing. Both help control breathing across the rev range. |
| 532 | literal / name | BMW M4 Coupé |
| 534 | literal / generation | M SERIES / F82 |
| 536 | literal / subtitle | A 3.0-liter twin-turbo inline-six. |
| 538 | literal / layout | Inline-six |
| 539 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 544 | literal / induction | Twin-turbo |
| 545 | literal / market | 2015 US base specification |
| 549 | literal / description | A 3.0-liter twin-turbo inline-six. The S55 combines direct injection, Valvetronic and Double VANOS. |
| 557 | literal / name | Overview |
| 558 | literal / title | The M straight-six returns. |
| 559 | literal / text | The S55 is a longitudinal 3.0-liter inline-six. The 2015 US base M3 and M4 share the 425 hp and 406 lb-ft factory rating. |
| 562 | literal / name | Turbos |
| 563 | literal / title | Two turbochargers. |
| 564 | literal / text | Two mono-scroll turbochargers compress intake air. TwinPower Turbo is a BMW technology name, not a universal statement about turbo count. |
| 568 | literal / title | Water-to-air charge cooling. |
| 569 | literal / text | A charge-air cooler transfers heat from compressed intake air to a separate coolant circuit before the air reaches the engine. |
| 572 | literal / name | Valves |
| 573 | literal / title | Lift and timing. |
| 574 | literal / text | Valvetronic varies intake-valve lift. Double VANOS changes camshaft timing. Both help control breathing across the rev range. |
| 582 | literal / generation | M SERIES / G80 |
| 584 | literal / subtitle | A 3.0-liter twin-turbo inline-six. |
| 586 | literal / layout | Inline-six |
| 587 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 592 | literal / induction | Twin-turbo |
| 593 | literal / market | 2021 US RWD Competition specification |
| 596 | literal / imageNote | S58 standalone engine-family reference, not the exact installed G80 engine bay. Exterior reference shows a G80 Competition. |
| 597 | literal / description | A 3.0-liter twin-turbo inline-six. The S58 powers this Competition sedan through an eight-speed automatic transmission. |
| 605 | literal / name | Overview |
| 606 | literal / title | Competition specification. |
| 607 | literal / text | This selection is the 2021 rear-wheel-drive Competition: 503 hp and 479 lb-ft. The manual base M3 has different factory ratings. |
| 610 | literal / name | Turbos |
| 611 | literal / title | Two mono-scroll turbochargers. |
| 612 | literal / text | Each turbocharger serves a group of cylinders. Electronically controlled wastegates regulate the exhaust energy driving the turbines. |
| 616 | literal / title | Air-to-water intercooling. |
| 617 | literal / text | Compressed intake air gives up heat to coolant in a charge-air cooler. Engine and charge-air cooling serve different temperature targets. |
| 620 | literal / name | Block |
| 621 | literal / title | A closed-deck foundation. |
| 622 | literal / text | The S58 uses a rigid closed-deck block and a forged crankshaft. These support the pressures and rotational loads of a high-output engine. |
| 630 | literal / author | Christian Flores / CFlo Photography |
| 637 | literal / author | Michael Sheehan / HighTechDad |
| 644 | literal / author | Thomas doerfer |
| 651 | literal / author | Hatsukari715 |
| 658 | literal / author | Alexander Migl |
| 665 | literal / author | Alexander Migl |
| 671 | literal / label | BMW M235i Coupé (F22) front.JPG |
| 672 | literal / author | Tokumeigakarinoaoshima |
| 674 | literal / license | CC0 |
| 678 | literal / label | BMW 435i Coupé Sport (F32) front.JPG |
| 679 | literal / author | Tokumeigakarinoaoshima |
| 681 | literal / license | CC0 |
| 685 | literal / label | BMW 640i Gran Coupé (F06) front.JPG |
| 686 | literal / author | Tokumeigakarinoaoshima |
| 688 | literal / license | CC0 |
| 693 | literal / author | DariuszSankowski |
| 695 | literal / license | CC0 |
| 699 | literal / label | 2016 BMW X5 xDrive35i (US) front 3.9.18.jpg |
| 700 | literal / author | Kevauto |
| 706 | literal / label | BMW M3 E46 Cabrio front.jpg |
| 707 | literal / author | JanST |
| 713 | literal / label | BMW M5 (E60) front.jpg |
| 714 | literal / author | M.rJirapat |
| 720 | literal / label | BMW M3 (F80) front.jpg |
| 721 | literal / author | Tokumeigakarinoaoshima |
| 727 | literal / label | BMW M4 Coupé (F82) front.JPG |
| 728 | literal / author | Tokumeigakarinoaoshima |
| 730 | literal / license | CC0 |
| 734 | literal / label | BMW M3 Competition (G80) IMG 3964.jpg |
| 735 | literal / author | Alexander Migl |
| 742 | literal / author | Hatsukari715 |
| 749 | literal / author | Hatsukari715 |
| 755 | literal / label | BMW M4 engine (20394482883).jpg |
| 756 | literal / author | Zytonits |
| 762 | literal / label | 2023-04-08 BMW S58 straight-6-engine 3rd view.jpg |
| 763 | literal / author | Wikisympathisant |
| 775 | literal / generation | M SERIES / E39 |
| 776 | literal / subtitle | The naturally aspirated S62 V8. |
| 779 | literal / shortLayout | 4.9 L / NATURALLY ASPIRATED V8 |
| 783 | literal / torqueUnit | Nm |
| 789 | literal / description | A 4,941 cm³ naturally aspirated V8 with individual throttle butterflies and Double VANOS. |
| 798 | literal / name | Overview |
| 799 | literal / title | Eight cylinders. No turbocharger. |
| 800 | literal / text | The S62 has two banks of four cylinders. Combustion drives the pistons and connecting rods, turning a shared crankshaft. |
| 804 | literal / title | Individual throttles. |
| 805 | literal / text | The S62 uses individual throttle butterflies to control airflow into its eight cylinders. |
| 809 | literal / title | Variable camshaft timing. |
| 810 | literal / text | Double VANOS varies intake and exhaust camshaft timing. It changes when the valves open, rather than adding boost. |
| 818 | literal / generation | 3 SERIES / E46 |
| 819 | literal / subtitle | The M54 straight-six, before turbocharging. |
| 821 | literal / layout | Inline-six |
| 822 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 826 | literal / torqueUnit | Nm |
| 828 | literal / market | E46 European specification · M54B30 |
| 831 | literal / imageNote | M54B25 photographed in an E39 525i. Family reference only: the selected 330i uses the larger M54B30, and engine-bay packaging differs. |
| 832 | literal / description | A 2,979 cm³ naturally aspirated M54B30 inline-six with Double VANOS. |
| 841 | literal / name | Overview |
| 842 | literal / title | One straight line of six cylinders. |
| 843 | literal / text | The selected 330i uses the 3.0-litre M54B30. The photograph is a 2.5-litre M54B25 family reference, not its exact engine. |
| 847 | literal / title | Timing on both camshafts. |
| 848 | literal / text | Double VANOS varies intake and exhaust camshaft timing. This engine does not have Valvetronic. |
| 852 | literal / title | Heat leaves through the coolant. |
| 853 | literal / text | Coolant circulates through the block and head, carrying heat to the radiator. The thermostat helps control operating temperature. |
| 861 | literal / generation | 5 SERIES / E60 |
| 862 | literal / subtitle | The early E60 with an M54B30 straight-six. |
| 864 | literal / layout | Inline-six |
| 865 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 869 | literal / torqueUnit | Nm |
| 871 | literal / market | 2003 European launch specification · M54B30 |
| 875 | literal / description | The early E60 530i used the 2,979 cm³ M54B30. Later 530i variants changed engine families, so the model year matters. |
| 884 | literal / name | Overview |
| 885 | literal / title | One straight line of six cylinders. |
| 886 | literal / text | The selected 330i uses the 3.0-litre M54B30. The photograph is a 2.5-litre M54B25 family reference, not its exact engine. |
| 890 | literal / title | Timing on both camshafts. |
| 891 | literal / text | Double VANOS varies intake and exhaust camshaft timing. This engine does not have Valvetronic. |
| 895 | literal / title | Heat leaves through the coolant. |
| 896 | literal / text | Coolant circulates through the block and head, carrying heat to the radiator. The thermostat helps control operating temperature. |
| 904 | literal / generation | 3 SERIES / E90 |
| 905 | literal / subtitle | Two turbochargers. The N54 sedan. |
| 907 | literal / layout | Inline-six |
| 908 | literal / shortLayout | 3.0 L / TWIN-TURBO INLINE-SIX |
| 914 | literal / market | 2009 US specification · N54 |
| 918 | literal / description | A 2,979 cm³ direct-injection inline-six with two parallel turbochargers. This N54 specification does not use the later N55 single twin-scroll turbo. |
| 927 | literal / name | Overview |
| 928 | literal / title | The twin-turbo straight-six. |
| 929 | literal / text | The N54 has six cylinders and two parallel turbochargers. Each turbo is fed by three cylinders. |
| 932 | literal / name | Turbo |
| 933 | literal / title | Two turbos, not two scrolls. |
| 934 | literal / text | Exhaust energy turns two turbine wheels. Their compressors supply pressurized air to the intake through charge-air cooling. |
| 938 | literal / title | Direct injection. |
| 939 | literal / text | Fuel is injected into the combustion chambers by a high-pressure system. The selected N54 does not have Valvetronic. |
| 945 | literal / name | BMW 335i Coupé |
| 947 | literal / generation | 3 SERIES / E92 |
| 948 | literal / subtitle | The original twin-turbo 335i Coupé. |
| 950 | literal / layout | Inline-six |
| 951 | literal / shortLayout | 3.0 L / TWIN-TURBO INLINE-SIX |
| 957 | literal / market | 2007 US specification · N54 |
| 961 | literal / description | A 2,979 cm³ N54 inline-six with direct injection and two parallel turbochargers. |
| 970 | literal / name | Overview |
| 971 | literal / title | The twin-turbo straight-six. |
| 972 | literal / text | The N54 has six cylinders and two parallel turbochargers. Each turbo is fed by three cylinders. |
| 975 | literal / name | Turbo |
| 976 | literal / title | Two turbos, not two scrolls. |
| 977 | literal / text | Exhaust energy turns two turbine wheels. Their compressors supply pressurized air to the intake through charge-air cooling. |
| 981 | literal / title | Direct injection. |
| 982 | literal / text | Fuel is injected into the combustion chambers by a high-pressure system. The selected N54 does not have Valvetronic. |
| 992 | literal / license | Public domain · resized / WebP conversion |
| 997 | literal / author | M 93 |
| 999 | literal / license | Public domain · resized / WebP conversion |
| 1004 | literal / author | M 93 |
| 1006 | literal / license | Attribution-only · resized / WebP conversion |
| 1011 | literal / author | OWS Photography |
| 1013 | literal / license | CC BY 4.0 · resized / WebP conversion |
| 1020 | literal / license | Public domain · resized / WebP conversion |
| 1025 | literal / author | Terabass |
| 1027 | literal / license | CC BY-SA 3.0 · resized / WebP conversion |
| 1032 | literal / author | Jussi P. Korkala (Jk-bmw) |
| 1034 | literal / license | Public domain · resized / WebP conversion |
| 1039 | literal / author | Aconcagua |
| 1041 | literal / license | CC BY-SA 3.0 · resized / WebP conversion |
| 1051 | literal / generation | M SERIES / F10 |
| 1052 | literal / subtitle | The first turbocharged M5. |
| 1055 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 1059 | literal / torqueUnit | Nm |
| 1061 | literal / market | 2011 European launch specification · S63B44T0 |
| 1064 | literal / imageNote | Engine photograph is a later F90 S63 family revision, not the F10 S63B44T0. Covers and hardware differ. The Exploded tab uses the F10 M5 catalogue. |
| 1065 | literal / description | A 4,395 cm³ twin-turbo V8 with the turbochargers between the cylinder banks and Valvetronic. This is the S63B44T0 revision, commonly called S63TU. |
| 1074 | literal / name | Overview |
| 1075 | literal / title | The hot-V layout. |
| 1076 | literal / text | The exhaust sides of the cylinder heads face into the V. Two turbochargers sit between the banks, shortening exhaust paths. |
| 1079 | literal / name | Revision |
| 1085 | literal / title | Intake-valve lift control. |
| 1086 | literal / text | Valvetronic varies intake-valve lift. VANOS separately adjusts camshaft timing. |
| 1094 | literal / generation | 3 SERIES / G20 |
| 1095 | literal / subtitle | The turbocharged four-cylinder 3 Series. |
| 1097 | literal / layout | Inline-four |
| 1098 | literal / shortLayout | 2.0 L / TURBO INLINE-FOUR |
| 1102 | literal / torqueUnit | Nm |
| 1103 | literal / induction | Twin-scroll turbo |
| 1104 | literal / market | 2019 European launch specification · B48 |
| 1117 | literal / name | Overview |
| 1118 | literal / title | Four cylinders in line. |
| 1119 | literal / text | The B48 family uses four cylinders and one twin-scroll turbocharger. The museum cutaway exposes internal components, but is not the exact G20 revision. |
| 1122 | literal / name | Turbo |
| 1123 | literal / title | One turbo, two exhaust passages. |
| 1124 | literal / text | A twin-scroll turbine housing separates exhaust pulses before they reach the turbine. It does not contain two turbochargers. |
| 1132 | literal / author | Damian B Oh |
| 1134 | literal / license | CC BY-SA 4.0 · resized / WebP conversion |
| 1139 | literal / author | Matti Blume (MB-one) |
| 1141 | literal / license | CC BY-SA 3.0 · resized / WebP conversion |
| 1146 | literal / author | Wikisympathisant |
| 1148 | literal / license | CC BY-SA 4.0 · resized / WebP conversion |

### public/navigation.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 3 | literal | (max-width:1100px) |
| 3 | literal | (prefers-reduced-motion:reduce) |
| 5 | literal | mobile-menu-toggle icon-button |
| 9 | literal | Compare cars |
| 9 | literal | Discover |
| 9 | literal | Electric BMWs |
| 9 | literal | Engine lab |
| 9 | literal | Tuning garage |
| 10 | literal | aria-current="page" |
| 13 | literal | Header preference |

### public/new-models.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | literal / shortLayout | 2.0 L / INLINE-FOUR |
| 1 | literal / market | 2016 (US) |
| 1 | literal / market | 2019 (US) |
| 1 | literal / label | 2019 BMW X1 xDrive20i blue front.jpg |
| 1 | literal / label | 2019 BMW X1 xDrive20i blue rear.jpg |
| 1 | literal / label | 2019 BMW X7 xDrive40i in white, front left.jpg |
| 1 | literal / label | 2019 BMW X7 xDrive40i in white, rear left.jpg |
| 1 | literal / market | 2020 (US) |
| 1 | literal / market | 2022 (US) |
| 1 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 1 | literal / name | 48V system |
| 1 | literal / author | Alexander Migl |
| 1 | literal / subtitle | B46 family, 2.0L turbo inline-four |
| 1 | literal / description | B46 family, 2.0L turbo inline-four. |
| 1 | literal / text | B46 family, 2.0L turbo inline-four. Transverse engine layout and all-wheel drive. |
| 1 | literal / subtitle | B58 family, 3.0L turbo inline-six |
| 1 | literal / subtitle | B58 family, 3.0L turbo inline-six, 48V mild hybrid |
| 1 | literal / description | B58 family, 3.0L turbo inline-six, 48V mild hybrid. 48V mild hybrid. |
| 1 | literal / text | B58 family, 3.0L turbo inline-six, 48V mild hybrid. Longitudinal engine layout and all-wheel drive. |
| 1 | literal / description | B58 family, 3.0L turbo inline-six. |
| 1 | literal / text | B58 family, 3.0L turbo inline-six. Longitudinal engine layout and all-wheel drive. |
| 1 | literal / subtitle | B58 family,3.0L turbo inline-six |
| 1 | literal / description | B58 family,3.0L turbo inline-six. |
| 1 | literal / text | B58 family,3.0L turbo inline-six. Longitudinal engine layout and all-wheel drive. |
| 1 | literal / name | BMW X1 xDrive28i |
| 1 | literal / label | BMW X4 M40i (G02, 2021) (52199172738).jpg |
| 1 | literal / label | BMW X6 sDrive40i (G06, 2021) (53488000190).jpg |
| 1 | literal / label | BMW X6 xDrive35d (G06) front.jpg |
| 1 | literal / name | BMW X6 xDrive40i |
| 1 | literal / name | BMW X7 xDrive40i |
| 1 | literal / license | CC0 |
| 1 | literal / author | Charles from Port Chester, New York |
| 1 | literal / text | Coolant carries heat away from the engine. Charge-air cooling reduces the temperature of compressed intake air before it enters the cylinders. |
| 1 | literal / engineAngle | Engine-family bay |
| 1 | literal / text | Exhaust energy spins the turbine, which drives the intake compressor. Twin-scroll refers to two exhaust passages in one turbine housing, not two turbochargers. |
| 1 | literal / layout | Inline-four |
| 1 | literal / layout | Inline-six |
| 1 | literal / title | Manage combustion and intake heat |
| 1 | literal / title | Mild hybrid assistance |
| 1 | literal / author | Mr.choppers |
| 1 | literal / imageNote | No verified B46 engine photograph is available. A different engine is not substituted. |
| 1 | literal / title | One twin-scroll turbo |
| 1 | literal / name | Overview |
| 1 | literal / angle | Rear three-quarter |
| 1 | literal / text | The 2022 US M40i includes a 48-volt mild hybrid system. This is distinct from a plug-in hybrid or a fully electric BMW. |
| 1 | literal / author | Throwawayacc222 |
| 1 | literal / author | Tokumeigakarinoaoshima |
| 1 | literal / name | Turbo |
| 1 | literal / induction | Twin-scroll turbo |
| 2 | literal / author | © M 93 |
| 2 | literal / induction | 111.5 kWh |
| 2 | literal / label | 2018 BMW i3 facelift (1).jpg |
| 2 | literal / market | 2019 BMW i3 120Ah (EU) |
| 2 | literal / market | 2021 BMW iX3 G08 (EU) |
| 2 | literal / market | 2022 BMW i4 eDrive40 (EU) |
| 2 | literal / market | 2022 BMW iX xDrive50 (EU) |
| 2 | literal / induction | 42.2 kWh |
| 2 | literal / induction | 80 kWh |
| 2 | literal / induction | 83.9 kWh |
| 2 | literal / generation | BMW i / G08 |
| 2 | literal / generation | BMW i / G26 |
| 2 | literal / generation | BMW i / I01 |
| 2 | literal / generation | BMW i / I20 |
| 2 | literal / label | BMW i3 (Facelift) – h 05072025.jpg |
| 2 | literal / name | BMW i3 120 Ah |
| 2 | literal / name | BMW i4 eDrive40 |
| 2 | literal / label | BMW i4 eDrive40 M Sport (G26) front.jpg |
| 2 | literal / label | BMW i4 eDrive40 M Sport (G26) rear.jpg |
| 2 | literal / name | BMW iX xDrive50 |
| 2 | literal / label | BMW iX xDrive50i SIGNATURE (i20) front.jpg |
| 2 | literal / label | BMW iX xDrive50i SIGNATURE (i20) rear.jpg |
| 2 | literal / name | BMW iX3 |
| 2 | literal / label | BMW iX3 M Sport (G08) front.jpg |
| 2 | literal / label | BMW iX3 M Sport (G08) rear.jpg |
| 2 | literal / license | CC BY-SA 3.0 de |
| 2 | literal / shortLayout | ELECTRIC / ELECTRIC AWD |
| 2 | literal / shortLayout | ELECTRIC / REAR-WHEEL DRIVE |
| 2 | literal / layout | Electric AWD |
| 2 | literal / title | Electric drive |
| 2 | literal / text | Factory battery energy: 111.5 kWh gross and 105.2 kWh usable. Gross capacity includes energy outside the usable operating window. These figures belong to the specification year shown. |
| 2 | literal / text | Factory battery energy: 42.2 kWh gross and 37.9 kWh usable. Gross capacity includes energy outside the usable operating window. These figures belong to the specification year shown. |
| 2 | literal / text | Factory battery energy: 80 kWh gross and 74 kWh usable. Gross capacity includes energy outside the usable operating window. These figures belong to the specification year shown. |
| 2 | literal / text | Factory battery energy: 83.9 kWh gross and 80.7 kWh usable. Gross capacity includes energy outside the usable operating window. These figures belong to the specification year shown. |
| 2 | literal / subtitle | Fifth-generation electrically excited synchronous motor drives the rear wheels. A high-voltage lithium-ion battery sits in the floor. Regenerative braking uses the motor as a generator during deceleration. |
| 2 | literal / title | Fixed-ratio drive |
| 2 | literal / name | Gearing |
| 2 | literal / title | High-voltage battery |
| 2 | literal / title | i3 120 Ah |
| 2 | literal / title | i4 eDrive40 |
| 2 | literal / title | iX xDrive50 |
| 2 | literal / torqueUnit | Nm |
| 2 | literal / imageNote | No verified powertrain inspection photograph is available for this vehicle. Exterior photos and factory system explanations are shown. |
| 2 | literal / angle | Rear three-quarter |
| 2 | literal / subtitle | Rear-mounted synchronous electric motor drives the rear wheels through a fixed-ratio transmission. Floor-mounted lithium-ion battery supplies electrical energy. Regenerative braking runs the drive motor as a generator to recover energy during deceleration. |
| 2 | literal / title | Recover energy while slowing down |
| 2 | literal / text | This electric powertrain uses fixed-ratio reduction gearing instead of a multi-speed manual gearbox. There is no petrol-engine idle, turbocharger or exhaust muffler. |
| 2 | literal / author | Tokumeigakarinoaoshima |
| 2 | literal / subtitle | Two fifth-generation electrically excited synchronous motors drive the front and rear axles, providing electric all-wheel drive. High-voltage floor battery supplies both drive units. Regenerative braking turns deceleration into recovered electrical energy. |
| 2 | literal / author | Vauxford |
| 3 | literal / author | © M 93 |
| 3 | literal / label | 2018 BMW B58 Turbo engine.jpg |
| 3 | literal / label | 2018 BMW i3 facelift (1).jpg |
| 3 | literal / label | 2019 BMW X1 xDrive20i blue front.jpg |
| 3 | literal / label | 2019 BMW X1 xDrive20i blue rear.jpg |
| 3 | literal / label | 2019 BMW X7 xDrive40i in white, front left.jpg |
| 3 | literal / label | 2019 BMW X7 xDrive40i in white, rear left.jpg |
| 3 | literal / author | Alexander Migl |
| 3 | literal / label | BMW i3 (Facelift) – h 05072025.jpg |
| 3 | literal / label | BMW i4 eDrive40 M Sport (G26) front.jpg |
| 3 | literal / label | BMW i4 eDrive40 M Sport (G26) rear.jpg |
| 3 | literal / label | BMW iX xDrive50i SIGNATURE (i20) front.jpg |
| 3 | literal / label | BMW iX xDrive50i SIGNATURE (i20) rear.jpg |
| 3 | literal / label | BMW iX3 M Sport (G08) front.jpg |
| 3 | literal / label | BMW iX3 M Sport (G08) rear.jpg |
| 3 | literal / label | BMW X4 M40i (G02, 2021) (52199172738).jpg |
| 3 | literal / label | BMW X6 sDrive40i (G06, 2021) (53488000190).jpg |
| 3 | literal / label | BMW X6 xDrive35d (G06) front.jpg |
| 3 | literal / license | CC BY-SA 3.0 de |
| 3 | literal / license | CC0 |
| 3 | literal / author | Charles from Port Chester, New York |
| 3 | literal / author | Mr.choppers |
| 3 | literal / author | Throwawayacc222 |
| 3 | literal / author | Tokumeigakarinoaoshima |
| 3 | literal / author | Vauxford |

### public/next-models.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 8 | literal / label | BMW M5 Touring (G99) Washington DC Metro Area, USA.jpg |
| 9 | literal / author | OWS Photography |
| 14 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 16 | literal / photoNote | G99 M5 Touring exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 22 | literal / angle | Rear three-quarter |
| 23 | literal / caption | G99 M5 Touring exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 25 | literal / label | BMW M5 Touring (G99) Washington DC Metro Area, USA (1).jpg |
| 26 | literal / author | OWS Photography |
| 31 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 40 | literal / author | Alexander-93 |
| 45 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 47 | literal / photoNote | G82 M4 CSL exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 54 | literal / label | BMW M3 CS (G80) IMG 5038.jpg |
| 55 | literal / author | Alexander Migl |
| 60 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 62 | literal / photoNote | G80 M3 CS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 68 | literal / angle | Rear three-quarter |
| 69 | literal / caption | G80 M3 CS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 71 | literal / label | BMW M3 CS (G80) IMG 5044.jpg |
| 72 | literal / author | Alexander Migl |
| 77 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 85 | literal / label | BMW M3 Touring Competition M xDrive (G81) front.jpg |
| 86 | literal / author | Tokumeigakarinoaoshima |
| 88 | literal / license | CC0 |
| 91 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 99 | literal / angle | Rear three-quarter |
| 102 | literal / label | 2023 BMW M3 Competition xDrive Auto Touring 1.jpg |
| 103 | literal / author | Calreyn88 |
| 108 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 116 | literal / label | BMW M5 CS F90 at FOS22.jpg |
| 117 | literal / author | MrWalkr |
| 122 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 124 | literal / photoNote | F90 M5 CS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 130 | literal / angle | Rear three-quarter |
| 131 | literal / caption | F90 M5 CS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 133 | literal / label | 2021 BMW M5 CS Rear F90.jpg |
| 134 | literal / author | MrWalkr |
| 139 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 147 | literal / label | BMW F87 M2 CS Hockenheim Silver Metallic (1).jpg |
| 148 | literal / author | Damian B Oh |
| 153 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 155 | literal / photoNote | F87 M2 CS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 161 | literal / angle | Rear three-quarter |
| 162 | literal / caption | F87 M2 CS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 164 | literal / label | BMW F87 M2 CS Hockenheim Silver Metallic (3).jpg |
| 165 | literal / author | Damian B Oh |
| 170 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 179 | literal / author | Calreyn88 |
| 184 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 186 | literal / photoNote | F82 M4 GTS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 192 | literal / angle | Rear three-quarter |
| 193 | literal / caption | F82 M4 GTS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 196 | literal / author | Calreyn88 |
| 201 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 209 | literal / label | BMW M3 CSL (E46).jpg |
| 210 | literal / author | Jake Thomas |
| 215 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 217 | literal / photoNote | E46 M3 CSL exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 223 | literal / angle | Rear three-quarter |
| 224 | literal / caption | E46 M3 CSL exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 226 | literal / label | Black BMW M3 CSL E46 rr.jpg |
| 227 | literal / author | Darren |
| 232 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 241 | literal / author | Calreyn88 |
| 246 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 248 | literal / photoNote | E92 M3 GTS exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 255 | literal / label | Black BMW M3 E30 fr.jpg |
| 256 | literal / author | Darren |
| 261 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 263 | literal / photoNote | E30 M3 Sport Evolution exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 269 | literal / angle | Rear three-quarter |
| 270 | literal / caption | E30 M3 Sport Evolution exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 272 | literal / label | BMW M3 Sport Evolution (4898166580).jpg |
| 278 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 286 | literal / label | 2008-2010 BMW M3 (E90) sedan 01.jpg |
| 292 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 294 | literal / photoNote | E90 M3 Sedan exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 300 | literal / angle | Rear three-quarter |
| 301 | literal / caption | E90 M3 Sedan exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 303 | literal / label | 2008-2010 BMW M3 (E90) sedan 05.jpg |
| 309 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 317 | literal / label | 2016 M6 Competition F06 Gran Coupe.jpg |
| 318 | literal / author | Robinson Drinkald |
| 320 | literal / license | CC0 |
| 323 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 331 | literal / angle | Rear three-quarter |
| 334 | literal / label | BMW M6 Gran Coupé (F06) Washington DC Metro Area, USA.jpg |
| 335 | literal / author | OWS Photography |
| 340 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 348 | literal / label | 2022-0426-MyWhip-2022 BMW M8 Competition Gran Coupe.jpg |
| 349 | literal / author | Bobak Ha'Eri |
| 354 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 356 | literal / photoNote | F93 M8 Competition Gran Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 362 | literal / angle | Rear three-quarter |
| 363 | literal / caption | F93 M8 Competition Gran Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 365 | literal / label | BMW M8 Competition Gran Coupé (F93, 2021) (52178892762).jpg |
| 366 | literal / author | Charles from Port Chester, New York |
| 371 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 379 | literal / label | BMW M8 Competition Cabriolet (F91) Miami Metro Area, USA (2).jpg |
| 380 | literal / author | OWS Photography |
| 385 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 387 | literal / photoNote | F91 M8 Competition Convertible exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 393 | literal / angle | Rear three-quarter |
| 394 | literal / caption | F91 M8 Competition Convertible exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 396 | literal / label | BMW M8 Competition Cabriolet (F91) Miami Metro Area, USA (1).jpg |
| 397 | literal / author | OWS Photography |
| 402 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 410 | literal / label | 1999 BMW Z3 M Coupe 2.jpg |
| 411 | literal / author | Calreyn88 |
| 416 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 426 | literal / author | Ermell |
| 431 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 433 | literal / photoNote | 2002 turbo exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 440 | literal / label | 1996 BMW 850 CSi.jpg |
| 441 | literal / author | Calreyn88 |
| 446 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 448 | literal / photoNote | E31 850CSi exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 455 | literal / label | BMW 750iL E38 (9224614766).jpg |
| 461 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 463 | literal / photoNote | E38 750iL exterior reference, the long-wheelbase V12 sedan. Photographed year, market and options may differ from the selected 1994 European powertrain specification. |
| 469 | literal / angle | Rear three-quarter |
| 470 | literal / caption | E38 750iL exterior reference, the long-wheelbase V12 sedan. Photographed year, market and options may differ from the selected 1994 European powertrain specification. |
| 472 | literal / label | BMW 750iL E38 (8754882150).jpg |
| 478 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 486 | literal / label | 1974 BMW 3.0 CSL 2.jpg |
| 487 | literal / author | Calreyn88 |
| 492 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 501 | literal / label | BMW 323i E21 in BMW-Museum in Munich, Bayern.JPG |
| 502 | literal / author | Jiří Sedláček |
| 507 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 509 | literal / photoNote | E21 323i exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 516 | literal / label | 2020 BMW M235i xDrive Gran Coupe Front.jpg |
| 517 | literal / author | Vauxford |
| 522 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 524 | literal / photoNote | F44 M235i xDrive Gran Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 530 | literal / angle | Rear three-quarter |
| 531 | literal / caption | F44 M235i xDrive Gran Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 533 | literal / label | 2020 BMW M235i xDrive Gran Coupe Rear.jpg |
| 534 | literal / author | Vauxford |
| 539 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 547 | literal / label | BMW Z4 M Coupé (E86) 182858542.jpg |
| 548 | literal / author | Trop86 |
| 550 | literal / license | CC0 |
| 553 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 555 | literal / photoNote | E86 Z4 M Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 561 | literal / angle | Rear three-quarter |
| 562 | literal / caption | E86 Z4 M Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 564 | literal / label | BMW Z4 M Coupé (E86) 183126220.jpg |
| 565 | literal / author | Trop86 |
| 567 | literal / license | CC0 |
| 570 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 578 | literal / label | BMW i4 M50 (Singapore).jpg |
| 579 | literal / author | Pangalau |
| 584 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 586 | literal / photoNote | G26 i4 M50 exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 593 | literal / label | BMW i5 M60 (G60) Washington DC Metro Area, USA (1).jpg |
| 594 | literal / author | OWS Photography |
| 599 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 601 | literal / photoNote | G60 i5 M60 xDrive exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 607 | literal / angle | Rear three-quarter |
| 608 | literal / caption | G60 i5 M60 xDrive exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 610 | literal / label | BMW i5 M60 (G60) Washington DC Metro Area, USA (2).jpg |
| 611 | literal / author | OWS Photography |
| 616 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 624 | literal / label | BMW i7 M70 1X7A2465.jpg |
| 625 | literal / author | Alexander-93 |
| 630 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 632 | literal / photoNote | G70 i7 M70 xDrive exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 638 | literal / angle | Rear three-quarter |
| 639 | literal / caption | G70 i7 M70 xDrive exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 641 | literal / label | BMW i7 M70 1X7A2463.jpg |
| 642 | literal / author | Alexander-93 |
| 647 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 655 | literal / label | BMW iX M60 (Singapore).jpg |
| 656 | literal / author | Pangalau |
| 661 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 663 | literal / photoNote | I20 iX M60 exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 669 | literal / angle | Rear three-quarter |
| 670 | literal / caption | I20 iX M60 exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 672 | literal / label | BMW iX M60 1X7A2458.jpg |
| 673 | literal / author | Alexander-93 |
| 678 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 686 | literal / label | BMW M3 Competition (G80) Washington DC Metro Area, USA (1).jpg |
| 687 | literal / author | OWS Photography |
| 692 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 701 | literal / label | BMW M4 Competition Coupé G82 front view.jpg |
| 702 | literal / author | Alexandre Prevot |
| 707 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 709 | literal / photoNote | G82 M4 Competition Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 717 | literal / author | Alexander-93 |
| 722 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 724 | literal / photoNote | G87 M2 exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 732 | literal / author | Calreyn88 |
| 737 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 739 | literal / photoNote | F92 M8 Competition Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 745 | literal / angle | Rear three-quarter |
| 746 | literal / caption | F92 M8 Competition Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 748 | literal / label | BMW M8 Competition (F92) Greater Toronto Area, Canada.jpg |
| 749 | literal / author | OWS Photography |
| 754 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 762 | literal / label | BMW M235i (F22) front view.jpg |
| 763 | literal / author | Alessandro |
| 768 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 770 | literal / photoNote | F22 M235i Coupé exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 777 | literal / label | BMW 535i (F10) front 20100425.jpg |
| 778 | literal / author | M 93 |
| 780 | literal / license | Attribution |
| 783 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 785 | literal / photoNote | Pre-facelift F10 535i exterior reference photographed in 2010. Exterior styling, model year and market differ from the selected 2015 US powertrain specification. |
| 792 | literal / label | BMW M5 (F90) front.jpg |
| 793 | literal / author | Tokumeigakarinoaoshima |
| 798 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 800 | literal / photoNote | F90 M5 exterior reference. Photographed year, options and market may differ from the selected factory specification. |
| 807 | literal / label | BMW M3 CSL (E46).jpg |
| 808 | literal / author | Jake Thomas |
| 813 | literal / changes | Resized and converted to WebP. Original composition retained. |
| 815 | literal / photoNote | BMW M3 CSL (E46) on a mountain road, photographed by Jake Thomas. |
| 822 | literal / imageNote | Explore the sourced factory powertrain explanations below. A verified photograph of this specific engine installation is not yet available. |
| 822 | dynamic dynamic-template / car | images/next/{value1}.webp |
| 822 | literal / torqueUnit | Nm |
| 824 | literal / name | Overview |
| 825 | literal | Air enters without a turbocharger. Cylinder capacity, valve timing and engine speed shape the engine’s torque delivery. |
| 825 | literal | Breathing |
| 825 | literal | Exhaust energy turns a turbine connected to an intake-air compressor. Charge-air cooling reduces the heat added as the air is compressed. The displayed turbo count describes the selected engine. |
| 825 | literal | Naturally aspirated power |
| 825 | literal | One exhaust-driven turbocharger |
| 825 | literal | Turbo |
| 825 | literal | Two exhaust-driven turbochargers |
| 826 | literal / name | Drive |
| 827 | literal / name | Hybrid |
| 827 | literal / title | System output and engine output |
| 828 | literal / name | Factory facts |
| 828 | dynamic dynamic-template / text | These figures describe the selected specification and {value1}. PS is metric horsepower. Equipment, power ratings and homologation can differ between markets and model years. Open the BMW source to inspect the original factory information. |
| 861 | literal / market | 2022 European launch specification · M xDrive |
| 861 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 861 | literal / driveNote | An eight-speed M Steptronic transmission, M xDrive and an Active M Differential deliver drive. The rear seats can fold to extend the Touring’s load space. |
| 861 | literal / layout | Inline-six |
| 861 | literal / generation | M SERIES / G81 |
| 861 | literal / drivetrain | M xDrive all-wheel drive |
| 861 | literal / subtitle | The first production M3 Touring. 510 PS meets a full-length roof. |
| 862 | literal / market | 2024 European launch specification · combined hybrid figures |
| 862 | literal / shortLayout | 4.4 L V8 / PLUG-IN HYBRID |
| 862 | literal / subtitle | An M5 for the long way home. 727 PS combined. |
| 862 | literal / generation | M SERIES / G99 |
| 862 | literal / drivetrain | M xDrive all-wheel drive |
| 862 | literal / code | S68 + eDrive |
| 862 | literal / description | The G99 brings the M5 Touring back with a twin-turbo 4.4-litre V8 and an electric motor. Its headline 727 PS and 1,000 Nm describe the coordinated hybrid system, rather than the petrol engine alone. |
| 862 | literal / hybridNote | The petrol engine contributes up to 585 PS and 750 Nm. Engine and motor reach their maximum ratings under different conditions, so their individual peaks are not simply added. A rechargeable battery also enables electric driving. |
| 862 | literal / layout | V8 + electric motor |
| 863 | literal / market | 2022 European CSL specification |
| 863 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 863 | literal / driveNote | An eight-speed M Steptronic transmission sends power to the rear wheels. The CSL’s model-specific chassis, lightweight components and aerodynamics are designed around intensive performance driving. |
| 863 | literal / layout | Inline-six |
| 863 | literal / generation | M SERIES / G82 CSL |
| 863 | literal / description | The M4 CSL combines a 550 PS S58 straight-six with extensive use of carbon-fibre-reinforced plastic and a two-seat cabin. It is a distinct limited-production version of the G82, with a different specification from the M4 Competition. |
| 863 | literal / subtitle | Two seats. Rear-wheel drive. A 550 PS lightweight special. |
| 864 | literal / market | 2023 European CS specification |
| 864 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 864 | literal / subtitle | 550 PS and four seats. The focused G80 special edition. |
| 864 | literal / layout | Inline-six |
| 864 | literal / generation | M SERIES / G80 CS |
| 864 | literal / drivetrain | M xDrive all-wheel drive |
| 864 | literal / driveNote | The eight-speed M Steptronic transmission works with M xDrive and an Active M Differential. The chassis and stability-control settings are tuned specifically for the CS. |
| 864 | literal / description | The G80 M3 CS uses an uprated 3.0-litre S58 with two mono-scroll turbochargers. Carbon-fibre body and cabin components reduce mass while retaining a four-seat layout. |
| 865 | literal / market | 2021 European CS specification |
| 865 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 865 | literal / driveNote | An eight-speed M Steptronic transmission, M xDrive and Active M Differential support the V8. The CS has model-specific chassis tuning and is separate from the 625 PS M5 Competition. |
| 865 | literal / subtitle | Gold-bronze details. Four bucket seats. A 635 PS V8. |
| 865 | literal / generation | M SERIES / F90 CS |
| 865 | literal / drivetrain | M xDrive all-wheel drive |
| 865 | literal / description | The M5 CS develops 635 PS and 750 Nm from its twin-turbo 4.4-litre V8. A carbon-fibre bonnet and other lightweight measures accompany the unusual cabin arrangement of four individual bucket seats. |
| 866 | literal / market | 2020 European CS specification |
| 866 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 866 | literal / subtitle | 450 PS. Carbon roof. A compact CS with a manual option. |
| 866 | literal / layout | Inline-six |
| 866 | literal / generation | M SERIES / F87 CS |
| 866 | literal / description | The F87 M2 CS uses a 450 PS version of the twin-turbo S55 straight-six. Its bonnet and roof use carbon-fibre construction, and adaptive M suspension forms part of the CS specification. |
| 867 | literal / market | 2016 European GTS specification |
| 867 | literal / shortLayout | 3.0 L / INLINE-SIX |
| 867 | literal / driveNote | A seven-speed M dual-clutch transmission drives the rear wheels. This is the production GTS road car, rather than a GT3 or DTM racing vehicle. |
| 867 | literal / layout | Inline-six |
| 867 | literal / generation | M SERIES / F82 GTS |
| 867 | literal / description | The road-going M4 GTS develops 500 PS and 600 Nm from its S55 six-cylinder. Adjustable aero components and a lightweight cabin distinguish it from the regular F82. |
| 867 | literal / subtitle | Water injection and 500 PS. The road-going GTS. |
| 868 | literal / market | 2003 European CSL specification |
| 868 | literal / shortLayout | 3.2 L / INLINE-SIX |
| 868 | literal / subtitle | Carbon airbox. Carbon roof. An unforgettable straight-six. |
| 868 | literal / layout | Inline-six |
| 868 | literal / generation | M SERIES / E46 CSL |
| 868 | literal / driveNote | The CSL uses a six-speed SMG automated manual gearbox and rear-wheel drive. Its factory specification differs from the 343 PS European standard M3. |
| 868 | literal / description | The E46 M3 CSL raises the naturally aspirated S54 straight-six to 360 PS and 370 Nm. A carbon-fibre air collector, carbon roof and carefully reduced weight give this M3 a distinctive identity. |
| 869 | literal / market | 2010 European GTS specification |
| 869 | literal / shortLayout | 4.4 L / NATURALLY ASPIRATED V8 |
| 869 | literal / driveNote | A seven-speed M dual-clutch transmission sends drive to the rear wheels. This limited-production GTS remains a road-car specification, distinct from M3 racing models. |
| 869 | literal / subtitle | Fire Orange. A 4.4-litre V8. 450 naturally aspirated PS. |
| 869 | literal / generation | M SERIES / E92 GTS |
| 869 | literal / description | The M3 GTS enlarges the S65 V8 from the standard M3’s 4.0 litres to 4.4 litres. The result is 450 PS and 440 Nm, combined with adjustable suspension, aerodynamic components and a two-seat cabin. |
| 870 | literal / market | 1990 European Sport Evolution specification |
| 870 | literal / shortLayout | 2.5 L / INLINE-FOUR |
| 870 | literal / layout | Inline-four |
| 870 | literal / generation | M SERIES / E30 SPORT EVO |
| 870 | literal / description | The Sport Evolution increases the S14 four-cylinder to 2,467 cm³ and produces 238 PS with 240 Nm. Its adjustable front and rear aero elements mark a late development of the original M3 road car. |
| 870 | literal / subtitle | The ultimate E30 chapter. 2.5 litres and 238 PS. |
| 871 | literal / market | 2008 European sedan specification |
| 871 | literal / shortLayout | 4.0 L / NATURALLY ASPIRATED V8 |
| 871 | literal / subtitle | Four doors around the naturally aspirated S65 V8. |
| 871 | literal / generation | M SERIES / E90 |
| 871 | literal / description | The E90 M3 places the 4.0-litre S65 V8 in a four-door sedan body. Its 420 PS and 400 Nm retain the high-revving character shared with the E92 M3 Coupé. |
| 871 | literal / driveNote | The front-mounted V8 drives the rear wheels. A six-speed manual gearbox and optional seven-speed M dual-clutch transmission offered different ways to experience the same M3 engine. |
| 872 | literal / market | 2016 European specification · 600 PS Competition Package |
| 872 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 872 | literal / subtitle | 600 PS. Four doors. A sweeping roofline and a twin-turbo V8. |
| 872 | literal / name | BMW M6 Competition Gran Coupé |
| 872 | literal / generation | M SERIES / F06 |
| 872 | literal / description | The F06 M6 Gran Coupé with the revised Competition Package develops 600 PS and 700 Nm. Introduced for July 2015 production, this package increases output over the standard M6 while retaining its carbon-fibre roof and four-door body. |
| 873 | literal / market | 2020 European Competition launch specification |
| 873 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 873 | literal / subtitle | 625 PS. Four doors. The grandest M8 silhouette. |
| 873 | literal / driveNote | An eight-speed M Steptronic transmission, M xDrive and Active M Differential coordinate drive. The F93 is a separate four-door body from the F92 Coupé and F91 Convertible. |
| 873 | literal / name | BMW M8 Competition Gran Coupé |
| 873 | literal / generation | M SERIES / F93 |
| 873 | literal / drivetrain | M xDrive all-wheel drive |
| 873 | literal / description | The M8 Competition Gran Coupé develops 625 PS and 750 Nm from a twin-turbo 4.4-litre V8. A wheelbase extended over the two-door M8 creates more rear-seat room beneath its flowing roofline. |
| 874 | literal / market | 2019 European Competition launch specification |
| 874 | literal / shortLayout | 4.4 L / TWIN-TURBO V8 |
| 874 | literal / driveNote | An eight-speed M Steptronic gearbox, M xDrive and an Active M Differential deliver the V8’s torque. The Convertible body has its own structure and weight compared with the M8 Coupé. |
| 874 | literal / generation | M SERIES / F91 |
| 874 | literal / drivetrain | M xDrive all-wheel drive |
| 874 | literal / subtitle | Open-air grand touring with 625 PS of M V8 power. |
| 874 | literal / description | The F91 M8 Competition combines a folding fabric roof with a 625 PS twin-turbo 4.4-litre V8. Its twin-turbo combustion powertrain develops 750 Nm. |
| 875 | literal / market | 1998 European S50 specification |
| 875 | literal / shortLayout | 3.2 L / INLINE-SIX |
| 875 | literal / driveNote | A five-speed manual gearbox drives the rear wheels. The early US S52 model and later S54-engined cars have different factory specifications. |
| 875 | literal / name | BMW Z3 M Coupé |
| 875 | literal / layout | Inline-six |
| 875 | literal / generation | M SERIES / E36/8 |
| 875 | literal / description | The early European Z3 M Coupé uses the 3.2-litre S50 straight-six with 321 PS and 350 Nm. Its fixed roof and distinctive rear hatch separate it from the open M Roadster. |
| 875 | literal / subtitle | The unmistakable M Coupé. Compact, muscular and six-cylinder. |
| 876 | literal / generation | 02 SERIES / E20 |
| 876 | literal / market | 1973 European road-car specification |
| 876 | literal / shortLayout | 2.0 L / TURBO INLINE-FOUR |
| 876 | literal / driveNote | A manual transmission drives the rear wheels. The body’s extended wheel arches, front spoiler and period stripes made this 02-series model immediately recognisable. |
| 876 | literal / subtitle | A turbocharged pioneer. 170 PS from a two-litre four. |
| 876 | literal / name | BMW 2002 turbo |
| 876 | literal / layout | Inline-four |
| 876 | literal / description | The 2002 turbo combines a two-litre four-cylinder with Kugelfischer fuel injection and a KKK exhaust-gas turbocharger. Its 170 PS and 240 Nm made it a landmark turbocharged BMW road car. |
| 877 | literal / market | 1992 European 850CSi specification |
| 877 | literal / shortLayout | 5.6 L / NATURALLY ASPIRATED V12 |
| 877 | literal / generation | 8 SERIES / E31 |
| 877 | literal / subtitle | A 5.6-litre V12, pop-up headlights and six manual gears. |
| 877 | literal / driveNote | A six-speed manual transmission delivers power to the rear axle. The low, pillarless coupé body and pop-up headlights are hallmarks of the original 8 Series. |
| 877 | literal / description | The 850CSi develops 380 PS and 550 Nm from its 5.6-litre V12. This range-topping E31 was developed with BMW Motorsport and uses a specification distinct from the 850i and 850Ci. |
| 878 | literal / market | 1994 European V12 powertrain specification · long wheelbase |
| 878 | literal / shortLayout | 5.4 L / NATURALLY ASPIRATED V12 |
| 878 | literal / generation | 7 SERIES / E38 |
| 878 | literal / driveNote | A five-speed automatic transmission drives the rear wheels. The iL body is longer than the standard-wheelbase 750i, while sharing its V12 powertrain family. |
| 878 | literal / description | The E38 750iL pairs a 5.4-litre V12 with an extended-wheelbase sedan body. BMW rates this engine generation at 326 PS and 490 Nm, prioritising smooth power delivery and flagship comfort. |
| 879 | literal / market | 1973 European 3,153 cm³ road specification |
| 879 | literal / shortLayout | 3.2 L / INLINE-SIX |
| 879 | literal / series | Classic |
| 879 | literal / generation | CLASSIC / E9 |
| 879 | literal / layout | Inline-six |
| 879 | literal / description | The later road-going E9 CSL uses a 3,153 cm³ naturally aspirated straight-six with 206 PS. Aluminium body panels and reduced equipment serve its lightweight philosophy. This entry describes the road car, rather than the much more powerful racing CSLs. |
| 879 | literal / subtitle | The lightweight road-car icon behind the CSL legend. |
| 880 | literal / market | 1977 European 323i introduction |
| 880 | literal / shortLayout | 2.3 L / INLINE-SIX |
| 880 | literal / generation | 3 SERIES / E21 |
| 880 | literal / layout | Inline-six |
| 880 | literal / subtitle | The first 3 Series discovers its straight-six signature. |
| 880 | literal / description | The first-generation 323i brings a 2.3-litre straight-six to the original 3 Series. BMW’s historical summary gives 143 PS and describes its role in establishing the model line’s six-cylinder character. |
| 881 | literal / generation | 2 SERIES / F44 |
| 881 | literal / shortLayout | 2.0 L / INLINE-FOUR |
| 881 | literal / market | 2020 Singapore launch specification |
| 881 | literal / subtitle | A compact four-door Gran Coupé with 306 PS and xDrive. |
| 881 | literal / driveNote | An eight-speed Steptronic Sport transmission, xDrive and a front-axle Torsen limited-slip differential coordinate traction. Its compact four-door architecture differs from the rear-drive 2 Series Coupé. |
| 881 | literal / name | BMW M235i xDrive Gran Coupé |
| 881 | literal / layout | Inline-four |
| 881 | literal / description | The F44 M235i Gran Coupé uses a transversely mounted two-litre turbocharged four-cylinder, rated at 306 PS and 450 Nm in the selected launch specification. It is an M Performance model, distinct from the two-door M235i Coupé. |
| 881 | literal / drivetrain | xDrive all-wheel drive |
| 882 | literal / market | 2006 European M Coupé specification |
| 882 | literal / shortLayout | 3.2 L / INLINE-SIX |
| 882 | literal / subtitle | A fixed-roof Z4 with the naturally aspirated S54. |
| 882 | literal / driveNote | A six-speed manual transmission and variable M differential lock deliver drive to the rear wheels. The M Coupé is distinct from the ordinary Z4 3.0si Coupé. |
| 882 | literal / name | BMW Z4 M Coupé |
| 882 | literal / layout | Inline-six |
| 882 | literal / generation | M SERIES / E86 |
| 882 | literal / description | The E86 Z4 M Coupé uses the naturally aspirated 3.2-litre S54 straight-six, rated at 343 PS and 365 Nm. Its fixed roof and rear hatch give it a different profile from the E85 M Roadster. |
| 885 | dynamic dynamic-template / induction | {value1} kWh usable |
| 885 | literal / layout | Dual-motor all-wheel drive |
| 885 | literal / shortLayout | ELECTRIC / ALL-WHEEL DRIVE |
| 885 | literal / drivetrain | Electric all-wheel drive |
| 885 | literal / imageNote | Explore the sourced electric-drive explanations below. A verified powertrain inspection photograph for this exact variant is not yet available. |
| 885 | dynamic dynamic-template / car | images/next/{value1}.webp |
| 885 | literal / torqueUnit | Nm |
| 885 | literal / powerScope | Peak system output with boost |
| 886 | dynamic dynamic-template / title | {value1} kWh usable energy |
| 886 | literal / name | Boost |
| 886 | literal / title | Coordinated front and rear electric motors |
| 886 | literal / text | During deceleration, the drive motors can act as generators. Power electronics manage energy recovered into the high-voltage battery, while physical brakes provide additional stopping force. |
| 886 | literal / name | Factory facts |
| 886 | literal / title | Recover energy while slowing down |
| 886 | dynamic dynamic-template / text | The underfloor lithium-ion battery provides {value1} kWh of usable energy in the selected specification. Usable capacity describes the driver-accessible operating window and differs from gross capacity. |
| 886 | literal / text | These facts describe a selected launch specification. Motor ratings, temporary peak output, battery capacities and equipment can change with model year or market. Open the BMW source for the original factory information. |
| 886 | literal / title | Understand the peak figures |
| 889 | literal / market | 2021 European M50 launch specification · Sport Boost peaks |
| 889 | literal / subtitle | A four-door electric Gran Coupé with 400 kW Sport Boost. |
| 889 | literal / generation | BMW i / G26 |
| 889 | literal / name | BMW i4 M50 |
| 889 | literal / boostNote | The displayed 400 kW and 795 Nm describe Sport Boost or Launch Control conditions. The temporary increase is limited in duration and should not be treated as a continuous motor rating. Individual motor peak outputs are not simply added. |
| 889 | literal / description | The i4 M50 coordinates electrically excited synchronous drive units on both axles. Its Sport Boost peak reaches 400 kW and 795 Nm, combining electric all-wheel drive with the low roofline and tailgate of a Gran Coupé. |
| 890 | literal / market | 2023 European launch specification · boost peak figures |
| 890 | literal / generation | BMW i / G60 |
| 890 | literal / name | BMW i5 M60 xDrive |
| 890 | literal / description | The i5 M60 xDrive combines a front electric drive unit with a rear electric drive unit. Its selected launch specification reaches up to 442 kW, with up to 820 Nm when M Sport Boost or M Launch Control is active. |
| 890 | literal / subtitle | Two motors. Up to 442 kW. The electric performance 5 Series. |
| 891 | literal / market | 2023 European M70 launch specification · Sport / boost peaks |
| 891 | literal / generation | BMW i / G70 |
| 891 | literal / name | BMW i7 M70 xDrive |
| 891 | literal / subtitle | Flagship comfort, with up to 485 kW of electric drive. |
| 891 | literal / boostNote | Peak system torque reaches 1,100 Nm with M Launch Control or M Sport Boost. BMW lists 1,015 Nm in Sport mode without that additional boost. The displayed 485 kW is a peak system rating, rather than a continuous motor rating. |
| 891 | literal / description | The i7 M70 pairs front and rear electric motors with a maximum coordinated system output of 485 kW. The long-wheelbase luxury sedan brings an M Performance specification to the fully electric 7 Series. |
| 892 | literal / market | 2022 European M60 specification · temporary boost / Launch Control |
| 892 | literal / subtitle | 455 kW with boost. Electric performance on an X scale. |
| 892 | literal / generation | BMW i / I20 |
| 892 | literal / name | BMW iX M60 |
| 892 | literal / boostNote | BMW specifies up to 397 kW outside the temporary increase, and up to 455 kW for less than ten seconds. Torque is 1,015 Nm in Sport mode and reaches 1,100 Nm with Launch Control. These peaks are distinct from continuous output. |
| 892 | literal / description | The iX M60 combines two electric drive units with an M-specific chassis and air suspension. Its coordinated drive system can temporarily reach 455 kW and up to 1,100 Nm with Launch Control. |

### public/official-heritage.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 6 | literal / label | BMW M3 Convertible — Front three-quarter |
| 12 | literal / photoType | Manufacturer editorial reference |
| 14 | literal / photoAngle | Front three-quarter |
| 19 | literal / angle | Rear three-quarter |
| 22 | literal / label | BMW M3 Convertible — Rear three-quarter |
| 28 | literal / photoType | Manufacturer editorial reference |
| 33 | literal / angle | Side profile |
| 36 | literal / label | BMW M3 Convertible — Side profile |
| 42 | literal / photoType | Manufacturer editorial reference |
| 50 | literal / label | BMW M3 — Front three-quarter |
| 56 | literal / photoType | Manufacturer editorial reference |
| 58 | literal / photoAngle | Front three-quarter |
| 63 | literal / angle | Rear three-quarter |
| 66 | literal / label | BMW M3 — Rear three-quarter |
| 72 | literal / photoType | Manufacturer editorial reference |
| 80 | literal / label | BMW M3 — Interior |
| 86 | literal / photoType | Manufacturer editorial reference |
| 94 | literal / label | BMW M5 — Front three-quarter |
| 100 | literal / photoType | Manufacturer editorial reference |
| 102 | literal / photoAngle | Front three-quarter |
| 107 | literal / angle | Rear three-quarter |
| 110 | literal / label | BMW M5 — Rear three-quarter |
| 116 | literal / photoType | Manufacturer editorial reference |
| 121 | literal / angle | Side profile |
| 124 | literal / label | BMW M5 — Side profile |
| 130 | literal / photoType | Manufacturer editorial reference |
| 138 | literal / label | BMW M5 — Interior |
| 144 | literal / photoType | Manufacturer editorial reference |
| 152 | literal / label | BMW M5 — Front three-quarter |
| 158 | literal / photoType | Manufacturer editorial reference |
| 160 | literal / photoAngle | Front three-quarter |
| 165 | literal / angle | Rear three-quarter |
| 168 | literal / label | BMW M5 — Rear three-quarter |
| 174 | literal / photoType | Manufacturer editorial reference |
| 179 | literal / angle | Side profile |
| 182 | literal / label | BMW M5 — Side profile |
| 188 | literal / photoType | Manufacturer editorial reference |
| 196 | literal / label | BMW M5 — Interior |
| 202 | literal / photoType | Manufacturer editorial reference |
| 210 | literal / label | BMW M3 CSL — Front three-quarter |
| 216 | literal / photoType | Manufacturer editorial reference |
| 218 | literal / photoAngle | Front three-quarter |
| 223 | literal / angle | Rear three-quarter |
| 226 | literal / label | BMW M3 CSL — Rear three-quarter |
| 232 | literal / photoType | Manufacturer editorial reference |
| 237 | literal / angle | Side profile |
| 240 | literal / label | BMW M3 CSL — Side profile |
| 246 | literal / photoType | Manufacturer editorial reference |
| 254 | literal / label | BMW M3 CSL — Interior |
| 260 | literal / photoType | Manufacturer editorial reference |
| 268 | literal / label | BMW M3 GTS — Front three-quarter |
| 274 | literal / photoType | Manufacturer editorial reference |
| 276 | literal / photoAngle | Front three-quarter |
| 281 | literal / angle | Rear three-quarter |
| 284 | literal / label | BMW M3 GTS — Rear three-quarter |
| 290 | literal / photoType | Manufacturer editorial reference |
| 295 | literal / angle | Side profile |
| 298 | literal / label | BMW M3 GTS — Side profile |
| 304 | literal / photoType | Manufacturer editorial reference |
| 312 | literal / label | BMW M3 GTS — Interior |
| 318 | literal / photoType | Manufacturer editorial reference |
| 326 | literal / label | BMW M3 Sport Evolution — Front three-quarter |
| 332 | literal / photoType | Manufacturer editorial reference |
| 334 | literal / photoAngle | Front three-quarter |
| 339 | literal / angle | Rear three-quarter |
| 342 | literal / label | BMW M3 Sport Evolution — Rear three-quarter |
| 348 | literal / photoType | Manufacturer editorial reference |
| 356 | literal / label | BMW M3 Sport Evolution — Interior |
| 362 | literal / photoType | Manufacturer editorial reference |
| 370 | literal / label | BMW 330i — Front three-quarter |
| 376 | literal / photoType | Manufacturer editorial reference |
| 378 | literal / photoAngle | Front three-quarter |
| 385 | literal / label | BMW M3 Sedan — Front three-quarter |
| 391 | literal / photoType | Manufacturer editorial reference |
| 393 | literal / photoAngle | Front three-quarter |
| 398 | literal / angle | Rear three-quarter |
| 401 | literal / label | BMW M3 Sedan — Rear three-quarter |
| 407 | literal / photoType | Manufacturer editorial reference |
| 412 | literal / angle | Side profile |
| 415 | literal / label | BMW M3 Sedan — Side profile |
| 421 | literal / photoType | Manufacturer editorial reference |
| 429 | literal / label | BMW M3 Sedan — Interior |
| 435 | literal / photoType | Manufacturer editorial reference |
| 443 | literal / label | BMW 335i Coupé — Front three-quarter |
| 449 | literal / photoType | Manufacturer editorial reference |
| 451 | literal / photoAngle | Front three-quarter |
| 456 | literal / angle | Rear three-quarter |
| 459 | literal / label | BMW 335i Coupé — Rear three-quarter |
| 465 | literal / photoType | Manufacturer editorial reference |
| 470 | literal / angle | Side profile |
| 473 | literal / label | BMW 335i Coupé — Side profile |
| 479 | literal / photoType | Manufacturer editorial reference |
| 487 | literal / label | BMW 335i Coupé — Interior |
| 493 | literal / photoType | Manufacturer editorial reference |
| 501 | literal / label | BMW 323i — Front three-quarter |
| 507 | literal / photoType | Manufacturer editorial reference |
| 509 | literal / photoAngle | Front three-quarter |
| 516 | literal / label | BMW 2002 turbo — Front three-quarter |
| 522 | literal / photoType | Manufacturer editorial reference |
| 524 | literal / photoAngle | Front three-quarter |
| 529 | literal / angle | Rear three-quarter |
| 532 | literal / label | BMW 2002 turbo — Rear three-quarter |
| 538 | literal / photoType | Manufacturer editorial reference |
| 543 | literal / angle | Side profile |
| 546 | literal / label | BMW 2002 turbo — Side profile |
| 552 | literal / photoType | Manufacturer editorial reference |
| 560 | literal / label | BMW 2002 turbo — Interior |
| 566 | literal / photoType | Manufacturer editorial reference |
| 574 | literal / label | BMW 335i — Front three-quarter |
| 580 | literal / photoType | Manufacturer editorial reference |
| 582 | literal / photoAngle | Front three-quarter |
| 587 | literal / angle | Rear three-quarter |
| 590 | literal / label | BMW 335i — Rear three-quarter |
| 596 | literal / photoType | Manufacturer editorial reference |
| 601 | literal / angle | Side profile |
| 604 | literal / label | BMW 335i — Side profile |
| 610 | literal / photoType | Manufacturer editorial reference |
| 618 | literal / label | BMW 335i — Interior |
| 624 | literal / photoType | Manufacturer editorial reference |
| 632 | literal / label | BMW Z3 M Coupé — Front three-quarter |
| 638 | literal / photoType | Manufacturer editorial reference |
| 640 | literal / photoAngle | Front three-quarter |
| 645 | literal / angle | Rear three-quarter |
| 648 | literal / label | BMW Z3 M Coupé — Rear three-quarter |
| 654 | literal / photoType | Manufacturer editorial reference |
| 659 | literal / angle | Side profile |
| 662 | literal / label | BMW Z3 M Coupé — Side profile |
| 668 | literal / photoType | Manufacturer editorial reference |
| 676 | literal / label | BMW Z3 M Coupé — Interior |
| 682 | literal / photoType | Manufacturer editorial reference |
| 690 | literal / label | BMW 750iL — Side profile |
| 696 | literal / photoType | Manufacturer editorial reference |
| 698 | literal / photoAngle | Side profile |
| 705 | literal / label | BMW 3.0 CSL — Front three-quarter |
| 711 | literal / photoType | Manufacturer editorial reference |
| 713 | literal / photoAngle | Front three-quarter |
| 718 | literal / angle | Rear three-quarter |
| 721 | literal / label | BMW 3.0 CSL — Rear three-quarter |
| 727 | literal / photoType | Manufacturer editorial reference |
| 732 | literal / angle | Rear three-quarter |
| 735 | literal / label | BMW 3.0 CSL — Rear three-quarter |
| 741 | literal / photoType | Manufacturer editorial reference |
| 749 | literal / label | BMW 3.0 CSL — Interior |
| 755 | literal / photoType | Manufacturer editorial reference |
| 763 | literal / label | BMW 850CSi — Front three-quarter |
| 769 | literal / photoType | Manufacturer editorial reference |
| 771 | literal / photoAngle | Front three-quarter |
| 776 | literal / angle | Rear three-quarter |
| 779 | literal / label | BMW 850CSi — Rear three-quarter |
| 785 | literal / photoType | Manufacturer editorial reference |
| 790 | literal / angle | Side profile |
| 793 | literal / label | BMW 850CSi — Side profile |
| 799 | literal / photoType | Manufacturer editorial reference |
| 807 | literal / label | BMW 850CSi — Interior |
| 813 | literal / photoType | Manufacturer editorial reference |
| 821 | literal / label | BMW Z4 M Coupé — Front three-quarter |
| 827 | literal / photoType | Manufacturer editorial reference |
| 829 | literal / photoAngle | Front three-quarter |
| 834 | literal / angle | Rear three-quarter |
| 837 | literal / label | BMW Z4 M Coupé — Rear three-quarter |
| 843 | literal / photoType | Manufacturer editorial reference |
| 848 | literal / angle | Side profile |
| 851 | literal / label | BMW Z4 M Coupé — Side profile |
| 857 | literal / photoType | Manufacturer editorial reference |
| 865 | literal / label | BMW Z4 M Coupé — Interior |
| 871 | literal / photoType | Manufacturer editorial reference |
| 879 | literal / label | BMW 530i — Front three-quarter |
| 885 | literal / photoType | Manufacturer editorial reference |
| 887 | literal / photoAngle | Front three-quarter |
| 892 | literal / angle | Rear three-quarter |
| 895 | literal / label | BMW 530i — Rear three-quarter |
| 901 | literal / photoType | Manufacturer editorial reference |
| 906 | literal / angle | Side profile |
| 909 | literal / label | BMW 530i — Side profile |
| 915 | literal / photoType | Manufacturer editorial reference |
| 923 | literal / label | BMW 530i — Interior |
| 929 | literal / photoType | Manufacturer editorial reference |
| 937 | literal / label | BMW M1 — Front three-quarter |
| 943 | literal / photoType | Manufacturer editorial reference |
| 945 | literal / photoAngle | Front three-quarter |
| 950 | literal / angle | Side profile |
| 953 | literal / label | BMW M1 — Side profile |
| 959 | literal / photoType | Manufacturer editorial reference |
| 964 | literal / angle | Rear view |
| 967 | literal / label | BMW M1 — Rear view |
| 973 | literal / photoType | Manufacturer editorial reference |
| 981 | literal / label | BMW 1 Series M Coupé — Front three-quarter |
| 987 | literal / photoType | Manufacturer editorial reference |
| 989 | literal / photoAngle | Front three-quarter |
| 994 | literal / angle | Rear three-quarter |
| 997 | literal / label | BMW 1 Series M Coupé — Rear three-quarter |
| 1003 | literal / photoType | Manufacturer editorial reference |
| 1008 | literal / angle | Side profile |
| 1011 | literal / label | BMW 1 Series M Coupé — Side profile |
| 1017 | literal / photoType | Manufacturer editorial reference |
| 1025 | literal / label | BMW 1 Series M Coupé — Interior |
| 1031 | literal / photoType | Manufacturer editorial reference |
| 1039 | literal / label | BMW M3 3.0 Coupé — Front three-quarter |
| 1045 | literal / photoType | Manufacturer editorial reference |
| 1047 | literal / photoAngle | Front three-quarter |
| 1052 | literal / angle | Rear three-quarter |
| 1055 | literal / label | BMW M3 3.0 Coupé — Rear three-quarter |
| 1061 | literal / photoType | Manufacturer editorial reference |
| 1066 | literal / angle | Front view |
| 1069 | literal / label | BMW M3 3.0 Coupé — Front view |
| 1075 | literal / photoType | Manufacturer editorial reference |
| 1083 | literal / label | BMW M3 — Front three-quarter |
| 1089 | literal / photoType | Manufacturer editorial reference |
| 1091 | literal / photoAngle | Front three-quarter |
| 1096 | literal / angle | Rear three-quarter |
| 1099 | literal / label | BMW M3 — Rear three-quarter |
| 1105 | literal / photoType | Manufacturer editorial reference |
| 1110 | literal / angle | Side profile |
| 1113 | literal / label | BMW M3 — Side profile |
| 1119 | literal / photoType | Manufacturer editorial reference |
| 1127 | literal / label | BMW M5 — Front three-quarter |
| 1133 | literal / photoType | Manufacturer editorial reference |
| 1135 | literal / photoAngle | Front three-quarter |
| 1140 | literal / angle | Side profile |
| 1143 | literal / label | BMW M5 — Side profile |
| 1149 | literal / photoType | Manufacturer editorial reference |
| 1154 | literal / angle | Rear view |
| 1157 | literal / label | BMW M5 — Rear view |
| 1163 | literal / photoType | Manufacturer editorial reference |
| 1171 | literal / label | BMW M5 — Interior |
| 1177 | literal / photoType | Manufacturer editorial reference |
| 1185 | literal / label | BMW M5 3.6 — Front three-quarter |
| 1191 | literal / photoType | Manufacturer editorial reference |
| 1193 | literal / photoAngle | Front three-quarter |
| 1198 | literal / angle | Side profile |
| 1201 | literal / label | BMW M5 3.6 — Side profile |
| 1207 | literal / photoType | Manufacturer editorial reference |
| 1212 | literal / angle | Rear view |
| 1215 | literal / label | BMW M5 3.6 — Rear view |
| 1221 | literal / photoType | Manufacturer editorial reference |
| 1229 | literal / label | BMW M635CSi — Front three-quarter |
| 1235 | literal / photoType | Manufacturer editorial reference |
| 1237 | literal / photoAngle | Front three-quarter |
| 1242 | literal / angle | Side profile |
| 1245 | literal / label | BMW M635CSi — Side profile |
| 1251 | literal / photoType | Manufacturer editorial reference |
| 1256 | literal / angle | Rear view |
| 1259 | literal / label | BMW M635CSi — Rear view |
| 1265 | literal / photoType | Manufacturer editorial reference |
| 1273 | literal / label | BMW M6 Coupé — Front three-quarter |
| 1279 | literal / photoType | Manufacturer editorial reference |
| 1281 | literal / photoAngle | Front three-quarter |
| 1286 | literal / angle | Rear three-quarter |
| 1289 | literal / label | BMW M6 Coupé — Rear three-quarter |
| 1295 | literal / photoType | Manufacturer editorial reference |
| 1300 | literal / angle | Side profile |
| 1303 | literal / label | BMW M6 Coupé — Side profile |
| 1309 | literal / photoType | Manufacturer editorial reference |
| 1317 | literal / label | BMW M6 Coupé — Interior |
| 1323 | literal / photoType | Manufacturer editorial reference |
| 1331 | literal / label | BMW Z3 M Roadster — Front three-quarter |
| 1337 | literal / photoType | Manufacturer editorial reference |
| 1339 | literal / photoAngle | Front three-quarter |
| 1344 | literal / angle | Rear three-quarter |
| 1347 | literal / label | BMW Z3 M Roadster — Rear three-quarter |
| 1353 | literal / photoType | Manufacturer editorial reference |
| 1358 | literal / angle | Side profile |
| 1361 | literal / label | BMW Z3 M Roadster — Side profile |
| 1367 | literal / photoType | Manufacturer editorial reference |
| 1375 | literal / label | BMW Z3 M Roadster — Interior |
| 1381 | literal / photoType | Manufacturer editorial reference |
| 1389 | literal / label | BMW Z4 M Roadster — Front three-quarter |
| 1395 | literal / photoType | Manufacturer editorial reference |
| 1397 | literal / photoAngle | Front three-quarter |
| 1402 | literal / angle | Rear three-quarter |
| 1405 | literal / label | BMW Z4 M Roadster — Rear three-quarter |
| 1411 | literal / photoType | Manufacturer editorial reference |
| 1416 | literal / angle | Side profile |
| 1419 | literal / label | BMW Z4 M Roadster — Side profile |
| 1425 | literal / photoType | Manufacturer editorial reference |
| 1433 | literal / label | BMW Z4 M Roadster — Interior |
| 1439 | literal / photoType | Manufacturer editorial reference |
| 1447 | literal / label | BMW M3 Convertible — Front three-quarter |
| 1453 | literal / photoType | Manufacturer editorial reference |
| 1456 | literal / label | BMW M3 — Front three-quarter |
| 1462 | literal / photoType | Manufacturer editorial reference |
| 1465 | literal / label | BMW M5 — Front three-quarter |
| 1471 | literal / photoType | Manufacturer editorial reference |
| 1474 | literal / label | BMW M5 — Front three-quarter |
| 1480 | literal / photoType | Manufacturer editorial reference |
| 1483 | literal / label | BMW M3 Convertible — Rear three-quarter |
| 1489 | literal / photoType | Manufacturer editorial reference |
| 1492 | literal / label | BMW M3 — Rear three-quarter |
| 1498 | literal / photoType | Manufacturer editorial reference |
| 1501 | literal / label | BMW M5 — Rear three-quarter |
| 1507 | literal / photoType | Manufacturer editorial reference |
| 1510 | literal / label | BMW M5 — Rear three-quarter |
| 1516 | literal / photoType | Manufacturer editorial reference |
| 1519 | literal / label | BMW M3 Convertible — Side profile |
| 1525 | literal / photoType | Manufacturer editorial reference |
| 1528 | literal / label | BMW M3 — Interior |
| 1534 | literal / photoType | Manufacturer editorial reference |
| 1537 | literal / label | BMW M5 — Side profile |
| 1543 | literal / photoType | Manufacturer editorial reference |
| 1546 | literal / label | BMW M5 — Side profile |
| 1552 | literal / photoType | Manufacturer editorial reference |
| 1555 | literal / label | BMW M3 CSL — Front three-quarter |
| 1561 | literal / photoType | Manufacturer editorial reference |
| 1564 | literal / label | BMW M3 GTS — Front three-quarter |
| 1570 | literal / photoType | Manufacturer editorial reference |
| 1573 | literal / label | BMW M3 CSL — Rear three-quarter |
| 1579 | literal / photoType | Manufacturer editorial reference |
| 1582 | literal / label | BMW M5 — Interior |
| 1588 | literal / photoType | Manufacturer editorial reference |
| 1591 | literal / label | BMW M5 — Interior |
| 1597 | literal / photoType | Manufacturer editorial reference |
| 1600 | literal / label | BMW M3 GTS — Rear three-quarter |
| 1606 | literal / photoType | Manufacturer editorial reference |
| 1609 | literal / label | BMW M3 CSL — Side profile |
| 1615 | literal / photoType | Manufacturer editorial reference |
| 1618 | literal / label | BMW M3 Sport Evolution — Front three-quarter |
| 1624 | literal / photoType | Manufacturer editorial reference |
| 1627 | literal / label | BMW M3 GTS — Side profile |
| 1633 | literal / photoType | Manufacturer editorial reference |
| 1636 | literal / label | BMW M3 Sedan — Front three-quarter |
| 1642 | literal / photoType | Manufacturer editorial reference |
| 1645 | literal / label | BMW M3 Sport Evolution — Rear three-quarter |
| 1651 | literal / photoType | Manufacturer editorial reference |
| 1654 | literal / label | BMW M3 CSL — Interior |
| 1660 | literal / photoType | Manufacturer editorial reference |
| 1663 | literal / label | BMW M3 GTS — Interior |
| 1669 | literal / photoType | Manufacturer editorial reference |
| 1672 | literal / label | BMW M3 Sport Evolution — Interior |
| 1678 | literal / photoType | Manufacturer editorial reference |
| 1681 | literal / label | BMW 330i — Front three-quarter |
| 1687 | literal / photoType | Manufacturer editorial reference |
| 1690 | literal / label | BMW 530i — Front three-quarter |
| 1696 | literal / photoType | Manufacturer editorial reference |
| 1699 | literal / label | BMW M3 Sedan — Rear three-quarter |
| 1705 | literal / photoType | Manufacturer editorial reference |
| 1708 | literal / label | BMW 335i — Front three-quarter |
| 1714 | literal / photoType | Manufacturer editorial reference |
| 1717 | literal / label | BMW 335i Coupé — Front three-quarter |
| 1723 | literal / photoType | Manufacturer editorial reference |
| 1726 | literal / label | BMW 530i — Rear three-quarter |
| 1732 | literal / photoType | Manufacturer editorial reference |
| 1735 | literal / label | BMW 335i Coupé — Rear three-quarter |
| 1741 | literal / photoType | Manufacturer editorial reference |
| 1744 | literal / label | BMW 335i — Rear three-quarter |
| 1750 | literal / photoType | Manufacturer editorial reference |
| 1753 | literal / label | BMW 335i Coupé — Side profile |
| 1759 | literal / photoType | Manufacturer editorial reference |
| 1762 | literal / label | BMW M3 Sedan — Side profile |
| 1768 | literal / photoType | Manufacturer editorial reference |
| 1771 | literal / label | BMW 530i — Side profile |
| 1777 | literal / photoType | Manufacturer editorial reference |
| 1780 | literal / label | BMW 335i — Side profile |
| 1786 | literal / photoType | Manufacturer editorial reference |
| 1789 | literal / label | BMW M3 Sedan — Interior |
| 1795 | literal / photoType | Manufacturer editorial reference |
| 1798 | literal / label | BMW 335i Coupé — Interior |
| 1804 | literal / photoType | Manufacturer editorial reference |
| 1807 | literal / label | BMW 323i — Front three-quarter |
| 1813 | literal / photoType | Manufacturer editorial reference |
| 1816 | literal / label | BMW Z3 M Coupé — Front three-quarter |
| 1822 | literal / photoType | Manufacturer editorial reference |
| 1825 | literal / label | BMW 2002 turbo — Front three-quarter |
| 1831 | literal / photoType | Manufacturer editorial reference |
| 1834 | literal / label | BMW 2002 turbo — Rear three-quarter |
| 1840 | literal / photoType | Manufacturer editorial reference |
| 1843 | literal / label | BMW 2002 turbo — Side profile |
| 1849 | literal / photoType | Manufacturer editorial reference |
| 1852 | literal / label | BMW Z3 M Coupé — Rear three-quarter |
| 1858 | literal / photoType | Manufacturer editorial reference |
| 1861 | literal / label | BMW Z3 M Coupé — Side profile |
| 1867 | literal / photoType | Manufacturer editorial reference |
| 1870 | literal / label | BMW 2002 turbo — Interior |
| 1876 | literal / photoType | Manufacturer editorial reference |
| 1879 | literal / label | BMW 335i — Interior |
| 1885 | literal / photoType | Manufacturer editorial reference |
| 1888 | literal / label | BMW 850CSi — Front three-quarter |
| 1894 | literal / photoType | Manufacturer editorial reference |
| 1897 | literal / label | BMW Z3 M Coupé — Interior |
| 1903 | literal / photoType | Manufacturer editorial reference |
| 1906 | literal / label | BMW 750iL — Side profile |
| 1912 | literal / photoType | Manufacturer editorial reference |
| 1915 | literal / label | BMW 3.0 CSL — Front three-quarter |
| 1921 | literal / photoType | Manufacturer editorial reference |
| 1924 | literal / label | BMW 850CSi — Rear three-quarter |
| 1930 | literal / photoType | Manufacturer editorial reference |
| 1933 | literal / label | BMW Z4 M Coupé — Front three-quarter |
| 1939 | literal / photoType | Manufacturer editorial reference |
| 1942 | literal / label | BMW 3.0 CSL — Rear three-quarter |
| 1948 | literal / photoType | Manufacturer editorial reference |
| 1951 | literal / label | BMW Z4 M Coupé — Rear three-quarter |
| 1957 | literal / photoType | Manufacturer editorial reference |
| 1960 | literal / label | BMW 3.0 CSL — Rear three-quarter |
| 1966 | literal / photoType | Manufacturer editorial reference |
| 1969 | literal / label | BMW 850CSi — Side profile |
| 1975 | literal / photoType | Manufacturer editorial reference |
| 1978 | literal / label | BMW Z4 M Coupé — Side profile |
| 1984 | literal / photoType | Manufacturer editorial reference |
| 1987 | literal / label | BMW 3.0 CSL — Interior |
| 1993 | literal / photoType | Manufacturer editorial reference |
| 1996 | literal / label | BMW 850CSi — Interior |
| 2002 | literal / photoType | Manufacturer editorial reference |
| 2005 | literal / label | BMW Z4 M Coupé — Interior |
| 2011 | literal / photoType | Manufacturer editorial reference |
| 2014 | literal / label | BMW M1 — Front three-quarter |
| 2020 | literal / photoType | Manufacturer editorial reference |
| 2023 | literal / label | BMW 530i — Interior |
| 2029 | literal / photoType | Manufacturer editorial reference |
| 2032 | literal / label | BMW 1 Series M Coupé — Front three-quarter |
| 2038 | literal / photoType | Manufacturer editorial reference |
| 2041 | literal / label | BMW M1 — Side profile |
| 2047 | literal / photoType | Manufacturer editorial reference |
| 2050 | literal / label | BMW M3 — Front three-quarter |
| 2056 | literal / photoType | Manufacturer editorial reference |
| 2059 | literal / label | BMW 1 Series M Coupé — Rear three-quarter |
| 2065 | literal / photoType | Manufacturer editorial reference |
| 2068 | literal / label | BMW M3 3.0 Coupé — Front three-quarter |
| 2074 | literal / photoType | Manufacturer editorial reference |
| 2077 | literal / label | BMW M1 — Rear view |
| 2083 | literal / photoType | Manufacturer editorial reference |
| 2086 | literal / label | BMW 1 Series M Coupé — Side profile |
| 2092 | literal / photoType | Manufacturer editorial reference |
| 2095 | literal / label | BMW M5 — Front three-quarter |
| 2101 | literal / photoType | Manufacturer editorial reference |
| 2104 | literal / label | BMW M3 3.0 Coupé — Rear three-quarter |
| 2110 | literal / photoType | Manufacturer editorial reference |
| 2113 | literal / label | BMW 1 Series M Coupé — Interior |
| 2119 | literal / photoType | Manufacturer editorial reference |
| 2122 | literal / label | BMW M5 — Side profile |
| 2128 | literal / photoType | Manufacturer editorial reference |
| 2131 | literal / label | BMW M3 3.0 Coupé — Front view |
| 2137 | literal / photoType | Manufacturer editorial reference |
| 2140 | literal / label | BMW M5 3.6 — Front three-quarter |
| 2146 | literal / photoType | Manufacturer editorial reference |
| 2149 | literal / label | BMW M3 — Rear three-quarter |
| 2155 | literal / photoType | Manufacturer editorial reference |
| 2158 | literal / label | BMW M5 — Rear view |
| 2164 | literal / photoType | Manufacturer editorial reference |
| 2167 | literal / label | BMW M635CSi — Front three-quarter |
| 2173 | literal / photoType | Manufacturer editorial reference |
| 2176 | literal / label | BMW M5 3.6 — Side profile |
| 2182 | literal / photoType | Manufacturer editorial reference |
| 2185 | literal / label | BMW M3 — Side profile |
| 2191 | literal / photoType | Manufacturer editorial reference |
| 2194 | literal / label | BMW M5 — Interior |
| 2200 | literal / photoType | Manufacturer editorial reference |
| 2203 | literal / label | BMW M635CSi — Side profile |
| 2209 | literal / photoType | Manufacturer editorial reference |
| 2212 | literal / label | BMW M6 Coupé — Front three-quarter |
| 2218 | literal / photoType | Manufacturer editorial reference |
| 2221 | literal / label | BMW M5 3.6 — Rear view |
| 2227 | literal / photoType | Manufacturer editorial reference |
| 2230 | literal / label | BMW Z3 M Roadster — Front three-quarter |
| 2236 | literal / photoType | Manufacturer editorial reference |
| 2239 | literal / label | BMW M635CSi — Rear view |
| 2245 | literal / photoType | Manufacturer editorial reference |
| 2248 | literal / label | BMW Z4 M Roadster — Front three-quarter |
| 2254 | literal / photoType | Manufacturer editorial reference |
| 2257 | literal / label | BMW M6 Coupé — Rear three-quarter |
| 2263 | literal / photoType | Manufacturer editorial reference |
| 2266 | literal / label | BMW Z3 M Roadster — Rear three-quarter |
| 2272 | literal / photoType | Manufacturer editorial reference |
| 2275 | literal / label | BMW M6 Coupé — Side profile |
| 2281 | literal / photoType | Manufacturer editorial reference |
| 2284 | literal / label | BMW Z3 M Roadster — Side profile |
| 2290 | literal / photoType | Manufacturer editorial reference |
| 2293 | literal / label | BMW Z4 M Roadster — Rear three-quarter |
| 2299 | literal / photoType | Manufacturer editorial reference |
| 2302 | literal / label | BMW M6 Coupé — Interior |
| 2308 | literal / photoType | Manufacturer editorial reference |
| 2311 | literal / label | BMW Z3 M Roadster — Interior |
| 2317 | literal / photoType | Manufacturer editorial reference |
| 2320 | literal / label | BMW Z4 M Roadster — Side profile |
| 2326 | literal / photoType | Manufacturer editorial reference |
| 2329 | literal / label | BMW Z4 M Roadster — Interior |
| 2335 | literal / photoType | Manufacturer editorial reference |

### public/parts.html

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | visible-text | APEX — Car Parts |
| 1 | meta-content | Learn BMW engine and electric drivetrain components with model-specific explanations. |
| 1 | meta-content | width=device-width,initial-scale=1 |
| 2 | visible-text | English |
| 2 | aria-label | Switch color theme |
| 3 | visible-text | 200+ hp |
| 3 | visible-text | 300+ hp |
| 3 | visible-text | 400+ hp |
| 3 | visible-text | 500+ hp |
| 3 | visible-text | 600+ hp |
| 3 | visible-text | All engines |
| 3 | visible-text | All source years |
| 3 | visible-text | APEX is not affiliated with BMW. Original recordings identify their source and note model or exhaust differences. 3D exteriors are creator models, not factory CAD or verified mechanical internals. |
| 3 | visible-text | Chassis / generation |
| 3 | visible-text | Engine family |
| 6 | alt | Selected BMW exterior |
| 8 | alt | Selected engine family |
| 15 | visible-text | Original |
| 15 | visible-text | Original creator recordings contain real car audio. Model and exhaust differences are noted above. |
| 15 | visible-text | recordings. |
| 17 | visible-text | Choose up to 3 |

### public/parts.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 1 | literal / author | Aceonhost |
| 1 | literal / author | Angelsharum |
| 1 | literal / author | Donar Reiskoffer |
| 1 | literal / author | No machine-readable author provided. M100~commonswiki assumed (based on copyright claims). |
| 1 | literal / author | ProjectManhattan |
| 1 | literal / author | Spock85 |
| 1 | literal / author | Tharish |
| 1 | literal / author | Tiia Monto |

### public/personal-garage.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 27 | literal / suspension | Suspension |
| 27 | literal / turbo | Turbo |
| 27 | literal / wheels | Wheel finish |
| 40 | literal / schema | apex.personal-backup |
| 52 | literal | apex.personal-backup |
| 52 | literal | Unsupported backup format. |
| 53 | literal | The backup is missing saved models or learning progress. |
| 54 | literal | The backup is missing garage data. |
| 65 | literal | The backup contains more than 20 saved builds. |
| 71 | literal | A saved build has an invalid or duplicate identifier. |
| 95 | literal | Storage unavailable |
| 102 | literal | Invalid storage value |
| 103 | literal | Invalid storage shape |
| 144 | dynamic dynamic-template | pg-{value1} |
| 146 | dynamic aria-label | Close My garage |
| 146 | dynamic visible-text | Learning |
| 146 | dynamic aria-label | My garage sections |
| 146 | dynamic visible-text | Saved builds |
| 146 | dynamic visible-text | Sign in to sync ? |
| 146 | dynamic visible-text | The cars you keep. The ideas you build. What you learn next. |
| 146 | dynamic visible-text | YOUR CORNER OF APEX |
| 146 | dynamic aria-label | Your garage summary |
| 171 | dynamic dynamic-template | {value1} selected |
| 171 | literal | Choose 2–3 saved BMWs to compare. |
| 172 | literal | Compare selected → |
| 177 | literal | Pick a few. Look a little closer. |
| 177 | literal | Your shortlist |
| 180 | dynamic dynamic-template | Open {value1} |
| 182 | literal | Open model ↗ |
| 182 | literal | pg-text-button pg-remove |
| 183 | literal | Compare this model |
| 186 | literal | Explore the collection ↗ |
| 186 | literal | Make room for your favorites. |
| 186 | literal | Save a BMW from its model card or detail page. Your shortlist will be waiting here. |
| 188 | literal | Find your way back. |
| 200 | literal | Choose a BMW in the tuning garage, explore a configuration and save a named snapshot. |
| 200 | literal | Give an idea some wheels. |
| 200 | literal | Open the tuning garage ↗ |
| 201 | literal | Resume a snapshot in the tuning garage. Performance changes remain hypothetical. |
| 201 | literal | Your saved concepts |
| 204 | literal | Untitled build |
| 208 | dynamic dynamic-template | +{value1} more |
| 209 | literal | Factory configuration snapshot |
| 210 | literal | Saved date unavailable |
| 211 | dynamic dynamic-template | Saved {value1} |
| 213 | literal | Resume build ↗ |
| 221 | dynamic dynamic-template | {value1} of {value2} lessons complete |
| 221 | dynamic dynamic-template | {value1} XP earned · Level {value2}: {value3}. |
| 221 | literal | UNDERSTANDING, ONE SYSTEM AT A TIME |
| 222 | dynamic dynamic-template | {value1} of {value2} academy lessons completed |
| 225 | literal | · Checkpoint |
| 225 | literal | YOUR NEXT LESSON |
| 226 | literal | Continue learning ↗ |
| 226 | literal | Start learning ↗ |
| 228 | dynamic dynamic-template | ALL {value1} COMPLETE |
| 228 | literal | Keep your curiosity in gear. |
| 228 | literal | You have completed every curriculum lesson. Revisit a lesson below, or practice in the academy. |
| 229 | literal | Open the academy ↗ |
| 236 | dynamic dynamic-template | {value1}-unit-{value2} |
| 237 | dynamic dynamic-template | {value1} of {value2} complete · {value3} |
| 242 | literal | · Checkpoint |
| 242 | literal | · Completed |
| 242 | literal | · Previously completed |
| 243 | literal | ✓ Review lesson |
| 244 | literal | Review completed lesson |
| 254 | dynamic dynamic-template | lessons complete · {value1} XP |
| 254 | literal | saved builds |
| 254 | literal | saved models |
| 256 | literal | Some browser data could not be read. Your stored data has not been changed. |
| 264 | dynamic dynamic-template | [data-pg-tab="{value1}"] |
| 271 | literal | Invalid favorites |
| 275 | literal | removed from saved models. |
| 275 | literal | saved to your garage. |
| 278 | dynamic dynamic-template | [data-pg-action="save-favorite"][data-pg-id="{value1}"] |
| 279 | literal | Favorites could not be saved. Existing browser data has been preserved. |
| 284 | literal | View unavailable |
| 286 | literal | View unavailable |
| 287 | literal | This item could not be opened. Please try again. |
| 294 | literal / type | application/json |
| 315 | literal | The backup is too large. |
| 354 | literal | The backup is too large. |
| 377 | literal | Choose up to three saved models for one comparison. |
| 378 | dynamic dynamic-template | {value1} model{value2} selected for comparison. |
| 381 | literal | ArrowLeft |
| 381 | literal | ArrowRight |
| 381 | literal | End |
| 383 | literal | ArrowRight |
| 383 | literal | End |
| 385 | literal | .pg-model-image img |
| 397 | literal | Account & sync status ? |
| 397 | literal | Sign in to sync ? |

### public/photo-sources.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 34 | literal | (max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw |
| 34 | dynamic visible-text | APEX / {value4} |
| 34 | literal | Breadcrumb |

### public/platform.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 15 | literal / label | A GARAGE THAT GOES WITH YOU |
| 15 | literal / description | Save your builds, keep your favorites, and continue learning wherever you sign in. |
| 15 | literal / title | Your account. |
| 15 | literal / kicker | YOUR BMW GARAGE |
| 16 | literal / description | Build your knowledge, one discovery at a time. Short lessons, hands-on challenges, and a road that grows with you. |
| 16 | literal / kicker | THE BMW LEARNING ACADEMY |
| 16 | literal / label | YOUR NEXT CHAPTER |
| 18 | literal / title | Inside the engine. |
| 18 | literal / label | INTERACTIVE ENGINE EXPLORER |
| 18 | literal / description | Meet the S63. Explore the systems of a twin-turbo V8, follow the flow, and see how the components connect. |
| 18 | literal / kicker | VIRTUAL ENGINE LAB |
| 19 | literal / title | Build. Test. Understand. |
| 19 | literal / description | Choose a BMW and explore how changes interact. Save your ideas and compare the tradeoffs behind a build. |
| 19 | literal / label | EDUCATIONAL SIMULATION |
| 19 | literal / kicker | THE TUNING GARAGE |
| 20 | literal / title | A closer comparison. |
| 20 | literal / kicker | THE DETAILS MAKE THE DIFFERENCE |
| 20 | literal / description | The same badge. A different character. Line up to three BMWs side by side and discover what sets them apart. |
| 20 | literal / label | YOUR SHORTLIST, SIDE BY SIDE |
| 21 | literal / title | A space for your obsession. |
| 21 | literal / description | Your favorite BMWs, saved builds, and learning progress. Ready whenever curiosity calls. |
| 21 | literal / kicker | YOUR PERSONAL GARAGE |
| 21 | literal / label | YOUR SAVED COLLECTION |
| 35 | literal | .site-header nav |
| 36 | visible-text | Engine lab |
| 36 | aria-label | Selected models |
| 36 | visible-text | Tuning |
| 42 | literal | .footer-end&gt;span |
| 43 | literal | Open saved models in My garage |
| 44 | aria-label | Search everything (Control K) |
| 45 | visible-text | Independent BMW stories, specifications and engineering guides. |
| 47 | visible-text | Compare cars |
| 47 | visible-text | Discover |
| 47 | visible-text | Electric BMWs |
| 47 | visible-text | Engine lab |
| 47 | visible-text | Explore |
| 47 | visible-text | Sources |
| 47 | visible-text | Tuning garage |
| 48 | literal | .footer-group:last-child |
| 50 | literal | Find a BMW, chassis or engine code… |
| 59 | literal | .hero-kicker span:last-child |
| 59 | literal | THE INDEPENDENT BMW LEARNING PLATFORM |
| 60 | visible-text | curiosity. |
| 60 | visible-text | Driven by |
| 61 | literal | .hero-content&gt;p |
| 61 | literal | Discover the icons. Understand the engineering. Find your own road into the world of BMW. |
| 62 | visible-text | Start learning |
| 64 | literal | home-directions home-feature |
| 65 | dynamic visible-text | 01 / THE COLLECTION |
| 65 | dynamic visible-text | 03 / SIDE BY SIDE |
| 65 | dynamic visible-text | A collection to explore. |
| 65 | dynamic visible-text | A whole machine to understand. |
| 65 | dynamic visible-text | Build a comparison |
| 65 | dynamic visible-text | Enter the academy |
| 65 | dynamic visible-text | Explore {value4} models |
| 65 | dynamic visible-text | Find your BMW. |
| 65 | dynamic visible-text | Follow the learning road. Get hands-on with the engineering. |
| 65 | dynamic visible-text | FOLLOW YOUR CURIOSITY |
| 65 | dynamic visible-text | From the original icons to a new generation. Every car has a story. |
| 65 | dynamic visible-text | Know what drives it. |
| 65 | dynamic visible-text | The finer differences. |
| 65 | dynamic visible-text | Two icons. Different characters. Go beyond the badge and compare. |
| 65 | dynamic visible-text | Where will it take you? |
| 67 | literal | APEX — Driven by curiosity |
| 70 | literal | #collection .section-heading |
| 71 | literal | THE BMW COLLECTION |
| 72 | literal | Explore the generations. Find an engine, a body style, or the BMW you keep coming back to. Save your favorites and compare the details. |
| 73 | literal | The BMW collection · APEX |
| 79 | literal | This page could not load. |
| 83 | dynamic aria-label | Breadcrumb |
| 83 | dynamic visible-text | Opening {value7}… |
| 85 | literal | · APEX BMW |
| 98 | literal | &garage= |
| 98 | literal | &level= |
| 108 | literal | Page load failed: |
| 108 | visible-text | This page could not load. |
| 108 | visible-text | Try again |
| 108 | visible-text | Your saved cars and learning progress are still here. |
| 118 | literal | · APEX |
| 120 | literal | "&gt;Learn this car ↗&lt;/a&gt; |
| 120 | literal | &lt;a class="primary learn-car-link" href="/learn?car= |
| 120 | visible-text | Build in the tuning garage |
| 120 | visible-text | Explore the S63 in 3D |
| 131 | literal | .profile-value:not(.profile-missing) |
| 138 | literal | The BMW collection · APEX |
| 151 | literal | lesson= |
| 151 | literal | tab= |
| 156 | literal | .profile-data-group[open] |
| 156 | literal | .profile-value:not(.profile-missing) |

### public/recordings.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 4 | literal / label | Engine recording |
| 4 | literal / title | F10 · N55 engine recording |
| 4 | literal / author | Roman Novak |
| 4 | literal / note | The creator identifies an F10 with an N55. The exact variant, exhaust configuration and market are not documented. |
| 5 | literal / note | BMW’s own S65 M3 accessory-exhaust demonstration. This is an M Performance system, not the standard exhaust or a muffler delete. |
| 5 | literal / title | E92 M3 · stock exhaust recording |
| 5 | literal / title | E9x M3 · BMW M Performance exhaust |
| 5 | literal / author | Exotic M3 |
| 5 | literal / label | M Performance exhaust |
| 5 | literal / id | MSYWgrYlsQ0 |
| 5 | literal / label | Stock exhaust |
| 5 | literal / note | The creator identifies an E92 M3 with its stock exhaust. Recording conditions and market may differ from the factory data shown. |
| 6 | literal / title | 2018 F90 M5 · stock exhaust recording |
| 6 | literal / author | cvdzijden – Supercar Videos |
| 6 | literal / label | Stock exhaust |
| 6 | literal / note | The creator identifies a 2018 F90 M5 with stock exhaust. Microphone position, market and operating conditions affect the recorded sound. |
| 7 | literal / author | A Cruz |
| 7 | literal / id | CuAAjqo51_w |
| 7 | literal / title | E46 M3 · S54 exhaust recording |
| 7 | literal / label | Stock exhaust |
| 7 | literal / note | The creator identifies an E46 M3 with its original exhaust. Body style and market are not verified against the selected convertible. |
| 8 | literal / title | E60 M5 · S85 stock exhaust recording |
| 8 | literal / author | Jayturbo_ENTJ |
| 8 | literal / note | Recorded from a six-speed manual E60 M5. The selected European factory figures are not a claim about this recording’s market or transmission. |
| 8 | literal / label | Stock exhaust |
| 9 | literal / title | 2016 F80 M3 · S55 stock exhaust |
| 9 | literal / author | Park Ave BMW |
| 9 | literal / label | Stock exhaust |
| 9 | literal / id | Zo0LhbfOtB8 |
| 10 | literal / title | 2021 G80 M3 Competition · exhaust comparison |
| 10 | literal / author | Headless Guitarist Rafael |
| 10 | literal / id | QVJ-ghbAUuM |
| 10 | literal / label | Stock / M Performance |
| 14 | literal / id | 4BhuCe78mt0 |
| 14 | literal / note | BMWBLOG’s recording from its 2014 M235i launch test drive. Exhaust configuration and market are not independently verified against the selected factory specification. |
| 14 | literal / title | F22 M235i · engine and exhaust recording |
| 15 | literal / title | 435i · cat-back before / after |
| 15 | literal / label | Cat-back comparison |
| 15 | literal / author | Straight Piped by: Gexhaust |
| 15 | literal / note | The exhaust shop identifies a 435i and compares its exhaust before and after a cat-back change. Body style, year and initial exhaust configuration are not independently verified. This is not a guaranteed factory or muffler-delete comparison. |
| 15 | literal / id | XgTJMCj9dvk |
| 16 | literal / label | Aftermarket exhaust |
| 16 | literal / title | F06 640i Gran Coupé · Fi exhaust |
| 16 | literal / author | FiExhaust |
| 16 | literal / note | FiExhaust’s own recording of an F06 640i Gran Coupé with its aftermarket exhaust. This is real modified-car audio, not the standard factory exhaust. |
| 16 | literal / id | PtWRLlYkUO0 |
| 17 | literal / title | 2017 F15 X5 35i · M Performance exhaust |
| 17 | literal / author | Canadian Auto Review |
| 17 | literal / id | HI7XetsXVtc |
| 17 | literal / label | M Performance exhaust |
| 17 | literal / note | The reviewer’s 2017 X5 xDrive35i recording features the M Performance package and exhaust. It differs from the selected 2014 factory configuration and is not stock exhaust audio. |
| 19 | literal / title | E39 M5 · stock exhaust recording |
| 19 | literal / label | Stock exhaust |
| 19 | literal / note | The creator identifies an E39 M5 with stock exhaust. Model year, market and recording conditions are not independently verified. |
| 19 | literal / author | VBSource |
| 20 | literal / title | 2007 E93 335i · N54 stock exhaust |
| 20 | literal / note | The creator identifies a 2007 E93 convertible with stock exhaust. This is an N54 family reference, not an exact recording of the selected E90 sedan or E92 coupé. |
| 20 | literal / author | TVTara |
| 21 | literal / title | F10 M5 · stock exhaust, start and revs |
| 21 | literal / author | NM2255 \| Raw Car Sounds |
| 21 | literal / label | Stock exhaust |
| 21 | literal / note | The creator identifies an F10 M5 with stock exhaust. Market, production date and recording conditions may differ from the selected factory specification. |
| 22 | literal / title | 2020 G20 330i · stock exhaust recording |
| 22 | literal / author | GV Aspirated |
| 22 | literal / label | Stock exhaust |

### public/responsive-photos.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 4 | literal | (max-width: 700px) 100vw, 60vw |
| 7 | dynamic dynamic-template | {value1} {value2}w |
| 7 | dynamic dynamic-template | srcset="{value1}" sizes="{value2}" |
| 7 | dynamic dynamic-template | width="{value1}" height="{value2}"{value3} |
| 9 | literal | (max-width: 700px) 100vw, 75vw |
| 12 | dynamic dynamic-template | {value1} {value2}w |

### public/smart-search.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 3 | literal | All |
| 3 | literal | Components |
| 3 | literal | Engineering |
| 3 | literal | Lessons |
| 3 | literal | Vehicles |
| 6 | literal | what which does do did is are was were an a the how why of and or bmw me my tell about explain find show please can you i want learn understand works work used use need function purpose specs spec specifications details information info photo for in on to with it its vs versus compare comparison between car cars vehicle vehicles system systems |
| 22 | literal | How a combustion engine works |
| 22 | literal | Pistons crankshaft valves four stroke cycle fuel ignition internal combustion ICE engine fundamentals |
| 23 | literal | How turbochargers work |
| 23 | literal | Single twin twin-scroll variable geometry VGT turbo boost intercooler B58 N54 N55 turbo lag forced induction |
| 24 | literal | Gearbox automatic manual DCT dual clutch drivetrain torque converter gears |
| 24 | literal | Transmissions and gear ratios |
| 25 | literal | BMW engine code explorer |
| 26 | literal | BMW cooling systems |
| 26 | literal | Engine coolant radiator pump thermostat intercooler heat thermal water cooling |
| 27 | literal | Dampers springs wheels suspension alignment shock absorber chassis ride |
| 27 | literal | Suspension and handling |
| 28 | literal | ECU DME sensors fuel boost knock control electronic control unit engine computer stability ABS |
| 28 | literal | Electronic engine control |
| 29 | literal | EV BEV PHEV battery inverter motor hybrid electric regenerative braking charging electricity |
| 29 | literal | Hybrid and electric powertrains |
| 30 | literal | 3D S63TU S63B44T0 V8 engine exploded X-ray intake exhaust oil fuel coolant parts under hood |
| 30 | literal | F10 M5 · S63 engine explorer |
| 31 | literal | Dyno ECU tuning turbo intercooler intake exhaust suspension brakes power torque RPM build upgrades modify modification horsepower stage |
| 31 | literal | Tuning garage & simulated dashboard |
| 32 | literal | Diagnostic component identification quiz mechanic fault boost troubleshooting parts workshop identify |
| 32 | literal | Virtual mechanic |
| 33 | literal | BMW history timeline |
| 33 | literal | History heritage 1916 1923 1928 1972 2013 BMW Motorsport origins founded |
| 40 | literal | $1 vs |
| 65 | literal / category | Vehicles |
| 72 | literal / category | Components |
| 78 | literal | Engineering |
| 78 | literal | Lessons |
| 79 | literal | Academy · interactive lesson |
| 79 | literal | Interactive educational workspace |
| 106 | literal | All |
| 115 | literal | Vehicles |
| 116 | literal | Lessons |
| 117 | literal | Components |
| 168 | literal | All |
| 174 | literal | All |
| 176 | literal | All |
| 186 | literal | Vehicles |
| 210 | dynamic dynamic-template | global-search-{value1} |
| 212 | dynamic dynamic-template | {value1}-help |
| 212 | dynamic dynamic-template | {value1}-title |
| 230 | dynamic visible-text | ↑ ↓ to navigate · Enter to open · Esc clears, then closes |
| 230 | literal | All |
| 230 | dynamic aria-label | Close search |
| 230 | dynamic visible-text | Esc |
| 230 | dynamic visible-text | Recent searches stay in this browser. |
| 230 | dynamic aria-label | Search category |
| 230 | dynamic visible-text | SEARCH THE ENTIRE GARAGE |
| 230 | dynamic visible-text | Search vehicles, components and lessons |
| 230 | dynamic placeholder | Try F10 M5, S63, or how turbos work… |
| 233 | literal | All |
| 244 | dynamic aria-label | Recent searches |
| 244 | dynamic visible-text | RECENT SEARCHES |
| 244 | dynamic aria-label | Remove {value5} from recent searches |
| 253 | literal | All |
| 253 | literal | Vehicles |
| 255 | dynamic visible-text | Compare {value4} |
| 259 | literal | class="gs-related-label" |
| 259 | literal | Related suggestion · |
| 261 | literal | All |
| 261 | dynamic dynamic-template | No exact matches. Related suggestions for “{value1}”{value2}. |
| 262 | literal | · vehicle comparison available |
| 262 | literal | All |
| 262 | literal | Vehicles |
| 263 | literal | Pick a recent search or explore a starting point below. |
| 263 | literal | Search a model, engine code, component or question. |
| 264 | literal | All |
| 264 | literal | matching results |
| 264 | dynamic visible-text | No {value1}. |
| 264 | literal | Related search suggestions |
| 264 | visible-text | Search all categories |
| 264 | literal | Search results |
| 264 | literal | Try a chassis such as F10, an engine code such as B58, or a component such as intercooler. |
| 264 | dynamic dynamic-template | Your {value1} filter is active. Search all categories for more results. |
| 272 | literal | Vehicles |
| 273 | literal | Components |
| 281 | literal | All |
| 287 | literal | ArrowDown |
| 287 | literal | ArrowUp |
| 289 | literal | ArrowDown |
| 290 | literal | End |
| 291 | literal | Enter |
| 292 | literal | Escape |
| 301 | dynamic dynamic-template | [data-gs-remove="{value1}"] |
| 304 | literal | All |

### public/system-guide.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 2 | literal / label | BMW: F10 M5 technical description |
| 3 | literal / label | Garrett: how a turbo works |
| 4 | literal / label | Bosch: gasoline direct injection systems |
| 5 | literal / label | U.S. DOE: how all-electric cars work |
| 6 | literal / label | ZF: damping systems |
| 7 | literal / note | This is a functional system explanation, not a model-specific part, fitment claim or repair procedure. Exact packaging and part numbers vary by engine revision and vehicle. |
| 9 | literal | Acts on the crown. |
| 9 | literal | Cylinder pressure |
| 9 | literal | Engine internals |
| 9 | literal | Lubrication |
| 9 | literal | Piston & connecting rod |
| 9 | literal | Receives force through the connecting rod. |
| 9 | literal | Supplies bearing surfaces and cylinder walls. |
| 9 | literal | Transfer combustion pressure into crankshaft torque. |
| 9 | literal | Within each cylinder of the engine block. |
| 10 | literal | Apply force at crankpins. |
| 10 | literal | Connecting rods |
| 10 | literal | Convert piston motion into rotating engine output. |
| 10 | literal | Engine internals |
| 10 | literal | In the lower engine block, supported by main bearings. |
| 10 | literal | Maintains bearing lubrication. |
| 10 | literal | Offset crankpins connect to the rods. Main journals support rotation while lubricated bearings carry loads. The flywheel or drive plate connects engine output to the transmission. |
| 10 | literal | Oil circuit |
| 10 | literal | Receives rotation through a flywheel or drive plate. |
| 11 | literal | Camshaft & valves |
| 11 | literal | Carry flow through the opened valves. |
| 11 | literal | Commands variable timing or lift where fitted. |
| 11 | literal | Control when the engine admits air and expels exhaust. |
| 11 | literal | Cylinder head, above the combustion chambers. |
| 11 | literal | Engine control |
| 11 | literal | Engine internals |
| 11 | literal | Intake and exhaust ports |
| 11 | literal | Rough running or timing faults can involve oil supply, sensors, actuators or mechanical wear. |
| 11 | literal | Synchronizes with the crankshaft. |
| 11 | literal | Timing drive |
| 12 | literal | At or near the exhaust side of a wastegated turbocharger. |
| 12 | literal | Boost control |
| 12 | literal | Coordinates the actuator. |
| 12 | literal | Provides exhaust energy. |
| 12 | literal | Receives the regulated exhaust flow. |
| 12 | literal | Regulate turbine drive by bypassing some exhaust flow. |
| 12 | literal | Turbocharging |
| 12 | literal | Unexpected boost or actuator-related faults can also result from leaks, sensors or control problems. |
| 13 | literal | Air-to-air units transfer heat to ambient air. Air-to-liquid units transfer heat to a separate liquid circuit. F10 M5 uses indirect charge-air cooling. Cooler outlet temperature and pressure loss both matter. |
| 13 | literal | Ambient air or coolant |
| 13 | literal | Between the turbo compressor and engine intake, with packaging varying by system. |
| 13 | literal | Carries heat away. |
| 13 | literal | Charge-air cooler / intercooler |
| 13 | literal | Compressor outlet |
| 13 | literal | Cooling systems |
| 13 | literal | Receives cooled charge air. |
| 13 | literal | Reduced performance under repeated load or pressure leaks can involve the cooler, pipework or its cooling circuit. |
| 13 | literal | Remove heat from compressed intake air. |
| 13 | literal | Supplies hot compressed air. |
| 14 | literal | A low-pressure supply feeds the high-pressure pump. A rail distributes fuel to direct injectors. Pressure sensing and engine control coordinate supply with demand. No universal BMW pressure specification applies here. |
| 14 | literal | Direct injectors |
| 14 | literal | Distributes pressurized fuel. |
| 14 | literal | Feeds the high-pressure stage. |
| 14 | literal | Fuel systems |
| 14 | literal | High-pressure fuel pump |
| 14 | literal | Low-pressure supply |
| 14 | literal | Meter fuel into cylinders. |
| 14 | literal | Supply the injection rail at the pressure demanded by the engine. |
| 15 | literal | Circulates coolant. |
| 15 | literal | Coolant circulates through passages in a heat exchanger. Air across its fins removes heat. Pump flow, thermostat behavior and fan operation interact. The engine-coolant circuit and charge-air cooling circuit can be separate. |
| 15 | literal | Coolant pump |
| 15 | literal | Coolant radiator |
| 15 | literal | Cooling systems |
| 15 | literal | Engine water jacket |
| 15 | literal | Fan and airflow |
| 15 | literal | High temperature or coolant loss can have many causes across the circuit. A warning does not isolate the radiator. |
| 15 | literal | Remove heat from the fins. |
| 15 | literal | Supplies heated coolant. |
| 15 | literal | Transfer engine-coolant heat to the surrounding air. |
| 15 | literal | Usually at the front of a combustion vehicle, behind the grille. |
| 16 | literal | An oil-pressure warning is a serious indication of a system condition. It does not prove the pump itself has failed. |
| 16 | literal | Bearings and turbocharger |
| 16 | literal | Circulate oil to lubricate and help cool engine components. |
| 16 | literal | Clean and distribute oil. |
| 16 | literal | Engine internals |
| 16 | literal | Filter and galleries |
| 16 | literal | Oil pump & lubrication |
| 16 | literal | Part of the engine lubrication circuit, connected to the sump and oil galleries. |
| 16 | literal | Provides the oil supply. |
| 16 | literal | Receive lubricating oil. |
| 16 | literal | Sump |
| 17 | literal | A coated substrate supports chemical reactions. A gasoline three-way catalyst converts hydrocarbons, carbon monoxide and nitrogen oxides when mixture control is appropriate. Oxygen-sensor feedback supports that control. |
| 17 | literal | Carries the treated gases away. |
| 17 | literal | Catalytic converter |
| 17 | literal | Convert harmful exhaust constituents into less harmful gases. |
| 17 | literal | Downstream exhaust |
| 17 | literal | Emissions faults can involve mixture, misfires, leaks, sensors or catalyst deterioration. |
| 17 | literal | Engine exhaust |
| 17 | literal | Exhaust systems |
| 17 | literal | In the exhaust path, often close to the engine for faster warm-up. |
| 17 | literal | Monitor mixture or catalyst behavior. |
| 17 | literal | Oxygen sensors |
| 17 | literal | Provides gases to treat. |
| 18 | literal | Between the engine and drivetrain. |
| 18 | literal | Carries output toward the rear axle. |
| 18 | literal | Change gear ratios using two controlled clutches. |
| 18 | literal | Clutches and gearsets |
| 18 | literal | Dual-clutch transmission |
| 18 | literal | Select the torque path and ratio. |
| 18 | literal | Shift symptoms can involve control, fluid condition, clutch behavior or other drivetrain faults. |
| 18 | literal | Supplies torque. |
| 18 | literal | Transmissions |
| 19 | literal | An open differential allows the two axle shafts to rotate at different speeds. Locking or limited-slip strategies influence torque distribution. BMW Active M Differential adds electronically controlled locking on applicable models. |
| 19 | literal | Carry torque to driven wheels. |
| 19 | literal | Coordinates locking where fitted. |
| 19 | literal | Differentials |
| 19 | literal | Distribute drive while allowing wheel-speed differences in a corner. |
| 19 | literal | Half-shafts |
| 19 | literal | Supplies drive through the propeller shaft. |
| 19 | literal | Vehicle control |
| 19 | literal | Whine, clunks or vibration can come from gears, bearings, mounts or nearby joints. |
| 20 | literal | Between the vehicle body and wheel suspension. |
| 20 | literal | May adjust damping on equipped cars. |
| 20 | literal | Moves with the wheel. |
| 20 | literal | Receives spring and damper forces. |
| 20 | literal | Repeated bouncing, leaks or poor control can involve dampers, joints, tires or alignment. |
| 20 | literal | Spring & damper |
| 20 | literal | Support the body and control suspension oscillation. |
| 20 | literal | Suspension |
| 20 | literal | Wheel carrier |
| 21 | literal | Across the front axle area, linked to the wheel carriers. |
| 21 | literal | Adds steering assistance. |
| 21 | literal | Assistance system |
| 21 | literal | Move the wheel carriers. |
| 21 | literal | Steering |
| 21 | literal | Steering column |
| 21 | literal | Steering rack |
| 21 | literal | Tie rods |
| 21 | literal | Translate steering input into steered-wheel movement. |
| 21 | literal | Transmits driver input. |
| 22 | literal | Adjust engine demand. |
| 22 | literal | Air and boost actuators |
| 22 | literal | Coordinate combustion, requested torque and operating limits. |
| 22 | literal | DME / engine controller |
| 22 | literal | Execute combustion commands. |
| 22 | literal | Injectors and ignition |
| 22 | literal | Reduced power or a warning may originate in sensors, wiring, mechanical systems or the controller. |
| 22 | literal | Report engine operating conditions. |
| 22 | literal | The controller combines driver demand with sensor feedback to command ignition, fuel, air and boost. Knock, temperatures and component limits affect its decisions. A fault code records a detected condition rather than a replacement instruction. |
| 23 | literal | A sensing element produces an electrical signal related to a measured quantity. The controller interprets it using calibration and plausibility checks. Sensors that look similar can have different ranges, signals and fitment. |
| 23 | literal | Carry supply and signal. |
| 23 | literal | Implausible readings may result from sensor faults, wiring or an actual system condition. |
| 23 | literal | In relevant air, coolant, fuel and lubrication circuits, depending on the sensor. |
| 23 | literal | Interprets the measurement. |
| 23 | literal | Measured circuit |
| 23 | literal | Pressure & temperature sensors |
| 23 | literal | Report physical conditions for feedback control. |
| 23 | literal | Supplies the physical input. |
| 23 | literal | Wiring and connector |
| 24 | literal | Distributes drive at the axle. |
| 24 | literal | In a longitudinal rear-drive layout, a propeller shaft connects transmission output to the rear differential. Half-shafts carry torque from the differential to the wheels. Joints accommodate motion and alignment changes. |
| 24 | literal | Propeller shaft & half-shafts |
| 24 | literal | Provides rotational output. |
| 24 | literal | Receive torque through half-shafts. |
| 24 | literal | Transmit rotation between transmission, differential and driven wheels. |
| 24 | literal | Under the vehicle and between driven-axle assemblies and wheel hubs. |
| 24 | literal | Vibration or clunks can involve joints, supports, mounts or other rotating components. |
| 24 | literal | Wheel hubs |
| 25 | literal | Battery cells are grouped into modules and a pack. Battery-management electronics monitor operating conditions and control the permitted charge and discharge. Gross capacity and driver-usable energy are not the same specification. |
| 25 | literal | Charge port and charging system |
| 25 | literal | Control energy flow to and from the drive motor. |
| 25 | literal | Electric drive |
| 25 | literal | Helps keep the pack within its operating range. |
| 25 | literal | High-voltage traction battery |
| 25 | literal | Power electronics |
| 25 | literal | Provide energy through an approved charging path. |
| 25 | literal | Reduced range or a battery warning can have many causes. A dashboard estimate alone does not identify battery health. |
| 25 | literal | Store electrical energy for an electric vehicle’s drive system. |
| 25 | literal | Thermal management |
| 26 | literal | Control motor speed and torque. |
| 26 | literal | Convert electrical energy into rotation to propel the vehicle. |
| 26 | literal | Electric drive |
| 26 | literal | Electric traction motor |
| 26 | literal | High-voltage battery |
| 26 | literal | Integrated into an electric drive unit at one or more axles. |
| 26 | literal | Power electronics |
| 26 | literal | Power electronics control the electrical supply and motor torque. Many designs can also operate as generators during deceleration. Motor type, count and axle placement vary between BMW models. |
| 26 | literal | Reduction gearing |
| 26 | literal | Supplies stored electrical energy. |
| 26 | literal | Transfers motor rotation to the wheels. |
| 27 | literal | A high-voltage warning can have multiple causes and requires trained diagnostic equipment. Do not open or probe high-voltage components. |
| 27 | literal | Control the flow of electrical energy between the battery and drive motor. |
| 27 | literal | Coordinates torque requests and operating limits. |
| 27 | literal | Drive motor |
| 27 | literal | Electric drive |
| 27 | literal | Inverter & power electronics |
| 27 | literal | Provides high-voltage DC energy. |
| 27 | literal | Receives controlled electrical power. |
| 27 | literal | The inverter switches battery power into a controlled form for the traction motor and manages requested torque. During energy recovery, power electronics control the flow back toward the battery. |
| 27 | literal | Traction battery |
| 27 | literal | Vehicle control system |
| 28 | literal | Battery management |
| 28 | literal | Charge inlet |
| 28 | literal | Charging |
| 28 | literal | Charging interruptions can involve the station, cable, temperature, settings or vehicle. Connector standards and charging rates vary by market and model. |
| 28 | literal | Condition and route charging energy. |
| 28 | literal | Connects the vehicle to AC or DC charging equipment. |
| 28 | literal | Convert AC charging power for storage in the high-voltage battery. |
| 28 | literal | During AC charging, the onboard charger converts incoming alternating current to the form used by the battery and coordinates charging limits. DC fast charging uses offboard power conversion and a different vehicle charging path. |
| 28 | literal | Inside the vehicle, connected to the charge inlet and high-voltage system. |
| 28 | literal | Onboard charger |
| 28 | literal | Power electronics |
| 28 | literal | Sets charging limits based on battery conditions. |
| 29 | literal | Auxiliary battery |
| 29 | literal | Between the high-voltage system and the vehicle’s low-voltage electrical network. |
| 29 | literal | Electric drive |
| 29 | literal | High-to-low-voltage DC/DC converter |
| 29 | literal | Low-voltage bus |
| 29 | literal | Low-voltage faults can have several causes, including battery condition, wiring and charging control. |
| 29 | literal | Powers vehicle control units and accessories. |
| 29 | literal | Provides the high-voltage input. |
| 29 | literal | Receives charging support. |
| 29 | literal | Supply low-voltage electrical systems from the traction battery. |
| 29 | literal | The converter reduces high-voltage DC to the lower voltage used by accessories and the auxiliary battery. Its operation is coordinated with the vehicle’s electrical management. |
| 29 | literal | Traction battery |
| 30 | literal | A temperature warning is a system-level symptom. Coolant circuits and high-voltage parts require model-specific professional service. |
| 30 | literal | Cooling systems |
| 30 | literal | Drive motor and inverter |
| 30 | literal | Electric-drive thermal management |
| 30 | literal | Generate heat during operation. |
| 30 | literal | Heat exchangers |
| 30 | literal | Manage operating temperatures in the battery, motor and power electronics. |
| 30 | literal | Needs temperature management while charging and driving. |
| 30 | literal | Traction battery |
| 30 | literal | Transfer heat between coolant and air or other circuits. |
| 30 | literal | Uses pumps, heat exchangers, valves and coolant circuits whose layout varies by vehicle. |
| 31 | literal | Acts as a generator when conditions allow. |
| 31 | literal | Brake feel and recovery vary with charge, temperature, traction and settings. Regeneration does not replace friction brakes. |
| 31 | literal | Braking & energy recovery |
| 31 | literal | Controlled through the drive motor and braking system. |
| 31 | literal | Provide rotation during deceleration. |
| 31 | literal | Receives recovered energy within its limits. |
| 31 | literal | Recover some motion energy as electrical energy while slowing down. |
| 31 | literal | Regenerative braking |
| 32 | literal | Allows the driven wheels to turn at different speeds. |
| 32 | literal | Change speed and torque at the axle. |
| 32 | literal | Electric-drive reduction gear |
| 32 | literal | Inside the electric drive unit between the motor and axle. |
| 32 | literal | Match electric-motor rotation to useful wheel speed and torque. |
| 32 | literal | Provides high-speed rotating output. |
| 32 | literal | Reduction gears |
| 32 | literal | Transmissions |
| 33 | literal | A charging fault may be in the station, cable, inlet, settings or vehicle. Keep connectors clean and follow the vehicle manual. |
| 33 | literal | Battery control system |
| 33 | literal | Charging |
| 33 | literal | Charging cable or station |
| 33 | literal | Charging inlet |
| 33 | literal | Connect the vehicle to compatible external charging equipment. |
| 33 | literal | Handles AC charging inside the vehicle. |
| 33 | literal | Monitors charging conditions and limits. |
| 33 | literal | Onboard charger |
| 33 | literal | Provides the external connection. |
| 34 | literal | A low-voltage warning can prevent a vehicle from waking even when the traction battery has charge. Diagnosis should follow the model-specific service procedure. |
| 34 | literal | Control units |
| 34 | literal | DC/DC converter |
| 34 | literal | Electric vehicles still use a low-voltage electrical network. A DC/DC converter normally supports this network from the traction battery and can recharge the auxiliary battery when the vehicle is active. |
| 34 | literal | Electrical systems |
| 34 | literal | Low-voltage auxiliary battery |
| 34 | literal | Power vehicle electronics and support low-voltage systems. |
| 34 | literal | Provides energy through the converter when enabled. |
| 34 | literal | Supplies low-voltage power from the high-voltage system. |
| 34 | literal | Traction battery |
| 34 | literal | Use the low-voltage network to wake and manage vehicle systems. |
| 37 | literal | connects to |
| 37 | dynamic visible-text | Original functional diagram · simplified connections · not a physical layout |
| 37 | literal | which connects to |
| 41 | literal | All |
| 41 | dynamic aria-label | System guide categories |
| 41 | dynamic visible-text | Systems, explained. |
| 42 | literal | All |
| 44 | literal | All |
| 44 | dynamic visible-text | Educational diagram |
| 44 | visible-text | No system guides match these filters. |
| 44 | literal | system guides |
| 45 | dynamic visible-text | {value1} / EDUCATIONAL GUIDE |
| 45 | dynamic visible-text | Connected components |
| 45 | dynamic visible-text | Location |
| 45 | dynamic visible-text | Possible symptoms |
| 45 | dynamic visible-text | Scope & fitment |
| 46 | literal | All |

### public/three-models.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 6 | literal / author | MMC Works |
| 14 | literal / uid | 2673357ae2364ecbac334ce2a2b74ceb |
| 16 | literal / author | SQUIR3D |
| 26 | literal / author | SQUIR3D |
| 36 | literal / author | FajarTFK |

### public/tuning-review.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 9 | literal | Review the supporting systems |
| 9 | literal | This turbo concept is missing a calibration or charge-cooling choice. Add those to the scenario, then verify the actual hardware, fuel delivery and controls with a specialist. |
| 10 | literal | Calibration and charge cooling are selected. Turbo fitment, fuel capacity, boost control and thermal limits still need evidence. |
| 10 | literal | Turbo support is recorded |
| 11 | literal | Larger turbo concept: airflow potential and response change together. This lab cannot quantify spool, lag or a safe boost target. |
| 14 | literal | Calibration needs a matching specification |
| 14 | literal | Fuel, engine condition, logging, torque limits and the exact ECU variant need a model-specific review. The output increase here is an editable-parts teaching assumption. |
| 15 | literal | An advanced output scenario retains the factory transmission selection. Clutch, gearbox and driveline capacity are not documented by this builder. |
| 15 | literal | Keep the driveline in the review |
| 18 | literal | Track chassis concept: road comfort, ground clearance, alignment and tyre suitability need attention. No handling score is predicted. |
| 19 | literal | Track brakes concept: temperature range, pedal behavior, wheel clearance and road suitability depend on the actual components. |
| 20 | literal | Exhaust specification is incomplete |
| 20 | literal | The full-exhaust concept has no defined catalyst, noise or local road-compliance specification. Verify these before choosing real parts. |
| 21 | literal | A shift-calibration concept does not describe a manual gearbox upgrade. Choose the factory transmission or a clutch / cooling concept. |
| 21 | literal | Manual transmission selected |
| 22 | literal | The preview changes finish only. Diameter, width, offset, tyre size, load rating and brake clearance are unspecified. |
| 22 | literal | Wheel change is visual only |
| 23 | literal | Naturally aspirated engine: turbo and charge-cooler controls are unavailable. A forced-induction conversion is a separate engineering project. |
| 24 | literal | These are system concepts. Exact parts, fitment and measured results have not been supplied for this build. |
| 24 | literal | Verify the chosen hardware |
| 25 | dynamic dynamic-template | {value1} review item{value2} |
| 25 | literal | Compare the documented engine ratings before exploring a scenario. |
| 25 | literal | Factory configuration |
| 25 | literal | Use these prompts to develop the build. They do not approve a real installation. |

### public/tuning-workbench.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 10 | dynamic dynamic-template | {value1}\n{value2}\n{value3} |
| 14 | literal / name | Chassis & style |
| 14 | literal / name | Review & save |
| 19 | dynamic dynamic-template | garage-{value1} |
| 28 | literal | (prefers-reduced-motion: reduce) |
| 32 | dynamic visible-text | APEX / TUNING WORKSHOP |
| 32 | dynamic visible-text | Choose a car. Shape the powertrain and chassis. Review each change against the factory baseline, then keep your configuration. |
| 32 | dynamic visible-text | EDUCATIONAL SCENARIOS |
| 32 | dynamic visible-text | Your BMW. |
| 32 | dynamic visible-text | Your next build. |
| 33 | dynamic aria-label | Choose a vehicle |
| 33 | dynamic visible-text | Find a BMW |
| 33 | dynamic visible-text | Model & engine |
| 33 | dynamic visible-text | START WITH THE RIGHT CAR |
| 33 | dynamic placeholder | Try M3, F10 or S63… |
| 34 | dynamic visible-text | A CLEAR BASELINE. A BETTER BUILD. |
| 34 | dynamic visible-text | Combustion tuning only. Find electric and hybrid models in the model library. |
| 34 | dynamic visible-text | Select a combustion model above or start with one of these. |
| 34 | dynamic visible-text | What would you build? |
| 36 | dynamic visible-text | 128 KB maximum · up to 20 builds |
| 36 | dynamic visible-text | Exported JSON |
| 36 | dynamic visible-text | Import a saved configuration |
| 36 | dynamic visible-text | Import builds |
| 36 | dynamic visible-text | Import JSON |
| 36 | dynamic visible-text | JSON file |
| 36 | dynamic visible-text | Load a snapshot or compare two configurations for the same BMW. Sign in to keep your garage with your account. |
| 36 | dynamic visible-text | or paste JSON |
| 36 | dynamic placeholder | Paste your exported configuration |
| 36 | dynamic visible-text | Saved builds |
| 36 | dynamic aria-label | Saved garage builds |
| 36 | dynamic visible-text | YOUR COLLECTION |
| 42 | literal | Choose your BMW |
| 42 | literal | No matches — try another search |
| 43 | dynamic dynamic-template | {value1} matching models · factory market is shown after selection |
| 48 | literal | "&gt;&lt;/span&gt; |
| 48 | literal | &lt;span data-garage-option-state=" |
| 48 | visible-text | N/A · naturally aspirated |
| 48 | literal | No factory turbo system |
| 48 | literal | Turbo conversions need a separate engineering specification and are outside this builder. |
| 54 | literal | Catalogue specification |
| 54 | dynamic visible-text | Factory source ↗ |
| 54 | dynamic visible-text | Reset ↺ |
| 54 | dynamic aria-label | Reset configuration to factory |
| 54 | dynamic visible-text | YOUR FACTORY BASELINE |
| 55 | dynamic visible-text | 01 / THE BASELINE |
| 55 | dynamic visible-text | 02 / EVERYDAY BALANCE |
| 55 | dynamic visible-text | 03 / FOCUSED SETUP |
| 55 | dynamic visible-text | Advanced output, cooling and chassis concepts. |
| 55 | dynamic visible-text | Factory |
| 55 | dynamic visible-text | Mild output scenario, road chassis choices. |
| 55 | dynamic visible-text | Original configuration. Start from zero. |
| 55 | dynamic visible-text | Road concept |
| 55 | dynamic aria-label | Start with a scenario |
| 55 | dynamic visible-text | Track concept |
| 56 | dynamic visible-text | ← Back |
| 56 | dynamic aria-label | Build configuration |
| 56 | dynamic visible-text | Build name |
| 56 | dynamic aria-label | Build steps |
| 56 | visible-text | Change a system to explore its assumed effect. Each power gain is a teaching input, not a tuner claim. |
| 56 | dynamic visible-text | Export JSON |
| 56 | dynamic placeholder | My {value3} build |
| 56 | dynamic visible-text | Name your build |
| 56 | dynamic visible-text | Next step → |
| 56 | visible-text | Review the complete configuration and keep a named snapshot. |
| 56 | dynamic visible-text | Save build ↗ |
| 56 | dynamic visible-text | Saved builds are available in My Garage. Export a JSON copy to keep or share. |
| 56 | visible-text | Shape the chassis concept and visual finish. These changes add no engine power. |
| 57 | dynamic visible-text | assumed scalar output |
| 57 | dynamic aria-label | Build insights |
| 57 | dynamic visible-text | Build review |
| 57 | dynamic visible-text | Concept preview · finish and stance only |
| 57 | dynamic visible-text | Concept preview, not an exact BMW model |
| 57 | literal | Dyno |
| 57 | dynamic aria-label | Live build insights |
| 57 | literal | Overview |
| 57 | dynamic visible-text | PS is metric horsepower. These are engine ratings. The scenario is not a measured aftermarket result. |
| 57 | dynamic aria-label | Simplified concept preview. Suspension, brake and wheel finish change the diagram. |
| 57 | dynamic visible-text | Stock vs. scenario |
| 58 | dynamic visible-text | Explore the curves |
| 58 | dynamic visible-text | Factory envelope |
| 58 | dynamic visible-text | Inspect the curve |
| 58 | dynamic visible-text | Move the RPM cursor to read the chart. No audio or driving simulation. |
| 58 | dynamic visible-text | No curve is a measured dyno run. |
| 58 | dynamic visible-text | Scenario Nm |
| 58 | dynamic visible-text | Scenario PS |
| 58 | dynamic visible-text | Synthetic power and torque envelopes anchored to factory ratings. |
| 59 | dynamic visible-text | Compare your builds |
| 60 | dynamic visible-text | Catalogue factory source ↗ |
| 60 | dynamic visible-text | Chassis, wheel, brake and transmission choices add no engine power. Power-to-weight holds verified factory mass constant. Actual part weight and physical fitment are unknown. |
| 60 | dynamic visible-text | How the scenarios work |
| 60 | visible-text | Matching factory mass is not documented for this entry. |
| 60 | dynamic visible-text | Power changes are arbitrary, additive teaching assumptions. They are not documented parts gains. Real output depends on the exact hardware, calibration, fuel, temperatures and engine condition. |
| 60 | dynamic visible-text | The dyno envelope is constructed from scalar ratings using P = T × angular speed. Curve shape is illustrative. |
| 75 | dynamic dynamic-template | [data-garage-step="{value1}"] |
| 81 | dynamic dynamic-template | [data-garage-insight="{value1}"] |
| 87 | literal | Factory baseline |
| 87 | literal | Saved snapshot |
| 87 | literal | Unsaved changes |
| 95 | literal | Engine power |
| 95 | literal | Nm |
| 95 | literal | Peak engine torque |
| 95 | visible-text | Power-to-weight unavailable: matching factory mass is not documented. |
| 95 | literal | PS/t |
| 96 | dynamic dynamic-template | {value1} kg, unchanged. |
| 96 | dynamic visible-text | {value1}: +{value2}% assumed output |
| 96 | dynamic visible-text | Factory mass: {value3} |
| 96 | literal | not documented. |
| 96 | dynamic visible-text | Total additive assumption: +{value2}%. |
| 98 | dynamic visible-text | {value1} system{value2} changed |
| 98 | visible-text | Add scenario support → |
| 98 | dynamic visible-text | See all {value1} review items → |
| 100 | dynamic dynamic-template | {value1} changes from factory |
| 100 | visible-text | Add calibration & charge cooling |
| 100 | visible-text | Choose a concept or change a system to create a new scenario. |
| 100 | dynamic visible-text | Engineering review |
| 100 | literal | Factory configuration |
| 100 | visible-text | Factory engine ratings provide the baseline. This builder does not assess vehicle condition. |
| 100 | dynamic visible-text | Tradeoffs to consider |
| 101 | literal / stock | 0px |
| 101 | literal / road | 5px |
| 101 | literal / track | 9px |
| 106 | literal | Engine power |
| 106 | literal | Nm |
| 106 | literal | Peak torque |
| 106 | literal | PS/t |
| 108 | dynamic visible-text | {value1} configuration comparison |
| 108 | dynamic dynamic-template | {value1} configuration differences |
| 108 | dynamic visible-text | Active |
| 108 | dynamic visible-text | Active: {value2} |
| 108 | dynamic visible-text | Both build columns are hypothetical. Only the factory column contains factory ratings. |
| 108 | visible-text | Change an active option to compare a different scenario. |
| 108 | literal | Choose a saved build |
| 108 | literal | Choose a snapshot to compare its output and configuration. It also appears as an overlay in the dyno view. |
| 108 | dynamic visible-text | Clear comparison |
| 108 | literal | Configurations match |
| 108 | dynamic visible-text | Factory |
| 108 | dynamic aria-label | Factory, active and saved scenario comparison |
| 108 | literal | Save a build to compare |
| 108 | literal | Save your first configuration in Review & save. Change a system, then compare the active scenario with that snapshot. |
| 108 | dynamic visible-text | Saved: {value3} |
| 108 | dynamic visible-text | Snapshot for this exact BMW |
| 116 | visible-text | Documented power and torque units are needed for a curve. |
| 120 | dynamic visible-text | {value2}k |
| 120 | dynamic aria-label | Constructed power and torque curves, not measurements. Read values with the RPM slider. |
| 120 | dynamic visible-text | ENGINE SPEED / RPM |
| 120 | dynamic visible-text | Factory and scenario envelopes |
| 120 | dynamic visible-text | Nm |
| 126 | dynamic dynamic-template | translate({value1},0) |
| 128 | dynamic dynamic-template | {value1} RPM |
| 130 | dynamic visible-text | {value1} · SAVED |
| 130 | dynamic visible-text | {value1} PS / {value2} Nm |
| 130 | dynamic visible-text | {value2} PS / {value3} Nm |
| 130 | dynamic visible-text | {value3} PS / {value4} Nm |
| 130 | dynamic visible-text | FACTORY ENVELOPE |
| 130 | dynamic visible-text | SCENARIO ENVELOPE |
| 137 | dynamic visible-text | {value5} changes · +{value6}% assumed output |
| 137 | dynamic aria-label | Compare {value2} |
| 137 | dynamic visible-text | Delete |
| 137 | dynamic aria-label | Delete {value11} |
| 137 | dynamic visible-text | Load |
| 137 | dynamic aria-label | Load {value9} |
| 137 | visible-text | Your first build starts with a BMW. Save it in the Review & save step. |
| 141 | literal | This browser could not save the build. Export JSON to keep a copy. |
| 145 | literal | Select a supported combustion model from this library. |
| 149 | dynamic dynamic-template | Loaded {value1}. |
| 151 | dynamic dynamic-template | {value1} · {value2} concept |
| 153 | literal | This named configuration is already saved. Change an option or its name to create another snapshot. |
| 154 | literal | All 20 saved-build slots are full. Export or delete a build before adding another. |
| 155 | dynamic dynamic-template | Saved {value1}. |
| 159 | literal | Choose a JSON file or paste an export first. |
| 159 | literal | The JSON is larger than 128 KB. |
| 159 | literal | This is not valid JSON. Use an APEX garage export. |
| 161 | literal | These configurations are already saved. No duplicates were added. |
| 162 | dynamic dynamic-template | Imported {value1} build{value2}. Your active configuration is unchanged. |
| 162 | literal | The browser could not store these builds. |
| 163 | literal | This configuration could not be imported. |
| 165 | literal | Reading configuration… |
| 165 | literal | The file could not be read. Paste its JSON instead. |
| 165 | literal | This file is larger than 128 KB. |
| 167 | dynamic dynamic-template | {value1} concept |
| 168 | dynamic dynamic-template | apex-{value1}-concept.json |
| 168 | literal / type | application/json |
| 168 | literal | Exported the configuration, factory sources and scenario assumptions. |
| 178 | dynamic dynamic-template | Deleted {value1}. |
| 180 | literal | [data-garage-preset],[data-garage-step],[data-garage-insight] |
| 181 | dynamic dynamic-template | {value1} applied. |
| 181 | literal | Factory configuration |
| 181 | literal | Road concept |
| 181 | literal | Track concept |
| 189 | literal | Factory configuration restored. |
| 190 | literal | Calibration and charge cooling added to the scenario. Review actual system specifications before selecting real parts. |
| 193 | literal | ArrowLeft |
| 193 | literal | ArrowRight |
| 193 | literal | End |

### public/turbo-types.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 8 | literal / trade | A larger unit can support more airflow, but its response depends on turbine sizing, engine displacement and control strategy. Bigger does not automatically mean better. |
| 8 | literal | Compressed intake air |
| 8 | literal | Engine exhaust |
| 8 | literal | F10 535i · N55 |
| 8 | literal | One turbine → shaft → one compressor |
| 9 | literal | F80 M3 · S55 |
| 9 | literal | F82 M4 · S55 |
| 9 | literal / body | In a parallel arrangement, separate exhaust groups drive two turbochargers. Their compressors supply the engine’s intake system alongside one another. “Twin-turbo” alone does not tell you whether either turbine housing is single-scroll or twin-scroll. |
| 9 | literal | Separate exhaust groups |
| 9 | literal | Shared engine intake |
| 9 | literal | Turbo A ∥ Turbo B |
| 9 | literal / trade | Two units add plumbing, heat and control complexity. Their response and airflow depend on the complete system, not simply the turbo count. |
| 10 | literal / body | A divided turbine housing has two scrolls. Carefully grouped cylinders feed separate passages so exhaust pulses interfere less before reaching the turbine. It is a housing design, not a second turbocharger. |
| 10 | literal | F10 535i · one twin-scroll / N55 |
| 10 | literal | F10 M5 · two twin-scroll / S63TU |
| 10 | literal | Grouped cylinder exhaust pulses |
| 10 | literal / trade | It depends on cylinder grouping and a matching divided exhaust manifold. A single-scroll manifold does not become a proper twin-scroll system just by changing the turbo. |
| 10 | literal | One compressor |
| 10 | literal | Scroll A + Scroll B → one turbine |
| 11 | literal | diesel-turbochargers/twostage-parallel-turbochargers-for-diesel-engines/ |
| 11 | literal | Higher demand · second turbo joins |
| 11 | literal | Lower demand · primary turbo |
| 11 | literal / body | Sequential describes staged operation: one turbo works at low engine demand, then another is introduced as demand increases. Valves manage the transition. The exact routing and activation points depend on the engine. |
| 11 | literal / trade | Staging can widen the useful operating range, but brings extra valves and control complexity. Sequential operation and series compression describe different things and can coexist. |
| 11 | literal | Valve-controlled transition |
| 12 | literal / body | Air leaving one compressor enters a second compressor for another compression stage. This is a series arrangement, unlike two parallel compressors. Bypasses and cooling arrangements vary by design. |
| 12 | literal | diesel-turbochargers/twostage-serial-turbochargers-for-diesel-engines/ |
| 12 | literal | Engine intake |
| 12 | literal | First compressor → second compressor |
| 12 | literal | Incoming air |
| 12 | literal / trade | Series compression can support a broad operating range and higher pressure ratios. More stages also mean more plumbing, heat management and control requirements. |
| 13 | literal | Adjustable vanes → turbine |
| 13 | literal | Controlled turbine response |
| 13 | literal | diesel-turbochargers/variable-geometry-turbos-for-diesel-engines/ |
| 13 | literal | Engine exhaust |
| 13 | literal | gasoline-turbochargers/variable-geometry-turbo-for-gas-engines/ |
| 13 | literal / trade | The mechanism must operate in hot exhaust gas. Vane control, durability and material requirements are part of the design, so compatibility cannot be assumed. |
| 13 | literal / tag | VGT / VNT |
| 14 | literal / body | An electrically assisted turbo adds a motor to the turbocharger shaft, helping drive the compressor before exhaust energy is sufficient. Some designs can recover energy. This is different from a separate electric compressor or e-booster. |
| 14 | literal | Compressor → intake |
| 14 | literal | Electrical power + exhaust energy |
| 14 | literal / trade | It needs a suitable electrical system, power electronics and thermal management. It is not a plug-in upgrade for every turbocharged BMW. |
| 14 | literal | Motor-assisted turbo shaft |
| 18 | dynamic visible-text | Count, housing and control are different characteristics. One engine can combine several of these labels. BMW’s “TwinPower Turbo” name does not specify the turbo count. |
| 18 | literal | Mono-scroll |
| 18 | literal | Twin-scroll · both turbos |
| 18 | dynamic visible-text | Twin-turbo ≠ twin-scroll. |
| 21 | dynamic visible-text | Explore {value2} ↗ |
| 23 | literal | (prefers-reduced-motion: reduce) |

### public/verified-specs.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 16 | literal / specification | BMW M5 F10 · ACEA specification valid 10/2011 · seven-speed M DCT |
| 19 | literal / transmission | 7-speed M double-clutch transmission with Drivelogic |
| 41 | literal / title | BMW M5 specifications · October 2011 · pages 1–2 |
| 42 | literal / title | BMW launch press kit · engine speed and rear-wheel drive |
| 44 | literal / verificationNote | The English factory PDF prints “560 hp” alongside 412 kW. This is metric horsepower (PS), approximately 552 mechanical hp. It is not a 560 SAE-hp US rating. |
| 47 | literal / specification | BMW M3 E92 Coupé · April 2007 European launch figures · six-speed manual |
| 50 | literal / transmission | 6-speed manual |
| 54 | literal / topSpeedNote | Electronically limited. These acceleration and mass figures describe the launch manual, not the later M DCT. |
| 56 | literal / weightConvention | EU unladen: DIN road-trim mass plus 75 kg for driver and luggage. |
| 68 | literal / title | BMW M3 launch press kit · April 2007 · pages 2 and 18 |
| 69 | literal / verificationNote | Factory European output is 309 kW / 420 PS (approximately 414 mechanical hp). Published here with the manual transmission and EU mass convention from the same document. |
| 72 | literal / specification | BMW M3 Competition Sedan G80 · 2021 US launch · rear-wheel drive · eight-speed M Steptronic |
| 75 | literal / transmission | 8-speed M Steptronic automatic with Drivelogic |
| 82 | literal / topSpeedNote | The US launch source quotes 155 mph, or 180 mph with the optional M Driver’s Package. A separate metric speed figure is not supplied here. |
| 93 | literal / title | BMW US 2021 M3/M4 launch · M3 Competition column in specifications table |
| 97 | literal / specification | BMW M4 Competition Coupé G82 · 2021 European launch · September 2020 ACEA data · rear-wheel drive |
| 100 | literal / transmission | 8-speed M Steptronic automatic with Drivelogic |
| 122 | literal / title | BMW M3/M4 Competition launch · original rear-drive configuration |
| 127 | literal / specification | BMW M2 G87 · 2023 European launch · October 2022 provisional ACEA data · eight-speed automatic baseline |
| 130 | literal / transmission | 8-speed M Steptronic with Drivelogic (6-speed manual optional) |
| 151 | literal / transmission | 6-speed manual |
| 154 | literal / title | BMW M2 launch technical specifications · October 2022 · pages 1–2 |
| 155 | literal / title | BMW M2 European launch · transmission alternatives and engine speed |
| 160 | literal / specification | BMW M3 Competition Touring G81 with M xDrive · June 2022 European launch · provisional ACEA data |
| 163 | literal / transmission | 8-speed M Steptronic automatic with Drivelogic |
| 164 | literal / drivetrain | M xDrive all-wheel drive |
| 183 | literal / title | BMW M3 Touring technical specifications · June 2022 · pages 1–2 |
| 184 | literal / verificationNote | Matches the catalogue’s original 510 PS M xDrive Touring, not the later 530 PS update or a saloon. June 2022 is the launch-document date, not a claimed production-year range. BMW identifies all figures in this launch sheet as provisional. |
| 187 | literal / specification | BMW M3 Sedan F80 · 2015 US base specification · six-speed manual baseline |
| 190 | literal / transmission | 6-speed manual (7-speed M DCT optional) |
| 195 | literal / topSpeedNote | 250 km/h / 155 mph in the 2015 US technical table. The source does not specify an optional higher limit. |
| 198 | literal / weightConvention | US curb mass, manual: 1,606 kg / 3,540 lb as published. DCT: 1,631 kg / 3,595 lb. These are not European DIN masses. |
| 210 | literal / transmission | 7-speed M DCT |
| 213 | literal / title | 2015 BMW M3 Sedan US technical data · manual and DCT columns |
| 214 | literal / title | BMW US M3/M4 launch · rear-wheel-drive powertrain and transmission choices |
| 219 | literal / specification | BMW M3 CSL E46 · 2003 European CSL · six-speed SMG Drivelogic · historical BMW technical table |
| 222 | literal / transmission | 6-speed SMG automated manual with Drivelogic |
| 226 | literal / topSpeedNote | 250 km/h, electronically limited in the original BMW CSL launch release. |
| 234 | literal / dimensionNote | Unladen body dimensions in millimetres, using the CSL column rather than the standard M3 Coupé column. Width excludes mirrors. |
| 241 | literal / title | BMW historical M3 technical tables · page 10 · 2003 CSL column |
| 242 | literal / title | BMW M3 CSL original April 2003 launch · six-speed SMG and performance |
| 243 | literal / title | BMW CSL archive reprint · retained for conflicting mass-convention context |

### public/viewer.js

| Line | Context | English source candidate |
| ---: | --- | --- |
| 18 | literal | Select |
| 40 | literal | 12 V BATTERY |
| 40 | literal | 8HP45 |
| 40 | literal | N55 · INLINE-SIX |
| 40 | literal | REAR DRIVE |
| 40 | literal | TWIN-SCROLL TURBO |
| 47 | literal | BoxGeometry |

## Conflicting duplicate dictionary entries

Existing conflicts are warnings; they do not prevent deployment. Reconcile terminology or use context-specific keys before making this rule strict.

| English key | First dictionary | Later dictionary |
| --- | --- | --- |
| Power | public/academy-translations-content.js:academyContentTranslations | public/academy-translations-legacy.js:default |
| Exhaust | public/academy-translations-content.js:academyContentTranslations | public/academy-translations-legacy.js:default |
| Drivetrain | public/academy-translations-content.js:academyContentTranslations | public/academy-translations-legacy.js:default |
| Engine | public/academy-translations-content.js:academyContentTranslations | public/academy-translations-legacy.js:default |
| Battery | public/academy-translations-content.js:academyContentTranslations | public/academy-translations-legacy.js:default |
| Twin-turbo inline six | public/academy-translations-content.js:academyContentTranslations | public/academy-translations-legacy.js:default |
| Single twin-scroll inline six | public/academy-translations-content.js:academyContentTranslations | public/academy-translations-legacy.js:default |
| Turbocharger | public/academy-translations-content.js:academyContentTranslations | public/academy-translations-parts.js:partsTranslations |
| Air & exhaust | public/academy-translations-legacy.js:default | public/academy-translations-parts.js:partsTranslations |
| Crankshaft | public/academy-translations.js:academyInterfaceTranslations | public/engine-lab-translations.js:engineLabTranslations |
| Compare | public/academy-translations-legacy.js:default | public/preferences.js:copy |
| Power | public/academy-translations-legacy.js:default | public/preferences.js:copy |
| Engine | public/academy-translations-legacy.js:default | public/preferences.js:copy |
| Zoom out | public/engine-lab-translations.js:engineLabTranslations | public/preferences.js:copy |
| Zoom in | public/engine-lab-translations.js:engineLabTranslations | public/preferences.js:copy |
| Turbocharger | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Throttle body | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Air & exhaust | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Electrical | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Generic reference | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Cut-open reference | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Electrical section | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Uses exhaust energy to compress the air entering the engine. | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Traps dust and dirt before intake air enters the engine. | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Creates the spark that ignites the air-fuel mixture. | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Converts low-voltage electrical energy into the high voltage needed for a spark. | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Meters and sprays fuel into the engine’s air supply or combustion chamber. | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Generates electricity and charges the battery while the engine runs. | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Changes the intake passage opening using a movable throttle plate. | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Uses hydraulic pressure to squeeze the pads against the brake disc. | public/academy-translations-parts.js:partsTranslations | public/preferences.js:copy |
| Intake | public/academy-translations-legacy.js:default | public/preferences.js:copy |
| Cooling | public/academy-translations-legacy.js:default | public/preferences.js:copy |
| Exhaust | public/academy-translations-legacy.js:default | public/preferences.js:copy |
| Powertrain | public/academy-translations-content.js:academyContentTranslations | public/preferences.js:copy |
| Rear-wheel drive | public/academy-translations-content.js:academyContentTranslations | public/preferences.js:copy |
| Front-wheel drive | public/academy-translations-content.js:academyContentTranslations | public/preferences.js:copy |
