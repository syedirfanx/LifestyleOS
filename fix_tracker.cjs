const fs = require('fs');

let code = `
import React from 'react';
import { SetupItem, Currency, Setup } from '../types';
import { ArrowLeft } from 'lucide-react';

interface TrackerPageProps {
  items: SetupItem[];
  setups: Setup[];
  currency: Currency;
  trackerType: 'emi' | 'loans' | 'recurring';
  onBack: () => void;
}

export const TrackerPage: React.FC<TrackerPageProps> = ({ items, setups, currency, trackerType, onBack }) => {
  let title = '';
  let filteredItems: SetupItem[] = [];

  const recurringSetupIds = setups.filter(s => s.category === '💳 Recurring Expenses').map(s => s.id);

  if (trackerType === 'emi') {
    title = 'EMI Tracker';
    filteredItems = items.filter(i => i.paymentMethod === 'EMI');
  } else if (trackerType === 'loans') {
    title = 'Loans';
    filteredItems = items.filter(i => i.paymentMethod === 'Loan');
  } else if (trackerType === 'recurring') {
    title = 'Recurring Expenses';
    filteredItems = items.filter(i => recurringSetupIds.includes(i.setupId));
  }

  // Helper to group items by Setup Type for recurring
  const groupedItems = filteredItems.reduce((acc, item) => {
    const setup = setups.find(s => s.id === item.setupId);
    const subCat = setup?.subCategory || setup?.title || 'Other';
    if (!acc[subCat]) acc[subCat] = [];
    acc[subCat].push(item);
    return acc;
  }, {} as Record<string, SetupItem[]>);

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            onBack();
          }}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#0e1422] rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-[#0d121f] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.08)] text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-400">
            {filteredItems.length} active {title.toLowerCase()}
          </p>
        </div>
      </div>

      {trackerType !== 'recurring' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const setup = setups.find(s => s.id === item.setupId);
            return (
            <div key={item.id} className="bg-[#0d121f] rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-400 mb-1">
                  {setup?.title || 'Item'}
                </div>
                <h3 className="text-base font-bold text-slate-100">{item.name}</h3>
                {(item.brand || item.model) && (
                  <p className="text-xs text-slate-400 font-medium">
                    {[item.brand, item.model].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>

              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 space-y-2">
                {trackerType === 'emi' && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium text-xs">Monthly EMI</span>
                      <span className="text-white font-bold">{item.paymentDetails?.monthlyEMI?.toLocaleString() || 0} {currency.code}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium text-xs">Remaining</span>
                      <span className="text-slate-300 font-semibold">{item.paymentDetails?.remainingAmount || 0} Installments</span>
                    </div>
                  </>
                )}

                {trackerType === 'loans' && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium text-xs">Monthly Payment</span>
                      <span className="text-white font-bold">{item.paymentDetails?.monthlyPayment?.toLocaleString() || 0} {currency.code}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium text-xs">Remaining Bal.</span>
                      <span className="text-slate-300 font-semibold">{item.paymentDetails?.remainingAmount?.toLocaleString() || 0} {currency.code}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )})}
          {filteredItems.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 text-sm">
              No active {title.toLowerCase()} found.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([groupName, groupItems]) => (
            <div key={groupName} className="space-y-4">
              <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">{groupName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupItems.map(item => (
                  <div key={item.id} className="bg-[#0d121f] rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{item.name}</h3>
                      <div className="text-xs font-semibold uppercase tracking-wide text-blue-400 mt-1">
                        {item.status}
                      </div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium text-xs">Monthly Cost</span>
                        <span className="text-white font-bold">{(item.paymentDetails?.monthlyCost || item.estimatedPrice).toLocaleString()} {currency.code}</span>
                      </div>
                      {item.paymentDetails?.nextBillingDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium text-xs">Next Due</span>
                          <span className="text-slate-300 font-semibold">{new Date(item.paymentDetails.nextBillingDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {item.paymentDetails?.billingCycle && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium text-xs">Cycle</span>
                          <span className="text-slate-300 font-semibold">{item.paymentDetails.billingCycle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 text-sm">
              No active {title.toLowerCase()} found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync('./src/components/TrackerPage.tsx', code);
console.log('TrackerPage updated');
