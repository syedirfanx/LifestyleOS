import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { Setup, SetupItem } from '../types';
import { LIFE_AREAS, SubCategoryPreset } from '../data/lifeAreasData';

interface NewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSetup: (
    setup: Omit<Setup, 'id' | 'createdAt'>,
    initialItems?: Omit<SetupItem, 'id' | 'setupId'>[]
  ) => void;
}

export const NewSetupModal: React.FC<NewSetupModalProps> = ({
  isOpen,
  onClose,
  onCreateSetup,
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState(LIFE_AREAS[0].id);
  const [selectedSubId, setSelectedSubId] = useState(LIFE_AREAS[0].subCategories[0].id);
  const [title, setTitle] = useState(LIFE_AREAS[0].subCategories[0].defaultTitle);
  const [description, setDescription] = useState('');

  // Track which item indexes are selected to preload
  const [selectedItemIndexes, setSelectedItemIndexes] = useState<number[]>([]);

  // Get current active life area and subcategory
  const currentArea = LIFE_AREAS.find((a) => a.id === selectedAreaId) || LIFE_AREAS[0];
  const currentSub: SubCategoryPreset =
    currentArea.subCategories.find((s) => s.id === selectedSubId) || currentArea.subCategories[0];

  // Initialize selected item indexes whenever currentSub changes or modal opens
  useEffect(() => {
    if (currentSub && currentSub.exampleItems) {
      setSelectedItemIndexes(currentSub.exampleItems.map((_, idx) => idx));
    }
  }, [selectedSubId, isOpen]);

  // Handle area change
  const handleAreaChange = (newAreaId: string) => {
    setSelectedAreaId(newAreaId);
    const area = LIFE_AREAS.find((a) => a.id === newAreaId);
    if (area && area.subCategories.length > 0) {
      const defaultSub = area.subCategories[0];
      setSelectedSubId(defaultSub.id);
      setTitle(defaultSub.defaultTitle);
    }
  };

  // Handle subcategory change
  const handleSubChange = (newSubId: string) => {
    setSelectedSubId(newSubId);
    const sub = currentArea.subCategories.find((s) => s.id === newSubId);
    if (sub) {
      setTitle(sub.defaultTitle);
    }
  };

  // Sync title if subcategory changes
  useEffect(() => {
    if (currentSub) {
      setTitle(currentSub.defaultTitle);
    }
  }, [selectedSubId]);

  if (!isOpen) return null;

  const toggleItem = (index: number) => {
    setSelectedItemIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    setSelectedItemIndexes(currentSub.exampleItems.map((_, idx) => idx));
  };

  const handleDeselectAll = () => {
    setSelectedItemIndexes([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const itemsToPreload = currentSub.exampleItems
      .filter((_, idx) => selectedItemIndexes.includes(idx))
      .map((item) => ({
        name: item.name,
        brand: item.brand,
        estimatedPrice: item.estimatedPrice,
        category: item.category || currentSub.name,
        quantity: 1,
        notes: `Pre-loaded starter item for ${currentSub.name}`,
      }));

    onCreateSetup(
      {
        title: title.trim(),
        category: currentArea.name,
        subCategory: currentSub.name,
        description: description.trim() || currentSub.description,
        icon: currentArea.icon,
      },
      itemsToPreload.length > 0 ? itemsToPreload : undefined
    );

    // Reset and close
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-teal-950 tracking-tight">
              Create New Setup
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Dropdown 1: Primary Life Area */}
          <div className="space-y-1.5">
            <label className="block text-slate-800 font-semibold">
              Primary Life Area
            </label>
            <div className="relative">
              <select
                value={selectedAreaId}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-teal-900 focus:bg-white cursor-pointer appearance-none pr-8"
              >
                {LIFE_AREAS.map((area) => (
                  <option key={area.id} value={area.id} className="bg-white text-slate-900 py-1">
                    {area.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Dropdown 2: Specific Setup Category (Cascading) */}
          <div className="space-y-1.5">
            <label className="block text-slate-800 font-semibold">
              Specific Setup Type
            </label>
            <div className="relative">
              <select
                value={selectedSubId}
                onChange={(e) => handleSubChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-teal-900 focus:bg-white cursor-pointer appearance-none pr-8"
              >
                {currentArea.subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-white text-slate-900 py-1">
                    {sub.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-600">
              {currentSub.description}
            </p>
          </div>

          {/* Example Items Picker Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-700">
                Pick Items for {currentSub.name}
              </span>
              <div className="flex items-center space-x-2 text-2xs font-medium">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-teal-900 hover:underline cursor-pointer font-bold"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {currentSub.exampleItems.map((item, idx) => {
                const isSelected = selectedItemIndexes.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleItem(idx)}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-medium transition-all cursor-pointer flex items-center space-x-1.5 border ${
                      isSelected
                        ? 'bg-teal-900 text-white border-teal-900 shadow-2xs font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-teal-200 shrink-0" />}
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-2xs text-slate-500 font-medium pt-0.5">
              {selectedItemIndexes.length} of {currentSub.exampleItems.length} items selected to preload
            </p>
          </div>

          {/* Setup Title Name Input */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-medium">Setup Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Makeup & Vanity Corner, Tech Workstation"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-medium">Description (optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief notes about your vision..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-900 hover:bg-teal-950 text-white font-semibold transition-colors cursor-pointer shadow-2xs flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Setup</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
