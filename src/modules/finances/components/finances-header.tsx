import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MoneyBagIcon,
  Add01Icon,
  Download01Icon,
  Share01Icon,
  InvoiceIcon,
  Folder01Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select';

interface FinancesHeaderProps {
  projects: any[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  selectedProject: any;
  summary: any;
  onRecordPayment: () => void;
  onCreateInvoice: () => void;
  onExportReport: () => void;
  onShareSummary: () => void;
}

export const FinancesHeader: React.FC<FinancesHeaderProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  selectedProject,
  summary,
  onRecordPayment,
  onCreateInvoice,
  onExportReport,
  onShareSummary,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const completionPct = summary?.paymentPercentage || 0;

  return (
    <div className="space-y-3 sm:space-y-4 font-mono select-none">
      {/* Top Navigation & Action Toolbar */}
      <div className="p-3 sm:p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Project Selector & Module Title */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-full sm:w-60 shrink-0">
              <Select value={selectedProjectId} onValueChange={(val) => onSelectProject(val || 'all')}>
                <SelectTrigger className="h-9 text-xs bg-zinc-950 border-zinc-800 text-white font-mono flex items-center gap-2 rounded-sm truncate w-full">
                  <HugeiconsIcon icon={Folder01Icon} size={14} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{selectedProject ? selectedProject.name : 'All Projects Financials'}</span>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="all">All Projects Financials</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0">
              <HugeiconsIcon icon={MoneyBagIcon} size={16} className="text-emerald-400 shrink-0" />
              <span className="truncate">Financial Command Center</span>
              <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] uppercase font-bold shrink-0">
                Enterprise Billing
              </Badge>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            <button
              onClick={onExportReport}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-sm bg-zinc-850 border border-zinc-750 text-zinc-200 hover:text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              title="Export Report"
            >
              <HugeiconsIcon icon={Download01Icon} size={14} />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            <button
              onClick={onShareSummary}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-sm bg-zinc-850 border border-zinc-750 text-zinc-200 hover:text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              title="Share Summary"
            >
              <HugeiconsIcon icon={Share01Icon} size={14} />
              <span className="hidden sm:inline">Share Summary</span>
            </button>

            <button
              onClick={onCreateInvoice}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-sm bg-zinc-850 border border-zinc-750 text-cyan-300 hover:text-cyan-200 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              title="Create Invoice"
            >
              <HugeiconsIcon icon={InvoiceIcon} size={14} />
              <span className="hidden sm:inline">Create Invoice</span>
            </button>

            <button
              onClick={onRecordPayment}
              className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-sm bg-white text-black font-bold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-zinc-200 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
            >
              <HugeiconsIcon icon={Add01Icon} size={15} />
              <span>Record Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Financial Hero Panel */}
      <div className="p-3.5 sm:p-5 rounded-sm bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 border border-zinc-800 shadow-lg space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 font-bold text-base sm:text-lg shrink-0 shadow">
              {selectedProject ? selectedProject.name.substring(0, 2).toUpperCase() : 'ALL'}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight truncate max-w-full">
                  {selectedProject ? selectedProject.name : 'Global Portfolio Financial Dashboard'}
                </h1>
                <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[10px] uppercase font-bold shrink-0">
                  {selectedProject?.status || 'Active Portfolio'}
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-sans leading-relaxed">
                Realtime revenue tracking, invoice lifecycle management, automated deliverable unlock rules, and financial audit ledger.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 sm:p-3 rounded-sm bg-zinc-950 border border-zinc-850 text-xs">
            <div>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold block truncate">Contract Value</span>
              <strong className="text-white text-xs sm:text-sm font-bold truncate block">{formatCurrency(summary?.totalCost || 0)}</strong>
            </div>

            <div>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold block truncate">Total Collected</span>
              <strong className="text-emerald-400 text-xs sm:text-sm font-bold truncate block">{formatCurrency(summary?.totalPaid || 0)}</strong>
            </div>

            <div>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold block truncate">Balance Due</span>
              <strong className="text-amber-400 text-xs sm:text-sm font-bold truncate block">{formatCurrency(summary?.remainingBalance || 0)}</strong>
            </div>

            <div>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold block truncate">Collection %</span>
              <strong className="text-cyan-400 text-xs sm:text-sm font-bold truncate block">{completionPct}% Paid</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
