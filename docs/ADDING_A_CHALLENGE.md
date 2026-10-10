# Adding a new challenge

This is the hand-off format for a new game. If a challenge is written up this way, it can be turned into a playable game (referee + bosses + viewer + starters) without guessing at rules. Fill in [`challenges/TEMPLATE.md`](../challenges/TEMPLATE.md) and save it as `challenges/<game-id>.md`.

## What to give, in order of usefulness

1. **The statement text, copied as text.** On CodinGame, open the puzzle in the IDE, scroll the left panel, select all of the statement and paste it into the template. Plain text or Markdown is best. Keep every table and every "Game Protocol" section word for word; that is where the exact input/output format lives.
2. **The protocol tables**: initialization input, per-turn input, per-turn output, time limits, max turns. These must be exact. A bot written against this arena should run unchanged on CodinGame, which only works if the lines match character for character.
3. **League rules.** CodinGame unlocks rules by league (Wood 2 → Wood 1 → Bronze → …). Say which league's rules you want. If you paste the full statement, every unlocked rule is in it already; state which ones should be active.
4. **The starter code** from the IDE in at least one language. It encodes the read order of the inputs and resolves ambiguities in the text.
5. **Link to the official referee if it is public.** Many CodinGame referees are on GitHub (Ocean of Code is `CodinGameCommunity/ocean-of-code`; official contests are under the `CodinGame` organisation, e.g. `CodinGame/SpringChallenge2020` is Pac-Man; the statement's "Expert Rules" section often links it; otherwise search "codingame <puzzle name> referee"). With the source, damage formulas, map generation and tie-breaks can be copied exactly instead of inferred.
6. **Map / test case examples** (optional): a few maps or seeds in the format the statement uses.

A PDF or screenshots work as a fallback, but they lose tables and code formatting and need manual transcription. If text copy is impossible, take screenshots of the *Game Protocol* and *Rules* sections at readable size, one section per image, and still fill in the protocol tables of the template by hand.

What is **not** needed: the CodinGame viewer, assets, sounds, or the Java SDK project. The arena has its own canvas viewer; a short description of what should be drawn is enough.

## Boss levels

Say what each boss should be able to do. A useful ladder:

| Level | Expectation |
|---|---|
| wood | Plays legally, never crashes, no strategy. Beating it proves your I/O works. |
| bronze | One clear idea (flood fill, tracking, greedy scoring). |
| silver | Uses every rule of the game at least naively. |
| gold+ | Search-based (minimax / MCTS / beam). Optional. |

If you have a bot of your own that you want to use as a boss, drop its source in `games/<id>/bosses/` and list it in `game.json`.

## What gets built from the challenge file

```
games/<id>/
  game.json        name, boss list, starter files, optional leagues: [{ id, name, default }]
  referee.js       rules: inputs, legal actions, scoring, frames  (extends games/base.js; see README "Adding a game" for the method list)
  statement.md     shown in the IDE's left panel
  viewer.js        canvas renderer for one frame
  starters/        bot.py, bot.js, Player.java, bot.cpp
  bosses/          boss.js (levels by argument) or .py; bots in other languages become opponents through the arena pool
```

The referee receives `league` (an id from `game.json`) in its constructor and gates rules on it; the UI shows a league dropdown when `leagues` is present and defaults to the entry marked `default`.

Restart the server and the game appears in the dropdown. The CLI picks it up too:

```
node cli.js <id> my_bot.java boss:bronze --games 10
```

## Checklist before calling a game done

- [ ] Starter code in every language runs against boss wood without a timeout or an invalid order.
- [ ] Every rule in the statement is enforced by the referee, or the statement says it is not.
- [ ] An illegal order produces a message that names the order and why it is illegal.
- [ ] `node cli.js <id> boss:silver boss:bronze --games 10` finishes with no disqualification.
- [ ] The viewer shows enough to debug: positions, trails, last orders, health or score, explosions/events.
