const fs = require('fs');
let code = fs.readFileSync('./src/components/ItemFormModal.tsx', 'utf-8');

const regex = /              <\/>\n            \)}\n\n            \{isRecurring && \(/;
code = code.replace(regex, "\n            {isRecurring && (\n");

fs.writeFileSync('./src/components/ItemFormModal.tsx', code);
