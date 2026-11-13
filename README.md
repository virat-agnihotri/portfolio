# The Little Quarter

GitHub source: https://github.com/virat-agnihotri/portfolio

After cloning, run `npm ci`, `npm test`, and `npm run build`. The build generates `dist/app.js`; deploy the complete `dist` directory. `npm run dev` starts the local preview only when requested. This project keeps its authored HTML, CSS, résumé, and runtime assets inside `dist`, so those files are tracked; only the generated JavaScript bundle is ignored.

Dependencies, secrets, analysis files, previews, Blender backups, and duplicate original GLBs are excluded by `.gitignore`. The runtime model copies are tracked under `dist/assets/models`. Model checks use `model-assets.json`, so tests do not depend on the original local upload folder.

An explorable first-person portfolio neighborhood, modeled in Blender and rendered with Three.js. Includes six main storefronts, a café terrace, fountain square, four enterable interiors, room navigation, clickable gallery exhibits, an accessible HTML pocket map, movement boundaries, mobile buttons, discovery stamps, and opt-in ambient sound.

## Run

```sh
npm install
npm run build
npm run dev
```

Open http://127.0.0.1:5174.

- WASD / arrow keys: walk. Scroll also moves forward or backward.
- Drag the scene: look around.
- E: enter a nearby portfolio building.
- M: open the map. The map can enter any room directly.
- Escape: close a dialog, or return to the street from a room.
- The Gallery's framed art opens example project details.

## Blender source

`blender/little-quarter.blend` is the editable neighborhood source, including the four interiors. The website loads `dist/assets/neighborhood.glb` exported from this source.

Rebuild both with:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.3/blender.exe' --background --python blender/build_neighborhood.py
```

The export script is reproducible and uses only built-in Blender geometry. No downloaded third-party models or textures are required. Running the script recreates the scene; save manual artwork changes as a separate version before rerunning it.

## Personalize

Edit `projects` and `openRoomDetails` in `src.js` to add real work, biography, résumé, email, and social links. Current project descriptions are explicitly illustrative. No contact form submits anywhere. Rebuild after source edits.

UI files are in `dist/index.html` and `dist/style.css`; the build bundles JavaScript only. Font downloads are optional: system fallbacks are provided. All 3D assets and code are served locally. A WebGL/model-loading fallback keeps the portfolio content accessible from the map.

## Visual direction

Warm plaster and terracotta, sage shopfronts, a blue-to-peach sky, and fine ink edges. The townhouse and bookshop use pitched roofs; the Workshop has a clerestory, and the Post Office has a civic clock. Blender contains the architectural detailing, tree branches and rounded canopies, and lantern housings. `environment.js` generates the local cobblestone, plaster, stone, and wood textures and adds sunlight, cached static shadows, drifting clouds, gentle canopy movement, leaves, and fountain spray. Reduced-motion preferences disable continuous decorative motion. No extra texture downloads are needed.

## Deployment

Run `npm run build`, then deploy the `dist` folder to any static host. This version was prepared for local use; it has not been published. The model is loaded as one local GLB. Detailed physics and custom character animation are not part of this version.

## Animated entrances

Choosing any portfolio building starts a camera approach, a hinged door opening, and a move through the doorway. A brief fade connects the street vestibule to its separate interior. This works from the map, street labels, and the nearby E prompt. Movement and repeat entry requests are blocked until the sequence finishes. Reduced-motion preferences retain a short transition without the camera journey. Returning to the street places the visitor facing the entrance.

`entrances.js` separates the exported door panel, glass, and handle into a hinged group and replaces the four solid building blocks with shells containing real doorway openings. Test the exported assemblies and sequence timing with `node entrances.test.mjs`.

## Shop discovery and town backdrop

Walking past a portfolio storefront gently turns the view toward its door, including from the center of the road. Movement continues along the original heading. The view also holds toward a nearby shop when you stop; manually dragging overrides the automatic turn for three seconds. Reduced-motion preferences disable automatic turning. A compact caption at the edge replaces the large floating shop cards.

Hover over an actual door to highlight its outline and surface; click it to start the entrance sequence. The E shortcut and map remain available for keyboard and touch navigation. `town.js` supplies 78 instanced background homes with increasing fog toward the outer rows, without adding downloaded model files.

## Offline checks

`npm run check`, `npm test`, and `npm run build` run without starting the frontend server. Tests cover the real exported door assemblies, road-center door ray targets, independent hover materials and reset, camera turns, entrance stages, movement smoothing across frame rates, and background instance transforms.

Walking accelerates and settles smoothly, dialogs clear movement, and returning from map-selected rooms restores the correct doorstep. Manual dragging preserves the current viewing direction. Background houses include windows on all sides, doors, chimneys, side lanes, and low garden walls. Browser visual QA is still required after the next authorized server start.

## Finished interiors

The rooms are enclosed with ceilings and entrance walls. Each has a return door that highlights on hover and can be clicked to go back to the street. Ceilings include cornices, beams, and pendants; interiors have skirting and wall paneling. The Gallery has a viewing bench, the Explorer a reading corner, the Workshop a pinboard and worktable, and the Post Office a writing desk and sorting cubbies.

`blender/finish_interiors.py` adds these finishes to the existing editable scene and re-exports the GLB. Run it after `blender/build_neighborhood.py` when rebuilding from scratch. It replaces its own collection on subsequent runs without duplicating the finishes. The Blender source also contains area lights for offline rendering; `interiors.js` supplies the active-room lights and interactive return doors in the website.

`node interiors.test.mjs` checks all four room envelopes, ceilings, return-door hit targets, hover reset, and lighting activation without starting a web server. `blender/render_interior.py` creates an offline look-back preview.

## Gallery exhibit layout

The runtime Gallery has two side-wall displays on each side and one center display: Lunar Vision and Tone Analyser on the left; Knowledge Vault AI and DocIntel AI on the right; Rocket Mission Simulator centered on the far wall. Each has a layered frame projecting from the wall, a bold DM Sans poster, a numbered plinth, and a reserved model space. The previous sample pedestals, sculptures, back-wall picture lights, and central bench are omitted when loading the Blender base.

`gallery-layout.js` controls placement and optional GLB paths. The supplied rocket, Moon, satellite, Red Bull car, Mercedes car, bookshelf, and brain hologram are now connected through `galleryModels`. Models are fitted to their display bounds without changing proportions. The cars are placed side by side; the satellite orbits the Moon unless reduced motion is preferred.

`gallery.js` owns these runtime exhibits; changing the layout does not require re-exporting the architectural Blender base. `node gallery.test.mjs` checks the two-left/two-right/center arrangement, project association, frame orientation, plinth placement, and clear central aisle. Visual browser review remains deferred while the frontend server is stopped.

## Supplied gallery models

The original files remain unchanged. Browser copies live in `dist/assets/models/`:

- Rocket platform: `rocket.glb` (from the project root).
- Lunar Vision: `moon.glb` plus `satellite.glb`; the satellite orbits the Moon.
- Tone Analyser: `redbull.glb` and `mercedes.glb`, positioned side by side with matched display dimensions.
- Knowledge Vault AI: `bookshelf.glb`.
- DocIntel AI: `brain-hologram.glb`, including its embedded animation when reduced motion is off.

`exhibit-models.js` fits and centers models, loads at most two concurrently, and defers requests until the visitor approaches the Gallery displays. Returning to a display reuses its loaded models. The rocket uses Draco compression; decoder files are bundled locally in `dist/assets/draco/`, with no CDN dependency. All supplied model textures are embedded in the GLBs. A driver model was not supplied and is not added.

Model geometry, asset copies, decoder availability, and normalization are checked offline by `node exhibit-models.test.mjs`. Browser rendering and visual inspection remain pending until the user authorizes running the frontend server.

## Evening Gallery and model inspection

The Gallery has a dimmer ambient setting, charcoal/sage wall overlays, a darker wood floor, brass floor inlays, ceiling tracks, and subtle frame illumination. Four unshadowed spotlights illuminate the nearest two posters and model stands, keeping the dynamic-light budget bounded. Other interiors retain pendant lighting at a reduced level. These presentation finishes live in `gallery-room.js`; the Blender architectural source stays editable separately.

Click a model or its plinth to inspect it. Drag horizontally to rotate the exhibit; vertical dragging changes the viewing elevation. Scroll or use the +/- controls to zoom. Reset restores its initial orientation and framing. Pause motion freezes the satellite orbit and embedded hologram animation. Escape or Close returns smoothly to the walking view. Clicking a poster still opens the project's details. Keyboard-accessible rotation, zoom, reset, and pause buttons are included.

`galleryScreenshots` in `gallery-layout.js` reserves one local screenshot path per project. No screenshot files have been supplied yet; current project-specific artwork remains. When actual screenshots are provided, their paths can be assigned without replacing the frames, labels, or model layout.

`node model-inspector.test.mjs` covers camera focus, view direction, rotation, zoom bounds, reset, return, ceiling clearance, and active lighting limits. The frontend server is not needed for these checks; a browser visual review remains pending.

## Direct entry, minimal HUD, and cached Gallery lifecycle

The intro screen is removed. Once the neighborhood model loads, exploration starts immediately. The main HUD shows only compact navigation and location controls; movement instructions are available from the ? button, and visited rooms are indicated inside the map.

Entering the Gallery queues all seven model assets with at most two requests in progress. Leaving hides the entire exhibit group and stops its satellite/embedded-animation updates. Loaded objects remain in an in-memory session cache; returning reuses them without another request. Already-started downloads can finish into that cache after exit, while queued requests wait for re-entry. This is session reuse, not a promise of permanent caching across browser reloads.

`room-decor.js` adds room-specific fitted finishes, warm plank floors, diffused window panels, softer seating, and reading/writing areas. Dynamic decor is visible only in the active room. The architectural Blender shell remains intact underneath these presentation layers.

`node gallery-lifecycle.test.mjs` verifies entry-only loading, bounded concurrency, all-model queueing, animation pause on exit, cache reuse, and active-room-only decor. Browser visual QA is deferred until a deployed URL or an authorized local preview is available.
## House order, mobile controls, and guided exhibits

Street houses are numbered Projects, Skills, About, and Contact. Internal Blender IDs remain unchanged; `src.js` maps the second physical house to skills and the third to biography. `wayfinding.js` replaces the old facade/interior wording. The decorative café is set back from the road so the Projects House is the first main-street entrance.

Door geometry now clears the 25cm step through its full swing and fits beneath the lintel. Mobile movement controls remain available indoors, with separate space for the room journal and exhibit actions. Pointer cancellation and lost capture release held movement.

The Gallery shows explicit Inspect model / Read project buttons for the closest stand, with loading feedback. Journal selections guide the camera to a viewing spot in front of the selected project. `gallery-navigation.js` routes around the five plinths using a small visibility graph; reduced-motion visitors move directly to the destination. Posters still open project notes, while models and plinths open inspection.

The About journal includes supplied hackathon names and editable draft thoughts/aims in `content.js`. Contact links include Instagram and X. The validated contact form opens an email draft with encoded subject and body; it does not send mail from the server or claim a message has been delivered.

Offline checks cover door clearance, exhibit routes from corners and other displays, view direction, reduced motion, content links, and the existing room/model lifecycle. Browser visual review remains pending; the local frontend server was not started.
