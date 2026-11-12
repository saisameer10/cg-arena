import sys

# Ultimate Tic-Tac-Toe starter. Debug with print(..., file=sys.stderr); it shows in the console panel.
# Rows and columns go from 0 to 8 (0 to 2 in the Wood league). Player 0 moves first.

while True:
    opponent_row, opponent_col = [int(i) for i in input().split()]   # -1 -1 on your first turn if you start
    valid_action_count = int(input())
    actions = []
    for i in range(valid_action_count):
        row, col = [int(j) for j in input().split()]
        actions.append((row, col))

    # The list is shuffled every turn, so the first action is a random legal move. Replace this with your logic.
    row, col = actions[0]
    print(f"opponent played {opponent_row} {opponent_col}, {valid_action_count} valid actions", file=sys.stderr)
    print(f"{row} {col}")
