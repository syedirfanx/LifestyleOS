const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');
const lines = code.split('\n');
// Find the line that imports from '../types'
const typesLineIdx = lines.findIndex(l => l.includes("from '../types'"));
if (typesLineIdx !== -1) {
    lines[typesLineIdx] = "import { Setup, SetupItem, Currency, ConfidenceLevel, ItemStatus, PaymentMethod, PaymentDetails } from '../types';";
    // Remove the mess I made (if any other bad lines exist around there)
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(", ItemStatus, PaymentMethod, PaymentDetails")) {
            if (i !== typesLineIdx) {
                lines[i] = "";
            }
        }
    }
}
fs.writeFileSync('./src/components/SetupDetail.tsx', lines.join('\n'));
