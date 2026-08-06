const fs = require('fs');
let code = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');

const calcReplace = `
  const totalDreamCost = items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  
  const purchasedItems = items.filter(i => i.status === 'Purchased');
  const purchasedValue = purchasedItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  const outstandingDreamValue = totalDreamCost - purchasedValue;

  const monthlyEMI = items.filter(i => i.paymentMethod === 'EMI' && i.status === 'Purchased').reduce((sum, item) => sum + (item.paymentDetails?.monthlyEMI || 0), 0);
  const monthlyLoans = items.filter(i => i.paymentMethod === 'Loan' && i.status === 'Purchased').reduce((sum, item) => sum + (item.paymentDetails?.monthlyPayment || 0), 0);
  
  // Recurring Expenses are calculated from setups that have category === '💳 Recurring Expenses'
  const recurringSetupIds = setups.filter(s => s.category === '💳 Recurring Expenses').map(s => s.id);
  const recurringItems = items.filter(i => recurringSetupIds.includes(i.setupId) && i.status === 'Purchased');
  
  const getSubCatMonthlySum = (subCategoryMatch) => {
    const sIds = setups.filter(s => s.category === '💳 Recurring Expenses' && s.subCategory === subCategoryMatch).map(s => s.id);
    return items.filter(i => sIds.includes(i.setupId) && i.status === 'Purchased').reduce((sum, item) => sum + (item.paymentDetails?.monthlyCost || 0), 0);
  };

  const monthlyRent = getSubCatMonthlySum('Housing');
  const monthlyUtilities = getSubCatMonthlySum('Utilities');
  const monthlySubscriptions = getSubCatMonthlySum('Subscriptions');
  const monthlyMemberships = getSubCatMonthlySum('Memberships');
  const monthlyInsurance = getSubCatMonthlySum('Insurance');

  const totalMonthlyCommitment = monthlyEMI + monthlyLoans + recurringItems.reduce((sum, i) => sum + (i.paymentDetails?.monthlyCost || 0), 0);
`;

const startIndex = code.indexOf('const totalDreamCost = items.reduce(');
const endIndex = code.indexOf('  const getSetupCost = (setupId: string) => {');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.slice(0, startIndex) + calcReplace + code.slice(endIndex);
}

// Update the Monthly Commitments UI
const oldGrid = `          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 pt-4 border-t border-slate-800/50">
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
          </div>`;

const newGrid = `          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 pt-4 border-t border-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">EMI</span>
              <span className="text-xs font-bold text-slate-200">{monthlyEMI.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Loans</span>
              <span className="text-xs font-bold text-slate-200">{monthlyLoans.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Rent</span>
              <span className="text-xs font-bold text-slate-200">{monthlyRent.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Utilities</span>
              <span className="text-xs font-bold text-slate-200">{monthlyUtilities.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Subs</span>
              <span className="text-xs font-bold text-slate-200">{monthlySubscriptions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Memberships</span>
              <span className="text-xs font-bold text-slate-200">{monthlyMemberships.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-400 uppercase">Insurance</span>
              <span className="text-xs font-bold text-slate-200">{monthlyInsurance.toLocaleString()}</span>
            </div>
          </div>`;
          
code = code.replace(oldGrid, newGrid);

// Update trackers
const trackersOld = `<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        </div>`;

const trackersNew = `<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => onNavigateToTracker?.('emi')} className="bg-[#0d121f] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#131a2b] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">EMI Tracker</span>
          </button>
          
          <button onClick={() => onNavigateToTracker?.('loans')} className="bg-[#0d121f] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#131a2b] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Loan Tracker</span>
          </button>

          <button onClick={() => onNavigateToTracker?.('recurring')} className="bg-[#0d121f] border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#131a2b] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Recurring Expenses</span>
          </button>
        </div>`;

code = code.replace(trackersOld, trackersNew);
fs.writeFileSync('./src/components/Dashboard.tsx', code);
console.log('Dashboard calculations updated');
