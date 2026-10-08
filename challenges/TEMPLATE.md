# Challenge: <name>

Copy this file to `challenges/<game-id>.md` and fill every section. Delete the hints in angle brackets.
See [docs/ADDING_A_CHALLENGE.md](../docs/ADDING_A_CHALLENGE.md) for what matters and why.

## Source

- Puzzle URL: <https://www.codingame.com/ide/puzzle/...>
- Official referee source, if public: <github link or "unknown">
- Target league / rule set: <e.g. "Bronze rules, everything unlocked">
- Players: <2 | 2-4 | 1 (optimization)>  Turn order: <simultaneous | alternating>

## Statement (verbatim)

<Paste the full statement text from the CodinGame IDE here, including the Rules, Victory conditions,
Expert rules / league notes, and the Game Protocol section. Keep tables as tables.>

## Protocol (exact)

### Initialization input
| Line | Content |
|---|---|
| 1 | `<e.g. width height myId>` |
| 2..N | `<...>` |

### Input for one game turn
| Line | Content |
|---|---|
| 1 | `<...>` |

### Output for one game turn
| Line | Content |
|---|---|
| 1 | `<one line, e.g. MOVE x y | WAIT>` |

### Limits
- Response time first turn: <1000> ms
- Response time per turn: <50 | 100> ms
- Max turns: <...>
- Victory / ranking rule: <...>
- What happens on an invalid output: <loses | ignored | ...>

## Starter code (from the IDE)

```python
# paste the Python (or any) starter here
```

## Bosses wanted

| Level | What it should do |
|---|---|
| wood | <legal random moves> |
| bronze | <...> |
| silver | <...> |

## Viewer

<What must be visible per turn: map, units, trails, HP, last orders, events. A screenshot of the CodinGame viewer helps.>

## Examples / maps / seeds (optional)

<Sample maps or test cases in the statement's format.>

## Ambiguities to decide

<Anything the statement leaves open, with the choice you want. E.g. "can MOVE and SILENCE be combined in a turn? yes">
