const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');
code = code.replace(
  'className="flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-2xs transition-colors cursor-pointer disabled:opacity-50 font-medium shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.2)]"',
  'className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-3 py-2 rounded-lg text-2xs transition-all duration-300 cursor-pointer disabled:opacity-50 font-bold shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-400/20"'
);
fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed Detect GPS');
