const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

const functionsCode = `  const handleVerifyPhone = async () => {
    if (!phoneDigits) return;
    setPhoneVerifying(true);
    try {
      const phoneNumber = \`\${countryCode}\${phoneDigits}\`;
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

  const handleLogout`;

code = code.replace("  const handleLogout", functionsCode);

// Add global declaration for recaptchaVerifier
const globalDecl = `declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const COUNTRY_PHONE_CODES`;

code = code.replace("const COUNTRY_PHONE_CODES", globalDecl);

const uiCode = `                    {/* Gender & Phone Grid */}
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
                    </div>`;

const originalUICodeStart = `                    {/* Gender & Phone Grid */}`;
const originalUICodeEnd = `                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">`;

const fullOriginalUI = code.substring(
  code.indexOf(originalUICodeStart),
  code.indexOf(originalUICodeEnd)
);

code = code.replace(fullOriginalUI, uiCode + '\n');

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed Header phone auth');
