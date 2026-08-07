const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

const oldDropdown = `{/* Regular Application User Dropdown */}
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
                    className="w-full text-left px-3.5 py-2 text-red-400 hover:bg-red-500/10 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}`;

const newDropdown = `{/* Regular Application User Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden text-sm text-slate-200">
                {/* Profile Header */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[2px]">
                      <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {firstName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-base">{firstName} {lastName}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">{userEmail}</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-2.5 flex items-center justify-between border border-blue-500/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse"></div>
                      <span className="text-xs font-semibold text-blue-300">Pro Member</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Active</span>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm leading-none mb-1">Account Settings</span>
                      <span className="text-xs text-slate-500 leading-none">Profile & personal details</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('preferences');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-none mb-1">Preferences</span>
                        <span className="text-xs text-slate-500 leading-none">Currency & location</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                      {currentCurrency.code}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('security');
                      setIsSettingsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm leading-none mb-1">Security</span>
                      <span className="text-xs text-slate-500 leading-none">Passwords & auth</span>
                    </div>
                  </button>
                </div>

                {/* Footer Actions */}
                <div className="p-2 border-t border-slate-800 bg-slate-900/50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm">Log Out</span>
                  </button>
                </div>
              </div>
            )}`;

code = code.replace(oldDropdown, newDropdown);

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed premium header dropdown');
