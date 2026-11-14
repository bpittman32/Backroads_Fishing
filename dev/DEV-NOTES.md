# Dev notes for the game chat

Running list of notes from the owner's assistant chat. Nothing here changes code; the game chat decides what to act on.
To mark a note handled, say so in the game chat; the assistant chat moves it to Handled.

## Open

### 2026-11-14 — Fish landing at exactly the species maximum size
- In the database on Nov 13, 11 personal bests came in at exactly `species_limits.max_cm`: Mike 5 (smallmouth 55, rock bass 28, walleye 70, perch 36, crappie 38), Jason 3 (redfish 95, mackerel 70, hardhead 45), Ben (peacock 70), Mom (spotted gar 88), Alex (chub 25).
- `makeFish` rolls `len = len[0] + (len[1]-len[0]) * random^(1.5-0.9z)`, so an exact max should be about 1 in several hundred catches of a species. 11 in one day across 676 fish suggests a size bonus that is clamped to `len[1]` (or rounding up) somewhere after the roll.
- Effect: the leaderboard fills with tied records at the cap.
- Check: anything that changes `f.len` after `makeFish` (school followers use `clamp(ld.len*rand(.85,1.15), ...)`; trophy/quest code, perks, weather or luck bonuses).

## Handled
(none yet)
