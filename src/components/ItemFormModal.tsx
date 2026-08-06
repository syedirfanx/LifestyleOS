import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Info } from 'lucide-react';
import { SetupItem, Currency, ConfidenceLevel, ItemStatus, PaymentMethod, PaymentDetails } from '../types';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: Partial<SetupItem>) => void;
  initialData?: SetupItem;
  setupTitle: string;
  setupCategory?: string;
  setupSubCategory?: string;
  currency: Currency;
  country: string;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  setupTitle,
  setupCategory,
  setupSubCategory,
  currency,
  country
}) => {
  const isEditMode = !!initialData;
  const isRecurring = setupCategory === 'Recurring Expenses';
  
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [priceInput, setPriceInput] = useState<string>('');
  const [notes, setNotes] = useState('');
  
  const [status, setStatus] = useState<ItemStatus>('Planning');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});

  const [isEstimating, setIsEstimating] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<{
    estimatedPrice: number;
    priceRangeMin: number;
    priceRangeMax: number;
    confidence: ConfidenceLevel;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setBrand(initialData.brand || '');
        setModel(initialData.model || '');
        setQuantity(initialData.quantity);
        setPriceInput(initialData.estimatedPrice.toString());
        setNotes(initialData.notes || '');
        setStatus(initialData.status || 'Planning');
        setPaymentMethod(initialData.paymentMethod || 'Cash');
        setPaymentDetails(initialData.paymentDetails || {});
        setAiEstimate(
          initialData.isAiEstimated
            ? {
                estimatedPrice: initialData.estimatedPrice,
                priceRangeMin: initialData.priceRangeMin || 0,
                priceRangeMax: initialData.priceRangeMax || 0,
                confidence: initialData.confidence || 'Medium',
              }
            : null
        );
      } else {
        setName('');
        setBrand('');
        setModel('');
        setQuantity(1);
        setPriceInput('');
        setNotes('');
        setStatus('Planning');
        setPaymentMethod('Cash');
        setPaymentDetails({});
        setAiEstimate(null);
      }
    }
  }, [isOpen, initialData]);

  const handleEstimatePrice = async () => {
    if (!name.trim()) return;
    setIsEstimating(true);
    setAiEstimate(null);

    try {
      const res = await fetch('/api/estimate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: name,
          brand,
          model,
          country,
          currency: currency.code,
        }),
      });

      const data = await res.json();
      if (data.estimatedPrice) {
        setAiEstimate(data);
        if (!priceInput.trim() || Number(priceInput) === 0) {
          setPriceInput(data.estimatedPrice.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = parseFloat(priceInput) || 0;

    onSubmit({
      name: name.trim(),
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      quantity: Math.max(1, quantity),
      estimatedPrice: isRecurring ? (paymentDetails.monthlyCost || parsedPrice) : parsedPrice,
      isAiEstimated: !!aiEstimate,
      priceRangeMin: aiEstimate?.priceRangeMin,
      priceRangeMax: aiEstimate?.priceRangeMax,
      confidence: aiEstimate?.confidence,
      notes: notes.trim() || undefined,
      status,
      paymentMethod: isRecurring ? undefined : paymentMethod,
      paymentDetails: isRecurring || paymentMethod === 'EMI' || paymentMethod === 'Loan' ? paymentDetails : undefined,
    });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#03050a]/90 backdrop-blur-sm">
      <div className="bg-[#0c111c] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between bg-[#0e1422] shrink-0 border-b border-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              {isEditMode ? 'Edit Item' : `Add Item to ${setupTitle}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 sm:space-y-6 text-xs overflow-y-auto flex-1 custom-scrollbar">
          
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Basic Info</h3>
            
            <div className="space-y-1">
              <label className="block text-slate-400 font-medium">Item Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MacBook Pro M3 Max"
                className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors font-medium border border-slate-800/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-400 font-medium">Brand (optional)</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple"
                  className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-medium">Model (optional)</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 16-inch, 36GB"
                  className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-400 font-medium">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors font-semibold border border-slate-800/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-medium">{isRecurring ? "Monthly Cost" : "Estimated Unit Price"} ({currency.symbol})</label>
                <div className="flex space-x-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors font-semibold border border-slate-800/50"
                  />
                  <button
                    type="button"
                    onClick={handleEstimatePrice}
                    disabled={isEstimating || !name.trim()}
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 px-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 border border-blue-500/20"
                    title="Estimate price with AI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            {aiEstimate && (
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-3 flex gap-3 text-xs">
                <div className="mt-0.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-300">AI Price Estimate</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-amber-400">
                        {aiEstimate.estimatedPrice.toLocaleString()} {currency.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPriceInput(aiEstimate.estimatedPrice.toString())}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-md text-2xs font-semibold cursor-pointer transition-colors shadow-sm flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Use</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-2xs text-slate-500 font-medium">
                    Typical range: {aiEstimate.priceRangeMin.toLocaleString()} - {aiEstimate.priceRangeMax.toLocaleString()} {currency.code}
                  </div>
                  <div className="flex items-center space-x-1.5 text-2xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded inline-flex">
                    <Info className="w-3 h-3" />
                    <span>Confidence: {aiEstimate.confidence}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          
          {/* New Section: Status & Payment Method */}
          <div className="space-y-4 pt-4 border-t border-slate-800/50">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lifecycle & Status</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-400 font-medium">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ItemStatus)}
                      className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50 appearance-none font-medium cursor-pointer"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Wishlist">Wishlist</option>
                      <option value="Ready to Buy">Ready to Buy</option>
                      {isRecurring ? (
                        <>
                          <option value="Active">Active</option>
                          <option value="Cancelled">Cancelled</option>
                        </>
                      ) : (
                        <>
                          <option value="Purchased">Purchased</option>
                          <option value="Sold">Sold</option>
                        </>
                      )}
                      <option value="Removed">Removed</option>
                    </select>
                  </div>
                  {!isRecurring && (
                  <div className="space-y-1">
                    <label className="block text-slate-400 font-medium">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50 appearance-none font-medium cursor-pointer"
                    >
                      <option value="Cash">Cash</option>
                      <option value="EMI">EMI</option>
                      <option value="Loan">Loan</option>
                    </select>
                  </div>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  {paymentMethod === 'EMI' && (
                    <div className="space-y-3 bg-[#131a2b] p-3 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-400 uppercase">EMI Details</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-xs font-medium">Down Payment</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={paymentDetails.downPayment || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, downPayment: parseFloat(e.target.value) || 0})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-xs font-medium">Interest Rate (%)</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={paymentDetails.interestRate || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, interestRate: parseFloat(e.target.value) || 0})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-xs font-medium">Installments</label>
                          <input
                            type="number" min="1"
                            value={paymentDetails.numberOfInstallments || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, numberOfInstallments: parseInt(e.target.value) || 0})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-xs font-medium">Monthly EMI</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={paymentDetails.monthlyEMI || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, monthlyEMI: parseFloat(e.target.value) || 0})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="block text-slate-400 text-xs font-medium">Start Date</label>
                          <input
                            type="date"
                            value={paymentDetails.emiStartDate || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, emiStartDate: e.target.value})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'Loan' && (
                    <div className="space-y-3 bg-[#131a2b] p-3 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-400 uppercase">Loan Details</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-xs font-medium">Loan Amount</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={paymentDetails.loanAmount || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, loanAmount: parseFloat(e.target.value) || 0})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-xs font-medium">Interest Rate (%)</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={paymentDetails.interestRate || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, interestRate: parseFloat(e.target.value) || 0})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="block text-slate-400 text-xs font-medium">Monthly Payment</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={paymentDetails.monthlyPayment || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, monthlyPayment: parseFloat(e.target.value) || 0})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-xs font-medium">Start Date</label>
                          <input
                            type="date"
                            value={paymentDetails.startDate || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, startDate: e.target.value})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-xs font-medium">End Date</label>
                          <input
                            type="date"
                            value={paymentDetails.endDate || ''}
                            onChange={(e) => setPaymentDetails({...paymentDetails, endDate: e.target.value})}
                            className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

            {isRecurring && (

              <div className="space-y-3 bg-[#1e1a3b] p-3 rounded-xl border border-purple-900/50">
                <div className="text-xs font-bold text-purple-400 uppercase">{setupSubCategory || 'Recurring'} Details</div>
                <div className="grid grid-cols-2 gap-3">
                  
                  
                  {setupSubCategory === 'Housing' && (
                    <div className="space-y-1">
                      <label className="block text-slate-400 text-xs font-medium">Deposit</label>
                      <input
                        type="number" min="0" step="0.01"
                        value={paymentDetails.securityDeposit || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, securityDeposit: parseFloat(e.target.value) || 0})}
                        className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                      />
                    </div>
                  )}
                  {setupSubCategory === 'Housing' && (
                    <>
                      <div className="space-y-1">
                        <label className="block text-slate-400 text-xs font-medium">Contract Start</label>
                        <input
                          type="date"
                          value={paymentDetails.startDate || ''}
                          onChange={(e) => setPaymentDetails({...paymentDetails, startDate: e.target.value})}
                          className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-400 text-xs font-medium">Contract End</label>
                        <input
                          type="date"
                          value={paymentDetails.endDate || ''}
                          onChange={(e) => setPaymentDetails({...paymentDetails, endDate: e.target.value})}
                          className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                        />
                      </div>
                    </>
                  )}

                  {setupSubCategory !== 'Housing' && (
                    <div className="space-y-1">
                      <label className="block text-slate-400 text-xs font-medium">Billing Cycle</label>
                      <select
                        value={paymentDetails.billingCycle || 'Monthly'}
                        onChange={(e) => setPaymentDetails({...paymentDetails, billingCycle: e.target.value as any})}
                        className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50 appearance-none cursor-pointer"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                  )}

                  {setupSubCategory !== 'Housing' && (
                    <div className="space-y-1">
                      <label className="block text-slate-400 text-xs font-medium">
                        {setupSubCategory === 'Utilities' ? 'Billing Day (1-31)' : 'Renewal Day (1-31)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={paymentDetails.billingDay || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, billingDay: parseInt(e.target.value) || undefined})}
                        className="w-full bg-[#0f172a] rounded-lg px-2 py-1.5 text-slate-100 text-sm focus:outline-none border border-slate-700/50"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
<div className="space-y-1 pt-2">
            <label className="block text-slate-400 font-medium">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need to check dimensions first..."
              className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border border-slate-800/50"
            />
          </div>

          <div className="pt-2 pb-1">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]"
            >
              {isEditMode ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
