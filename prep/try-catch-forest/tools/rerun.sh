#!/bin/bash
# usage: rerun.sh <bot-file> <game_id>  > game.json
# Replays an arena battle (or test game) as a test game: our code in our seat, same opponents, same seats, same map.
API=https://www.codingame.com/api/v1
CH=${CG_CHALLENGE:-unleash-the-geek-2026-opp35}
BODY=$(mktemp)
python - "$1" "$2" > "$BODY" <<'PY'
import json,sys,io
print(json.dumps({"language":"Java","code":io.open(sys.argv[1],encoding='utf-8').read(),"replay_game_id":int(sys.argv[2])}))
PY
curl -s -H "Authorization: Bearer $(cat ~/.config/codingame/token)" -X POST "$API/challenges/$CH/test-games?wait=30&format=json" -H 'Content-Type: application/json' --data-binary @"$BODY"
rm -f "$BODY"
