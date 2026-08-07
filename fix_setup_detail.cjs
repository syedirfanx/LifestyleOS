const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

if (!code.includes('import { ConfirmDeleteModal }')) {
  code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { ConfirmDeleteModal } from './ConfirmDeleteModal';"
  );
}

if (!code.includes('itemToDelete')) {
  code = code.replace(
    "const [editingItemId, setEditingItemId] = useState<string | null>(null);",
    "const [editingItemId, setEditingItemId] = useState<string | null>(null);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);"
  );
} else {
  // It's already there at the bottom, but not in state.
  code = code.replace(
    "const [editingItemId, setEditingItemId] = useState<string | null>(null);",
    "const [editingItemId, setEditingItemId] = useState<string | null>(null);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);"
  );
}

code = code.replace(
  "onClick={() => onDeleteItem(item.id)}",
  "onClick={() => setItemToDelete(item.id)}"
);

fs.writeFileSync('./src/components/SetupDetail.tsx', code);
console.log('Fixed SetupDetail');
