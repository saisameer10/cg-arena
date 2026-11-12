# SPOILER: reference solution, used to compute expected outputs and to prove that tests can be passed.
import sys

message = sys.stdin.readline().rstrip('\n')
bits = ''.join(format(ord(c), '07b') for c in message)
blocks, i = [], 0
while i < len(bits):
    j = i
    while j < len(bits) and bits[j] == bits[i]:
        j += 1
    blocks.append(('0' if bits[i] == '1' else '00') + ' ' + '0' * (j - i))
    i = j
print(' '.join(blocks))
