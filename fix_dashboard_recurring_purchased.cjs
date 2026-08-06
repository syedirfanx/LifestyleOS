const fs = require('fs');
let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

const calcRegex = /const getSubCatMonthlySum = \(subCategoryMatch\) => \{[\s\S]*?const totalMonthlyCommitment = [^\n]*;/;

const calcReplace = `
  const getSubCatMonthlySum = (subCategoryMatch) => {
    const sIds = setups.filter(s => s.category === 'Recurring Expenses' && s.subCategory === subCategoryMatch).map(s => s.id);
    return items.filter(i => sIds.includes(i.setupId) && i.status === 'Purchased').reduce((sum, item) => sum + (item.paymentDetails?.monthlyCost || item.estimatedPrice || 0), 0);
  };

  const monthlyRent = getSubCatMonthlySum('Housing');
  const monthlyUtilities = getSubCatMonthlySum('Utilities');
  const monthlySubscriptions = getSubCatMonthlySum('Subscriptions');
  const monthlyMemberships = getSubCatMonthlySum('Memberships');
  const monthlyInsurance = getSubCatMonthlySum('Insurance');

  const purchasedRecurringItems = recurringItems.filter(i => i.status === 'Purchased');
  const totalMonthlyCommitment = monthlyEMI + monthlyLoans + purchasedRecurringItems.reduce((sum, i) => sum + (i.paymentDetails?.monthlyCost || i.estimatedPrice || 0), 0);
`;

code = code.replace(calcRegex, calcReplace.trim());

fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('Fixed Dashboard recurring purchased logic');
