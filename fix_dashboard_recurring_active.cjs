const fs = require('fs');
let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

const regex = /i\.status === 'Purchased'/g;
// We can't just replace all. We need to only replace for recurring items.
code = code.replace(
  "items.filter(i => sIds.includes(i.setupId) && i.status === 'Purchased')",
  "items.filter(i => sIds.includes(i.setupId) && i.status === 'Active')"
);

code = code.replace(
  "const purchasedRecurringItems = recurringItems.filter(i => i.status === 'Purchased');",
  "const purchasedRecurringItems = recurringItems.filter(i => i.status === 'Active');"
);

fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('Fixed Dashboard recurring active logic');
