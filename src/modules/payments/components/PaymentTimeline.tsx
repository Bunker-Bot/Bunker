import React, { useState } from 'react';
import { format } from 'date-fns';
import type { PaymentEntry } from '../types/payment';
import { ConfirmDeleteDialog } from '../../../components/ui/confirm-delete-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Download01Icon,
  Delete02Icon,
  DocumentCodeIcon,
  Invoice01Icon,
  CreditCardIcon,
  Tag01Icon,
} from '@hugeicons/core-free-icons';

interface PaymentTimelineProps {
  payments: PaymentEntry[];
  currency?: string;
  onDeletePayment?: (id: string) => void;
  readOnly?: boolean;
}

export const PaymentTimeline: React.FC<PaymentTimelineProps> = ({
  payments,
  currency = 'INR',
  onDeletePayment,
  readOnly = false,
}) => {
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentEntry | null>(null);

  const formatAmount = (num: number, curr?: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: curr || currency || 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (payments.length === 0) {
    return (
      <div className="p-8 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 text-center font-mono space-y-3">
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <HugeiconsIcon icon={CreditCardIcon} size={20} />
        </div>
        <h4 className="text-sm font-semibold text-zinc-300 font-sans">No payment entries recorded</h4>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          {readOnly
            ? 'No verified payment records have been posted for this project yet.'
            : 'Click "Record Payment" above to enter a payment, upload invoices, or attach receipts.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono select-none">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <HugeiconsIcon icon={Invoice01Icon} size={14} className="text-zinc-500" />
          <span>Payment History ({payments.length})</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="p-4 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 hover:border-zinc-700/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Date + Amount + Method + Status */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-400" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-white font-mono">
                    {formatAmount(payment.amount, payment.currency)}
                  </span>

                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-medium text-zinc-300">
                    {payment.paymentMethod}
                  </span>

                  {payment.isVerified && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                  <span>{format(new Date(payment.paymentDate), 'MMM d, yyyy')}</span>
                  {payment.transactionId && (
                    <span className="flex items-center gap-1 text-zinc-400">
                      <HugeiconsIcon icon={Tag01Icon} size={11} className="text-zinc-600" />
                      <span className="font-mono text-[11px]">Txn: {payment.transactionId}</span>
                    </span>
                  )}
                </div>

                {payment.notes && (
                  <p className="text-xs text-zinc-400 italic pt-0.5 leading-relaxed">
                    "{payment.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions (Invoice, Receipt, Delete) */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/40 w-full md:w-auto justify-end">
              {payment.invoiceUrl && (
                <a
                  href={payment.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 px-2.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="View / Download Invoice"
                >
                  <HugeiconsIcon icon={DocumentCodeIcon} size={13} className="text-zinc-400" />
                  <span>Invoice</span>
                  <HugeiconsIcon icon={Download01Icon} size={11} className="text-zinc-500" />
                </a>
              )}

              {payment.receiptUrl && (
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 px-2.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="View / Download Receipt"
                >
                  <HugeiconsIcon icon={Invoice01Icon} size={13} className="text-emerald-400" />
                  <span>Receipt</span>
                  <HugeiconsIcon icon={Download01Icon} size={11} className="text-zinc-500" />
                </a>
              )}

              {!readOnly && onDeletePayment && (
                <button
                  type="button"
                  onClick={() => setPaymentToDelete(payment)}
                  className="h-8 w-8 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-rose-900/60 text-zinc-500 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Delete Entry"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(paymentToDelete)}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={() => {
          if (paymentToDelete && onDeletePayment) {
            onDeletePayment(paymentToDelete.id);
          }
        }}
        title="Delete Payment Entry"
        description={`Are you sure you want to delete the payment entry of ${paymentToDelete ? formatAmount(paymentToDelete.amount, paymentToDelete.currency) : ''}? This action cannot be undone.`}
        confirmText="Delete Payment"
      />
    </div>
  );
};
