const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

if (!code.includes('import { ConfirmDeleteModal }')) {
  code = code.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { ConfirmDeleteModal } from './ConfirmDeleteModal';"
  );
}

code = code.replace(
  "  const [editingItem, setEditingItem] = useState<SetupItem | null>(null);",
  "  const [editingItem, setEditingItem] = useState<SetupItem | null>(null);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);"
);

code = code.replace(
  "onClick={() => onDeleteItem(item.id)}",
  "onClick={() => setItemToDelete(item.id)}"
);

code = code.replace(
  "    </div>\n  );\n};",
  "      <ConfirmDeleteModal\n        isOpen={itemToDelete !== null}\n        title=\"Delete Item\"\n        message=\"Are you sure you want to delete this item?\"\n        onConfirm={() => { if (itemToDelete) onDeleteItem(itemToDelete); }}\n        onCancel={() => setItemToDelete(null)}\n      />\n    </div>\n  );\n};"
);

fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('Updated SetupDetail');
