import React, { useState, useEffect, useCallback } from 'react';
import { Setup, SetupItem, Currency } from './types';
import { INITIAL_SETUPS, INITIAL_ITEMS } from './data/initialSetups';
import { detectLocationFromGpsOrIp, LocationState } from './utils/locationCurrency';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SetupDetail } from './components/SetupDetail';
import { NewSetupModal } from './components/NewSetupModal';
import { StarsBackground } from './components/StarsBackground';
import { TrackerPage } from './components/TrackerPage';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

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

  const [setups, setSetups] = useState<Setup[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [items, setItems] = useState<SetupItem[]>([]);

  const [activeSetupId, setActiveSetupId] = useState<string | null>(null);
  const [activeTracker, setActiveTracker] = useState<'emi' | 'loans' | 'recurring' | null>(null);
  const [isNewSetupModalOpen, setIsNewSetupModalOpen] = useState(false);
  const [isSuggestingItems, setIsSuggestingItems] = useState(false);

  // Scroll to top when active setup changes or navigation happens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSetupId, activeTracker]);

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
    } catch (e) {
      console.error(e);
    }
  }, [currentCurrency, currentCountry, city]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        // Fetch data
        try {
          const setupsRef = collection(db, 'setups');
          const qSetups = query(setupsRef, where('userId', '==', firebaseUser.uid));
          const setupsSnap = await getDocs(qSetups);
          const loadedSetups: Setup[] = [];
          setupsSnap.forEach(doc => loadedSetups.push(doc.data() as Setup));
          
          const itemsRef = collection(db, 'items');
          const qItems = query(itemsRef, where('userId', '==', firebaseUser.uid));
          const itemsSnap = await getDocs(qItems);
          const loadedItems: SetupItem[] = [];
          itemsSnap.forEach(doc => loadedItems.push(doc.data() as SetupItem));

          if (loadedSetups.length === 0 && loadedItems.length === 0) {
             // New user, seed with initial data
             setSetups(INITIAL_SETUPS);
             setItems(INITIAL_ITEMS);
             // Save initial to firestore
             for (const s of INITIAL_SETUPS) {
               await setDoc(doc(db, 'setups', s.id), { ...s, userId: firebaseUser.uid });
             }
             for (const i of INITIAL_ITEMS) {
               await setDoc(doc(db, 'items', i.id), { ...i, userId: firebaseUser.uid });
             }
          } else {
             setSetups(loadedSetups.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
             setItems(loadedItems);
          }
          setDataLoaded(true);
        } catch (err) {
          console.error("Error fetching data:", err);
          setDataLoaded(true); // Proceed anyway, but maybe empty
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setSetups([]);
        setItems([]);
        setDataLoaded(false);
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Remove old localstorage sync for setups/items


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
    if (user) {
      deleteDoc(doc(db, 'setups', setupId)).catch(console.error);
      // We should technically delete all items from firestore as well, but for simplicity we'll just delete them locally here. To be thorough:
      items.filter(i => i.setupId === setupId).forEach(item => {
         deleteDoc(doc(db, 'items', item.id)).catch(console.error);
      });
    }
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
    if (user) {
      setDoc(doc(db, 'items', newItem.id), { ...newItem, userId: user.uid }).catch(console.error);
    }
  };

  // Update item
  const handleUpdateItem = (itemId: string, updated: Partial<SetupItem>) => {
    setItems((prev) => {
      const newItems = prev.map((i) => (i.id === itemId ? { ...i, ...updated } : i));
      if (user) {
        const itemToUpdate = newItems.find(i => i.id === itemId);
        if (itemToUpdate) {
          setDoc(doc(db, 'items', itemId), { ...itemToUpdate, userId: user.uid }, { merge: true }).catch(console.error);
        }
      }
      return newItems;
    });
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (user) {
      deleteDoc(doc(db, 'items', itemId)).catch(console.error);
    }
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
        if (user) {
          newItems.forEach(item => {
            setDoc(doc(db, 'items', item.id), { ...item, userId: user.uid }).catch(console.error);
          });
        }
      }
    } catch (err) {
      console.error('Failed to suggest items:', err);
    } finally {
      setIsSuggestingItems(false);
    }
  };

  const activeSetup = setups.find((s) => s.id === activeSetupId);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#03050a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode) {
      return <AuthPage initialMode={authMode} onBack={() => setAuthMode(null)} onSuccess={() => {}} />;
    }
    return <LandingPage onNavigateToAuth={(mode) => setAuthMode(mode)} />;
  }

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-[#03050a] flex items-center justify-center flex-col space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        <div className="text-slate-400 text-sm font-semibold tracking-widest uppercase">Loading your setups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 font-sans antialiased selection:bg-blue-600/30 selection:text-white flex flex-col relative overflow-hidden">
      {/* Stars Background */}
      <StarsBackground />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col min-h-screen">
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
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 relative z-10 pb-12">
        {activeTracker ? (
          <TrackerPage
            items={items}
            setups={setups}
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
      </div>

      {/* New Setup Modal */}
      <NewSetupModal
        isOpen={isNewSetupModalOpen}
        onClose={() => setIsNewSetupModalOpen(false)}
        onCreateSetup={handleCreateSetup}
      />

    </div>
  );
}
