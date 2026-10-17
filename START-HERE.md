# BMW site — VS Code edition

1. Extract the ZIP using Windows Extract All.
2. In Visual Studio Code, choose File → Open Folder and open bmw-site (the folder containing package.json).
3. Choose Terminal → New Terminal.
4. Run `npm.cmd start` on Windows, or `npm start` on macOS/Linux.
5. Open http://localhost:3000 in your browser. Keep the terminal running.

Node.js is required. The preview uses built-in Node modules; npm install is not required to preview it. npm.cmd avoids the PowerShell npm.ps1 execution-policy error on Windows.

## What is included

- 63 curated BMW models: 30 M entries, 8 electric cars, and models across the numbered, X, Z and i families. This is a selected collection across generations, rather than a register of every production variant.
- 38 new local WebP photographs with source and license information.
- English, Georgian and German interface options; light, dark and automatic themes.
- Search by model, engine or generation, series filters, power sorting, and progressive browsing.
- A saved garage and comparison for up to three models. Preferences and saved models are stored in this browser on this device.
- Existing engine inspection, component guides, real-recording links, 3D exterior references and simulated engine sound.

## Files to edit
- public/index.html: cars page structure
- public/style.css: design and responsive styles
- public/design.css: new visual design and light/dark theme styles
- public/app.js: shared interactions
- public/collection.js: browsing, favorites and comparison
- public/preferences.js: interface translations and theme preferences
- public/models.js and public/new-models.js: BMW collection
- public/extended-models.js: expanded catalog and attributed photographs
- public/photo-manifest.json: new photo sources and licenses
- public/parts.js: photographed parts catalog
- public/turbo-types.js: turbo technology guide
- public/images/: photographs
- public/engine-sound.js, engine-core.js and engine-worklet.js: simulated interactive sound
- public/parts.html, electric.html and about.html: other pages

Save a file and refresh the browser. The four HTML files share some markup; update shared structure consistently across them. Preserve photo attribution, licenses and the distinction between factory data and simulated sound.

## Local and hosted
Original downloaded source snapshot: c2353ac989fd98a9317d1479297d0fb8a45f101d.
Editing this copy does not automatically update the published site. Your published site remains online. Cloud sign-in, D1 garage storage and deployed user data are not connected to this local preview. Embedded 3D models, videos and external sources need internet access.

The original Worker, database schema, migrations and build script are included. `npm run build` rebuilds Worker assets; it does not deploy. For database tooling dependencies, run `npm.cmd install` on Windows or `npm install` elsewhere.

If using Codex in VS Code, open this project folder and ask it to read START-HERE.md first. This conversation is not automatically transferred into the source folder.
