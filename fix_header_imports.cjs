const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

code = code.replace(
  "import { motion } from 'motion/react';",
  "import { motion } from 'motion/react';\nimport { auth } from '../firebase';\nimport { signOut } from 'firebase/auth';"
);

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed Header imports');
