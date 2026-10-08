# my-bots

Your own bots live here. Everything in this folder except this file is git-ignored, so you can keep work-in-progress versions without committing them.

Run one from the CLI (language is inferred from the extension: `.py`, `.js`, `.java`, `.cpp`):

```
node cli.js tron my-bots/tron_v3.py boss:silver --games 20
node cli.js ocean-of-code my-bots/sub_v2.java my-bots/sub_v1.java --games 10   # new version vs old
```

Java files must declare `class Player` (the file can be named anything).
