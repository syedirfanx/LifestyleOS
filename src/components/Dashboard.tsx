import React from 'react';
import { Plus, Trash2, ChevronRight, Box } from 'lucide-react';
import { Setup, SetupItem, Currency } from '../types';
import { AreaIcon } from './AreaIcon';

interface DashboardProps {
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
}) => {
  // Calculate total dream cost across all setups
  const totalDreamCost = items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);

  const getSetupCost = (setupId: string) => {
    return items
      .filter((i) => i.setupId === setupId)
      .reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);
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
      <div className="bg-teal-950 border border-teal-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
              Total Estimate
            </span>
            <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {totalDreamCost.toLocaleString()} <span className="text-lg font-normal text-teal-200">{currency.code}</span>
            </div>
          </div>

          <div className="flex items-center space-x-8 border-t md:border-t-0 md:border-l border-teal-800/80 pt-4 md:pt-0 md:pl-8 text-teal-100">
            <div>
              <div className="text-2xl font-bold text-white">{setups.length}</div>
              <div className="text-xs font-medium uppercase tracking-wider text-teal-200">Setups</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{items.length}</div>
              <div className="text-xs font-medium uppercase tracking-wider text-teal-200">Total Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Setups Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">
            Your Life Area Setups
          </h2>
        </div>

        {setups.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-teal-950 flex items-center justify-center mx-auto">
              <Box className="w-6 h-6 text-teal-900" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">No Setups Created</h3>
            </div>
            <button
              onClick={onNewSetup}
              className="bg-teal-900 hover:bg-teal-950 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
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
                  className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-900 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs relative text-slate-900"
                >
                  <div className="space-y-4">
                    {/* Primary Area & SubCategory ABOVE Setup Name */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-teal-900">
                          <span className="truncate">{setup.category}</span>
                          {setup.subCategory && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600 font-medium truncate">{setup.subCategory}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-950 transition-colors line-clamp-1">
                          {setup.title}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSetup(setup.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title="Delete Setup"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Cost & Items Badge */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-2xs text-slate-500 font-medium">Estimated Cost</div>
                        <div className="text-base font-bold text-teal-950">
                          {setupCost.toLocaleString()} <span className="text-xs text-slate-500 font-normal">{currency.code}</span>
                        </div>
                      </div>
                      <div className="text-2xs font-semibold text-teal-950 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                      </div>
                    </div>

                    {/* Item Preview List */}
                    {topItems.length > 0 && (
                      <div className="space-y-1.5 px-0.5">
                        {topItems.map((item) => (
                          <div
                            key={item.id}
                            className="text-2xs text-slate-600 flex items-center justify-between"
                          >
                            <span className="truncate pr-2 text-slate-700 font-medium">{item.name}</span>
                            <span className="text-slate-900 font-semibold shrink-0">
                              {(item.estimatedPrice * item.quantity).toLocaleString()} {currency.symbol}
                            </span>
                          </div>
                        ))}
                        {itemCount > 3 && (
                          <div className="text-2xs text-slate-400 pt-0.5">
                            +{itemCount - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-teal-950 transition-colors">
                    <span className="font-semibold text-2xs">View Setup Details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-teal-950" />
                  </div>
                </div>
              );
            })}

            {/* Add New Setup Thumbnail Card */}
            <div
              onClick={onNewSetup}
              className="group bg-slate-50/80 border border-dashed border-teal-900/30 rounded-2xl p-6 hover:border-teal-900 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px] space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-teal-900/10 border border-teal-900/20 flex items-center justify-center text-teal-950 group-hover:bg-teal-900 group-hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-teal-950 transition-colors">
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
