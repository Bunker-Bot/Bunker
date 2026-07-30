import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { InvoiceIcon, Download01Icon, Share01Icon } from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';

interface InvoicesGridProps {
  invoices: any[];
  currency?: string;
  onDownloadPdf?: (inv: any) => void;
  onShareInvoice?: (inv: any) => void;
}

export const InvoicesGrid: React.FC<InvoicesGridProps> = ({
  invoices,
  currency = 'INR',
  onDownloadPdf,
  onShareInvoice,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-xs">
          <HugeiconsIcon icon={InvoiceIcon} size={15} className="text-cyan-400" />
          <span>Invoices & Billing Documents ({invoices.length})</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-sans">Automated Invoicing</span>
      </div>

      {invoices.length === 0 ? (
        <div className="p-6 rounded bg-zinc-950 border border-zinc-850 text-center text-zinc-500 text-xs">
          No invoices generated yet for this workspace. Record payments to automatically generate invoices.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {invoices.map((inv, idx) => {
            const isPaid = inv.status === 'paid';
            return (
              <motion.div
                key={inv.id || idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="p-4 rounded bg-zinc-950 border border-zinc-850 space-y-3 shadow-sm hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono text-sm">{inv.invoiceNumber}</span>
                  <Badge variant="outline" className={`rounded-sm text-[10px] uppercase font-bold ${
                    isPaid ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                  }`}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-lg font-extrabold text-white block">{formatCurrency(inv.amount)}</span>
                  <p className="text-[10px] text-zinc-400 font-sans">
                    Payment Method: <strong className="text-zinc-200 font-mono">{inv.paymentMethod}</strong>
                  </p>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    Date: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-850">
                  {inv.invoiceUrl ? (
                    <a
                      href={inv.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 h-8 px-2.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white font-bold text-[11px] inline-flex items-center justify-center gap-1 transition-colors"
                    >
                      <HugeiconsIcon icon={Download01Icon} size={13} />
                      <span>Download</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => onDownloadPdf && onDownloadPdf(inv)}
                      className="flex-1 h-8 px-2.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white font-bold text-[11px] inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <HugeiconsIcon icon={Download01Icon} size={13} />
                      <span>Download PDF</span>
                    </button>
                  )}

                  <button
                    onClick={() => onShareInvoice && onShareInvoice(inv)}
                    className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white inline-flex items-center justify-center cursor-pointer transition-colors"
                    title="Share Invoice Link"
                  >
                    <HugeiconsIcon icon={Share01Icon} size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
