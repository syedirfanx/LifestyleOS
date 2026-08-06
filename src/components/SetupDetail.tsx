import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Sparkles, Trash2, Edit2, Check, X, Info } from 'lucide-react';
import { Setup, SetupItem, Currency, ConfidenceLevel } from '../types';

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

      {/* Setup Title & Header Banner */}
      <div className="bg-[#0d121f] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.08)] text-white">
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
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">Total cost</span>
            <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {setupTotalCost.toLocaleString()} <span className="text-sm font-semibold text-slate-400">{currency.code}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Items Table & Total Breakdown */}
      <div className="bg-[#0e1422] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 flex items-center justify-between bg-slate-950/40">
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

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#03050a]/90 backdrop-blur-sm">
          <div className="bg-[#0c111c] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between bg-[#0e1422] shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  Add Item to {setup.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setAiEstimate(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                handleAddItemSubmit(e);
                setIsAddModalOpen(false);
              }}
              className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1"
            >
              {/* Item Name */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bed, Air Conditioner, Desk"
                  className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Brand */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-medium">Brand (optional)</label>
                  <input
                     type="text"
                     value={brand}
                     onChange={(e) => setBrand(e.target.value)}
                     placeholder="e.g. IKEA, LG"
                     className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                  />
                </div>

                {/* Model */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-medium">Model (optional)</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Lisabo"
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Quantity */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-medium">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs"
                  />
                </div>

                {/* Price Input & AI Estimate Trigger */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-medium">
                      Price ({currency.code})
                    </label>
                    <button
                      type="button"
                      onClick={handleEstimatePrice}
                      disabled={!name.trim() || isEstimating}
                      className="text-2xs text-blue-400 hover:text-blue-300 disabled:opacity-40 font-bold inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{isEstimating ? 'Estimating...' : 'AI Estimate'}</span>
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Manual price"
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or specifications..."
                  className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                />
              </div>

              {/* AI Estimate Returned Box */}
              {aiEstimate && (
                <div className="bg-slate-900 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-100 font-semibold">
                    <span className="inline-flex items-center space-x-1 text-blue-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>AI Market Estimate Result</span>
                    </span>
                    <span className="text-2xs bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-sans font-medium">
                      Confidence: {aiEstimate.confidence}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-4 text-slate-200">
                    <div>
                      <span className="text-2xs text-slate-500 block">Estimated Price</span>
                      <span className="text-sm font-bold text-blue-400">
                        {aiEstimate.estimatedPrice.toLocaleString()} {currency.code}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-500 block">Expected Range</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {aiEstimate.priceRangeMin.toLocaleString()} - {aiEstimate.priceRangeMax.toLocaleString()} {currency.code}
                      </span>
                    </div>
                  </div>

                  {aiEstimate.notes && (
                    <p className="text-2xs text-slate-500 pt-1">
                      {aiEstimate.notes}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleApplyAiEstimate}
                    className="text-2xs text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Use this estimated price
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAiEstimate(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)] flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#03050a]/90 backdrop-blur-sm">
          <div className="bg-[#0c111c] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between bg-[#0e1422] shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  Edit Item in {setup.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItemId(null);
                  setEditAiEstimate(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleEditItemSubmit}
              className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1"
            >
              {/* Item Name */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Item Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Bed, Air Conditioner, Desk"
                  className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Brand */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-medium">Brand (optional)</label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    placeholder="e.g. IKEA, LG"
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                  />
                </div>

                {/* Model */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-medium">Model (optional)</label>
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    placeholder="e.g. Lisabo"
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Quantity */}
                <div className="space-y-1">
                  <label className="block text-slate-300 font-medium">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs"
                  />
                </div>

                {/* Price Input & AI Estimate Trigger */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-medium">
                      Price ({currency.code})
                    </label>
                    <button
                      type="button"
                      onClick={handleEditEstimatePrice}
                      disabled={!editName.trim() || isEditEstimating}
                      className="text-2xs text-blue-400 hover:text-blue-300 disabled:opacity-40 font-bold inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{isEditEstimating ? 'Estimating...' : 'AI Estimate'}</span>
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Manual price"
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Notes (optional)</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Additional notes or specifications..."
                  className="w-full bg-slate-950 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:bg-slate-950 transition-colors text-xs placeholder-slate-500"
                />
              </div>

              {/* AI Estimate Returned Box */}
              {editAiEstimate && (
                <div className="bg-slate-900 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-100 font-semibold">
                    <span className="inline-flex items-center space-x-1 text-blue-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>AI Market Estimate Result</span>
                    </span>
                    <span className="text-2xs bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-sans font-medium">
                      Confidence: {editAiEstimate.confidence}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-4 text-slate-200">
                    <div>
                      <span className="text-2xs text-slate-500 block">Estimated Price</span>
                      <span className="text-sm font-bold text-blue-400">
                        {editAiEstimate.estimatedPrice.toLocaleString()} {currency.code}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-500 block">Expected Range</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {editAiEstimate.priceRangeMin.toLocaleString()} - {editAiEstimate.priceRangeMax.toLocaleString()} {currency.code}
                      </span>
                    </div>
                  </div>

                  {editAiEstimate.notes && (
                    <p className="text-2xs text-slate-500 pt-1">
                      {editAiEstimate.notes}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleApplyEditAiEstimate}
                    className="text-2xs text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Use this estimated price
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItemId(null);
                    setEditAiEstimate(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)] flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
