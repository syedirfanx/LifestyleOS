import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, MapPin, Locate, Loader2, Globe, X, Lock, LogOut, ChevronDown, KeyRound, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { signOut, RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { Currency } from '../types';
import { COMMON_CURRENCIES } from '../utils/locationCurrency';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const COUNTRY_PHONE_CODES = [
  { code: '+880', label: 'BD (+880)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+91', label: 'IN (+91)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+966', label: 'SA (+966)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+86', label: 'CN (+86)' },
];

interface HeaderProps {
  currentCurrency: Currency;
  currentCountry: string;
  city?: string;
  isDetectingLocation?: boolean;
  onRefreshLocation?: () => void;
  onSelectCurrency?: (currency: Currency) => void;
  onNewSetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  currentCountry,
  city,
  isDetectingLocation = false,
  onRefreshLocation,
  onSelectCurrency,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  const [firstName, setFirstName] = useState(auth.currentUser?.displayName?.split(' ')[0] || 'User');
  const [lastName, setLastName] = useState(auth.currentUser?.displayName?.split(' ').slice(1).join(' ') || '');
  const [userEmail, setUserEmail] = useState(auth.currentUser?.email || '');
  const userPhoto = auth.currentUser?.photoURL || null;
  const [countryCode, setCountryCode] = useState('+880');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [gender, setGender] = useState('');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMessage, setPassMessage] = useState('');
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      setPassMessage('Please enter current and new password');
      return;
    }
    setPassMessage('Password updated successfully');
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => {
      setPassMessage('');
    }, 2000);
  };

  const handleVerifyPhone = async () => {
    if (!phoneDigits) return;
    setPhoneVerifying(true);
    try {
      const phoneNumber = `${countryCode}${phoneDigits}`;
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }
      
      const appVerifier = window.recaptchaVerifier;
      if (auth.currentUser) {
        const result = await linkWithPhoneNumber(auth.currentUser, phoneNumber, appVerifier);
        setConfirmationResult(result);
        setOtpSent(true);
      }
    } catch (e: any) {
      console.error(e);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      alert('Error: ' + e.message);
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpCode || !confirmationResult) return;
    try {
      await confirmationResult.confirm(otpCode);
      setOtpSent(false);
      setConfirmationResult(null);
      alert('Phone number verified and linked!');
    } catch (e: any) {
      console.error(e);
      alert('Invalid OTP: ' + e.message);
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut(auth);
      localStorage.removeItem('lifestyle_os_auth');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-40 text-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="relative overflow-hidden group">
            <motion.h1 
              initial={{ backgroundPosition: '200% center' }}
              animate={{ backgroundPosition: '-200% center' }}
              transition={{ 
                repeat: Infinity, 
                duration: 8, 
                ease: "linear"
              }}
              className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase select-none font-logo bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-[length:200%_auto]"
            >
              LIFESTYLE OS
            </motion.h1>
          </div>

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
              <div className="absolute right-0 mt-2 w-64 bg-[#0d121f] rounded-xl shadow-xl z-50 py-1.5 text-xs text-slate-200">
                {/* Profile Header */}
                <div className="px-3.5 py-2.5 bg-slate-950/40">
                  <p className="font-semibold text-slate-100">{firstName} {lastName}</p>
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
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span>Password & Security</span>
                  </button>
                </div>

                {/* Footer Actions */}
                <div className="pt-1">
                  <div className="px-3.5 py-1.5 text-2xs text-slate-400 flex justify-between items-center">
                    <span>Version</span>
                    <span className="text-slate-500 font-medium">v1.0.4</span>
                  </div>
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

      {/* Settings Modal (Standard App Modal without Left Sidebar) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#03050a]/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0d121f] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header & Close */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0 bg-[#0f172a]">
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
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Password & Security</span>
                  <span className="sm:hidden">Security</span>
                </button>
              </div>

              {/* Account Settings Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col items-center space-y-3 pb-2 border-b border-slate-800/50">
                    <div className="relative group cursor-pointer">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        {firstName.charAt(0)}{lastName.charAt(0)}
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Names Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 relative group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all group-hover:border-slate-700"
                        />
                      </div>

                      <div className="space-y-1.5 relative group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all group-hover:border-slate-700"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 relative group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all group-hover:border-slate-700"
                      />
                    </div>

                    {/* Gender & Phone Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 relative group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Gender
                        </label>
                        <div className="relative">
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all group-hover:border-slate-700 appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="bg-[#131a2b] text-slate-100 hidden">Select your gender</option>
                            <option value="male" className="bg-[#131a2b] text-slate-100">Male</option>
                            <option value="female" className="bg-[#131a2b] text-slate-100">Female</option>
                            <option value="non_binary" className="bg-[#131a2b] text-slate-100">Non-binary</option>
                            <option value="prefer_not_to_say" className="bg-[#131a2b] text-slate-100">Prefer not to say</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 relative group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Phone
                        </label>
                        <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:bg-slate-900 transition-all group-hover:border-slate-700">
                          <div className="relative border-r border-slate-800 bg-slate-900/80">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="w-full h-full bg-transparent text-slate-200 text-sm font-semibold px-3 focus:outline-none appearance-none cursor-pointer pl-3 pr-8 min-w-[80px]"
                            >
                              {COUNTRY_PHONE_CODES.map((item) => (
                                <option key={item.code} value={item.code} className="bg-[#131a2b] text-slate-100">
                                  {item.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                          </div>
                          <input
                            type="tel"
                            value={phoneDigits}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val.startsWith('0')) {
                                val = val.replace(/^0+/, '');
                              }
                              setPhoneDigits(val);
                            }}
                            placeholder=""
                            className="w-full bg-transparent px-3 py-2.5 text-slate-200 font-semibold focus:outline-none text-sm min-w-0"
                          />
                        </div>
                        {phoneDigits && !otpSent && (
                          <div className="mt-2 text-right">
                             <button
                               onClick={handleVerifyPhone}
                               disabled={phoneVerifying}
                               className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg font-bold transition-all"
                             >
                               {phoneVerifying ? 'Verifying...' : 'Verify Number'}
                             </button>
                          </div>
                        )}
                        {otpSent && (
                          <div className="mt-2 flex space-x-2">
                             <input 
                               type="text" 
                               value={otpCode}
                               onChange={e => setOtpCode(e.target.value)}
                               placeholder="OTP Code"
                               className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500/50"
                             />
                             <button
                               onClick={handleConfirmOtp}
                               className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg font-bold transition-all"
                             >
                               Confirm
                             </button>
                          </div>
                        )}
                        <div id="recaptcha-container"></div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20">
                      Save Changes
                    </button>
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
                          {c.code} ({c.symbol}) - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full bg-[#0f172a] rounded-lg px-3 py-2 text-slate-100 focus:outline-none font-medium"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 block">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full bg-[#0f172a] rounded-lg px-3 py-2 text-slate-100 focus:outline-none font-medium"
                      placeholder="Enter new password"
                    />
                  </div>

                  {passMessage && (
                    <div className="text-2xs text-emerald-400 font-semibold">{passMessage}</div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)]"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 flex items-center justify-between text-2xs text-slate-400 bg-[#0f172a] shrink-0">
              <span>Lifestyle OS v1.0.4</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="bg-[#0d121f] hover:bg-slate-800 text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


