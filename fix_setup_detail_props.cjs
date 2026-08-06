const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

code = code.replace(
  "        setupCategory={setup.category}\n        setupSubCategory={setup.subCategory}\n        setupCategory={setup.category}\n        setupSubCategory={setup.subCategory}",
  "        setupCategory={setup.category}\n        setupSubCategory={setup.subCategory}"
);

// Also remove Rent and Subscription from SetupDetail Badges
code = code.replace(
  "{item.status === 'Purchased' && item.paymentMethod === 'Subscription' && (\n                        <span className=\"text-[10px] bg-purple-950/40 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide\">\n                          Sub: {item.paymentDetails?.monthlyCost?.toLocaleString()} {currency.code}/mo\n                        </span>\n                      )}",
  ""
);

code = code.replace(
  "{item.status === 'Purchased' && item.paymentMethod === 'Rent' && (\n                        <span className=\"text-[10px] bg-amber-950/40 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide\">\n                          Rent: {item.paymentDetails?.monthlyCost?.toLocaleString()} {currency.code}/mo\n                        </span>\n                      )}",
  ""
);

fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('Fixed SetupDetail');
