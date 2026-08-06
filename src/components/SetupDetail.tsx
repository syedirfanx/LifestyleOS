import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Sparkles, Trash2, Edit2, Check, X, Info } from 'lucide-react';
import { Setup, SetupItem, Currency, ConfidenceLevel, ItemStatus, PaymentMethod, PaymentDetails } from '../types';
import { ItemFormModal } from "./ItemFormModal";

interface SetupDetailProps {
  setup: Setup;
  items: SetupItem[];
  currency: Currency;
  country: string;
  onBack: () => void;
  onAddItem: (item: Omit<SetupItem, 'id'>) => void;
  onUpdateItem: (itemId: string, updated: Partial<SetupItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onSuggestAiSetupItems: (setupTitle: string) => void;
  isSuggestingItems?: boolean;
}

export const SetupDetail: React.FC<SetupDetailProps> = ({
  setup,
  items,
  currency,
  country,
  onBack,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onSuggestAiSetupItems,
  isSuggestingItems = false,
}) => {
  // Add item state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [priceInput, setPriceInput] = useState<string>('');
  const [notes, setNotes] = useState('');

  // AI Estimation state for new item form
  const [isEstimating, setIsEstimating] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<{
    estimatedPrice: number;
    priceRangeMin: number;
    priceRangeMax: number;
    confidence: ConfidenceLevel;
    notes?: string;
  } | null>(null);

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editNotes, setEditNotes] = useState('');
  const [isEditEstimating, setIsEditEstimating] = useState(false);
  const [editAiEstimate, setEditAiEstimate] = useState<{
    estimatedPrice: number;
    priceRangeMin: number;
    priceRangeMax: number;
    confidence: ConfidenceLevel;
    notes?: string;
  } | null>(null);

  const setupItems = items.filter((i) => i.setupId === setup.id);
  const isRecurring = setup.category === 'Recurring Expenses';
  const setupTotalCost = setupItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);

  // Handle AI price estimate for new item
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
        // Only set price input if the user has NOT manually typed a price
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

  const handleApplyAiEstimate = () => {
    if (aiEstimate) {
      setPriceInput(aiEstimate.estimatedPrice.toString());
    }
  };

  const handleEditEstimatePrice = async () => {
    if (!editName.trim()) return;
    setIsEditEstimating(true);
    setEditAiEstimate(null);

    try {
      const res = await fetch('/api/estimate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: editName,
          brand: editBrand,
          model: editModel,
          country,
          currency: currency.code,
        }),
      });

      const data = await res.json();
      if (data.estimatedPrice) {
        setEditAiEstimate(data);
        if (!editPrice.trim() || Number(editPrice) === 0) {
          setEditPrice(data.estimatedPrice.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditEstimating(false);
    }
  };

  const handleApplyEditAiEstimate = () => {
    if (editAiEstimate) {
      setEditPrice(editAiEstimate.estimatedPrice.toString());
    }
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = parseFloat(priceInput) || 0;

    onAddItem({
      setupId: setup.id,
      name: name.trim(),
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      quantity: Math.max(1, quantity),
      estimatedPrice: parsedPrice,
      isAiEstimated: !!aiEstimate,
      priceRangeMin: aiEstimate?.priceRangeMin,
      priceRangeMax: aiEstimate?.priceRangeMax,
      confidence: aiEstimate?.confidence,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setName('');
    setBrand('');
    setModel('');
    setQuantity(1);
    setPriceInput('');
    setNotes('');
    setAiEstimate(null);
  };

  const startEditing = (item: SetupItem) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditBrand(item.brand || '');
    setEditModel(item.model || '');
    setEditQuantity(item.quantity);
    setEditPrice(item.estimatedPrice.toString());
    setEditNotes(item.notes || '');
    setEditAiEstimate(
      item.isAiEstimated
        ? {
            estimatedPrice: item.estimatedPrice,
            priceRangeMin: item.priceRangeMin || 0,
            priceRangeMax: item.priceRangeMax || 0,
            confidence: item.confidence || 'Medium',
            notes: undefined,
          }
        : null
    );
    setIsEditModalOpen(true);
  };

  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId) return;

    const parsedPrice = parseFloat(editPrice) || 0;

    onUpdateItem(editingItemId, {
      name: editName.trim(),
      brand: editBrand.trim() || undefined,
      model: editModel.trim() || undefined,
      quantity: Math.max(1, editQuantity),
      estimatedPrice: parsedPrice,
      isAiEstimated: !!editAiEstimate,
      priceRangeMin: editAiEstimate?.priceRangeMin || undefined,
      priceRangeMax: editAiEstimate?.priceRangeMax || undefined,
      confidence: editAiEstimate?.confidence || undefined,
      notes: editNotes.trim() || undefined,
    });

    setIsEditModalOpen(false);
    setEditingItemId(null);
    setEditAiEstimate(null);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="space-y-6 pb-20 text-slate-100 animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            onBack();
          }}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#0e1422] rounded-xl text-slate-300 hover:text-white hover:bg-slate-850 transition-all text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Setups</span>
        </button>

        <button
          onClick={() => onSuggestAiSetupItems(setup.title)}
          disabled={isSuggestingItems}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer inline-flex items-center space-x-1.5 shadow-[0_0_15px_rgba(37,99,235,0.25)] disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isSuggestingItems ? 'Generating suggestions...' : 'AI Suggest Items'}</span>
        </button>
      </div>

      {/* Combined Setup Banner & Items Table */}
      <div className="bg-[#0d121f] rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.08)] text-white flex flex-col">
        {/* Setup Title & Header Banner */}
        <div className="p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
            <div className="space-y-1.5">
              <div className="text-2xs font-semibold uppercase tracking-wide text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded inline-block">
                {setup.category}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
                {setup.title}
              </h1>
              {setup.description && (
                <p className="text-sm text-slate-300 max-w-xl leading-relaxed">{setup.description}</p>
              )}
            </div>

            <div className="text-left md:text-right shrink-0 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">{isRecurring ? "Monthly Cost" : "Total Cost"}</span>
              <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {setupTotalCost.toLocaleString()} <span className="text-sm font-semibold text-slate-400">{currency.code}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Items Table & Total Breakdown */}
        <div className="bg-[#0c111c] border-t border-slate-800/50">
          <div className="p-5 flex items-center justify-between bg-[#0e1422]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Setup Items ({setupItems.length})
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center space-x-1.5 shadow-[0_0_15px_rgba(37,99,235,0.25)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {setupItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-4">
            <div>No items in this setup yet. Add items to start estimating total cost.</div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5 shadow-[0_0_15px_rgba(37,99,235,0.25)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Item</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-950/20">
              <div className="col-span-4">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Est. Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Rows */}
            {setupItems.map((item) => {
              const lineTotal = item.estimatedPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="p-5 sm:px-6 sm:py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center text-xs hover:bg-slate-800/40 transition-colors bg-[#0f172a]/30 rounded-xl"
                >
                  {/* Name & Details */}
                  <div className="sm:col-span-4 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100 text-sm">{item.name}</span>
                      {item.isAiEstimated && (
                        <span className="text-[10px] bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          AI Est
                        </span>
                      )}
                    </div>
                    {(item.brand || item.model) && (
                      <div className="text-xs text-slate-400 font-medium">
                        {[item.brand, item.model].filter(Boolean).join(' • ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-slate-500 font-normal italic">{item.notes}</div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                          (item.status === 'Purchased' || item.status === 'Active') ? 'bg-emerald-950/40 text-emerald-400' :
                          item.status === 'Ready to Buy' ? 'bg-amber-950/40 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {item.status || 'Planning'}
                        </span>
                      
                      {item.status === 'Purchased' && item.paymentMethod === 'EMI' && (
                        <span className="text-[10px] bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          EMI: {item.paymentDetails?.monthlyEMI?.toLocaleString()} {currency.code}/mo
                        </span>
                      )}
                      {item.status === 'Purchased' && item.paymentMethod === 'Loan' && (
                        <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          Loan: {item.paymentDetails?.monthlyPayment?.toLocaleString()} {currency.code}/mo
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2 sm:text-center text-slate-300 font-semibold">
                    <span className="sm:hidden text-slate-500 font-semibold uppercase tracking-wide pr-1 text-2xs">Qty:</span>
                    {item.quantity}
                  </div>

                  {/* Unit Price */}
                  <div className="sm:col-span-2 sm:text-right text-slate-300 font-semibold">
                    <span className="sm:hidden text-slate-500 font-semibold uppercase tracking-wide pr-1 text-2xs">Unit:</span>
                    {item.estimatedPrice.toLocaleString()} <span className="text-xs text-slate-500 font-medium">{currency.code}</span>
                  </div>

                  {/* Line Total */}
                  <div className="sm:col-span-2 sm:text-right font-black text-blue-400 text-sm">
                    <span className="sm:hidden text-slate-500 font-semibold uppercase tracking-wide pr-1 text-2xs">Total:</span>
                    {lineTotal.toLocaleString()} <span className="text-xs text-slate-500 font-medium">{currency.code}</span>
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-2 flex items-center justify-end space-x-1">
                    <button
                      onClick={() => startEditing(item)}
                      className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Total Calculation Row */}
            <div className="p-6 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Estimated Cost for {setup.title}
              </div>
              <div className="text-xl font-black text-blue-400 tracking-tight">
                {setupTotalCost.toLocaleString()} <span className="text-sm font-semibold text-slate-500">{currency.code}</span>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>


      {/* Add Item Modal */}
      <ItemFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => {
          onAddItem({ ...data, setupId: setup.id } as Omit<SetupItem, 'id'>);
          setIsAddModalOpen(false);
        }}
        setupTitle={setup.title}
        setupCategory={setup.category}
        setupSubCategory={setup.subCategory}
        currency={currency}
        country={country}
      />

      {/* Edit Item Modal */}
      <ItemFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItemId(null);
        }}
        onSubmit={(data) => {
          if (editingItemId) {
            onUpdateItem(editingItemId, data);
            setIsEditModalOpen(false);
            setEditingItemId(null);
          }
        }}
        initialData={items.find(i => i.id === editingItemId)}
        setupTitle={setup.title}
        setupCategory={setup.category}
        setupSubCategory={setup.subCategory}
        currency={currency}
        country={country}
      />

    </div>
  );
};
