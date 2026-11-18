#!/bin/bash
# usage: seedbatch.sh <bot-file> <out-prefix> <opponents-json> <seed-option>...
# Plays one test game per seed option (e.g. seed=123, as printed by game.py) and saves <out-prefix>N.json:
# two versions played on the same seeds meet the same maps, unit counts and power pools.
HERE=$(cd "$(dirname "$0")" && pwd)
BOT=$1; PRE=$2; OPP=$3; shift 3; i=0
for s in "$@"; do
  i=$((i+1))
  bash "$HERE/run.sh" "$BOT" Java "$OPP" "\"$s\"" > "$PRE$i.json"
  python "$HERE/game.py" "$PRE$i.json" | tail -1
done
