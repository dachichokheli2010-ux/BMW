import * as T from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';

// Original procedural geometry. This is a teaching schematic, not BMW CAD.
export const ENGINE_LAB_PARTS = [
  { id: 'turbos', name: 'Twin-scroll turbochargers', area: 'Inside the V, above the crankcase', text: 'Two exhaust-driven turbines power two compressors. Each turbine has two separated exhaust passages; twin-scroll describes the passages, not the number of turbochargers.', detail: 'The F10 M5 places both turbochargers between the cylinder banks. Short inboard exhaust paths help response. Wheel speeds and housing shapes here are illustrative.', connects: ['exhaust', 'intake', 'chargecoolers', 'lubrication', 'cooling'], color: '#69b9ff', tags: 'turbo boost compressor turbine hot v twinpower' },
  { id: 'block', name: 'V8 cylinder block', area: 'The central structure, with two banks of four cylinders', text: 'The block locates the cylinders, supports the crankshaft and carries coolant and oil passages.', detail: 'The F10 M5 uses a 90-degree V8. The open cylinder sleeves in this model reveal the layout; the real casting, dimensions and internal galleries are more complex.', connects: ['pistons', 'crankshaft', 'heads', 'cooling', 'lubrication'], color: '#a0b1c5', tags: 'engine cylinder crankcase 90 degree v8 s63 s63tu s63tü' },
  { id: 'pistons', name: 'Eight pistons', area: 'One inside each cylinder', text: 'Expanding combustion gas pushes the pistons down their bores. Each piston completes intake, compression, power and exhaust strokes.', detail: 'Piston rings seal combustion pressure and help control oil. The motion is slowed for learning; the displayed stroke, firing sequence and clearances are not factory measurements.', connects: ['rods', 'block', 'valves', 'fuel'], color: '#dce6f1', tags: 'combustion four stroke piston rings internals' },
  { id: 'rods', name: 'Connecting rods', area: 'Between each piston and a crankshaft journal', text: 'The rods transfer force between pistons and crankshaft while their angle changes during rotation.', detail: 'The small end pivots at the piston pin; the big end rotates around its crank journal. Oil films protect the bearing surfaces.', connects: ['pistons', 'crankshaft', 'lubrication'], color: '#b3c2d2', tags: 'conrod connecting rod internals bearing' },
  { id: 'crankshaft', name: 'Crankshaft', area: 'Low in the block, along the engine centreline', text: 'Offset journals turn the pistons’ reciprocating motion into rotating output.', detail: 'A V8 crankshaft includes journals, counterweights and oil drillings. The exposed shaft illustrates the mechanism, without reproducing the production crankshaft or balance design.', connects: ['rods', 'flywheel', 'timing', 'lubrication'], color: '#8b9aad', tags: 'crank torque output crossplane bearing' },
  { id: 'heads', name: 'Cylinder heads', area: 'Above the two cylinder banks', text: 'The heads form the tops of the combustion chambers and contain ports, valves, spark plugs and injectors.', detail: 'In this hot-V arrangement the exhaust exits toward the centre and intake air enters from the outside. Transparent mode helps reveal the simplified internal arrangement.', connects: ['block', 'valves', 'camshafts', 'fuel', 'intake', 'exhaust'], color: '#8ca4bd', tags: 'cylinder head combustion spark plug ports' },
  { id: 'camshafts', name: 'Camshafts', area: 'Two over each cylinder bank', text: 'Rotating cam lobes operate the valve mechanisms. The four-stroke cycle requires one camshaft revolution for every two crankshaft revolutions.', detail: 'The production engine includes variable cam timing. These cams demonstrate the half-speed relationship; their profiles and timing are illustrative.', connects: ['valves', 'timing', 'heads', 'lubrication'], color: '#bccddd', tags: 'cam dohc double vanos valve timing' },
  { id: 'valves', name: 'Valves & VALVETRONIC', area: 'In the cylinder heads, above each combustion chamber', text: 'Intake valves admit air and exhaust valves release spent gas. VALVETRONIC varies intake valve lift to help control engine load.', detail: 'The model shows four valves per cylinder and exaggerated valve movement. It does not reproduce the eccentric shaft, intermediate levers or a calibrated valve event schedule.', connects: ['camshafts', 'heads', 'intake', 'exhaust'], color: '#bce8f7', tags: 'valvetronic valve lift intake exhaust poppet' },
  { id: 'exhaust', name: 'Cross-bank exhaust manifold', area: 'Inboard of the heads, inside the V', text: 'The manifold routes exhaust pulses from both cylinder banks to the twin-scroll turbines.', detail: 'BMW uses a cross-bank manifold to manage pulse delivery. The crossing pipes here explain the concept; they do not specify the production cylinder pairing, equal lengths or service routing.', connects: ['heads', 'valves', 'turbos'], color: '#ff976a', tags: 'exhaust manifold hot v crossbank crossover scroll gas' },
  { id: 'intake', name: 'Air intake & charge pipes', area: 'Around the outside of the banks and into the compressors', text: 'Filtered air enters the compressors, passes through charge-air coolers and then travels to the intake ports.', detail: 'The outboard intakes are a key feature of the hot-V layout. Pipes and filters are schematic; no measured airflow, boost pressure or production packaging is simulated.', connects: ['turbos', 'chargecoolers', 'heads', 'valves'], color: '#6bbaff', tags: 'air filter intake boost charge pipe throttle' },
  { id: 'chargecoolers', name: 'Air-to-liquid charge coolers', area: 'In the compressed-air path before the intake ports', text: 'Compression heats the air. A liquid-cooled heat exchanger removes some of that heat before the air enters the engine.', detail: 'The F10 M5 uses air-to-liquid charge cooling. This model separates the cooler cores for clarity and draws a conceptual coolant circuit, without reproducing the actual hose network.', connects: ['turbos', 'intake', 'cooling'], color: '#75d6e4', tags: 'intercooler charge air water liquid cooler heat exchanger' },
  { id: 'fuel', name: 'Direct fuel injection', area: 'Fuel rails over the banks; injectors enter the combustion chambers', text: 'High-pressure injectors spray fuel directly into the cylinders, where the air and fuel mixture is ignited by spark plugs.', detail: 'Fuel delivery is metered electronically. The rail and gold flow paths explain the supply relationship; spray shape, pressure and injector timing are not simulated.', connects: ['heads', 'pistons', 'valves'], color: '#f2ca71', tags: 'fuel injector direct injection petrol gasoline rail high precision' },
  { id: 'cooling', name: 'Cooling circuit', area: 'Around the block, heads, turbos and heat exchangers', text: 'Circulating coolant carries heat to heat exchangers, where it can be released to the air.', detail: 'Real engines use multiple branches and controlled thermal circuits. The teal routes are conceptual and intentionally omit the exact F10 M5 plumbing and control strategy.', connects: ['block', 'heads', 'turbos', 'chargecoolers'], color: '#54d5c3', tags: 'coolant radiator water pump thermostat heat temperature' },
  { id: 'lubrication', name: 'Oil supply & sump', area: 'Sump below the crankshaft; galleries supply bearings and upper engine', text: 'A pump draws oil from the sump and supplies loaded surfaces, including crank bearings, cams and turbo bearings.', detail: 'The F10 M5 uses wet-sump lubrication adapted for high lateral loads. The amber paths show the principle of oil supply and return, not the engine’s production gallery layout.', connects: ['crankshaft', 'rods', 'camshafts', 'turbos'], color: '#e6ad63', tags: 'oil lubrication sump wet pump bearing filter' },
  { id: 'timing', name: 'Timing drive', area: 'At the front of the engine', text: 'The timing drive maintains the relationship between crankshaft and camshafts so the valves and pistons move in sequence.', detail: 'The displayed chain loops and sprockets are a schematic of the drive relationship. They do not show the production chain path, tensioners or workshop timing marks.', connects: ['crankshaft', 'camshafts'], color: '#8cb1d1', tags: 'timing chain sprocket front pulley' },
  { id: 'flywheel', name: 'Output flywheel', area: 'At the rear of the crankshaft, facing the transmission', text: 'The engine’s rotating output passes to the transmission through its coupling assembly.', detail: 'The rear disc marks the engine-to-transmission interface. Its geometry is symbolic and does not reproduce an M DCT clutch or flywheel assembly.', connects: ['crankshaft'], color: '#889eb2', tags: 'flywheel transmission gearbox dct clutch output' },
];

const FLOW = {
  intake: { color: '#6bbaff', text: 'Air: filter → compressor → air-to-liquid charge cooler → outer intake ports.' },
  exhaust: { color: '#ff976a', text: 'Exhaust: inner exhaust ports → cross-bank manifold → twin-scroll turbines → exhaust outlet.' },
  cooling: { color: '#54d5c3', text: 'Cooling: heat exchanger → engine and turbo cooling branches → heat exchanger. Conceptual circuit.' },
  oil: { color: '#e6ad63', text: 'Lubrication: sump and pump → crank bearings, cams and turbo bearings → return to sump.' },
  fuel: { color: '#f2ca71', text: 'Fuel: supply → high-pressure rails → direct injectors → combustion chambers.' },
};
let sequence = 0;

/** Mount an independent, accessible S63 teaching explorer. Call destroy() on unmount. */
export function mountEngineLab(container, options = {}) {
  if (!(container instanceof Element)) throw new TypeError('mountEngineLab requires a DOM element.');
  if (!document.querySelector('link[data-engine-lab-styles], link[href$="engine-lab.css"]')) {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet'; sheet.href = new URL('./engine-lab.css', import.meta.url).href;
    sheet.dataset.engineLabStyles = ''; document.head.append(sheet);
  }
  const uid = `engine-lab-${++sequence}`;
  const root = document.createElement('section');
  root.className = 'engine-lab'; root.setAttribute('aria-label', 'F10 M5 S63 engine explorer');
  root.innerHTML = `
    <div class="el-intro"><div><span class="el-eyebrow">ENGINEERING, REVEALED</span><h2>Inside the <em>S63 V8.</em></h2><p>F10 M5 · 90° V8 · hot-V twin turbo</p></div><span class="el-model-tag">EDUCATIONAL 3D MODEL</span></div>
    <p class="el-disclosure">An original, simplified representation of the F10 M5 S63Tü architecture. Geometry, locations, fluid routes and motion are illustrative; this is not factory CAD or a repair guide.</p>
    <div class="el-toolbar" role="group" aria-label="Engine view controls">
      <button type="button" data-action="explode" aria-pressed="false">Explode view</button><button type="button" data-action="xray" aria-pressed="true">X-ray</button><button type="button" data-action="animate" aria-pressed="false">Animate internals</button><button type="button" data-action="reset">Reset view</button>
      <label class="el-speed" for="${uid}-speed">Motion speed <input id="${uid}-speed" type="range" min="0.2" max="1" value="0.45" step="0.05" aria-label="Slowed educational animation speed"></label>
    </div>
    <div class="el-workspace"><div class="el-stage"><div class="el-viewport" tabindex="0" role="img" aria-label="Interactive engine schematic. Drag to orbit, pinch or scroll to zoom. Keyboard: arrow keys orbit, plus and minus zoom, zero resets. Use the component buttons to explore every part."></div><div class="el-view-label"><span class="el-live-dot"></span><span>90° V8 / 8 CYLINDERS</span><span class="el-render-status">STARTING VIEWER</span></div><div class="el-viewport-note">Drag to orbit · scroll or pinch to zoom<br>Click to inspect · keyboard: arrows / + / −</div><p class="el-fallback" hidden>3D rendering is unavailable on this device. Explore every component and its connections using the list and details below.</p></div>
    <aside class="el-inspector" aria-label="Component information"><span class="el-eyebrow">COMPONENT INSPECTOR</span><h3 class="el-part-name"></h3><p class="el-location"></p><p class="el-description"></p><details class="el-technical"><summary>Engineering notes</summary><p></p></details><div class="el-connections"><span>CONNECTED TO</span><div></div></div><button type="button" class="el-focus" data-action="focus">Zoom to component ↗</button><p class="el-select-status" role="status" aria-live="polite"></p></aside></div>
    <div class="el-flow-controls"><label for="${uid}-flow">Trace a system</label><select id="${uid}-flow" aria-label="Show an educational fluid flow path"><option value="none">No flow overlay</option><option value="intake">Intake air</option><option value="exhaust">Exhaust gas</option><option value="cooling">Cooling circuit</option><option value="oil">Lubrication circuit</option><option value="fuel">Fuel injection</option></select><p class="el-flow-note" role="status">Select a flow to follow its path. All routes are conceptual.</p></div>
    <div class="el-parts-heading"><label for="${uid}-search">Find a component</label><input id="${uid}-search" type="search" placeholder="Try “turbo”, “valves” or “oil”…" autocomplete="off"><span class="el-search-count" role="status"></span></div><div class="el-parts" role="group" aria-label="Engine components"></div><p class="el-no-parts" hidden>No matching component. Try a part name or system.</p>
    <footer class="el-footer"><span>Slowed motion · illustrative valve timing and firing sequence</span><a href="https://www.press.bmwgroup.com/usa/article/detail/T0114798EN_US/introducing-the-all-new-5th-generation-bmw-m5" target="_blank" rel="noopener noreferrer">Architecture source: BMW PressClub ↗</a></footer>`;
  container.append(root);
  const $ = selector => root.querySelector(selector);
  const listeners = [];
  function listen(el, event, fn, opts) { el.addEventListener(event, fn, opts); listeners.push(() => el.removeEventListener(event, fn, opts)); }
  const state = { selected: 'turbos', explode: false, xray: true, running: false, speed: .45, flow: 'none' };
  const partMap = new Map(ENGINE_LAB_PARTS.map(part => [part.id, part]));
  const partButtons = new Map();
  for (const part of ENGINE_LAB_PARTS) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.part = part.id;
    button.textContent = part.name; button.style.setProperty('--part-color', part.color); button.setAttribute('aria-pressed', 'false');
    $('.el-parts').append(button); partButtons.set(part.id, button);
  }
  let renderer, scene, camera, controls, groups = {}, pickable = [], connectionLines;
  let destroyed = false, contextLost = false, visible = true, frameId = 0, lastTime = 0, phase = 0, flowTime = 0, resizing, visibilityObserver;
  let cameraGoal = null, targetGoal = null;
  const internals = { pistons: [], rods: [], cams: [], valves: [], wheels: [] }, flows = [], allocatedMaterials = new Set(), allocatedGeometry = new Set();
  const viewport = $('.el-viewport'), stage = $('.el-stage');

  function selectPart(id, focus = true) {
    const part = partMap.get(id); if (!part || destroyed) return false;
    state.selected = id;
    $('.el-part-name').textContent = part.name; $('.el-location').textContent = part.area;
    $('.el-description').textContent = part.text; $('.el-technical p').textContent = part.detail;
    const connections = $('.el-connections > div'); connections.replaceChildren();
    for (const connected of part.connects) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.part = connected; button.textContent = partMap.get(connected).name; connections.append(button);
    }
    for (const [key, button] of partButtons) { button.setAttribute('aria-pressed', String(key === id)); button.classList.toggle('is-selected', key === id); }
    $('.el-select-status').textContent = `${part.name} selected. ${part.connects.length} connected components.`;
    updateMaterials(); updateConnectionLines(); if (focus) focusPart();
    options.onSelect?.(part); return true;
  }
  function updateMaterials() {
    for (const mesh of pickable) {
      const material = mesh.material, selected = mesh.userData.part === state.selected;
      material.emissive?.set(selected ? 0x2376bd : 0x000000); if (material.emissive) material.emissiveIntensity = selected ? .33 : 0;
      const opacity = state.xray && mesh.userData.shell ? .17 : mesh.userData.baseOpacity ?? 1;
      material.transparent = opacity < 1; material.opacity = opacity; material.depthWrite = opacity >= .5;
    }
  }
  function focusPart() {
    if (!camera || !groups[state.selected]) return;
    const g = groups[state.selected]; targetGoal = g.position.clone().add(g.userData.anchor);
    const direction = camera.position.clone().sub(controls.target).normalize();
    cameraGoal = targetGoal.clone().addScaledVector(direction, state.selected === 'block' ? 5.1 : 3.5);
  }
  function reset() {
    state.explode = false; state.xray = true; state.running = false; state.flow = 'none'; state.speed = .45;
    for (const key of ['explode', 'xray', 'animate']) $(`[data-action="${key}"]`).setAttribute('aria-pressed', String(key === 'xray'));
    $('[data-action="animate"]').textContent = 'Animate internals'; $(`#${uid}-flow`).value = 'none'; $(`#${uid}-speed`).value = '.45';
    $('.el-flow-note').textContent = 'Select a flow to follow its path. All routes are conceptual.';
    $(`#${uid}-search`).value = ''; filterParts('');
    if (camera) { cameraGoal = new T.Vector3(5.8, 4.5, -6); targetGoal = new T.Vector3(0, 1, 0); }
    selectPart('turbos', false);
  }
  function filterParts(query) {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean); let count = 0, first = null;
    for (const part of ENGINE_LAB_PARTS) {
      const match = words.every(word => `${part.name} ${part.area} ${part.tags}`.toLocaleLowerCase().includes(word));
      partButtons.get(part.id).hidden = !match; if (match) { count++; first ||= part.id; }
    }
    $('.el-no-parts').hidden = count > 0; $('.el-search-count').textContent = `${count} component${count === 1 ? '' : 's'}`;
    if (words.length && first && (!partButtons.get(state.selected) || partButtons.get(state.selected).hidden)) selectPart(first, false);
  }
  listen(root, 'click', event => {
    const partButton = event.target.closest('button[data-part]'); if (partButton && root.contains(partButton)) { selectPart(partButton.dataset.part); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'reset') { reset(); return; } if (action === 'focus') { focusPart(); return; }
    const key = action === 'animate' ? 'running' : action;
    if (['explode', 'xray', 'running'].includes(key)) {
      state[key] = !state[key]; $(`[data-action="${action}"]`).setAttribute('aria-pressed', String(state[key]));
      if (key === 'running') $('[data-action="animate"]').textContent = state.running ? 'Pause internals' : 'Animate internals';
      if (key === 'explode') {
        if (state.explode && state.flow !== 'none') {
          state.flow = 'none'; $(`#${uid}-flow`).value = 'none';
          $('.el-flow-note').textContent = 'Exploded view separates the components. Choose a flow to reassemble and trace its system.';
        }
        if (camera) { cameraGoal = state.explode ? new T.Vector3(7, 5.5, -7) : new T.Vector3(5.8, 4.5, -6); targetGoal = new T.Vector3(0, 1, 0); }
      }
      updateMaterials();
    }
  });
  listen($(`#${uid}-search`), 'input', event => filterParts(event.target.value));
  listen($(`#${uid}-search`), 'keydown', event => { if (event.key === 'Enter') { const first = [...partButtons.values()].find(button => !button.hidden); if (first) selectPart(first.dataset.part); } });
  listen($(`#${uid}-speed`), 'input', event => { state.speed = Number(event.target.value); });
  listen($(`#${uid}-flow`), 'change', event => {
    state.flow = event.target.value;
    if (state.flow !== 'none' && state.explode) {
      state.explode = false; $('[data-action="explode"]').setAttribute('aria-pressed', 'false');
      if (camera) { cameraGoal = new T.Vector3(5.8, 4.5, -6); targetGoal = new T.Vector3(0, 1, 0); }
    }
    $('.el-flow-note').textContent = FLOW[state.flow]?.text || 'Select a flow to follow its path. All routes are conceptual.';
  });

  function unavailable(message) {
    root.classList.add('el-no-webgl'); $('.el-fallback').hidden = false; $('.el-render-status').textContent = message;
    for (const action of ['explode', 'xray', 'animate', 'focus']) { const button = $(`[data-action="${action}"]`); button.disabled = true; button.setAttribute('aria-pressed', 'false'); }
    $(`#${uid}-speed`).disabled = true;
  }
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.5;
    renderer.domElement.setAttribute('aria-hidden', 'true'); renderer.domElement.style.touchAction = 'none'; viewport.append(renderer.domElement);
    scene = new T.Scene(); camera = new T.PerspectiveCamera(38, 1, .05, 70); camera.position.set(5.8, 4.5, -6);
    controls = new OrbitControls(camera, renderer.domElement); controls.target.set(0, 1, 0); controls.enableDamping = true;
    controls.dampingFactor = .09; controls.minDistance = 2; controls.maxDistance = 15; controls.maxPolarAngle = Math.PI * .85; controls.enablePan = true;
    listen(controls, 'start', () => { cameraGoal = targetGoal = null; });
    scene.add(new T.HemisphereLight(0xb7d9ff, 0x152135, 2.4));
    for (const [position, color, intensity] of [[[3, 7, -3], 0xffffff, 5], [[-4, 2, 2], 0x478dff, 4], [[1, 4, 5], 0xa0d7ff, 3]]) { const light = new T.DirectionalLight(color, intensity); light.position.set(...position); scene.add(light); }
    const engine = new T.Group(); scene.add(engine);
    function geometry(value) { allocatedGeometry.add(value); return value; }
    function material(color, extras = {}) { const m = new T.MeshStandardMaterial({ color, metalness: .65, roughness: .35, ...extras }); allocatedMaterials.add(m); return m; }
    function partGroup(id, anchor, explode) { const group = new T.Group(); group.userData = { part: id, anchor: new T.Vector3(...anchor), explode: new T.Vector3(...explode) }; groups[id] = group; engine.add(group); return group; }
    function mesh(parent, geom, color, position = [0, 0, 0], rotation = [0, 0, 0], extras = {}) {
      const m = new T.Mesh(geometry(geom), material(color, extras)); m.position.set(...position); m.rotation.set(...rotation);
      let p = parent; while (p && !p.userData.part) p = p.parent;
      if (p) { m.userData.part = p.userData.part; pickable.push(m); } parent.add(m); return m;
    }
    function box(parent, size, color, position, rotation, extras) { return mesh(parent, new T.BoxGeometry(...size), color, position, rotation, extras); }
    function cyl(parent, radius, length, color, position, rotation = [Math.PI / 2, 0, 0], extras) { return mesh(parent, new T.CylinderGeometry(radius, radius, length, 24), color, position, rotation, extras); }
    function pipe(parent, points, radius, color) { return mesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), 32, radius, 8, false), color); }
    function torus(parent, radius, tube, color, position, rotation = [0, 0, 0]) { return mesh(parent, new T.TorusGeometry(radius, tube, 12, 36), color, position, rotation); }
    function shell(m) { m.userData.shell = true; return m; }
    function bank(parent, side) { const group = new T.Group(); group.position.set(side * .29, .57, 0); group.rotation.z = -side * Math.PI / 4; parent.add(group); return group; }
    const zs = [-.93, -.31, .31, .93], bankSides = [-1, 1], steel = 0xa4b4c6, dark = 0x223345;
    const block = partGroup('block', [0, .8, 0], [0, -.05, 0]);
    shell(box(block, [1.1, .42, 2.9], 0x556a82, [0, .4, 0]));
    for (const side of bankSides) {
      const b = bank(block, side); shell(box(b, [.62, .87, 2.74], 0x698198, [0, .44, 0]));
      for (const z of zs) {
        shell(mesh(b, new T.CylinderGeometry(.246, .246, .89, 28, 1, true), 0x8295a9, [0, .49, z], [0, 0, 0], { side: T.DoubleSide }));
        torus(b, .244, .025, 0xbbcbd9, [0, .94, z], [Math.PI / 2, 0, 0]);
      }
      for (let z = -1.2; z < 1.3; z += .2) box(b, [.68, .038, .045], 0x7890a4, [0, .2, z]);
    }
    const crank = partGroup('crankshaft', [0, .49, 0], [0, -.45, .08]);
    const crankRotator = new T.Group(); crankRotator.position.y = .5; crank.add(crankRotator);
    cyl(crankRotator, .083, 3.14, steel, [0, 0, 0]);
    const journalPhases = [0, Math.PI / 2, Math.PI * 1.5, Math.PI];
    for (let i = 0; i < 4; i++) {
      const a = journalPhases[i], x = Math.cos(a) * .12, y = Math.sin(a) * .12;
      cyl(crankRotator, .077, .25, 0xd0dbe3, [x, y, zs[i]]);
      for (const dz of [-.16, .16]) box(crankRotator, [.29, .19, .08], 0x8a9cb0, [x * .5, y * .5, zs[i] + dz], [0, 0, a]);
    }
    const pistons = partGroup('pistons', [0, 1.05, 0], [0, .48, 0]);
    const rods = partGroup('rods', [0, .76, 0], [0, .12, 0]);
    for (const side of bankSides) for (let i = 0; i < 4; i++) {
      const p = new T.Group(); p.rotation.z = -side * Math.PI / 4; pistons.add(p);
      cyl(p, .207, .19, 0xc3d0dc, [0, 0, 0], [0, 0, 0]);
      for (const y of [.035, .065]) torus(p, .208, .009, 0x4d6276, [0, y, 0], [Math.PI / 2, 0, 0]);
      cyl(p, .051, .4, steel, [0, -.045, 0], [0, 0, Math.PI / 2]);
      internals.pistons.push({ group: p, side, index: i });
      const rod = cyl(rods, .035, 1, 0xb0bfcc, [0, .7, zs[i]], [0, 0, 0]);
      internals.rods.push(rod);
    }
    const heads = partGroup('heads', [0, 1.42, 0], [0, .9, 0]);
    const cams = partGroup('camshafts', [0, 1.62, 0], [0, 1.4, 0]);
    const valves = partGroup('valves', [0, 1.35, 0], [0, 1.1, 0]);
    for (const side of bankSides) {
      const head = bank(heads, side); shell(box(head, [.68, .25, 2.83], 0x7f98b2, [0, 1.09, 0]));
      shell(box(head, [.7, .16, 2.87], 0x1c2b3e, [0, 1.31, 0]));
      for (const x of [-.24, .24]) for (const z of [-1.23, -.62, 0, .62, 1.23]) cyl(head, .026, .028, 0xc5d9e5, [x, 1.405, z], [0, 0, 0]);
      const camBank = bank(cams, side), valveBank = bank(valves, side);
      for (const x of [-.18, .18]) {
        const shaft = new T.Group(); shaft.position.set(x, 1.3, 0); camBank.add(shaft); cyl(shaft, .042, 2.68, steel, [0, 0, 0]);
        for (let i = 0; i < 4; i++) for (const dz of [-.095, .095]) { const lobe = cyl(shaft, .078, .055, 0xd5e0e9, [.027, 0, zs[i] + dz]); lobe.rotation.z = i * Math.PI / 2; }
        internals.cams.push(shaft);
      }
      for (let i = 0; i < 4; i++) for (const x of [-.16, .16]) for (const dz of [-.09, .09]) {
        const valve = new T.Group(); valve.position.set(x, 1.105, zs[i] + dz); valveBank.add(valve);
        cyl(valve, .013, .21, 0xe1ebf2, [0, 0, 0], [0, 0, 0]); cyl(valve, .069, .022, 0x879cae, [0, -.105, 0], [0, 0, 0]);
        internals.valves.push({ group: valve, base: 1.105, phase: i * Math.PI / 2 + (x < 0 ? .85 : 2.85) + (side > 0 ? Math.PI : 0) });
      }
    }
    const turboGroup = partGroup('turbos', [0, 2.02, .12], [0, 1.2, .2]);
    for (const side of bankSides) {
      const x = side * .38, y = 2.01;
      torus(turboGroup, .215, .085, 0xa2b9cc, [x, y, -.13]); torus(turboGroup, .2, .083, 0xa38372, [x, y, .16]);
      cyl(turboGroup, .094, .37, 0x6a8193, [x, y, .02]);
      const wheel = new T.Group(); wheel.position.set(x, y, -.225); turboGroup.add(wheel);
      for (let j = 0; j < 9; j++) { const a = j * Math.PI * 2 / 9; box(wheel, [.035, .14, .024], 0xd5ebf6, [Math.sin(a) * .085, Math.cos(a) * .085, 0], [0, .35, -a]); }
      cyl(wheel, .039, .055, 0xc9e5f8, [0, 0, 0]); internals.wheels.push(wheel);
      pipe(turboGroup, [[x + side * .22, y, -.13], [x + side * .29, y + .12, -.22], [x + side * .24, y + .21, -.45]], .064, 0x8da6bb);
      pipe(turboGroup, [[x, y - .19, .16], [x, y - .1, .57], [side * .48, 1.2, 1.72]], .079, 0x9a7f71);
    }
    const exhaust = partGroup('exhaust', [0, 1.5, .25], [.1, .55, .5]);
    for (const side of bankSides) for (let i = 0; i < 4; i++) {
      pipe(exhaust, [[side * .82, 1.35, zs[i]], [side * .54, 1.47, zs[i]], [-side * .16, 1.62 + (i % 2) * .06, zs[i] * .65], [-side * .38, 1.82, .18]], .043, 0xae8268);
    }
    const intake = partGroup('intake', [1.48, 1.37, -.35], [0, .25, -.6]);
    const charge = partGroup('chargecoolers', [-1.34, 1.7, -.95], [0, .7, -.9]);
    for (const side of bankSides) {
      box(intake, [.4, .37, .64], dark, [side * 1.85, .95, -.9]);
      for (let z = -1.16; z <= -.65; z += .085) box(intake, [.41, .015, .022], 0x4b6378, [side * 1.85, 1.14, z]);
      pipe(intake, [[side * 1.85, 1.08, -.55], [side * 1.77, 1.65, -.4], [side * .78, 2.05, -.4], [side * .38, 2.01, -.22]], .081, 0x334e68);
      box(charge, [.43, .28, .82], 0x6b99ad, [side * 1.36, 1.71, -.83]);
      for (let z = -1.18; z < -.45; z += .075) box(charge, [.45, .03, .018], 0xa6d9e7, [side * 1.36, 1.86, z]);
      pipe(intake, [[side * .63, 2.21, -.45], [side * .9, 2.17, -.8], [side * 1.36, 1.75, -1.25]], .068, 0x6099b3);
      pipe(intake, [[side * 1.36, 1.68, -.4], [side * 1.58, 1.53, -.13], [side * 1.58, 1.44, .92]], .087, 0x517a9b);
      for (const z of zs) pipe(intake, [[side * 1.58, 1.44, z], [side * 1.39, 1.36, z], [side * 1.15, 1.35, z]], .055, 0x6e9fbd);
    }
    const fuel = partGroup('fuel', [1.09, 1.61, .1], [0, 1.2, -.15]);
    for (const side of bankSides) {
      cyl(fuel, .029, 2.64, 0xd8bb73, [side * 1.07, 1.69, 0]);
      for (const z of zs) { cyl(fuel, .032, .28, 0xc2b399, [side * 1.01, 1.53, z], [0, 0, -side * Math.PI / 4]); cyl(fuel, .022, .17, 0xbac6ce, [side * 1.16, 1.48, z + .11], [0, 0, -side * Math.PI / 4]); }
    }
    const cooling = partGroup('cooling', [0, .94, -1.9], [0, .15, -1.05]);
    box(cooling, [2.4, 1.05, .17], 0x304f64, [0, .9, -1.94]);
    for (let i = 0; i < 18; i++) box(cooling, [2.3, .016, .185], 0x6995aa, [0, .42 + i * .055, -1.94]);
    for (const side of bankSides) pipe(cooling, [[side * 1.12, 1.2, -1.94], [side * 1.5, 1.1, -1.65], [side * 1.32, .76, -.6], [side * .8, .72, .3]], .044, 0x356f76);
    const oil = partGroup('lubrication', [0, .09, 0], [0, -.7, .1]);
    box(oil, [1.02, .31, 2.5], 0x263c51, [0, .05, 0]); box(oil, [1.15, .055, 2.65], 0x597286, [0, .23, 0]);
    for (let i = 0; i < 8; i++) box(oil, [1.07, .035, .045], 0x45637b, [0, -.115, -1.08 + i * .3]);
    cyl(oil, .11, .28, 0x8d9b9e, [-.62, .25, -1]);
    const timing = partGroup('timing', [0, 1.12, -1.48], [0, .2, -.6]);
    for (const side of bankSides) {
      torus(timing, .13, .027, 0x8ca4bb, [side * 1.17, 1.49, -1.47]);
      const points = [[side * .03, .5, -1.48], [side * 1.25, 1.42, -1.48], [side * 1.17, 1.62, -1.48], [side * 1.0, 1.42, -1.48], [side * .03, .5, -1.48]];
      pipe(timing, points, .018, 0xb3c4cc);
    }
    cyl(timing, .17, .14, 0x687b8c, [0, .5, -1.59]);
    const flywheel = partGroup('flywheel', [0, .5, 1.65], [0, -.05, .75]);
    cyl(flywheel, .39, .1, 0x879bac, [0, .5, 1.65]); torus(flywheel, .38, .018, 0xc3d3e0, [0, .5, 1.71]);
    for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4; cyl(flywheel, .024, .11, 0x3c5569, [Math.sin(a) * .29, .5 + Math.cos(a) * .29, 1.65]); }
    const floor = new T.Mesh(geometry(new T.CircleGeometry(4.2, 64)), material(0x0a1420, { metalness: .1, roughness: .9, transparent: true, opacity: .65 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.29; scene.add(floor);
    const grid = new T.GridHelper(8, 24, 0x31506a, 0x183247); grid.position.y = -.275; grid.material.transparent = true; grid.material.opacity = .28; allocatedMaterials.add(grid.material); allocatedGeometry.add(grid.geometry); scene.add(grid);

    function flowPath(type, points, parent = engine) {
      const curve = new T.CatmullRomCurve3(points.map(point => new T.Vector3(...point))), group = new T.Group(); group.visible = false; parent.add(group);
      const tube = new T.Mesh(geometry(new T.TubeGeometry(curve, 48, .021, 6, false)), material(FLOW[type].color, { metalness: .1, roughness: .5, transparent: true, opacity: .62, depthTest: false })); tube.renderOrder = 10; group.add(tube);
      const dots = [];
      for (let i = 0; i < 7; i++) { const dot = new T.Mesh(geometry(new T.SphereGeometry(.042, 8, 8)), material(FLOW[type].color, { emissive: FLOW[type].color, emissiveIntensity: 1.4, depthTest: false })); dot.renderOrder = 11; group.add(dot); dots.push(dot); }
      flows.push({ type, curve, group, dots });
    }
    for (const side of bankSides) {
      flowPath('intake', [[side * 1.85, 1.1, -.9], [side * 1.75, 1.65, -.4], [side * .38, 2.01, -.22], [side * .74, 2.2, -.55], [side * 1.36, 1.8, -1], [side * 1.58, 1.45, .1], [side * 1.15, 1.35, .5]]);
      flowPath('exhaust', [[side * .85, 1.35, -.9], [side * .5, 1.47, -.6], [-side * .18, 1.68, -.4], [-side * .38, 2.01, .16], [-side * .4, 1.4, 1.6]]);
      flowPath('cooling', [[side * 1.1, .5, -1.94], [side * 1.4, .8, -1.3], [side * .65, .8, .8], [side * 1.1, 1.45, .7], [side * .38, 1.98, .14], [side * 1.36, 1.85, -.9], [side * 1.1, 1.35, -1.94]]);
      flowPath('oil', [[0, .1, -.9], [side * .3, .49, -.5], [side * .12, .51, .7], [side * 1.1, 1.5, .9], [side * .38, 2.01, .02], [side * .7, .7, .9], [0, .1, .9]]);
      flowPath('fuel', [[side * 1.07, 1.69, -1.35], [side * 1.07, 1.69, .9], [side * 1.02, 1.52, .93], [side * .78, 1.15, .93]]);
    }
    const lineMaterial = new T.LineBasicMaterial({ color: 0x91c5ef, transparent: true, opacity: .28, depthTest: false }); allocatedMaterials.add(lineMaterial);
    const connectionGeometry = geometry(new T.BufferGeometry());
    connectionGeometry.setAttribute('position', new T.BufferAttribute(new Float32Array(ENGINE_LAB_PARTS.length * 6), 3));
    connectionGeometry.setDrawRange(0, 0);
    connectionLines = new T.LineSegments(connectionGeometry, lineMaterial); connectionLines.renderOrder = 8; engine.add(connectionLines);
    const raycaster = new T.Raycaster(), pointer = new T.Vector2(); let down = null;
    listen(renderer.domElement, 'pointerdown', event => { down = { x: event.clientX, y: event.clientY, id: event.pointerId }; });
    listen(renderer.domElement, 'pointercancel', () => { down = null; });
    listen(renderer.domElement, 'pointerup', event => {
      const start = down; down = null; if (!start || start.id !== event.pointerId || Math.hypot(start.x - event.clientX, start.y - event.clientY) > 6) return;
      const bounds = viewport.getBoundingClientRect(); pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera); const hits = raycaster.intersectObjects(pickable, false);
      // Prefer internal parts through the transparent casting.
      const hit = hits.find(item => !(state.xray && item.object.userData.shell)) || hits[0]; if (hit) selectPart(hit.object.userData.part, false);
    });
    listen(viewport, 'keydown', event => {
      if (event.target !== viewport || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '0'].includes(event.key)) return;
      event.preventDefault(); cameraGoal = targetGoal = null;
      const offset = camera.position.clone().sub(controls.target), spherical = new T.Spherical().setFromVector3(offset);
      if (event.key === 'ArrowLeft') spherical.theta -= .12; if (event.key === 'ArrowRight') spherical.theta += .12;
      if (event.key === 'ArrowUp') spherical.phi = Math.max(.1, spherical.phi - .12); if (event.key === 'ArrowDown') spherical.phi = Math.min(Math.PI * .85, spherical.phi + .12);
      if (event.key === '+' || event.key === '=') spherical.radius = Math.max(2, spherical.radius * .9); if (event.key === '-') spherical.radius = Math.min(15, spherical.radius * 1.1);
      camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(spherical)); if (event.key === '0') reset(); controls.update();
    });
    function resize() { const width = viewport.clientWidth, height = viewport.clientHeight; if (width && height) { renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); } }
    resizing = new ResizeObserver(resize); resizing.observe(viewport); resize();
    listen(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); contextLost = true; cancelAnimationFrame(frameId); frameId = 0; unavailable('3D CONTEXT LOST'); });
    $('.el-render-status').textContent = 'LIVE 3D'; updateMaterials();
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible && !document.hidden) startFrame(); else { cancelAnimationFrame(frameId); frameId = 0; } }, { rootMargin: '120px' }); visibilityObserver.observe(stage);
    }
    listen(document, 'visibilitychange', () => { if (!document.hidden && visible) startFrame(); else { cancelAnimationFrame(frameId); frameId = 0; } });
    function startFrame() { if (!frameId && !destroyed && !contextLost) { lastTime = performance.now(); frameId = requestAnimationFrame(frame); } }
    function frame(now) {
      frameId = 0; if (destroyed || contextLost || !visible || document.hidden) return;
      // rAF samples its timestamp before callbacks run; it can precede the
      // performance.now() captured while mounting or resuming this viewer.
      const dt = Math.max(0, Math.min((now - lastTime) / 1000, .05)); lastTime = now;
      if (state.running) phase += dt * state.speed * Math.PI * 3;
      flowTime += dt * .24;
      for (const group of Object.values(groups)) group.position.lerp(state.explode ? group.userData.explode : new T.Vector3(), 1 - Math.exp(-dt * 7));
      crankRotator.rotation.z = phase;
      for (let i = 0; i < internals.pistons.length; i++) {
        const piston = internals.pistons[i], a = phase + journalPhases[piston.index], axis = new T.Vector3(piston.side * Math.SQRT1_2, Math.SQRT1_2, 0);
        const journal = new T.Vector3(Math.cos(a) * .12, .5 + Math.sin(a) * .12, zs[piston.index]);
        const origin = new T.Vector3(piston.side * .29, .57, zs[piston.index]), relative = origin.clone().sub(journal), dot = relative.dot(axis);
        const travel = -dot + Math.sqrt(Math.max(.02, .64 ** 2 - (relative.lengthSq() - dot * dot)));
        const end = origin.addScaledVector(axis, travel); piston.group.position.copy(end);
        const rod = internals.rods[i], vector = end.clone().sub(journal); rod.position.copy(journal).addScaledVector(vector, .5); rod.scale.y = vector.length(); rod.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), vector.normalize());
      }
      for (const cam of internals.cams) cam.rotation.z = phase * .5;
      for (const valve of internals.valves) valve.group.position.y = valve.base - Math.max(0, Math.sin(phase * .5 + valve.phase)) ** 8 * .095;
      for (const wheel of internals.wheels) wheel.rotation.z = phase * 5;
      for (const flow of flows) {
        flow.group.visible = flow.type === state.flow;
        if (flow.group.visible) for (let i = 0; i < flow.dots.length; i++) {
          const progress = ((flowTime + i / flow.dots.length) % 1 + 1) % 1;
          flow.dots[i].position.copy(flow.curve.getPoint(progress));
        }
      }
      if (cameraGoal) { const amount = 1 - Math.exp(-dt * 5); camera.position.lerp(cameraGoal, amount); controls.target.lerp(targetGoal, amount); if (camera.position.distanceTo(cameraGoal) < .008) cameraGoal = targetGoal = null; }
      controls.update(); updateConnectionLines(); renderer.render(scene, camera); frameId = requestAnimationFrame(frame);
    }
    startFrame();
  } catch (error) {
    console.warn('Engine lab 3D unavailable:', error.message);
    renderer?.dispose(); renderer?.domElement.remove(); renderer = null;
    unavailable('COMPONENT GUIDE');
  }
  function updateConnectionLines() {
    if (!connectionLines || !groups[state.selected]) return;
    const selected = groups[state.selected], start = selected.position.clone().add(selected.userData.anchor), points = [];
    for (const id of partMap.get(state.selected).connects) { const group = groups[id]; if (group) { points.push(...start.toArray(), ...group.position.clone().add(group.userData.anchor).toArray()); } }
    const positions = connectionLines.geometry.getAttribute('position'); positions.array.set(points); positions.needsUpdate = true;
    connectionLines.geometry.setDrawRange(0, points.length / 3); connectionLines.geometry.computeBoundingSphere();
  }
  filterParts(''); selectPart('turbos', false);
  return {
    ready: !!renderer, parts: ENGINE_LAB_PARTS,
    selectPart, reset,
    destroy() {
      if (destroyed) return; destroyed = true; cancelAnimationFrame(frameId); resizing?.disconnect(); visibilityObserver?.disconnect();
      for (const remove of listeners) remove(); controls?.dispose();
      for (const geom of allocatedGeometry) geom.dispose(); for (const material of allocatedMaterials) material.dispose();
      renderer?.dispose(); root.remove();
    },
  };
}
