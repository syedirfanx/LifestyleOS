const fs = require('fs');
let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

const regex = /  const totalDreamCost = items.reduce\([\s\S]*?const totalMonthlyCommitment = [^\n]*;/;

const calcReplace = `
  const recurringSetupIds = setups.filter(s => s.category === '💳 Recurring Expenses').map(s => s.id);
  const assetItems = items.filter(i => !recurringSetupIds.includes(i.setupId));
  const recurringItems = items.filter(i => recurringSetupIds.includes(i.setupId));

  const totalDreamCost = assetItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  
  const purchasedItems = assetItems.filter(i => i.status === 'Purchased');
  const purchasedValue = purchasedItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  const outstandingDreamValue = totalDreamCost - purchasedValue;

  const monthlyEMI = assetItems.filter(i => i.paymentMethod === 'EMI' && i.status === 'Purchased').reduce((sum, item) => sum + (item.paymentDetails?.monthlyEMI || 0), 0);
  const monthlyLoans = assetItems.filter(i => i.paymentMethod === 'Loan' && i.status === 'Purchased').reduce((sum, item) => sum + (item.paymentDetails?.monthlyPayment || 0), 0);
  
  const getSubCatMonthlySum = (subCategoryMatch) => {
    const sIds = setups.filter(s => s.category === '💳 Recurring Expenses' && s.subCategory === subCategoryMatch).map(s => s.id);
    return items.filter(i => sIds.includes(i.setupId)).reduce((sum, item) => sum + (item.paymentDetails?.monthlyCost || item.estimatedPrice || 0), 0);
  };

  const monthlyRent = getSubCatMonthlySum('Housing');
  const monthlyUtilities = getSubCatMonthlySum('Utilities');
  const monthlySubscriptions = getSubCatMonthlySum('Subscriptions');
  const monthlyMemberships = getSubCatMonthlySum('Memberships');
  const monthlyInsurance = getSubCatMonthlySum('Insurance');

  const totalMonthlyCommitment = monthlyEMI + monthlyLoans + recurringItems.reduce((sum, i) => sum + (i.paymentDetails?.monthlyCost || i.estimatedPrice || 0), 0);
`;

code = code.replace(regex, calcReplace.trim());

// We also need to fix getSetupCost. Should it only count assets, or what if the setup is a recurring one?
// The dashboard shows total cost for each setup. For recurring expenses, it's monthly cost.
// Let's modify getSetupCost logic if needed later. But let's check it first.

fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('Fixed dashboard calculations.');
