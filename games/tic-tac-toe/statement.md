# Ultimate Tic-Tac-Toe

CodinGame page: <https://www.codingame.com/multiplayer/bot-programming/tic-tac-toe>

Two players take turns marking cells. Player 0 is **X** and always moves first; player 1 is **O**. This referee is a port of the official CodinGame referee (<https://github.com/CodinGame/game-ultimate-tictactoe>): same leagues, same order of the valid-action list for a given seed, same output format, same error messages and the same scores.

## Leagues

| League | Board | Max turns (both players together) |
|---|---|---|
| Wood | one 3×3 board, rows and columns 0–2 | 9 |
| Bronze and above | a 3×3 board of nine 3×3 boards, rows and columns 0–8 | 81 |

Pick the league in the IDE or with `--league wood|bronze` (default: bronze).

## Rules

**Wood.** Classic tic-tac-toe: the first player with three marks in a row, column or diagonal wins. A full board without a line is a draw.

**Bronze and above.** The 9×9 grid is split into nine small boards; small board `(row / 3, col / 3)` holds cell `(row, col)`.

- Three in a row inside a small board wins that board. A won board is closed: nobody plays in it any more.
- The cell you play decides where your opponent plays next: playing at position `(row % 3, col % 3)` inside a small board sends the opponent to the small board at that same position of the big grid. Example: you play `4 5`, which is the middle-right cell of the center board, so your opponent must play in the right board (rows 3–5, columns 6–8).
- If that board is already won or full, the opponent may play in any empty cell of any open board.
- Winning three small boards in a row, column or diagonal of the big grid wins the game.
- If every board is closed and nobody has a line of boards, the player who won more small boards wins; an equal count is a draw.

**Scores** (what the arena ranks by): 10 for a line, otherwise the number of small boards won; a player who loses by an invalid output, an invalid action or a timeout scores -1. Wood: 10 for the winner, 0 for a draw.

## Protocol

There is no initialization input.

**Input for one game turn**

| Line | Content |
|---|---|
| 1 | `opponentRow opponentCol`: the opponent's last move, `-1 -1` if you are player 0 and this is the first turn |
| 2 | `validActionCount`: the number of cells you may play this turn |
| next `validActionCount` lines | `row col`: one cell you may play |

The valid actions come in a **shuffled** order (CodinGame shuffles them with a random generator seeded by the game seed), so the first one is a random legal move, not the best one.

**Output for one game turn**

| Line | Content |
|---|---|
| 1 | `row col`, optionally followed by whitespace and a message that the viewer shows (up to 19 characters are shown in full, longer ones are cut to 17 characters plus `...`) |

Exact format, from the official referee: the whole line must match `(-?[0-9])\s+(-?[0-9])(\s+message)?`. Each coordinate is a single digit, and nothing may come before the row. With CodinGame's referee code even a trailing space with no message fails the match. Otherwise the game ends with **"Invalid output."**. A well-formed cell that is not one of this turn's valid actions ends the game with **"Invalid action."**.

## Constraints

- First turn ≤ 1000 ms, then ≤ 100 ms per turn.
- One line of output per turn; send debug text to stderr.

## Tips

- Wood is solved: perfect play draws. Win when you can, block the opponent's line, take the center, and never leave two open threats for the opponent.
- In Bronze, look one move ahead: before playing, check which board you send the opponent to. Can it win a board or the game there? Will it get a free choice because that board is closed?
- Strong bots search: Monte Carlo tree search or alpha-beta with a board evaluation, within 100 ms.
