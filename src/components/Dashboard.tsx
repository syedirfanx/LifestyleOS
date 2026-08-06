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
      <div className="bg-[#0d121f] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.08)] text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">
              Total estimated cost
            </span>
            <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {totalDreamCost.toLocaleString()} <span className="text-sm font-semibold text-slate-400">{currency.code}</span>
            </div>
          </div>

          <div className="flex items-center space-x-8 pt-4 md:pt-0 md:pl-8 text-blue-100">
            <div>
              <div className="text-2xl font-black text-white">{setups.length}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Setups</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{items.length}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Items</div>
            </div>
          </div>
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
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Estimated Cost</div>
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
