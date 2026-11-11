# Helper handoff: realistic aquatic plants (branch `helper-plants`)

The source files on this branch came from a helper conversation. Another conversation owns `main` and the dev artifact. Nothing here has been merged.

## Files
- `dev/game.html`: the full dev source exactly as I published it to the dev artifact (version `1794401302-565e`). It's the dev build, not the public build.
- `dev/helpers/plants.js`: the plant painting library. It is the same code as the first `<script>` block in `dev/game.html`.
- `dev/helpers/plants_game.js`: the game-side plant code (which plants grow where, sprite drawing). It is the same code as the copy inside the main script of `dev/game.html`.
- `dev/helpers/bass2-reference.js`: the standalone Largemouth Bass prototype that was handed to the other conversation earlier. Reference only; it isn't wired into anything on this branch.

## What I started from
- I first read dev artifact version **`1794400163-732d`** and built the plant changes on it.
- Before publishing, the dev artifact had moved to **`1794401123-7dea`**: the other conversation's fish-behavior change (`pullAway()`, "bait-taking on the fall"). I re-applied my changes on top of `1794401123-7dea` as a clean line-based patch with no conflicts, then published.
- I never worked from a GitHub commit. For reference, `main` was at `9cdce18` (v1.02a, 11:31) when this branch was created.

## What I published or pushed
- **Dev artifact:** one publish only, version **`1794401302-565e`** (2026-11-11 12:48 UTC, 07:48 ET), labelled "Realistic aquatic plants for every area", applied over `1794401123-7dea`.
- **Earlier failed attempt:** before that, one attempt to publish a small notice fix (described under "Unfinished" below) was rejected because network access was off. Nothing from it reached the dev artifact.
- **GitHub `main`:** I never pushed to main and made no other GitHub writes. The only push is this branch.

## Features (what changed in the game)
1. **Real plants per area** replace the generic ribbon/coontail/pondweed weeds. Weed positions and heights still come from the existing world layout.
   - Pond: tape grass, coontail, milfoil, elodea, large-leaf pondweed, muskgrass patches.
   - Creek: water crowfoot streaming downstream; flowers only on stems that reach the surface; height capped so it stays in the shallow runs.
   - Lake: tape grass, large-leaf pondweed and muskgrass on the shelf; milfoil and coontail in `deepWeeds`.
   - Bayou: hydrilla, fanwort, coontail.
   - River: sparse sago pondweed and tape grass (keeps about 40% of weeds).
   - Alpine: quillwort and muskgrass.
   - Amazon: scattered red fanwort (keeps about 50%).
   - Pier: turtle grass, shoal grass, manatee grass (no freshwater weeds).
   - Congo: no rooted weeds; riverweed on the rocks instead.
2. **Lily pads:** realistic white water lilies with red-brown stalks to the bottom (when the water is under 140 deep). In the Amazon they become Victoria lilies, 2.4× size, with stalks that fade out with depth.
3. **Floating plants:**
   - Bayou: hyacinth and water lettuce in place of the old pads, plus patchy duckweed drawn from the existing `duck` array.
   - Amazon: floating meadows of water lettuce and hyacinth.
   - Congo: hyacinth rafts.
   - Pier: sargassum clumps.
4. **Rocks and pilings:**
   - Water moss trailing downstream on submerged creek boulders.
   - Riverweed crust on Congo boulders.
   - The pier pilings' old barnacle, oyster and green bands are replaced by `PLANTS.fouling()`: barnacles at the tide line, sea lettuce and algae fringe, small oysters.
5. **Shore plants** (far-bank reeds drawn from sprites): cattail at the pond, bulrush at the lake, water willow at the river, papyrus at the Congo (papyrus clumps are new; Congo had no reeds). The bayou, Amazon and other areas keep the old reed drawing.
6. **Performance:**
   - Each plant is painted once into a sprite at screen resolution (height rounded to steps of 4, 5 seed variants per kind), then drawn bent in horizontal bands for sway.
   - Night and off-season tints are blended into cached copies (8 darkness steps × 6 browning steps), so every plant draws in one pass.
   - Measured in headless Chrome, frame time matched the original build day and night. Building the plants takes under 100 ms per area load.

## Functions and sections touched in `dev/game.html`
- **New `<script>` block before the main script:** the PLANTS library (`window.PLANTS = {P, sprite, drawBent, lilyPad, victoria, fouling, riverweedOnRock}`).
- **New code just before `drawPads()`:**
  - lookup tables: `PLANTSET`, `SHOREKIND`, the `floats` array
  - setup functions: `plantRng()`, `assignPlants()`
  - drawing helpers: `plantSprite()`, `plantTinted()`, `drawPlant()`, `drawFloaters()`
- **World setup:** one line added after `if(Lc.congo)buildCongoRocks();else congoRocks=[];` calls `assignPlants()`. It reassigns `weeds` (filter + kind/height/seed per weed), builds `floats` and adds Congo papyrus to `reeds`.
- **Render loop:** the body of `drawWeed` was replaced with a sprite draw through `drawPlant()`. `isFront` and the front/back split are unchanged.
- **`drawPads()`:** rewritten. It calls `drawFloaters()` first, draws Victoria lilies in the Amazon and lily stalks + `PLANTS.lilyPad()` elsewhere, and returns early for the bayou.
- **`drawReeds()`:** an early branch for areas in `SHOREKIND`. Otherwise the original code is unchanged.
- **`drawPierPilings()`:** the barnacle/oyster/green-band loops were replaced with one `PLANTS.fouling()` call.
- **`drawBoulders()`:**
  - creek: water moss after `drawRock()` for submerged rocks
  - Congo: `PLANTS.riverweedOnRock()` before the waterline highlight
- **Unchanged:** `drawHyacinth()` is now unused (the bayou goes through `drawFloaters()`) but still in the file. No version number or Dev Notes changes.

## Unfinished or known issues
- **Not tested on a real phone,** only headless Chrome at 430×860 @2x, midday and night, all nine areas. Off-season browning is coded but wasn't visually checked.
- **The creek moss and crowfoot rely on a sprite flip** to trail downstream (left). If a creek or another current area flows the other way, set or clear `flip` in `PLANTSET`.
- **Lily stalks are skipped where the water is ≥140 deep.** On creek and lake, pads keep the new lily look; I didn't decide whether pads belong in the trout creek at all.
- **The old `drawHyacinth()` is dead code** and could be removed.
- **The one-time-notice fix was never applied.** It makes notices like "Moth Flies refunded" stay up until tapped (`notice()` beside `toast()`). It was sent to the user as a file earlier and is not on this branch.
- **The bass prototype** (`bass2-reference.js`) was handed over earlier; the other conversation owns the fish work.
- **Version:** still v1.01a in the dev source; no Dev Notes entry was added.
