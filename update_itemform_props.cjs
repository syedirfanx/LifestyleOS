const fs = require('fs');
let code = fs.readFileSync('./src/components/ItemFormModal.tsx', 'utf-8');

code = code.replace(
  "  setupTitle: string;\n  currency: Currency;",
  "  setupTitle: string;\n  setupCategory?: string;\n  setupSubCategory?: string;\n  currency: Currency;"
);

code = code.replace(
  "  setupTitle,\n  currency,\n  country\n}) => {",
  "  setupTitle,\n  setupCategory,\n  setupSubCategory,\n  currency,\n  country\n}) => {"
);

fs.writeFileSync('./src/components/ItemFormModal.tsx', code);
console.log('ItemFormModal Props updated');
