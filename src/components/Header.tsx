import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, MapPin, Locate, Loader2, Globe, X, Lock, LogOut, ChevronDown, Shield, Trash2, AlertTriangle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { Currency } from '../types';
import { COMMON_CURRENCIES } from '../utils/locationCurrency';

interface HeaderProps {
  currentCurrency: Currency;
  currentCountry: string;
  city?: string;
  isDetectingLocation?: boolean;
  onRefreshLocation?: () => void;
  onSelectCurrency?: (currency: Currency) => void;
  onNewSetup: () => void;
  onHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  currentCountry,
  city,
  isDetectingLocation = false,
  onRefreshLocation,
  onSelectCurrency,
  onHome,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  const currentUser = auth.currentUser;
  const userPhoto = currentUser?.photoURL || null;
  const userEmail = currentUser?.email || '';

  const [displayName, setDisplayName] = useState(currentUser?.displayName || 'User');
  const [gender, setGender] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Account deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user profile & stored gender from Firestore and localStorage
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      if (user.displayName) {
        setDisplayName(user.displayName);
      }

      const localGender = localStorage.getItem(`lifestyle_user_gender_${user.uid}`);
      if (localGender) {
        setGender(localGender);
      }

      // Check Firestore users collection
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.gender) {
            setGender(data.gender);
            localStorage.setItem(`lifestyle_user_gender_${user.uid}`, data.gender);
          }
          if (data.displayName) {
            setDisplayName(data.displayName);
          }
        }
      } catch {
        // Fallback: check prayerSettings document if users collection is not yet permitted
        try {
          const pRef = doc(db, 'prayerSettings', user.uid);
          const pSnap = await getDoc(pRef);
          if (pSnap.exists()) {
            const data = pSnap.data();
            if (data.gender) {
              setGender(data.gender);
              localStorage.setItem(`lifestyle_user_gender_${user.uid}`, data.gender);
            }
          }
        } catch {
          // ignore
        }
      }
    };

    loadUserData();
  }, [isSettingsModalOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const handleSaveSettings = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsSettingsModalOpen(false);
      return;
    }

    setIsSaving(true);
    const trimmedName = displayName.trim() || user.displayName || 'User';

    // 1. Persist locally for immediate offline cache
    if (gender) {
      localStorage.setItem(`lifestyle_user_gender_${user.uid}`, gender);
    }
    localStorage.setItem(`lifestyle_user_name_${user.uid}`, trimmedName);

    // 3. Persist profile info to Firestore users collection
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(
        userDocRef,
        {
          userId: user.uid,
          displayName: trimmedName,
          email: user.email || '',
          gender: gender || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err: any) {
      console.warn('Could not save to users collection, trying prayerSettings fallback:', err?.message || err);
      // Fallback: save to prayerSettings which already has rule permissions configured
      try {
        const prayerDocRef = doc(db, 'prayerSettings', user.uid);
        await setDoc(
          prayerDocRef,
          {
            userId: user.uid,
            gender: gender || '',
            displayName: trimmedName,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fallbackErr: any) {
        console.warn('Fallback sync also unavailable:', fallbackErr?.message || fallbackErr);
      }
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSettingsModalOpen(false);
    }, 400);
    setIsSaving(false);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut(auth);
      localStorage.removeItem('lifestyle_os_auth');
      localStorage.removeItem('lifestyle_prayer_records');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (deleteConfirmText.trim().toLowerCase() !== 'delete') {
      setDeleteError('Type DELETE in the box below to proceed.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError('');

    try {
      const uid = user.uid;

      // 1. Delete user setups from Firestore
      try {
        const setupsSnap = await getDocs(query(collection(db, 'setups'), where('userId', '==', uid)));
        const deleteSetupPromises = setupsSnap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deleteSetupPromises);
      } catch (err) {
        console.warn('Error deleting setups:', err);
      }

      // 2. Delete user items from Firestore
      try {
        const itemsSnap = await getDocs(query(collection(db, 'items'), where('userId', '==', uid)));
        const deleteItemPromises = itemsSnap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deleteItemPromises);
      } catch (err) {
        console.warn('Error deleting items:', err);
      }

      // 3. Delete user prayer logs
      try {
        const prayerLogsSnap = await getDocs(query(collection(db, 'prayerLogs'), where('userId', '==', uid)));
        const deleteLogsPromises = prayerLogsSnap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deleteLogsPromises);
      } catch (err) {
        console.warn('Error deleting prayer logs:', err);
      }

      // 4. Delete user prayer settings
      try {
        await deleteDoc(doc(db, 'prayerSettings', uid));
      } catch (err) {
        console.warn('Error deleting prayer settings:', err);
      }

      // 5. Delete user profile document
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.warn('Error deleting user profile:', err);
      }

      // 6. Clear local storage
      localStorage.clear();

      // 7. Delete Firebase Auth user
      await deleteUser(user);

      setIsDeleteModalOpen(false);
      setIsSettingsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      if (err?.code === 'auth/requires-recent-login') {
        setDeleteError('For security, deleting your account requires a recent login. Please sign out, log in again, and retry.');
      } else {
        setDeleteError(err?.message || 'Failed to delete account. Please try again.');
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const firstName = displayName.split(' ')[0] || 'User';

  return (
    <>
      <header className="bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-40 text-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={onHome}
            className="text-left relative overflow-hidden group cursor-pointer focus:outline-none"
          >
            <motion.h1 
              initial={{ backgroundPosition: '200% center' }}
              animate={{ backgroundPosition: '-200% center' }}
              transition={{ 
                repeat: Infinity, 
                duration: 8, 
                ease: "linear"
              }}
              className="text-xl sm:text-2xl font-bold tracking-widest uppercase select-none font-logo bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-[length:200%_auto]"
            >
              LIFESTYLE OS
            </motion.h1>
          </button>

          {/* User Account Trigger Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 sm:gap-3 p-1.5 sm:pr-4 rounded-full bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 hover:shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-all duration-300 cursor-pointer"
            >
              {userPhoto ? (
                <img src={userPhoto} referrerPolicy="no-referrer" alt="Profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 shadow-inner object-cover" />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-inner">
                  {firstName.charAt(0)}
                </div>
              )}
              <div className="hidden sm:flex flex-col items-start justify-center pr-1">
                <span className="text-xs font-bold text-slate-200 leading-tight">{firstName}</span>
                <span className="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest leading-none mt-0.5">Pro Member</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Regular Application User Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0d121f] rounded-xl shadow-xl z-50 py-1.5 text-xs text-slate-200 border border-slate-800/80">
                {/* Profile Header */}
                <div className="px-3.5 py-2.5 bg-slate-950/40">
                  <p className="font-semibold text-slate-100">{displayName}</p>
                  <p className="text-2xs text-slate-400 truncate mt-0.5">{userEmail}</p>
                </div>

                {/* Navigation Items */}
                <div className="py-1 text-slate-300">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-[#131a2b] hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('preferences');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-[#131a2b] hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span>Preferences</span>
                    </div>
                    <span className="text-2xs font-sans text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded font-semibold">
                      {currentCurrency.code}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('security');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-[#131a2b] hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Security</span>
                  </button>
                </div>

                {/* Footer Actions (Version removed) */}
                <div className="pt-1 border-t border-slate-800/60">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#03050a]/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0d121f] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] border border-slate-800">
            {/* Modal Header & Close */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0 bg-[#0f172a] border-b border-slate-800/80">
              <h3 className="text-base font-bold text-white">
                Settings
              </h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 bg-[#0d121f]">
              {/* Top Tab Bar */}
              <div className="grid grid-cols-3 gap-1 bg-[#0f172a] p-1 rounded-xl text-2xs sm:text-xs font-medium">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 sm:px-2.5 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center space-x-1 sm:space-x-1.5 ${
                    activeTab === 'profile'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Account Settings</span>
                  <span className="sm:hidden">Account</span>
                </button>

                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`py-2 px-1 sm:px-2.5 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center space-x-1 sm:space-x-1.5 ${
                    activeTab === 'preferences'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>Preferences</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-2 px-1 sm:px-2.5 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center space-x-1 sm:space-x-1.5 ${
                    activeTab === 'security'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>Security</span>
                </button>
              </div>

              {/* Account Settings Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4 pt-2">
                  {/* Profile Image: kept from Gmail, no upload */}
                  <div className="flex flex-col items-center space-y-2 pb-3 border-b border-slate-800/50">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        referrerPolicy="no-referrer"
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-slate-700/80"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {displayName.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Name: Blocked as no change, like email */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Name
                        </label>
                        <span className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Cannot be changed</span>
                        </span>
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        disabled
                        readOnly
                        className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-400 text-sm font-semibold cursor-not-allowed select-none opacity-80"
                      />
                    </div>

                    {/* Email: Blocked as no change */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Email Address
                        </label>
                        <span className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Cannot be changed</span>
                        </span>
                      </div>
                      <input
                        type="email"
                        value={userEmail}
                        disabled
                        readOnly
                        className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-2.5 text-slate-400 text-sm font-semibold cursor-not-allowed select-none opacity-80"
                      />
                    </div>

                    {/* Gender Selection: Stored and saved for that user */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        Gender
                      </label>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all hover:border-slate-700 appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#131a2b] text-slate-400 hidden">Select your gender</option>
                          <option value="male" className="bg-[#131a2b] text-slate-100">Male</option>
                          <option value="female" className="bg-[#131a2b] text-slate-100">Female</option>
                          <option value="non_binary" className="bg-[#131a2b] text-slate-100">Non-binary</option>
                          <option value="prefer_not_to_say" className="bg-[#131a2b] text-slate-100">Prefer not to say</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-4 text-xs pt-1">
                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Current Location</span>
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0f172a]/40 rounded-xl p-3 gap-2">
                      <span className="text-slate-100 font-semibold">
                        {city ? `${city}, ${currentCountry}` : currentCountry}
                      </span>
                      <button
                        type="button"
                        onClick={onRefreshLocation}
                        disabled={isDetectingLocation}
                        className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-3 py-2 rounded-lg text-2xs transition-all duration-300 cursor-pointer disabled:opacity-50 font-bold shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-400/20"
                      >
                        {isDetectingLocation ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <Locate className="w-3.5 h-3.5 text-white" />
                        )}
                        <span>Detect GPS</span>
                      </button>
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Default Currency</span>
                    </label>
                    <select
                      value={currentCurrency.code}
                      onChange={(e) => {
                        const found = COMMON_CURRENCIES.find((c) => c.code === e.target.value);
                        if (found && onSelectCurrency) {
                          onSelectCurrency(found);
                        }
                      }}
                      className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none transition-colors cursor-pointer font-medium"
                    >
                      {COMMON_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#131a2b] text-slate-100">
                          {c.code} ({c.symbol}) : {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Security Tab (Password removed as authentication is passwordless) */}
              {activeTab === 'security' && (
                <div className="space-y-4 text-xs pt-1">
                  {/* Passwordless Sign-in Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      <span>Authentication Method</span>
                    </label>
                    <div className="bg-[#0f172a]/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Google Authentication</div>
                        <div className="text-2xs text-slate-400 mt-0.5">Passwordless sign-in active with your Google account</div>
                      </div>
                      <span className="text-2xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
                    <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-rose-200">Delete Account & All Data</div>
                        <div className="text-2xs text-rose-300/70 mt-0.5 max-w-sm">
                          Permanently delete your profile, setups, items, and prayer tracker logs. This action cannot be reversed.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmText('');
                          setDeleteError('');
                          setIsDeleteModalOpen(true);
                        }}
                        className="bg-rose-600/90 hover:bg-rose-600 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shrink-0 self-start sm:self-center cursor-pointer shadow-md shadow-rose-950"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (only in account and preferences, not in security) */}
            {activeTab !== 'security' && (
              <div className="px-5 py-3.5 flex items-center justify-end space-x-2 bg-[#0f172a] shrink-0 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="bg-[#0d121f] hover:bg-slate-800 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Caution & Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0b0f19] border border-rose-900/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-rose-950/50">
            {/* Header */}
            <div className="px-5 py-4 bg-rose-950/30 border-b border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-rose-300">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Permanently Delete Account</h3>
                  <div className="text-2xs text-rose-300/80">Irreversible action</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeletingAccount) setIsDeleteModalOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Caution Content */}
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3.5 space-y-2 text-rose-200">
                <div className="font-semibold text-rose-100 flex items-center gap-1.5">
                  <span>Warning: This cannot be undone</span>
                </div>
                <p className="text-2xs text-rose-200/80 leading-relaxed">
                  Deleting your account will immediately and permanently erase all your data from the database, including:
                </p>
                <ul className="text-2xs space-y-1 list-disc list-inside text-rose-300/90 pl-1">
                  <li>All setups and curated spaces</li>
                  <li>All setup items, categories, and cost breakdowns</li>
                  <li>All daily prayer tracking history, streaks, and settings</li>
                  <li>Your user profile and authentication record</li>
                </ul>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-2xs font-semibold text-slate-300 block">
                  To confirm, please type <span className="font-mono font-bold text-rose-400">DELETE</span> below:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  disabled={isDeletingAccount}
                  className="w-full bg-[#070b13] border border-slate-800 focus:border-rose-500/60 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs font-mono font-bold focus:outline-none transition-colors"
                />
              </div>

              {deleteError && (
                <div className="text-2xs text-rose-400 font-semibold bg-rose-950/50 p-2.5 rounded-lg border border-rose-900/40">
                  {deleteError}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3.5 bg-[#070b13] border-t border-slate-800/80 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-[#0f172a] hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim().toLowerCase() !== 'delete' || isDeletingAccount}
                onClick={handleDeleteAccount}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  deleteConfirmText.trim().toLowerCase() === 'delete' && !isDeletingAccount
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950'
                    : 'bg-rose-950/40 text-rose-400/40 cursor-not-allowed border border-rose-900/20'
                }`}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete My Account Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
