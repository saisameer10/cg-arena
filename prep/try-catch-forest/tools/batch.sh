#!/bin/bash
# usage: batch.sh <bot-file> <out-prefix> <count> [opponents-json]
# Plays <count> test games one after the other, saves <out-prefix>N.json and prints one result line per game.
HERE=$(cd "$(dirname "$0")" && pwd)
for i in $(seq 1 "$3"); do
  bash "$HERE/run.sh" "$1" Java "${4:-[\"default\",\"default\"]}" > "$2$i.json"
  python "$HERE/game.py" "$2$i.json" | tail -1
done
