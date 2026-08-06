const fs = require('fs');
let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

code = code.replace(
  '<div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Estimated Cost</div>',
  '<div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{setup.category === "Recurring Expenses" ? "Monthly Cost" : "Estimated Cost"}</div>'
);

fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('Fixed Dashboard cost label');
