import sys

# Try Catch Forest starter. Debug with print(..., file=sys.stderr).
# You (my_id) catch the units of player (my_id + 1) % 3 and are caught by player (my_id + 2) % 3.
my_id = int(input())
map_radius = int(input())
tree_count = int(input())
for _ in range(tree_count):
    tree_id, tree_x, tree_y, tree_radius = [int(j) for j in input().split()]

while True:
    my_score = int(input())
    nets, smokes, decoys = [int(j) for j in input().split()]
    entity_count = int(input())
    commands = []
    for _ in range(entity_count):
        f = input().split()
        entity_id, entity_type, owner = int(f[0]), f[1], int(f[2])
        x, y, dx, dy, ghost, turns_remaining, fatigue, immobilized_turns = [int(j) for j in f[3:11]]
        if entity_type == "UNIT" and owner == my_id:
            commands.append(f"MOVE {entity_id} 0 0")   # every unit walks to the centre
    # MOVE | DASH | NET | SMOKE | DECOY <id> <x> <y>, joined by ';', or WAIT
    print(";".join(commands) if commands else "WAIT")
