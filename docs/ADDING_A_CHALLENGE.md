# Adding a new challenge

Open Claude Code in this folder and hand over the challenge in any of these forms. Claude follows `.claude/skills/add-challenge/SKILL.md` and reports what it built and how it validated it.

## What to give

| You give | What happens | Quality |
|---|---|---|
| **CodinGame link** (best) | `node cli.js fetch <url>` downloads the original statement from CodinGame's public puzzle service (no login) and its type, so the challenge is classified automatically. Claude then looks for the official referee source. | Exact statement; exact rules when the referee is public |
| **PDF** of the statement | Claude reads the PDF, text and diagrams (checked: diagrams such as The Bridge's UP/DOWN zone are readable). Keep it in `challenges/raw/<id>/`. | As good as the PDF |
| **Screenshots / photos** | Claude reads the images. One section per image at readable size works best; protocol tables must be legible. | Good; numbers are double-checked |
| **Video** | Frames are extracted with ffmpeg and read. ffmpeg is not installed on this PC yet (`winget install Gyan.FFmpeg`). Without it, send screenshots instead. | For context and strategy, not for exact rules |
| **Pasted text** | Used as is. | As good as the paste |
| **Replay links / screenshots of games** | For coaching rather than for building: see `.claude/skills/coach-bot/SKILL.md`. | |

Also useful, when you have them: the starter code from the IDE (it pins the input order), which league you are in (rules unlock by league), and a link to the official referee if the statement's "Expert Rules" names one.

## The generic pipeline

```bash
node cli.js new <link>          # statement + scaffold for its kind (offline: node cli.js new <id> --kind io|solo|multi)
node cli.js make-tests <id>     # solo/io: tests from generator.js + the reference solution
node cli.js validate <id>       # the same end-to-end battery for every challenge
```

Only the puzzle's own rules (referee), bosses or reference solution and generator are written per puzzle; scaffolding, test generation, validation, the review of disqualifications and timing, patterns, the arena and versions are generic.

## What gets built

```
games/<id>/
  game.json        name, url, kind, starters, bosses / tests, leagues
  referee.js       rules, frames and review()          (multi and solo; io uses games/io-referee.js)
  statement.md     rules summary in our own words + the exact protocol
  viewer.js        canvas renderer for one frame       (io uses games/io-viewer.js)
  starters/        bot.py, bot.js, Player.java, bot.cpp
  bosses/          multi: boss.js with wood / bronze / silver levels
  tests/           solo: NN-name.json levels; io: NN-name.in + .out
  generator.js     solo: random levels, always solvable
challenges/<id>.md     sources, rule decisions, differences from CodinGame
challenges/raw/<id>.*  the original statement (local only, not committed)
```

## Limits to know

- **Bosses** are written for this arena; CodinGame's boss code is not public. Beating our silver boss is a strong signal, not a CodinGame promotion.
- **Test maps** of solo and classic puzzles are our own (CodinGame's validators are hidden anyway). Every level is checked to be solvable.
- **Rules** are exact when CodinGame published the referee (it is ported, as for Ocean of Code). Otherwise they are implemented from the statement and every ambiguity is written down in `challenges/<id>.md`.

## Checklist before a challenge is called done

- [ ] Starters in every installed language run a full game or test without errors.
- [ ] Every rule in the statement is enforced, or `challenges/<id>.md` says why not.
- [ ] An illegal action produces CodinGame's message, naming the action and the reason.
- [ ] Multi: `node cli.js <id> boss:silver boss:bronze --games 10` and bronze vs wood show a clear ladder with no disqualification.
- [ ] Solo: a reference solution passes every test and 20 random levels.
- [ ] `review()` names the mistake of a deliberately bad bot, at the right turn.
- [ ] The viewer shows positions, the last action, health or score, and the turn's events.
