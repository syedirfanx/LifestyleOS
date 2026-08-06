const fs = require('fs');
let code = fs.readFileSync('./src/components/TrackerPage.tsx', 'utf-8');

const regex = /if \(trackerType === 'emi'\) \{[\s\S]*?\} else if \(trackerType === 'recurring'\) \{/;

const newSection = `if (trackerType === 'emi') {
    title = 'EMI Tracker';
    filteredItems = items.filter(i => i.paymentMethod === 'EMI' && !recurringSetupIds.includes(i.setupId));
  } else if (trackerType === 'loans') {
    title = 'Loans';
    filteredItems = items.filter(i => i.paymentMethod === 'Loan' && !recurringSetupIds.includes(i.setupId));
  } else if (trackerType === 'recurring') {`;

code = code.replace(regex, newSection);
fs.writeFileSync('./src/components/TrackerPage.tsx', code);
console.log('Fixed TrackerPage filtering');
