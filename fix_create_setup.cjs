const fs = require('fs');
let code = fs.readFileSync('./src/components/NewSetupModal.tsx', 'utf-8');
code = code.replace(
  'className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer shadow-sm flex items-center space-x-1.5"',
  'className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20 flex items-center space-x-1.5"'
);
fs.writeFileSync('./src/components/NewSetupModal.tsx', code);
console.log('Fixed Create Setup');
