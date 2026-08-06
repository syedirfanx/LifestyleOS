import React from 'react';
import { Plus, Trash2, ChevronRight, Box } from 'lucide-react';
import { Setup, SetupItem, Currency } from '../types';
import { AreaIcon } from './AreaIcon';

import { CreditCard, CalendarClock, Home, Landmark } from 'lucide-react';



interface DashboardProps {
  onNavigateToTracker?: (tracker: 'emi' | 'loans' | 'recurring') => void;

  setups: Setup[];
  items: SetupItem[];
  currency: Currency;
  onSelectSetup: (setupId: string) => void;
  onNewSetup: () => void;
  onDeleteSetup: (setupId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setups,
  items,
  currency,
  onSelectSetup,
  onNewSetup,
  onDeleteSetup,
  onNavigateToTracker,
}) => {
  // Calculate total dream cost across all setups
  
  
const recurringSetupIds = setups.filter(s => s.category === 'Recurring Expenses').map(s => s.id);
  const assetItems = items.filter(i => !recurringSetupIds.includes(i.setupId));
  const recurringItems = items.filter(i => recurringSetupIds.includes(i.setupId));

  const totalDreamCost = assetItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  
  const purchasedItems = assetItems.filter(i => i.status === 'Purchased');
  const purchasedValue = purchasedItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
  const outstandingDreamValue = totalDreamCost - purchasedValue;

  const monthlyEMI = assetItems.filter(i => i.paymentMethod === 'EMI' && i.status === 'Purchased').reduce((sum, item) => sum + (item.paymentDetails?.monthlyEMI || 0), 0);
  const monthlyLoans = assetItems.filter(i => i.paymentMethod === 'Loan' && i.status === 'Purchased').reduce((sum, item) => sum + (item.paymentDetails?.monthlyPayment || 0), 0);
  
  const getSubCatMonthlySum = (subCategoryMatch) => {
    const sIds = setups.filter(s => s.category === 'Recurring Expenses' && s.subCategory === subCategoryMatch).map(s => s.id);
    return items.filter(i => sIds.includes(i.setupId) && i.status === 'Active').reduce((sum, item) => sum + (item.paymentDetails?.monthlyCost || item.estimatedPrice || 0), 0);
  };

  const monthlyRent = getSubCatMonthlySum('Housing');
  const monthlyUtilities = getSubCatMonthlySum('Utilities');
  const monthlySubscriptions = getSubCatMonthlySum('Subscriptions');
  const monthlyMemberships = getSubCatMonthlySum('Memberships');
  const monthlyInsurance = getSubCatMonthlySum('Insurance');

  const purchasedRecurringItems = recurringItems.filter(i => i.status === 'Active');
  const totalMonthlyCommitment = monthlyEMI + monthlyLoans + purchasedRecurringItems.reduce((sum, i) => sum + (i.paymentDetails?.monthlyCost || i.estimatedPrice || 0), 0);
  const getSetupCost = (setupId: string) => {
    const isRecurring = setups.find(s => s.id === setupId)?.category === 'Recurring Expenses';
    return items
      .filter((i) => i.setupId === setupId)
      .reduce((sum, item) => {
        if (isRecurring) {
          return sum + (item.paymentDetails?.monthlyCost || item.estimatedPrice || 0);
        }
        return sum + item.estimatedPrice * item.quantity;
      }, 0);
  };

  const getSetupItemCount = (setupId: string) => {
    return items.filter((i) => i.setupId === setupId).length;
  };

  const getSetupTopItems = (setupId: string) => {
    return items.filter((i) => i.setupId === setupId).slice(0, 3);
  };

  return (
    <div className="space-y-8 pb-16">
      
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
        <div className="bg-[#0d121f] rounded-3xl p-6 relative overflow-hidden shadow-sm text-white">
          <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none"></div>
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
          </div>
        </div>
      </div>

      {/* Trackers Section */}
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
      </div>
{/* Setups Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your Life Area Setups
          </h2>
        </div>

        {setups.length === 0 ? (
          <div className="bg-[#0d121f] rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#0f172a] text-blue-400 flex items-center justify-center mx-auto">
              <Box className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">No Setups Created</h3>
            </div>
            <button
              onClick={onNewSetup}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)]"
            >
              Create Your First Setup
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {setups.map((setup) => {
              const setupCost = getSetupCost(setup.id);
              const itemCount = getSetupItemCount(setup.id);
              const topItems = getSetupTopItems(setup.id);

              return (
                <div
                  key={setup.id}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    onSelectSetup(setup.id);
                  }}
                  className="group bg-[#0d121f] rounded-2xl p-6 hover:bg-[#131a2b]/80 hover:shadow-[0_0_25px_rgba(37,99,235,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 shadow-sm relative text-slate-100"
                >
                  <div className="space-y-4">
                    {/* Primary Area & SubCategory ABOVE Setup Name */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wide text-blue-400">
                          <span className="truncate">{setup.category}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                          {setup.title}
                        </h3>
                        {setup.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-normal leading-relaxed">
                            {setup.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSetup(setup.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                        title="Delete Setup"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Cost & Items Badge */}
                    <div className="bg-slate-950/60 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{setup.category === "Recurring Expenses" ? "Monthly Cost" : "Estimated Cost"}</div>
                        <div className="text-base font-extrabold text-blue-400 mt-0.5">
                          {setupCost.toLocaleString()} <span className="text-xs text-slate-500 font-semibold">{currency.code}</span>
                        </div>
                      </div>
                      <div className="text-2xs font-semibold text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded-lg">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                      </div>
                    </div>

                    {/* Item Preview List */}
                    {topItems.length > 0 && (
                      <div className="space-y-2 px-0.5">
                        {topItems.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs flex items-center justify-between"
                          >
                            <span className="truncate pr-2 text-slate-400 font-medium">{item.name}</span>
                            <span className="text-slate-200 font-bold shrink-0">
                              {(item.estimatedPrice * item.quantity).toLocaleString()} {currency.symbol}
                            </span>
                          </div>
                        ))}
                        {itemCount > 3 && (
                          <div className="text-2xs text-slate-500 font-semibold uppercase tracking-wide pt-0.5">
                            +{itemCount - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-3 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400 transition-colors">
                    <span className="font-semibold text-2xs uppercase tracking-wide text-slate-500 group-hover:text-blue-400">View Details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-500 group-hover:text-blue-400" />
                  </div>
                </div>
              );
            })}

            {/* Add New Setup Thumbnail Card */}
            <div
              onClick={onNewSetup}
              className="group bg-[#0d121f]/40 rounded-2xl p-6 hover:bg-[#0d121f] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px] space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Plus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-300 transition-colors">
                  Add New Setup
                </div>
                <div className="text-2xs text-slate-500 max-w-[200px]">
                  Configure house, tech, fashion, automotive, or custom area
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
