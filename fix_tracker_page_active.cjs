const fs = require('fs');
let code = fs.readFileSync('./src/components/TrackerPage.tsx', 'utf-8');

code = code.replace(
  "filteredItems = items.filter(i => recurringSetupIds.includes(i.setupId));",
  "filteredItems = items.filter(i => recurringSetupIds.includes(i.setupId) && i.status === 'Active');"
);

fs.writeFileSync('./src/components/TrackerPage.tsx', code);
console.log('Fixed TrackerPage for active recurring expenses');
