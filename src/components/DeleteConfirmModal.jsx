import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName = 'this item', itemType = 'task' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white w-full max-w-sm rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl p-6 text-center">
        
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white light:text-slate-900">
          Delete {itemType === 'task' ? 'Task' : 'Category'}?
        </h3>

        <p className="text-xs text-slate-400 light:text-slate-600 mt-2 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-200 light:text-slate-800">"{itemName}"</span>?
          Historical completion records and past scores will remain safely preserved.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 light:text-slate-700 bg-slate-800 light:bg-slate-100 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}
