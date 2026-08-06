const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

// Replace active profile tab design
const profileTabRegex = /\{\/\* Account Settings Tab \*\/\}[\s\S]*?\{\/\* Preferences Tab \*\/\}/;
const profileTabReplacement = `{/* Account Settings Tab */}
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
                            placeholder="1712345678"
                            className="w-full bg-transparent px-3 py-2.5 text-slate-200 font-semibold focus:outline-none text-sm min-w-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}`;

code = code.replace(profileTabRegex, profileTabReplacement);

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('updated header profile');
