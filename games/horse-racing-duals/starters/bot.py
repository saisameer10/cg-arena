import sys

n = int(input())  # the number of horses
strengths = [int(input()) for _ in range(n)]  # one strength per line

# Write the answer with print. To debug: print("Debug messages...", file=sys.stderr)
print(f"n={n} first={strengths[:10]}", file=sys.stderr)
print("answer")
