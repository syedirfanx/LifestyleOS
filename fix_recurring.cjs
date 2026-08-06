const fs = require('fs');
const files = [
  'src/data/lifeAreasData.ts',
  'src/components/ItemFormModal.tsx',
  'src/components/SetupDetail.tsx',
  'src/components/TrackerPage.tsx',
  'src/components/Dashboard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/💳 Recurring Expenses/g, 'Recurring Expenses');
  fs.writeFileSync(file, content);
}
console.log('Fixed category names');
