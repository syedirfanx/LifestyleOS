const fs = require('fs');
let code = fs.readFileSync('./src/components/SetupDetail.tsx', 'utf-8');

// The start is at `      {/* Add Item Modal */}`
// The end is before the final `    </div>` and `  );`

const startTag = '      {/* Add Item Modal */}';
const endTag = '    </div>\n  );\n};';

const startIndex = code.indexOf(startTag);
const endIndex = code.lastIndexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find start or end tags.');
  process.exit(1);
}

const replacement = `
      {/* Add Item Modal */}
      <ItemFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => {
          onAddItem({ ...data, setupId: setup.id } as Omit<SetupItem, 'id'>);
          setIsAddModalOpen(false);
        }}
        setupTitle={setup.title}
        currency={currency}
        country={country}
      />

      {/* Edit Item Modal */}
      <ItemFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItemId(null);
        }}
        onSubmit={(data) => {
          if (editingItemId) {
            onUpdateItem(editingItemId, data);
            setIsEditModalOpen(false);
            setEditingItemId(null);
          }
        }}
        initialData={items.find(i => i.id === editingItemId)}
        setupTitle={setup.title}
        currency={currency}
        country={country}
      />
\n`;

const newCode = code.slice(0, startIndex) + replacement + code.slice(endIndex);
fs.writeFileSync('./src/components/SetupDetail.tsx', newCode);
console.log('Replaced successfully');
