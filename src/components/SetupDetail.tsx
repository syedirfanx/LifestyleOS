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
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editNotes, setEditNotes] = useState('');

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
  };

  const saveEditing = (itemId: string) => {
    onUpdateItem(itemId, {
      name: editName.trim(),
      brand: editBrand.trim() || undefined,
      model: editModel.trim() || undefined,
      quantity: Math.max(1, editQuantity),
      estimatedPrice: parseFloat(editPrice) || 0,
      notes: editNotes.trim() || undefined,
    });
    setEditingItemId(null);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            onBack();
          }}
          className="text-xs font-semibold text-slate-600 hover:text-teal-950 flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Setups</span>
        </button>

        <button
          onClick={() => onSuggestAiSetupItems(setup.title)}
          disabled={isSuggestingItems}
          className="bg-teal-900 hover:bg-teal-950 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1.5 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isSuggestingItems ? 'Generating...' : 'AI Suggest Items'}</span>
        </button>
      </div>

      {/* Setup Title & Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
            {setup.category} Setup
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {setup.title}
          </h1>
          {setup.description && (
            <p className="text-sm text-slate-600 pt-1">{setup.description}</p>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-right">
          <div className="text-xs font-semibold text-slate-600">Total Setup Cost</div>
          <div className="text-2xl font-extrabold text-teal-950">
            {setupTotalCost.toLocaleString()} <span className="text-sm font-normal text-slate-600">{currency.code}</span>
          </div>
        </div>
      </div>

      {/* Add New Item Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">
          Add Item to {setup.title}
        </h2>

        <form onSubmit={handleAddItemSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Item Name */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-medium">Item Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bed, Air Conditioner, Desk"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
              />
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-medium">Brand (optional)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. IKEA, LG, Gree"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
              />
            </div>

            {/* Model */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-medium">Model (optional)</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Lisabo, 1.5 Ton Inverter"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-medium">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Price Input & AI Estimate Trigger */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-slate-700 font-medium">
                  Estimated Price ({currency.code})
                </label>
                <button
                  type="button"
                  onClick={handleEstimatePrice}
                  disabled={!name.trim() || isEstimating}
                  className="text-2xs text-teal-900 hover:text-teal-950 disabled:opacity-40 font-bold inline-flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isEstimating ? 'Estimating...' : 'Estimate Price'}</span>
                </button>
              </div>

              <input
                type="number"
                min="0"
                step="any"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="Manual price or click Estimate Price"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-medium">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes or specifications..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* AI Estimate Returned Box */}
          {aiEstimate && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-900 font-semibold">
                <span className="inline-flex items-center space-x-1 text-teal-950 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Market Estimate Result</span>
                </span>
                <span className="text-2xs bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium">
                  Confidence: {aiEstimate.confidence}
                </span>
              </div>

              <div className="flex items-baseline space-x-4 text-slate-800">
                <div>
                  <span className="text-2xs text-slate-500 block">Estimated Price</span>
                  <span className="text-sm font-bold text-teal-950">
                    {aiEstimate.estimatedPrice.toLocaleString()} {currency.code}
                  </span>
                </div>
                <div>
                  <span className="text-2xs text-slate-500 block">Expected Price Range</span>
                  <span className="text-xs text-slate-700 font-medium">
                    {aiEstimate.priceRangeMin.toLocaleString()} - {aiEstimate.priceRangeMax.toLocaleString()} {currency.code}
                  </span>
                </div>
              </div>

              {aiEstimate.notes && (
                <p className="text-2xs text-slate-500 pt-1 border-t border-slate-200">
                  {aiEstimate.notes}
                </p>
              )}

              <button
                type="button"
                onClick={handleApplyAiEstimate}
                className="text-2xs text-teal-900 font-bold hover:underline cursor-pointer"
              >
                Use this estimated price
              </button>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-teal-900 hover:bg-teal-950 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </form>
      </div>

      {/* Setup Items Table & Total Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-950">
            Setup Items ({setupItems.length})
          </h3>
        </div>

        {setupItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No items in this setup yet. Add items above to start estimating total cost.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50">
              <div className="col-span-4">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Est. Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Rows */}
            {setupItems.map((item) => {
              const isEditing = editingItemId === item.id;
              const lineTotal = item.estimatedPrice * item.quantity;

              if (isEditing) {
                return (
                  <div key={item.id} className="p-4 bg-slate-50 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Item name"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                      <input
                        type="text"
                        value={editBrand}
                        onChange={(e) => setEditBrand(e.target.value)}
                        placeholder="Brand"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                      <input
                        type="text"
                        value={editModel}
                        onChange={(e) => setEditModel(e.target.value)}
                        placeholder="Model"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="1"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                          className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 text-center"
                        />
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Price"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Notes..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs mr-3"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEditing(item.id)}
                          className="bg-teal-900 hover:bg-teal-950 text-white p-1.5 rounded-lg cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1.5 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="p-4 sm:px-5 sm:py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center text-xs hover:bg-slate-50/80 transition-colors"
                >
                  {/* Name & Details */}
                  <div className="sm:col-span-4 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      {item.isAiEstimated && (
                        <span className="text-2xs bg-slate-100 text-teal-950 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-medium">
                          AI Est.
                        </span>
                      )}
                    </div>
                    {(item.brand || item.model) && (
                      <div className="text-2xs text-slate-500">
                        {[item.brand, item.model].filter(Boolean).join(' • ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-2xs text-slate-500 italic">{item.notes}</div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2 sm:text-center text-slate-800 font-medium">
                    <span className="sm:hidden text-slate-500 pr-1">Qty:</span>
                    {item.quantity}
                  </div>

                  {/* Unit Price */}
                  <div className="sm:col-span-2 sm:text-right text-slate-800 font-medium">
                    <span className="sm:hidden text-slate-500 pr-1">Unit:</span>
                    {item.estimatedPrice.toLocaleString()} {currency.code}
                  </div>

                  {/* Line Total */}
                  <div className="sm:col-span-2 sm:text-right font-bold text-teal-950">
                    <span className="sm:hidden text-slate-500 pr-1">Total:</span>
                    {lineTotal.toLocaleString()} {currency.code}
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-2 flex items-center justify-end space-x-1">
                    <button
                      onClick={() => startEditing(item)}
                      className="p-1.5 text-slate-400 hover:text-teal-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Total Calculation Row */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                Total Estimated Cost for {setup.title}
              </div>
              <div className="text-xl font-bold text-teal-950 tracking-tight">
                {setupTotalCost.toLocaleString()} {currency.code}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
