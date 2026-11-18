#!/bin/bash
# usage: rerun.sh <bot-file> <game_id>  > game.json
# Replays an arena battle (or test game) as a test game: our code in our seat, same opponents, same seats, same map.
# Only battles of the CURRENT submission can be replayed. Waits until the game is done (a game can take longer than
# the 30 seconds one request waits) and, if another test game of ours is still running, waits for that one first.
API=https://www.codingame.com/api/v1
CH=${CG_CHALLENGE:-unleash-the-geek-2026-opp35}
BODY=$(mktemp); OUT=$(mktemp)
python - "$1" "$2" > "$BODY" <<'PY'
import json,sys,io
print(json.dumps({"language":"Java","code":io.open(sys.argv[1],encoding='utf-8').read(),"replay_game_id":int(sys.argv[2])}))
PY
auth() { curl -s -H "Authorization: Bearer $(cat ~/.config/codingame/token)" "$@"; }
field() { python -c "import json,sys
try: print(json.load(open(sys.argv[1],encoding='utf-8')).get(sys.argv[2],''))
except Exception: print('')" "$OUT" "$1"; }
for attempt in 1 2 3 4 5 6; do
  auth -X POST "$API/challenges/$CH/test-games?wait=30&format=json" -H 'Content-Type: application/json' --data-binary @"$BODY" > "$OUT"
  if grep -q "test-game-running" "$OUT"; then                 # somebody's game is still running: wait for it, then try again
    id=$(field test_game_id); [ -n "$id" ] && auth "$API/test-games/$id?wait=30&format=json" > /dev/null
    continue
  fi
  break
done
id=$(field test_game_id); st=$(field status)
n=0
while [ -n "$id" ] && [ "$st" != "done" ] && [ "$st" != "failed" ] && ! grep -q '"log"' "$OUT" && [ $n -lt 12 ]; do
  auth "$API/test-games/$id?wait=30&format=json" > "$OUT"; st=$(field status); n=$((n+1))
done
cat "$OUT"; rm -f "$BODY" "$OUT"
