const fs = require('fs');

let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

const importsToAdd = `
import { CreditCard, CalendarClock, Home, Landmark } from 'lucide-react';
`;

code = code.replace("import { AreaIcon } from './AreaIcon';", "import { AreaIcon } from './AreaIcon';\n" + importsToAdd);

code = code.replace('interface DashboardProps {', `
interface DashboardProps {
  onNavigateToTracker?: (tracker: 'emi' | 'subscriptions' | 'loans' | 'rent') => void;
`);

code = code.replace('onDeleteSetup,', 'onDeleteSetup,\n  onNavigateToTracker,');

// We need to calculate values inside Dashboard component:
const calculations = `
  const totalDreamCost = items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  
  const purchasedItems = items.filter(i => i.status === 'Purchased');
  const purchasedValue = purchasedItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  const outstandingDreamValue = totalDreamCost - purchasedValue;

  const monthlyEMI = items.filter(i => i.paymentMethod === 'EMI').reduce((sum, item) => sum + (item.paymentDetails?.monthlyEMI || 0), 0);
  const monthlySubscriptions = items.filter(i => i.paymentMethod === 'Subscription' && (!item.paymentDetails?.billingCycle || item.paymentDetails?.billingCycle === 'Monthly')).reduce((sum, item) => sum + (item.paymentDetails?.monthlyCost || 0), 0);
  const monthlyLoans = items.filter(i => i.paymentMethod === 'Loan').reduce((sum, item) => sum + (item.paymentDetails?.monthlyPayment || 0), 0);
  const monthlyRent = items.filter(i => i.paymentMethod === 'Rent').reduce((sum, item) => sum + (item.paymentDetails?.monthlyCost || 0), 0);
  const totalMonthlyCommitment = monthlyEMI + monthlySubscriptions + monthlyLoans + monthlyRent;
`;

code = code.replace('const totalDreamCost = items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);', calculations);

const heroSectionReplace = `
      {/* Grand Total Hero Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dream Worth */}
        <div className="bg-[#0d121f] rounded-3xl p-6 relative overflow-hidden shadow-sm text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">Total Dream Worth</span>
          <div className="text-3xl font-black text-white tracking-tight mt-1">
            {totalDreamCost.toLocaleString()} <span className="text-sm font-semibold text-slate-400">{currency.code}</span>
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-800/50">
            <div>
              <div className="text-xs font-semibold text-slate-400">Purchased Value</div>
              <div className="text-sm font-bold text-slate-200">{purchasedValue.toLocaleString()} {currency.code}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400">Outstanding</div>
              <div className="text-sm font-bold text-slate-200">{outstandingDreamValue.toLocaleString()} {currency.code}</div>
            </div>
          </div>
        </div>

        {/* Monthly Commitments */}
        <div className="bg-[#0d121f] rounded-3xl p-6 relative overflow-hidden shadow-sm text-white border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Monthly Commitments</span>
          <div className="text-3xl font-black text-white tracking-tight mt-1">
            {totalMonthlyCommitment.toLocaleString()} <span className="text-sm font-semibold text-slate-400">{currency.code}</span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 pt-4 border-t border-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">EMI</span>
              <span className="text-xs font-bold text-slate-200">{monthlyEMI.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Loans</span>
              <span className="text-xs font-bold text-slate-200">{monthlyLoans.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Subs</span>
              <span className="text-xs font-bold text-slate-200">{monthlySubscriptions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Rent</span>
              <span className="text-xs font-bold text-slate-200">{monthlyRent.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trackers Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Trackers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => onNavigateToTracker?.('emi')} className="bg-[#0d121f] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#131a2b] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">EMI</span>
          </button>
          
          <button onClick={() => onNavigateToTracker?.('subscriptions')} className="bg-[#0d121f] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#131a2b] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Subscriptions</span>
          </button>

          <button onClick={() => onNavigateToTracker?.('loans')} className="bg-[#0d121f] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#131a2b] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Loans</span>
          </button>

          <button onClick={() => onNavigateToTracker?.('rent')} className="bg-[#0d121f] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#131a2b] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Rent</span>
          </button>
        </div>
      </div>
`;

// Replace the old Grand Total Hero Summary with the new one:
const startString = '{/* Grand Total Hero Summary */}';
const endString = '{/* Setups Grid */}';

const startIndex = code.indexOf(startString);
const endIndex = code.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.slice(0, startIndex) + heroSectionReplace + code.slice(endIndex);
}

fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('Done replacing dashboard summary cards.');
