const fs = require('fs');

let code = fs.readFileSync('./src/App.tsx', 'utf-8');

code = code.replace(
  "import { StarsBackground } from './components/StarsBackground';",
  "import { StarsBackground } from './components/StarsBackground';\nimport { TrackerPage } from './components/TrackerPage';"
);

code = code.replace(
  "const [activeSetupId, setActiveSetupId] = useState<string | null>(null);",
  "const [activeSetupId, setActiveSetupId] = useState<string | null>(null);\n  const [activeTracker, setActiveTracker] = useState<'emi' | 'subscriptions' | 'loans' | 'rent' | null>(null);"
);

code = code.replace(
  "window.scrollTo({ top: 0, behavior: 'instant' });\n  }, [activeSetupId]);",
  "window.scrollTo({ top: 0, behavior: 'instant' });\n  }, [activeSetupId, activeTracker]);"
);

const replaceMainRender = `
        {/* Main Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 relative z-10 pb-12">
        {activeTracker ? (
          <TrackerPage
            items={items}
            currency={currentCurrency}
            trackerType={activeTracker}
            onBack={() => setActiveTracker(null)}
          />
        ) : activeSetupId && activeSetup ? (
          <SetupDetail
            setup={activeSetup}
            items={items}
            currency={currentCurrency}
            country={currentCountry}
            onBack={() => setActiveSetupId(null)}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onSuggestAiSetupItems={handleSuggestAiSetupItems}
            isSuggestingItems={isSuggestingItems}
          />
        ) : (
          <Dashboard
            setups={setups}
            items={items}
            currency={currentCurrency}
            onSelectSetup={setActiveSetupId}
            onNewSetup={() => setIsNewSetupModalOpen(true)}
            onDeleteSetup={handleDeleteSetup}
            onNavigateToTracker={(tracker) => setActiveTracker(tracker)}
          />
        )}
      </main>
`;

// we need to find `        {/* Main Container */}`
const startString = '{/* Main Container */}';
const endString = '      </div>\n\n      {/* New Setup Modal */}';

const startIndex = code.indexOf(startString);
const endIndex = code.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.slice(0, startIndex) + replaceMainRender + code.slice(endIndex);
}

fs.writeFileSync('./src/App.tsx', code);
console.log('App.tsx updated.');
