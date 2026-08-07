const fs = require('fs');

let code = fs.readFileSync('./src/App.tsx', 'utf-8');

// Imports
const imports = `import React, { useState, useEffect, useCallback } from 'react';
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
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';`;

code = code.replace(/import React, \{ useState, useEffect, useCallback \} from 'react';[\s\S]*?import \{ AuthPage \} from '\.\/components\/AuthPage';/, imports);

// Fix component start
const appStart = `export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);`;

code = code.replace(/export default function App\(\) \{[\s\S]*?const \[authMode, setAuthMode\] = useState<'login' \| 'register' \| null>\(null\);/, appStart);

// Remove localStorage initialization for setups and items, add loading states
code = code.replace(
  `  const [setups, setSetups] = useState<Setup[]>(() => {
    try {
      const saved = localStorage.getItem('dream_setups_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SETUPS;
  });`,
  `  const [setups, setSetups] = useState<Setup[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);`
);

code = code.replace(
  `  const [items, setItems] = useState<SetupItem[]>(() => {
    try {
      const saved = localStorage.getItem('dream_items_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ITEMS;
  });`,
  `  const [items, setItems] = useState<SetupItem[]>([]);`
);

// Add Firebase Auth Listener & Data Fetching
const firestoreSync = `
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
`;

code = code.replace(
  `  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dream_setup_currency', JSON.stringify(currentCurrency));
      localStorage.setItem('dream_setup_country', currentCountry);
      if (city) localStorage.setItem('dream_setup_city', city);
      localStorage.setItem('dream_setups_v3', JSON.stringify(setups));
      localStorage.setItem('dream_items_v3', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [currentCurrency, currentCountry, city, setups, items]);`,
  `  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dream_setup_currency', JSON.stringify(currentCurrency));
      localStorage.setItem('dream_setup_country', currentCountry);
      if (city) localStorage.setItem('dream_setup_city', city);
    } catch (e) {
      console.error(e);
    }
  }, [currentCurrency, currentCountry, city]);
${firestoreSync}`
);

// Update handleCreateSetup
code = code.replace(
  `    const newSetup: Setup = {
      ...setupPartial,
      id: \`setup-\${Date.now()}\`,
      createdAt: new Date().toISOString(),
    };
    setSetups((prev) => [newSetup, ...prev]);
    if (initialItems && initialItems.length > 0) {
      const createdItems: SetupItem[] = initialItems.map((item, idx) => ({
        ...item,
        id: \`item-init-\${Date.now()}-\${idx}\`,
        setupId: newSetup.id,
        quantity: item.quantity || 1,
      }));
      setItems((prev) => [...prev, ...createdItems]);
    }`,
  `    const newSetup: Setup = {
      ...setupPartial,
      id: \`setup-\${Date.now()}\`,
      createdAt: new Date().toISOString(),
    };
    
    setSetups((prev) => [newSetup, ...prev]);
    if (user) {
      setDoc(doc(db, 'setups', newSetup.id), { ...newSetup, userId: user.uid }).catch(console.error);
    }

    if (initialItems && initialItems.length > 0) {
      const createdItems: SetupItem[] = initialItems.map((item, idx) => ({
        ...item,
        id: \`item-init-\${Date.now()}-\${idx}\`,
        setupId: newSetup.id,
        quantity: item.quantity || 1,
      }));
      setItems((prev) => [...prev, ...createdItems]);
      if (user) {
        createdItems.forEach(item => {
          setDoc(doc(db, 'items', item.id), { ...item, userId: user.uid }).catch(console.error);
        });
      }
    }`
);

// Update handleDeleteSetup
code = code.replace(
  `  const handleDeleteSetup = (setupId: string) => {
    setSetups((prev) => prev.filter((s) => s.id !== setupId));
    setItems((prev) => prev.filter((i) => i.setupId !== setupId));`,
  `  const handleDeleteSetup = (setupId: string) => {
    setSetups((prev) => prev.filter((s) => s.id !== setupId));
    setItems((prev) => prev.filter((i) => i.setupId !== setupId));
    if (user) {
      deleteDoc(doc(db, 'setups', setupId)).catch(console.error);
      // We should technically delete all items from firestore as well, but for simplicity we'll just delete them locally here. To be thorough:
      items.filter(i => i.setupId === setupId).forEach(item => {
         deleteDoc(doc(db, 'items', item.id)).catch(console.error);
      });
    }`
);

// Update handleAddItem
code = code.replace(
  `  const handleAddItem = (itemPartial: Omit<SetupItem, 'id'>) => {
    const newItem: SetupItem = {
      ...itemPartial,
      id: \`item-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
    };
    setItems((prev) => [...prev, newItem]);
  };`,
  `  const handleAddItem = (itemPartial: Omit<SetupItem, 'id'>) => {
    const newItem: SetupItem = {
      ...itemPartial,
      id: \`item-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
    };
    setItems((prev) => [...prev, newItem]);
    if (user) {
      setDoc(doc(db, 'items', newItem.id), { ...newItem, userId: user.uid }).catch(console.error);
    }
  };`
);

// Update handleUpdateItem
code = code.replace(
  `  const handleUpdateItem = (itemId: string, updated: Partial<SetupItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updated } : i))
    );
  };`,
  `  const handleUpdateItem = (itemId: string, updated: Partial<SetupItem>) => {
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
  };`
);

// Update handleDeleteItem
code = code.replace(
  `  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };`,
  `  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (user) {
      deleteDoc(doc(db, 'items', itemId)).catch(console.error);
    }
  };`
);

// Update Auth return block
code = code.replace(
  `  if (!isAuthenticated) {
    if (authMode) {
      return <AuthPage initialMode={authMode} onBack={() => setAuthMode(null)} onSuccess={() => setIsAuthenticated(true)} />;
    }
    return <LandingPage onNavigateToAuth={(mode) => setAuthMode(mode)} />;
  }`,
  `  if (authChecking) {
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
  }`
);

// handleSuggestAiSetupItems - save items
code = code.replace(
  `        setItems((prev) => [...prev, ...newItems]);
      }
    } catch (err) {`,
  `        setItems((prev) => [...prev, ...newItems]);
        if (user) {
          newItems.forEach(item => {
            setDoc(doc(db, 'items', item.id), { ...item, userId: user.uid }).catch(console.error);
          });
        }
      }
    } catch (err) {`
);


fs.writeFileSync('./src/App.tsx', code);
console.log('Fixed App.tsx for Firebase sync');
