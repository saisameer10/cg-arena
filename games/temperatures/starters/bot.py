import sys

n = int(input())  # the number of temperatures to analyse
temps = [int(i) for i in input().split()] if n > 0 else []

# Write an answer using print. To debug: print("Debug messages...", file=sys.stderr)
print(f"n={n} temps={temps[:10]}", file=sys.stderr)
print("result")
