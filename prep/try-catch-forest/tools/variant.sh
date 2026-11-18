#!/bin/bash
# usage: variant.sh <source.java> <out-dir> [FLAG=value ...]
# Compiles a copy of a bot into <out-dir> for the local referee, with switches changed, e.g.
#   variant.sh versions/v9.java bin/noDash F_DASH=false
#   variant.sh versions/v11.java bin/wg15 P_WG_FAR=1.5        (numbers, v11 and later)
# The copy also has the turn-time guard switched off: on a busy machine it would make the search coarser at random.
SRC=$1; OUT=$2; shift 2
mkdir -p "$OUT.src"
sed 's/System.nanoTime() - turnStart > 25_000_000L/false/' "$SRC" > "$OUT.src/Player.java"
for kv in "$@"; do
  k=${kv%%=*}; v=${kv#*=}
  case $k in
    F_*) grep -q "static final boolean $k = " "$OUT.src/Player.java" || { echo "no switch $k"; exit 1; }
         sed -i "s/static final boolean $k = [a-z]*;/static final boolean $k = $v;/" "$OUT.src/Player.java" ;;
    P_*) grep -q -E "[ ,]$k = [0-9.]+[,;]" "$OUT.src/Player.java" || { echo "no number $k"; exit 1; }
         sed -i -E "s/([ ,])$k = [0-9.]+([,;])/\1$k = $v\2/" "$OUT.src/Player.java" ;;
    *) echo "unknown name $k"; exit 1 ;;
  esac
done
"${JAVAC:-javac}" -nowarn -d "$OUT" "$OUT.src/Player.java"
