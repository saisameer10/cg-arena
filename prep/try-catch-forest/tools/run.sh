#!/bin/bash
# usage: run.sh <file> <language> <opponents-json> [game-options-json]  > game.json
# Plays one test game through the CodinGame API (token in ~/.config/codingame/token) and prints the JSON log.
# Opponents: "default", "boss", "me" or agent ids, e.g. '["default","default"]'.
API=https://www.codingame.com/api/v1
CH=${CG_CHALLENGE:-unleash-the-geek-2026-opp35}
BODY=$(mktemp)
python - "$1" "$2" "$3" "$4" > "$BODY" <<'PY'
import json,sys,io
b={"language":sys.argv[2],"code":io.open(sys.argv[1],encoding='utf-8').read(),"opponents":json.loads(sys.argv[3])}
if len(sys.argv)>4 and sys.argv[4]: b["game_options"]=json.loads(sys.argv[4])
print(json.dumps(b))
PY
curl -s -H "Authorization: Bearer $(cat ~/.config/codingame/token)" -X POST "$API/challenges/$CH/test-games?wait=30&format=json" -H 'Content-Type: application/json' --data-binary @"$BODY"
rm -f "$BODY"
