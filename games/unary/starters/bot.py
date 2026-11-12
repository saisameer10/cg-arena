import sys

# Read the whole input in the order given by the statement's protocol, then print the answer.
# Debug with print(..., file=sys.stderr).
lines = sys.stdin.read().split('\n')
print(f"read {len(lines)} lines", file=sys.stderr)
print("answer")  # TODO
