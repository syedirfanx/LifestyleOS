import React from 'react';
import { Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-[#0f172a] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-800">
        <div className="p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-2">{title}</h2>
          <p className="text-sm text-slate-400 mb-6">{message}</p>
          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className="flex-1 py-2.5 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-[0_0_15px_rgba(225,29,72,0.25)]"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
