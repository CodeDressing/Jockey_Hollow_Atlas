# Mushroom Tower Defense — First Playable

## 01 — The run

Defend the grow room exit against 15 waves on a single fixed route. During each build phase, place or upgrade towers on marked pads, inspect the upcoming wave, and press **Start Wave**. Towers fire automatically. The build phase resumes after each wave resolves. The game runs independently of the Atlas and uses fictional combat stats and original art.

- Start with **20 integrity** and **$130**. Integrity never regenerates.
- Earn **$4 for each enemy killed**, including bacteria and contaminants, and **$25 per wave survived**. Leaks earn no kill reward. A survivable wave earns its clear reward whether enemies were killed or leaked.
- A leak deducts the enemy's listed integrity cost once and removes that enemy. At zero integrity, cancel all remaining spawns, stop combat, and show **Defeat** with the round reached. Restart resets the entire run. There is no selling, placement during waves, or paid progression in the first playable.
- Clear round 15 with at least 1 integrity to win. A fatal leak on the final tick takes priority over a win.
- Show integrity, cash, round, upcoming enemy counts, selected tower stats, and the reason an action is unavailable. On touch, tap a pad to see build or upgrade choices. On desktop, give pads and choices keyboard focus. Use shapes and labels as well as color to identify threats.

## 02 — Map and timing

**Grow Room A** uses a 12 × 8 logical grid. Coordinates are zero-based `(column, row)`, with cell centers used for distance calculations. The path follows `(0,2) → (4,2) → (4,5) → (8,5) → (8,2) → (11,2)`. Place towers only on pads at `(2,1)`, `(3,3)`, `(5,2)`, `(3,5)`, `(5,4)`, `(6,6)`, `(8,6)`, `(9,4)`, `(7,2)`, and `(10,1)`.

Move enemies along the path with a fixed simulation step. Send one group at a time in the table's listed order. Each group has its own spawn interval. Begin the next group 1.2 seconds after the last spawn of the preceding group, so groups may overlap along the path. The first group begins 1 second after **Start Wave**. Pause suspends all simulation timers. Use route progress to break targeting ties consistently, then spawn order.

## 03 — Enemies

| Code | Enemy | HP | Speed in cells/s | Spawn interval | Leak cost | Behavior |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| S | Fast spore | 14 | 2.4 | 0.55 s | 1 | Quick and fragile. Place rapid-fire coverage near the route entrance or exit. |
| F | Fungal cluster | 85 | 0.75 | 1.25 s | 3 | Reduces projectile damage by 40%. Piercing lasers or cannons deal full damage. |
| M | Mold swarm | 10 | 1.55 | 0.22 s | 1 | Tight packs favor splash damage and coverage at bends. |
| B1 | Bacterial bloom | 24 | 1.65 | 0.35 s | 2 | A dense contamination pack first introduced in round 5. A splash cannon can hit several at once. |
| B2 | Shielded colony | 66 | 1.05 | 0.80 s | 3 | First introduced in round 10. Reduces splash damage by half. Add laser coverage or split fire with projectiles. |
| B3 | Contamination carrier | 135 | 1.00 | 1.70 s | 5 | First introduced in round 15. Carries a barrier that absorbs the first 28 damage of any kind before HP is lost. Use sustained fire. |

Apply damage reduction before barrier absorption. Clamp integrity at zero and award cash only when an enemy's HP reaches zero before it crosses the exit. Enemies spawn with their base stats. Later waves increase pressure through counts and enemy mixtures.

## 04 — Towers and upgrades

Ranges and splash radii are in grid cells. Upgrade costs are incremental. Each tower has one Tier 2 and one Tier 3 upgrade and occupies one pad.

| Tower | Base cost and stats | Targeting and role | Tier 2 | Tier 3 |
| --- | --- | --- | --- | --- |
| Spore Dart | $45. 7 damage every 0.30 s. Range 2.3. | Fires a visible single-target projectile at the enemy farthest along the route within range. Good against fast spores and stragglers. | $40. 10 damage and range 2.5. | $65. 13 damage every 0.24 s and range 2.7. |
| Hypha Laser | $75. 20 damage every 0.75 s. Range 3.2. | Beams toward the farthest-progress enemy in range. Deals full damage to up to 3 enemies whose centers are within 0.30 cells of the beam, ordered by distance from the tower. Ends at max range. | $55. 28 damage and up to 4 targets. | $85. 38 damage every 0.65 s, range 3.5, up to 5 targets. |
| Agar Cannon | $70. 20 damage every 1.40 s. Range 2.6. Splash radius 0.8. | Fires at the farthest-progress enemy in range, applying full splash damage to each enemy within the radius of the target's position. Place at bends against swarms and blooms. | $55. 28 damage and splash radius 1.0. | $85. 36 damage every 1.15 s and splash radius 1.2. |

Damage commits on the shot tick. Animate tracers, beams, and impacts for feedback. A tower fires only when at least one target is in range and its cooldown is ready. An unfired tower remains ready until a target enters range.

## 05 — Wave table

Groups are ordered left to right. The leak column lists the integrity deduction for each unit in group order. Each fifth wave introduces a new contamination tier and changes which coverage is valuable.

| Round | Ordered groups | Total | Threat and intended response | Leak cost per unit |
| ---: | --- | ---: | --- | --- |
| 1 | 8 S | 8 | Learn fast-spore targeting. | S 1 |
| 2 | 12 S | 12 | Extend coverage so fast spores have fewer gaps. | S 1 |
| 3 | 6 S, 4 F | 10 | Clusters introduce projectile resistance. | S 1, F 3 |
| 4 | 16 M, 3 F | 19 | A packed swarm rewards area damage at a bend. | M 1, F 3 |
| 5 | 6 S, 12 B1 | 18 | First bacterial bloom. Prepare splash coverage. | S 1, B1 2 |
| 6 | 12 M, 6 F | 18 | Split coverage between packed and armored enemies. | M 1, F 3 |
| 7 | 15 S, 10 B1 | 25 | Keep fast coverage downstream of the splash zone. | S 1, B1 2 |
| 8 | 20 M, 7 F | 27 | Raise damage at the main bend. | M 1, F 3 |
| 9 | 12 S, 14 M, 5 F | 31 | Pressure arrives in three distinct groups. | S 1, M 1, F 3 |
| 10 | 12 M, 6 B2 | 18 | Shielded bacterial colonies debut. Lasers or projectiles handle survivors after splash clears the swarm. | M 1, B2 3 |
| 11 | 15 B1, 7 F | 22 | Splash clears blooms while lasers wear down clusters. | B1 2, F 3 |
| 12 | 18 S, 8 B2 | 26 | Overlap a fast cleanup tower with anti-shield coverage. | S 1, B2 3 |
| 13 | 24 M, 10 F, 6 B2 | 40 | Mixed resistance rewards all three tower classes. | M 1, F 3, B2 3 |
| 14 | 22 S, 17 B1, 8 B2 | 47 | Combine early crowd control with exit insurance. | S 1, B1 2, B2 3 |
| 15 | 28 M, 8 B2, 4 B3 | 40 | Contamination carriers debut. Use sustained damage to remove barriers and protect exit coverage. | M 1, B2 3, B3 5 |

## 06 — Build and acceptance

Build a standalone browser game with a deterministic simulation, map renderer, pad controls, build menu, wave preview, and results screen. Keep map, wave, enemy, and tower parameters as data so balance changes can be tested without rewriting combat logic. The first playable uses a single map and run length.

1. Spawn counts, intervals, route progress, and group order match the data. Rounds 5, 10, and 15 each introduce their assigned contamination tier exactly once. Pausing freezes movement, firing, and spawns.
2. A build or upgrade deducts its exact cost once. Off-pad placements, occupied-pad builds, out-of-phase actions, and unaffordable purchases leave state intact.
3. Verify the dart's single target, laser alignment and target cap, cannon radius, resistance multipliers, and carrier barrier with fixed positions. Changing towers or wave speed does not change damage per simulation tick.
4. Leak each enemy class once in an isolated fixture. Verify loss of 1, 3, 1, 2, 3, and 5 integrity for S, F, M, B1, B2, and B3 respectively, without credit or repeated penalties.
5. Verify a no-build run is defeated during round 2, with all integrity exhausted on that round's 12th leak. Verify final-wave defeat takes priority over winning, and replay clears state.
6. Record at least one deterministic winning placement-and-upgrade sequence with the starting budget. Replay it successfully on both desktop and phone before calling the build balanced. The listed values are initial balance targets for that playtest.
