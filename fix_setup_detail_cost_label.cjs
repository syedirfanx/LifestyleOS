const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

code = code.replace(
  '<span className="text-xs font-semibold uppercase tracking-wide text-blue-400">Total cost</span>',
  '<span className="text-xs font-semibold uppercase tracking-wide text-blue-400">{isRecurring ? "Monthly Cost" : "Total Cost"}</span>'
);

fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('Fixed SetupDetail cost label');
