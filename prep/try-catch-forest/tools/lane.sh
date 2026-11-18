#!/bin/bash
# usage: (in a scratch folder that holds fetch.py = tools/arenafetch.py and the built debug variants)  bash lane.sh
# The replay lane: follows whichever submission is live, fetches its finished battles, asks lane_tasks.py which
# replays are outstanding (three at a time, most important first) and runs them with rerun.sh.
# Replays are tied to the current submission: after a resubmission the old battles are refused, and this loop
# moves to the new submission's battles by itself. Edit lane_tasks.py to say which versions run on which battles.
T=$(cd "$(dirname "$0")" && pwd)
for pass in $(seq 1 200); do
  SUB=$(curl -s -H "Authorization: Bearer $(cat ~/.config/codingame/token)" https://www.codingame.com/api/v1/challenges/${CG_CHALLENGE:-unleash-the-geek-2026-opp35}/progress | python -c "import json,sys; print(json.load(sys.stdin).get('submission_id',''))" | tr -d '\r')
  [ -z "$SUB" ] && continue
  echo $SUB > lane_sub.txt
  python fetch.py $SUB > /dev/null 2>&1
  python "$T/arena.py" . battles_$SUB.json > /dev/null 2>&1
  python "$T/lane_tasks.py" $SUB 2>/dev/null | tr -d '\r' > lane_now.txt      # tr: Python prints CRLF on Windows
  if [ ! -s lane_now.txt ]; then python -c "import time; time.sleep(45)"; continue; fi
  while read d b g; do
    bash "$T/rerun.sh" $b/Player.java $g > $d/$g.json
    echo "$d $g $(python "$T/game.py" $d/$g.json | tail -1 | cut -c1-110)"
  done < lane_now.txt
done
