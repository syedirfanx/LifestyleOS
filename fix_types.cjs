const fs = require('fs');
let code = fs.readFileSync('./src/types.ts', 'utf-8');
code = code.replace(
  "export type ItemStatus = 'Planning' | 'Wishlist' | 'Ready to Buy' | 'Purchased' | 'Sold' | 'Removed';",
  "export type ItemStatus = 'Planning' | 'Wishlist' | 'Ready to Buy' | 'Purchased' | 'Sold' | 'Removed' | 'Active' | 'Cancelled';"
);
fs.writeFileSync('./src/types.ts', code);
