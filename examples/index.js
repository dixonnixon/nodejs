var rect = require('./rectangle')

function solveRect(l, b) {
   if(l <= 0 || b <= 0) {
        return NaN;
   } 
   else {
        return { p: rect.perimeter(l, b), a: rect.area(l,b) };
   }
}

console.log(solveRect(2, 4));
console.log(solveRect(3, 5));
console.log(solveRect(0, 5));
console.log(solveRect(-3, 5));