// readline(), print() and printErr() are provided, like on CodinGame.
const n = parseInt(readline());                       // the number of temperatures to analyse
const line = n > 0 ? readline() : '';
const temps = n > 0 ? line.split(' ').map(Number) : [];

printErr(`n=${n} temps=${temps.slice(0, 10)}`);
print('result');
