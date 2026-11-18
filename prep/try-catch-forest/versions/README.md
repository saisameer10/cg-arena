# Versions

Each file is a complete bot (class `Player`); to play one, send the file as it is (`tools/run.sh versions/v8.java Java ...`).

| File | State | What it is |
|---|---|---|
| `v1.java` | played 80 Bronze games in the arena | first bot written from the statement |
| `v5.java` | **live in the arena** (Bronze -> Silver); same as `../Player.java` | v1 + referee slide rule, five-turn chase, wider nets, unseen-ground penalty, rescue nets |
| `v6.java` | candidate, not submitted | v5 + dash budget, smoke past the hunter, no stacking, ways-out count, unseen predators keep moving, time guard |
| `v7.java` | candidate, not submitted | v6 + early approach dash, lighter unseen-ground penalty for hunters |
| `v8.java` | candidate, not submitted | v7 + search map instead of the ring patrol |

`../Player.java` is always the version that is live in the arena. A candidate replaces it only after a fair test
(paired seeds or replays of arena battles, both catches and losses) shows it is better; `kb/log.md` has the numbers.
