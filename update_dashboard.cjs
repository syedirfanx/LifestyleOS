const fs = require('fs');
let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

code = code.replace(
  "import React from 'react';",
  "import React, { useState } from 'react';\nimport { ConfirmDeleteModal } from './ConfirmDeleteModal';"
);

code = code.replace(
  "export const Dashboard: React.FC<DashboardProps> = ({",
  "export const Dashboard: React.FC<DashboardProps> = ({\n"
);
// just a small trick to find the start of the component body
code = code.replace(
  "  // Calculate total dream cost across all setups",
  "  const [setupToDelete, setSetupToDelete] = useState<string | null>(null);\n\n  // Calculate total dream cost across all setups"
);

// replace the onDeleteSetup call
code = code.replace(
  "onDeleteSetup(setup.id);",
  "setSetupToDelete(setup.id);"
);

// add the modal at the end of the component
code = code.replace(
  "    </div>\n  );\n};",
  "      <ConfirmDeleteModal\n        isOpen={setupToDelete !== null}\n        title=\"Delete Setup\"\n        message=\"Are you sure you want to delete this setup? This action cannot be undone.\"\n        onConfirm={() => { if (setupToDelete) onDeleteSetup(setupToDelete); }}\n        onCancel={() => setSetupToDelete(null)}\n      />\n    </div>\n  );\n};"
);

fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('Updated Dashboard');
