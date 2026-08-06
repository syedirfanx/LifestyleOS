const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

code = code.replace(
  "        setupTitle={setup.title}\n        currency={currency}",
  "        setupTitle={setup.title}\n        setupCategory={setup.category}\n        setupSubCategory={setup.subCategory}\n        currency={currency}"
);

fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('Fixed Edit Modal Props');
