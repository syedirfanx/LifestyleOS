const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

code = code.replace(/<img src=\{userPhoto\}/g, '<img src={userPhoto} referrerPolicy="no-referrer"');

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed img referrerPolicy');
