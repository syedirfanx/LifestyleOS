import React, { useState, useEffect, useCallback } from 'react';
import { Setup, SetupItem, Currency } from './types';
import { INITIAL_SETUPS, INITIAL_ITEMS } from './data/initialSetups';
import { detectLocationFromGpsOrIp, LocationState } from './utils/locationCurrency';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SetupDetail } from './components/SetupDetail';
import { NewSetupModal } from './components/NewSetupModal';

export default function App() {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('dream_setup_currency');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  });

  const [currentCountry, setCurrentCountry] = useState<string>(() => {
    return localStorage.getItem('dream_setup_country') || 'Bangladesh';
  });

  const [city, setCity] = useState<string | undefined>(() => {
    return localStorage.getItem('dream_setup_city') || undefined;
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [setups, setSetups] = useState<Setup[]>(() => {
    try {
      const saved = localStorage.getItem('dream_setups_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SETUPS;
  });

  const [items, setItems] = useState<SetupItem[]>(() => {
    try {
      const saved = localStorage.getItem('dream_items_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ITEMS;
  });

  const [activeSetupId, setActiveSetupId] = useState<string | null>(null);
  const [isNewSetupModalOpen, setIsNewSetupModalOpen] = useState(false);
  const [isSuggestingItems, setIsSuggestingItems] = useState(false);

  // Scroll to top when active setup changes or navigation happens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSetupId]);

  // Function to detect and set GPS / IP location & local currency
  const handleDetectLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    try {
      const loc: LocationState = await detectLocationFromGpsOrIp();
      setCurrentCountry(loc.country);
      setCurrentCurrency(loc.currency);
      if (loc.city) setCity(loc.city);

      localStorage.setItem('dream_setup_country', loc.country);
      localStorage.setItem('dream_setup_currency', JSON.stringify(loc.currency));
      if (loc.city) localStorage.setItem('dream_setup_city', loc.city);
    } catch (err) {
      console.error('Location detection failed:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  }, []);

  // Run auto location detection once on mount
  useEffect(() => {
    handleDetectLocation();
  }, [handleDetectLocation]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dream_setup_currency', JSON.stringify(currentCurrency));
      localStorage.setItem('dream_setup_country', currentCountry);
      if (city) localStorage.setItem('dream_setup_city', city);
      localStorage.setItem('dream_setups_v2', JSON.stringify(setups));
      localStorage.setItem('dream_items_v2', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [currentCurrency, currentCountry, city, setups, items]);

  // Create setup
  const handleCreateSetup = (
    setupPartial: Omit<Setup, 'id' | 'createdAt'>,
    initialItems?: Omit<SetupItem, 'id' | 'setupId'>[]
  ) => {
    const newSetup: Setup = {
      ...setupPartial,
      id: `setup-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSetups((prev) => [newSetup, ...prev]);

    if (initialItems && initialItems.length > 0) {
      const createdItems: SetupItem[] = initialItems.map((item, idx) => ({
        ...item,
        id: `item-init-${Date.now()}-${idx}`,
        setupId: newSetup.id,
        quantity: item.quantity || 1,
      }));
      setItems((prev) => [...prev, ...createdItems]);
    }

    setActiveSetupId(newSetup.id);
  };

  // Delete setup
  const handleDeleteSetup = (setupId: string) => {
    setSetups((prev) => prev.filter((s) => s.id !== setupId));
    setItems((prev) => prev.filter((i) => i.setupId !== setupId));
    if (activeSetupId === setupId) {
      setActiveSetupId(null);
    }
  };

  // Add item to setup
  const handleAddItem = (itemPartial: Omit<SetupItem, 'id'>) => {
    const newItem: SetupItem = {
      ...itemPartial,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Update item
  const handleUpdateItem = (itemId: string, updated: Partial<SetupItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updated } : i))
    );
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // AI Suggest items for current setup
  const handleSuggestAiSetupItems = async (setupTitle: string) => {
    if (!activeSetupId) return;
    setIsSuggestingItems(true);

    try {
      const res = await fetch('/api/suggest-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupTitle,
          country: currentCountry,
          currency: currentCurrency.code,
        }),
      });

      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const newItems: SetupItem[] = data.items.map((item: any, idx: number) => ({
          id: `item-ai-${Date.now()}-${idx}`,
          setupId: activeSetupId,
          name: item.name || 'Suggested Item',
          brand: item.brand || undefined,
          model: item.model || undefined,
          quantity: item.quantity || 1,
          estimatedPrice: item.estimatedPrice || 100,
          isAiEstimated: true,
          notes: item.notes || 'AI suggested essential item for this setup',
        }));

        setItems((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error('Failed to suggest items:', err);
    } finally {
      setIsSuggestingItems(false);
    }
  };

  const activeSetup = setups.find((s) => s.id === activeSetupId);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-500 font-sans antialiased selection:bg-teal-900 selection:text-white flex flex-col">
      {/* Top Header */}
      <Header
        currentCurrency={currentCurrency}
        currentCountry={currentCountry}
        city={city}
        isDetectingLocation={isDetectingLocation}
        onRefreshLocation={handleDetectLocation}
        onSelectCurrency={(cur) => setCurrentCurrency(cur)}
        onNewSetup={() => setIsNewSetupModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeSetupId && activeSetup ? (
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
          />
        )}
      </main>

      {/* New Setup Modal */}
      <NewSetupModal
        isOpen={isNewSetupModalOpen}
        onClose={() => setIsNewSetupModalOpen(false)}
        onCreateSetup={handleCreateSetup}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="font-semibold text-teal-950">Lifestyle OS</span>
          <span className="text-slate-500">Cost Estimation Platform</span>
        </div>
      </footer>
    </div>
  );
}
