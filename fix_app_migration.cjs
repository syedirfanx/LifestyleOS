const fs = require('fs');
let code = fs.readFileSync('./src/App.tsx', 'utf-8');

const regex = /  const \[setups, setSetups\] = useState<Setup\[\]>\(\(\) => \{[\s\S]*?    return initialSetups;\n  \}\);/;

const replacement = `  const [setups, setSetups] = useState<Setup[]>(() => {
    try {
      const saved = localStorage.getItem('dream_setup_setups');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old category names
        return parsed.map((s: Setup) => {
          if (s.category === '💳 Recurring Expenses') {
            return { ...s, category: 'Recurring Expenses' };
          }
          return s;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return initialSetups;
  });`;

code = code.replace(regex, replacement);
fs.writeFileSync('./src/App.tsx', code);
console.log('Fixed App migration');
