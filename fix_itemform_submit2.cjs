const fs = require('fs');
let code = fs.readFileSync('./src/components/ItemFormModal.tsx', 'utf-8');

const oldSubmit = `      status: isRecurring ? 'Purchased' : status,`;
const newSubmit = `      status,`;

code = code.replace(oldSubmit, newSubmit);
fs.writeFileSync('./src/components/ItemFormModal.tsx', code);
console.log('Fixed item submit logic for recurring');
