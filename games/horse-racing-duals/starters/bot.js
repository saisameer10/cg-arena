// readline(), print() and printErr() are provided, like on CodinGame.
const n = parseInt(readline());               // the number of horses
const strengths = [];
for (let i = 0; i < n; i++) strengths.push(parseInt(readline()));   // one strength per line

printErr(`n=${n} first=${strengths.slice(0, 10)}`);
print('answer');
