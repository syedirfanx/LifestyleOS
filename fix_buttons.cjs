const fs = require('fs');

function updateFile(filePath, replacements) {
  let code = fs.readFileSync(filePath, 'utf-8');
  for (const [oldStr, newStr] of replacements) {
    code = code.replace(oldStr, newStr);
  }
  fs.writeFileSync(filePath, code);
  console.log('Updated ' + filePath);
}

// 1. SetupDetail.tsx
updateFile('./src/components/SetupDetail.tsx', [
  [
    'className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#0e1422] rounded-xl text-slate-300 hover:text-white hover:bg-slate-850 transition-all text-xs font-bold cursor-pointer"',
    'className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all duration-300 text-xs font-bold cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]"'
  ],
  [
    'className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer inline-flex items-center space-x-1.5 shadow-[0_0_15px_rgba(37,99,235,0.25)] disabled:opacity-50"',
    'className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer inline-flex items-center space-x-1.5 shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/30 disabled:opacity-50"'
  ],
  [
    'className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-[0_0_15px_rgba(37,99,235,0.25)]"',
    'className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all duration-300 cursor-pointer inline-flex items-center space-x-1.5 shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20"'
  ]
]);

// 2. Dashboard.tsx
updateFile('./src/components/Dashboard.tsx', [
  [
    'className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)]"',
    'className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20"'
  ]
]);

// 3. ItemFormModal.tsx
updateFile('./src/components/ItemFormModal.tsx', [
  [
    'className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]"',
    'className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20"'
  ]
]);

// 4. Header.tsx
updateFile('./src/components/Header.tsx', [
  [
    'className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.2)]"',
    'className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20"'
  ],
  [
    'className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)]"',
    'className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20"'
  ]
]);

