import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, MoneyBagIcon, Edit01Icon } from '@hugeicons/core-free-icons';

interface EditProjectBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (budget: number) => Promise<void>;
  currentBudget?: number;
  isSubmitting?: boolean;
}

export const EditProjectBudgetModal: React.FC<EditProjectBudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentBudget = 0,
  isSubmitting = false,
}) => {
  const [budget, setBudget] = useState<string>(String(currentBudget || ''));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budget);
    if (isNaN(parsed) || parsed < 0) return;

    await onSubmit(parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-sm rounded-lg bg-[#0c0c0e]/95 border border-zinc-800/80 p-5 font-mono text-xs space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HugeiconsIcon icon={MoneyBagIcon} size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans tracking-tight">Project Contract Value</h3>
              <p className="text-[10px] text-zinc-500">Set total agreed project value</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Total Contract Budget (INR ₹)
            </label>
            <input
              type="number"
              step="any"
              required
              autoFocus
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full h-10 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono transition-colors"
            />
            <p className="text-[10px] text-zinc-500 pt-1">
              Automated deliverable releases (25%, 50%, 75%, 100%) calculate unlock status based on this value.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !budget}
              className="h-10 px-5 rounded-lg bg-white text-black font-semibold text-xs font-mono hover:bg-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              <HugeiconsIcon icon={Edit01Icon} size={13} />
              <span>{isSubmitting ? 'Updating...' : 'Save Contract Value'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
