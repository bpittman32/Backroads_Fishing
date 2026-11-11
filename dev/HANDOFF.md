# Handoff: rocks + bite behavior (+ the v1.02a release)

Branch `helper-rocks-bite`. `dev/game.html` is the full dev source, the same file published as dev artifact version **1794414665-bbc3**.

## What I changed

1. **Realistic rocks** (creek, river, Big Rock Lake, Highline, Pelican Point)
   - Stone matches the place: rusty sandstone in the creek, silt-coated river rock, pink glacial granite at the lake, broken pale granite and gneiss at Highline, and pitted limestone with barnacles and oysters at the pier.
   - Irregular shapes. Highline and pier rocks are angular and shaded face by face; the others are smooth and rounded.
   - Each stone has its own grain: granite flecks, gneiss bands, sandstone layers, limestone pits, quartz veins and rust stains.
   - A brown algae film coats the tops, thinning with depth. River rocks carry a layer of silt, and creek rocks have fountain moss on the face that meets the current.
   - Algae grows by season: green strands trail downstream off shallow creek rocks in summer, and sea lettuce at the pier rocks with the swell.
   - Rocks take on the water's color and darken with depth (red fades first), turbidity and night.
   - Rippling sunlight moves across the tops of shallow rocks. It fades with depth, rain, fog and muddy water.
   - Rocks are lowered into the bank so they don't hang off slopes. Each one has a contact shadow on the bed.
   - In current: specks drift over each rock and into the eddy behind it, sand settles in its lee, and the surface shows a hump, standing wave and boils. These scale with how deep the rock top is in feet and the surface current. A rock that breaks the surface gets white water and a bubble plume.
   - Small bottom stones and the stones buried in the bed use each place's stone colors.
   - Each rock's body is cached in its own small canvas. The cache is rebuilt only when darkness, season growth or scale changes.
   - Congo rocks (`drawBoulder`) and Amazon stumps are unchanged.
2. **Bite behavior** (bait only)
   - A nibble no longer holds the bait. The bait keeps sinking and the fish follows it down.
   - On the bite, the bait pauses for 0.35–0.8 s (`f.holdT`). Then the fish either swims off with it or sits on it (`f.carry`, 65% swim off).
   - Before the hookset, reeling for more than 0.12 s calls `pullAway(f)`. The fish lets go and the toast reads "Pulled it away". A bold, non-wise fish may come back after 3–6 s.
   - `startFight` clears `f.mouthHold`, so a hooked fish is fully in the fight.
   - Lure strikes on a moving retrieve are unchanged.
3. **v1.02a release prep:** `VERSION` was bumped to `v1.02a`. I added the Dev Notes entries "Real rocks" and "Water plants" (the seaweed chat hadn't written its notes) and rewrote the "Fish on the bait" entry.

## Functions and sections touched in game.html

- **New, inserted before `drawBoulders`:** `ROCKKIND`, `rockKind`, `rockTint`, `rockCol`, `rockSun`, `rockShape`, `rockPath`, `drawRock`, `stoneStyle`, `drawRockWater`.
- **`drawBoulders`:** a new `else if(rockKind()&&rockKind().shape){drawRock(...);continue;}` branch. The seaweed chat later added its watermoss call to this same line.
- **`render`:** `drawRockWater(c,dk,vx0,vx1);` runs just before `drawBeds(...)`.
- **The world build in `resize`:** a loop that lowers each boulder onto the bed, placed just before `holds=cboulders.map(...)`.
- **`drawGround`:** the small-stones loop now uses `stoneStyle`, and the buried-rocks fill uses the place's stone.
- **Fish AI:** the `'nibble'` entry sets `f.mouthHold=false`. The bite entry adds `f.holdT`, `f.carry` and `f.reelT`. The `case 'bite'` branch adds the reel-away check and the hold-or-carry logic.
- **New `pullAway(f)`:** placed just above `missHook`.
- **`startFight`:** clears `f.mouthHold`.
- **Also edited:** the `NOTES` array and `const VERSION`.

## What I started from

- **Rocks:** dev artifact version 1794398688-0aa8. The edits were merged onto 1794400011-7bf5 and published as 1794400163-732d.
- **Bite:** dev artifact version 1794400163-732d, published as 1794401123-7dea.
- **Release:** dev artifact version 1794401302-565e (it already included the seaweed work). I added notes and the version, then published 1794414665-bbc3.
- **Main:** the push went on top of commit `6e5091c` (v1.01a).

## Publishes and pushes I made

- **Dev artifact:** 1794400163-732d (rocks, about 07:29 ET), 1794401123-7dea (bite, about 07:45 ET) and 1794414665-bbc3 (v1.02a notes and version, 11:31 ET).
- **Main:** commit `9cdce18`, "v1.02a", about 11:31 ET.
  - `index.html` was built from dev 1794414665-bbc3 by `dev/tools/strip.py`. It removes `/*DEV*/…/*/DEV*/` and `<!--DEV-->…<!--/DEV-->` blocks, which reproduces how v1.01a was built.
  - The `sw.js` cache name went from `backroads-v40` to `backroads-v41`.
  - I could not check from my session that GitHub Pages is serving v1.02a.

## Unfinished work and known issues

- **Field-guide fish:** this was the other chat's work. Congo species and the flounder still use the old drawings, which the Dev Notes say.
- **Surface effects over rocks** are subtle on purpose, at most a few pixels. They could be turned up if gameplay wants them more visible.
- **Moss on creek rocks:** my fountain moss on the upstream face sits alongside the seaweed chat's `watermoss` sprite on the tops. Both are intentional, but someone could tidy up the overlap.
- **Small stones in bayou and pond:** still shown. A mud bottom in a swamp realistically has none, but I left it alone.
- **`dev/check.py`** (in the artifact) is stale: it fails at the stats opt-in dialog, and that was already true before my changes.
- **`dev/tools/`:** these are my test and screenshot scripts, written for my session's paths. The rock code itself lives only in `game.html`.
