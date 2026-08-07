const fs = require('fs');
let code = fs.readFileSync('./src/components/Header.tsx', 'utf-8');

const oldTrigger = `{/* User Account Trigger Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-xs">
                {firstName.charAt(0)}
              </div>
              <span className="text-sm font-bold hidden sm:inline">{firstName}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>`;

const newTrigger = `{/* User Account Trigger Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 sm:gap-3 p-1.5 sm:pr-4 rounded-full bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 hover:shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-all duration-300 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-inner">
                {firstName.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col items-start justify-center pr-1">
                <span className="text-xs font-bold text-slate-200 leading-tight">{firstName}</span>
                <span className="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest leading-none mt-0.5">Pro Member</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>`;

code = code.replace(oldTrigger, newTrigger);

fs.writeFileSync('./src/components/Header.tsx', code);
console.log('Fixed premium header trigger');
