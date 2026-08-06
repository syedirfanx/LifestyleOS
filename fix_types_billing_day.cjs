const fs = require('fs');
let code = fs.readFileSync('./src/types.ts', 'utf-8');

code = code.replace(
  "nextBillingDate?: string;",
  "nextBillingDate?: string;\n  billingDay?: number;"
);

fs.writeFileSync('./src/types.ts', code);
console.log('Fixed types billing day');
