const fs = require('fs');

let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

// Update ItemFormModal usage in SetupDetail.tsx
code = code.replace(
  "setupTitle={setup.title}",
  "setupTitle={setup.title}\n        setupCategory={setup.category}\n        setupSubCategory={setup.subCategory}"
);

code = code.replace(
  "setupTitle={setup.title}",
  "setupTitle={setup.title}\n        setupCategory={setup.category}\n        setupSubCategory={setup.subCategory}"
);

fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('SetupDetail updated to pass category props');
