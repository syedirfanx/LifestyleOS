const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

const regex = /\{!isRecurring && \([\s\S]*?<span className=\{\`text-\[10px\] px-1\.5 py-0\.5 rounded font-bold uppercase tracking-wide \$\{[\s\S]*?\}\`\}>[\s\S]*?\{item\.status \|\| 'Planning'\}[\s\S]*?<\/span>[\s\S]*?\)\}/;

const replacement = `<span className={\`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide \${
                          item.status === 'Purchased' ? 'bg-emerald-950/40 text-emerald-400' :
                          item.status === 'Ready to Buy' ? 'bg-amber-950/40 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }\`}>
                          {item.status || 'Planning'}
                        </span>`;

code = code.replace(regex, replacement);
fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('Fixed SetupDetail badge for recurring');
