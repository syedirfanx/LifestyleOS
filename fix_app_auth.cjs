const fs = require('fs');
let code = fs.readFileSync('./src/App.tsx', 'utf-8');

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
import { AuthPage } from './components/AuthPage';`;

code = code.replace(/import React, \{ useState, useEffect, useCallback \} from 'react';[\s\S]*?import \{ TrackerPage \} from '\.\/components\/TrackerPage';/, imports);

const oldAppStart = `export default function App() {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {`;

const newAppStart = `export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lifestyle_os_auth') === 'true';
  });
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {`;

code = code.replace(oldAppStart, newAppStart);

const oldReturn = `  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 font-sans antialiased selection:bg-blue-600/30 selection:text-white flex flex-col relative overflow-hidden">
      {/* Stars Background */}
      <StarsBackground />

      {/* Top Header */}`;

const newReturn = `  if (!isAuthenticated) {
    if (authMode) {
      return <AuthPage initialMode={authMode} onBack={() => setAuthMode(null)} onSuccess={() => setIsAuthenticated(true)} />;
    }
    return <LandingPage onNavigateToAuth={(mode) => setAuthMode(mode)} />;
  }

  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 font-sans antialiased selection:bg-blue-600/30 selection:text-white flex flex-col relative overflow-hidden">
      {/* Stars Background */}
      <StarsBackground />

      {/* Top Header */}`;

code = code.replace(oldReturn, newReturn);

fs.writeFileSync('./src/App.tsx', code);
console.log('Fixed App.tsx for Auth');
