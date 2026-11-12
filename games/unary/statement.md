# Unary

Classic puzzle ([CodinGame page](https://www.codingame.com/ide/puzzle/unary), CodinGame type CODE, easy). The original statement is in the **Original statement** tab once fetched.

Encode a message using only zeros. Write each character as its 7-bit binary code, join all the bits, and split them into runs of equal bits. Each run becomes two blocks separated by a space:

- first block: `0` for a run of 1s, `00` for a run of 0s;
- second block: as many `0` as the run is long.

All blocks are separated by single spaces. For example, `C` is `1000011`, so it becomes `0 0 00 0000 0 00`.

## Protocol

**Input**: one line, the message: ASCII characters (7-bit), length 1 to 100.

**Output**: one line, the encoded message.
