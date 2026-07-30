import React, { useState } from 'react';
import type { PaymentMethod, CreatePaymentInput } from '../types/payment';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Add01Icon,
  Upload01Icon,
  DocumentCodeIcon,
  Invoice01Icon,
} from '@hugeicons/core-free-icons';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePaymentInput) => Promise<void>;
  projectId: string;
  isSubmitting?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Transfer',
  'UPI',
  'PayPal',
  'Stripe',
  'Wise',
  'Cash',
  'Cheque',
  'Crypto',
  'Custom',
];

const CURRENCIES = [
  { code: 'INR', label: 'INR (₹)' },
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
];

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  isSubmitting = false,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('INR');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionId, setTransactionId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    await onSubmit({
      projectId,
      amount: parsedAmount,
      currency,
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      notes: notes.trim() || undefined,
      invoiceFile,
      receiptFile,
      isVerified: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-lg rounded-lg bg-[#0c0c0e]/95 border border-zinc-800/80 p-5 font-mono text-xs space-y-4 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HugeiconsIcon icon={Add01Icon} size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans tracking-tight">Record New Payment</h3>
              <p className="text-[10px] text-zinc-500">Add payment transaction and attach financial records</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4 flex items-center">
                Payment Amount (*)
              </label>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full h-10 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono transition-colors"
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4 flex items-center">
                Currency
              </label>
              <Select value={currency} onValueChange={(val: any) => setCurrency(val as string)}>
                <SelectTrigger className="h-10 text-xs px-3 bg-zinc-900/80 border-zinc-800 rounded-lg font-mono text-zinc-200 focus:border-zinc-600 w-full">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4 flex items-center">
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val as PaymentMethod)}>
                <SelectTrigger className="h-10 text-xs px-3 bg-zinc-900/80 border-zinc-800 rounded-lg font-mono text-zinc-200 focus:border-zinc-600 w-full">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4 flex items-center">
                Transaction / UTR ID
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. UPI/1294810481"
                className="w-full h-10 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4">
                <HugeiconsIcon icon={DocumentCodeIcon} size={14} className="text-zinc-500" />
                <span>Attach Invoice</span>
              </div>
              <input
                type="file"
                id="invoice_upload"
                accept=".pdf,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="invoice_upload"
                className="h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white text-[11px] font-mono inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors w-full truncate"
              >
                <HugeiconsIcon icon={Upload01Icon} size={12} />
                <span className="truncate">{invoiceFile ? invoiceFile.name : 'Choose File'}</span>
              </label>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4">
                <HugeiconsIcon icon={Invoice01Icon} size={14} className="text-emerald-500/80" />
                <span>Attach Receipt</span>
              </div>
              <input
                type="file"
                id="receipt_upload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="receipt_upload"
                className="h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white text-[11px] font-mono inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors w-full truncate"
              >
                <HugeiconsIcon icon={Upload01Icon} size={12} />
                <span className="truncate">{receiptFile ? receiptFile.name : 'Choose File'}</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider h-4 flex items-center">
              Payment Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Milestone 1 advance payment received"
              className="w-full p-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-white outline-none font-mono resize-none transition-colors"
            />
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
              disabled={isSubmitting || !amount}
              className="h-10 px-5 rounded-lg bg-white text-black font-semibold text-xs font-mono hover:bg-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
