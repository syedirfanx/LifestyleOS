const fs = require('fs');
let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

const oldGetSetupCost = `  const getSetupCost = (setupId: string) => {
    return items
      .filter((i) => i.setupId === setupId)
      .reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  };`;

const newGetSetupCost = `  const getSetupCost = (setupId: string) => {
    const isRecurring = setups.find(s => s.id === setupId)?.category === '💳 Recurring Expenses';
    return items
      .filter((i) => i.setupId === setupId)
      .reduce((sum, item) => {
        if (isRecurring) {
          return sum + (item.paymentDetails?.monthlyCost || item.estimatedPrice || 0);
        }
        return sum + item.estimatedPrice * item.quantity;
      }, 0);
  };`;

code = code.replace(oldGetSetupCost, newGetSetupCost);
fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('Fixed getSetupCost');
