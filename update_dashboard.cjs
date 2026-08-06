const fs = require('fs');
let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

// Replace monthly commitments border
code = code.replace(
  'className="bg-[#0d121f] rounded-3xl p-6 relative overflow-hidden shadow-sm text-white border border-slate-800"',
  'className="bg-[#0d121f] rounded-3xl p-6 relative overflow-hidden shadow-sm text-white"'
);

// Replace trackers section
const trackersRegex = /\{\/\* Trackers Section \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
const trackersReplacement = `{/* Trackers Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Trackers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => onNavigateToTracker?.('emi')} className="bg-[#0d121f] p-5 rounded-2xl flex items-center justify-between hover:bg-[#131a2b] transition-colors group">
            <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">EMI Tracker</span>
            <div className="text-xl font-black text-blue-400">
              {monthlyEMI.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{currency.code}</span>
            </div>
          </button>
             
          <button onClick={() => onNavigateToTracker?.('loans')} className="bg-[#0d121f] p-5 rounded-2xl flex items-center justify-between hover:bg-[#131a2b] transition-colors group">
            <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">Loan Tracker</span>
            <div className="text-xl font-black text-emerald-400">
              {monthlyLoans.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{currency.code}</span>
            </div>
          </button>

          <button onClick={() => onNavigateToTracker?.('recurring')} className="bg-[#0d121f] p-5 rounded-2xl flex items-center justify-between hover:bg-[#131a2b] transition-colors group">
            <span className="text-sm font-bold text-slate-200 group-hover:text-purple-400 transition-colors">Recurring</span>
            <div className="text-xl font-black text-purple-400">
              {purchasedRecurringItems.reduce((sum, i) => sum + (i.paymentDetails?.monthlyCost || i.estimatedPrice || 0), 0).toLocaleString()} <span className="text-xs font-semibold text-slate-500">{currency.code}</span>
            </div>
          </button>
        </div>
      </div>`;

code = code.replace(trackersRegex, trackersReplacement);

fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('updated dashboard');
