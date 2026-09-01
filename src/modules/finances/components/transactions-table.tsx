import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CreditCardIcon,
  Search01Icon,
  Download01Icon,
  Delete02Icon,
  CheckmarkBadge01Icon,
  Link01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { ConfirmDeleteDialog } from '../../../components/ui/confirm-delete-dialog';

interface TransactionsTableProps {
  payments: any[];
  currency?: string;
  onDeletePayment?: (id: string) => Promise<void> | void;
  readOnly?: boolean;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  payments,
  currency = 'INR',
  onDeletePayment,
  readOnly = false,
}) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val || 0);

  const filtered = payments.filter((p) => {
    return (
      p.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionId && p.transactionId.toLowerCase().includes(search.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const dA = new Date(a.paymentDate).getTime();
      const dB = new Date(b.paymentDate).getTime();
      return sortOrder === 'desc' ? dB - dA : dA - dB;
    } else {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    }
  });

  const handleExportCsv = () => {
    const headers = ['Date', 'Amount', 'Currency', 'Payment Method', 'Transaction ID', 'Status', 'Notes'];
    const rows = sorted.map((p) => [
      p.paymentDate,
      p.amount,
      p.currency || currency,
      p.paymentMethod,
      p.transactionId || '',
      p.isVerified ? 'Verified' : 'Pending',
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_ledger_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm font-mono text-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-xs">
          <HugeiconsIcon icon={CreditCardIcon} size={15} className="text-emerald-400" />
          <span>Payment Ledger & Verified Transactions ({sorted.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <HugeiconsIcon icon={Search01Icon} size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, notes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="h-8 px-3 rounded-sm bg-zinc-850 border border-zinc-750 text-zinc-200 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <HugeiconsIcon icon={Download01Icon} size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="p-6 rounded bg-zinc-950 border border-zinc-850 text-center text-zinc-500 text-xs">
          No payment transactions match the filter criteria.
        </div>
      ) : (
        <div className="rounded-sm border border-zinc-800 bg-zinc-950 shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
              <tr>
                <th
                  onClick={() => {
                    if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else setSortField('date');
                  }}
                  className="px-3 sm:px-4 py-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    {sortField === 'date' && (
                      <HugeiconsIcon icon={sortOrder === 'asc' ? ArrowUp01Icon : ArrowDown01Icon} size={11} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else setSortField('amount');
                  }}
                  className="px-3 sm:px-4 py-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    {sortField === 'amount' && (
                      <HugeiconsIcon icon={sortOrder === 'asc' ? ArrowUp01Icon : ArrowDown01Icon} size={11} />
                    )}
                  </div>
                </th>
                <th className="px-3 sm:px-4 py-3">Method</th>
                <th className="px-3 sm:px-4 py-3">Reference ID</th>
                <th className="px-3 sm:px-4 py-3">Status</th>
                <th className="px-3 sm:px-4 py-3">Files</th>
                <th className="px-3 sm:px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {sorted.map((p) => {
                const isExpanded = expandedId === p.id;
                return (
                  <React.Fragment key={p.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      className="hover:bg-zinc-900/60 transition-colors cursor-pointer"
                    >
                      <td className="px-3 sm:px-4 py-3 font-mono text-zinc-400">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-bold text-emerald-400 font-mono">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-white font-bold">{p.paymentMethod}</td>
                      <td className="px-3 sm:px-4 py-3 text-cyan-400 font-mono">
                        {p.transactionId || 'N/A'}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                          <HugeiconsIcon icon={CheckmarkBadge01Icon} size={11} />
                          <span>Verified</span>
                        </Badge>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px]">
                          {p.invoiceUrl && (
                            <a
                              href={p.invoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded-sm bg-cyan-950/70 border border-cyan-800/80 text-cyan-400 hover:bg-cyan-900/80 hover:text-cyan-200 flex items-center gap-1 transition-colors"
                            >
                              <span>Invoice</span>
                              <HugeiconsIcon icon={Link01Icon} size={10} />
                            </a>
                          )}
                          {p.receiptUrl && (
                            <a
                              href={p.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded-sm bg-purple-950/70 border border-purple-800/80 text-purple-400 hover:bg-purple-900/80 hover:text-purple-200 flex items-center gap-1 transition-colors"
                            >
                              <span>Receipt</span>
                              <HugeiconsIcon icon={Link01Icon} size={10} />
                            </a>
                          )}
                          {!p.invoiceUrl && !p.receiptUrl && (
                            <span className="text-zinc-600 text-[11px] font-mono">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right">
                        {!readOnly && onDeletePayment ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingPaymentId(p.id);
                            }}
                            className="px-2 py-1 rounded-sm bg-rose-950/40 border border-rose-900/60 text-rose-400 hover:bg-rose-900/80 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 text-[10.5px] font-medium shadow-xs"
                            title="Delete Payment"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={13} />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span className="text-zinc-600 text-[11px] font-mono">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Row for Notes */}
                    {isExpanded && p.notes && (
                      <tr className="bg-zinc-900/80">
                        <td colSpan={7} className="px-4 py-3 text-zinc-300 font-sans text-xs border-t border-zinc-800">
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold">Transaction Notes</span>
                            <p className="text-zinc-200">{p.notes}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Delete Payment Alert Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deletingPaymentId)}
        title="Delete Payment Transaction"
        description="Are you sure you want to permanently remove this payment entry from the ledger? Project totals and financial progression metrics will be recalculated."
        confirmText="Delete Payment"
        isLoading={isDeleting}
        onClose={() => setDeletingPaymentId(null)}
        onConfirm={async () => {
          if (!deletingPaymentId || !onDeletePayment) return;
          try {
            setIsDeleting(true);
            await onDeletePayment(deletingPaymentId);
          } finally {
            setIsDeleting(false);
            setDeletingPaymentId(null);
          }
        }}
      />
    </div>
  );
};
