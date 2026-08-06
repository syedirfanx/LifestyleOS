import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, MapPin, Locate, Loader2, Globe, X, Lock, LogOut, ChevronDown, KeyRound, Shield } from 'lucide-react';
import { Currency } from '../types';
import { COMMON_CURRENCIES } from '../utils/locationCurrency';

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

  const [firstName, setFirstName] = useState('Syed');
  const [lastName, setLastName] = useState('Irfaan');
  const [userEmail, setUserEmail] = useState('syedirfaanx@gmail.com');
  const [countryCode, setCountryCode] = useState('+880');
  const [phoneDigits, setPhoneDigits] = useState('1712345678');
  const [gender, setGender] = useState('male');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMessage, setPassMessage] = useState('');

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

  const handleLogout = () => {
    setIsDropdownOpen(false);
    alert('Logged out successfully');
  };

  return (
    <>
      <header className="bg-teal-950 border-b border-teal-900/80 sticky top-0 z-40 text-white shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Lifestyle OS
            </h1>
          </div>

          {/* User Account Trigger Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2.5 bg-teal-900 hover:bg-teal-800/90 border border-teal-800/80 rounded-xl px-3.5 py-1.5 text-white transition-colors cursor-pointer shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 text-teal-950 flex items-center justify-center font-bold text-xs shrink-0">
                {firstName.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-white">{firstName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-teal-200" />
            </button>

            {/* Regular Application User Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs divide-y divide-slate-100 text-slate-800">
                {/* Profile Header */}
                <div className="px-3.5 py-2.5 bg-slate-50">
                  <p className="font-semibold text-teal-950">{firstName} {lastName}</p>
                  <p className="text-2xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                </div>

                {/* Navigation Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 hover:text-teal-950 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('preferences');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 hover:text-teal-950 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span>Preferences</span>
                    </div>
                    <span className="text-2xs font-mono text-teal-950 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-medium">
                      {currentCurrency.code}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('security');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 hover:text-teal-950 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Password & Security</span>
                  </button>
                </div>

                {/* Footer Actions */}
                <div className="pt-1">
                  <div className="px-3.5 py-1.5 text-2xs text-slate-400 flex justify-between items-center">
                    <span>Version</span>
                    <span className="font-mono text-slate-500">v1.0.4</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
            {/* Modal Header & Close */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
              <h3 className="text-base font-bold text-teal-950">
                Settings
              </h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Top Tab Bar */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-2xs sm:text-xs font-medium border border-slate-200/80">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 sm:px-2.5 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center space-x-1 sm:space-x-1.5 ${
                    activeTab === 'profile'
                      ? 'bg-teal-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
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
                      ? 'bg-teal-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>Preferences</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-2 px-1 sm:px-2.5 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center space-x-1 sm:space-x-1.5 ${
                    activeTab === 'security'
                      ? 'bg-teal-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Password & Security</span>
                  <span className="sm:hidden">Security</span>
                </button>
              </div>

              {/* Account Settings Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4 text-xs pt-1">
                  {/* Names Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 block">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 block">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & Gender Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 block">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-teal-900 focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="male" className="bg-white text-slate-900">Male</option>
                        <option value="female" className="bg-white text-slate-900">Female</option>
                        <option value="non_binary" className="bg-white text-slate-900">Non-binary</option>
                        <option value="prefer_not_to_say" className="bg-white text-slate-900">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone Number Full Width Row */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      Phone Number
                    </label>
                    <div className="flex rounded-lg border border-slate-200 bg-slate-50 focus-within:border-teal-900 transition-colors overflow-hidden">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-slate-100 text-slate-900 text-xs px-2.5 py-2 border-r border-slate-200 focus:outline-none cursor-pointer font-medium max-w-[120px] sm:max-w-none truncate"
                      >
                        {COUNTRY_PHONE_CODES.map((item) => (
                          <option key={item.code} value={item.code} className="bg-white text-slate-900">
                            {item.label}
                          </option>
                        ))}
                      </select>
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
                        placeholder="1712345678"
                        className="w-full bg-transparent px-3 py-2 text-slate-900 font-medium focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-4 text-xs pt-1">
                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Current Location</span>
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 gap-2">
                      <span className="text-slate-900 font-semibold">
                        {city ? `${city}, ${currentCountry}` : currentCountry}
                      </span>
                      <button
                        type="button"
                        onClick={onRefreshLocation}
                        disabled={isDetectingLocation}
                        className="flex items-center justify-center space-x-1.5 bg-teal-900 hover:bg-teal-950 text-white px-3 py-2 rounded-lg text-2xs transition-colors cursor-pointer disabled:opacity-50 font-medium shadow-2xs shrink-0"
                      >
                        {isDetectingLocation ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-200" />
                        ) : (
                          <Locate className="w-3.5 h-3.5 text-teal-200" />
                        )}
                        <span>Detect GPS</span>
                      </button>
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 transition-colors cursor-pointer font-medium"
                    >
                      {COMMON_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-white text-slate-900">
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
                    <label className="text-xs font-medium text-slate-700 block">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 font-medium"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 font-medium"
                      placeholder="Enter new password"
                    />
                  </div>

                  {passMessage && (
                    <div className="text-2xs text-emerald-600 font-semibold">{passMessage}</div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-teal-900 hover:bg-teal-950 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500 bg-slate-50/60 shrink-0">
              <span>Lifestyle OS v1.0.4</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="bg-teal-900 hover:bg-teal-950 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
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


