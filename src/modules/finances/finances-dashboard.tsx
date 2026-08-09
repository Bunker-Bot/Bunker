import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  useFinancialOverview,
  usePaymentHistory,
  useInvoices,
  usePaymentTimeline,
  useDeliverables,
  useRecordPayment,
  useReleaseDeliverable,
  useExportFinancialReport,
} from '../../lib/supabase/queries/finances';
import {
  useCreateDeliveryAsset,
  useDeleteDeliveryAsset,
  useUpdateProjectBudget,
} from '../../lib/supabase/queries/payments';
import { useProjects } from '../../lib/supabase/queries/projects';

import { FinancesHeader } from './components/finances-header';
import { FinancesKpiCards } from './components/finances-kpi-cards';
import { RevenueCharts } from './components/revenue-charts';
import { PaymentProgressStacked } from './components/payment-progress-stacked';
import { PaymentJourneyTimeline } from './components/payment-journey-timeline';
import { InvoicesGrid } from './components/invoices-grid';
import { TransactionsTable } from './components/transactions-table';
import { DeliverablesWorkspace } from './components/deliverables-workspace';
import { FinancialInsights } from './components/financial-insights';
import { RecentFinancialActivity } from './components/recent-financial-activity';

import { AddPaymentModal } from '../payments/components/AddPaymentModal';
import { EditProjectBudgetModal } from '../payments/components/EditProjectBudgetModal';

export interface FinancesDashboardProps {
  projectId?: string;
  readOnly?: boolean;
}

export const FinancesDashboard: React.FC<FinancesDashboardProps> = ({
  projectId: propProjectId,
  readOnly = false,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(propProjectId || 'all');
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);

  const activeProjectId = propProjectId || (selectedProjectId === 'all' ? undefined : selectedProjectId);

  // Queries
  const { data: projectsResult } = useProjects();
  const { data: overview } = useFinancialOverview(activeProjectId);
  const { data: payments = [] } = usePaymentHistory(activeProjectId);
  const { data: invoices = [] } = useInvoices(activeProjectId);
  const { data: timeline = [] } = usePaymentTimeline(activeProjectId);
  const { data: deliverables = [] } = useDeliverables(activeProjectId, readOnly);

  // Mutations
  const recordPaymentMutation = useRecordPayment();
  const releaseDeliverableMutation = useReleaseDeliverable();
  const exportReportMutation = useExportFinancialReport();
  const createAssetMutation = useCreateDeliveryAsset();
  const deleteAssetMutation = useDeleteDeliveryAsset();
  const updateBudgetMutation = useUpdateProjectBudget();

  const projectsOptions = useMemo(() => {
    const raw =
      (projectsResult as any)?.projects ||
      (projectsResult as any)?.data ||
      (Array.isArray(projectsResult) ? projectsResult : []);
    return raw.map((p: any) => ({
      id: String(p.id),
      name: p.name || p.title || 'Untitled Project',
      status: p.status || 'active',
    }));
  }, [projectsResult]);

  const selectedProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projectsOptions.find((p: any) => p.id === activeProjectId) || null;
  }, [activeProjectId, projectsOptions]);

  const summary = overview || {
    totalCost: 0,
    totalPaid: 0,
    remainingBalance: 0,
    paymentPercentage: 0,
    averagePayment: 0,
    largestPayment: 0,
    paymentsCount: 0,
  };

  const unlockedCount = deliverables.filter((d: any) => d.isUnlocked || d.isManualUnlocked).length;

  const handleExportCsv = () => {
    exportReportMutation.mutate({ format: 'csv', data: payments });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-[1700px] mx-auto space-y-6 font-mono text-zinc-100 select-none pb-12"
    >
      {/* 1. Workspace Header */}
      <FinancesHeader
        projects={projectsOptions}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        selectedProject={selectedProject}
        summary={summary}
        onRecordPayment={() => setIsAddPaymentOpen(true)}
        onCreateInvoice={() => setIsAddPaymentOpen(true)}
        onExportReport={handleExportCsv}
        onShareSummary={() => {
          navigator.clipboard.writeText(window.location.href);
          alert('Financial summary link copied to clipboard!');
        }}
      />

      {/* 2. Enterprise KPI Cards */}
      <FinancesKpiCards
        summary={summary}
        paymentsCount={payments.length}
        assetsCount={deliverables.length}
        unlockedAssetsCount={unlockedCount}
        onEditProjectValue={!readOnly && activeProjectId ? () => setIsEditBudgetOpen(true) : undefined}
      />

      {/* 3. Recharts Financial Analytics */}
      <RevenueCharts summary={summary} payments={payments} />

      {/* 4. Payment Stacked Progression */}
      <PaymentProgressStacked summary={summary} />

      {/* 5. Visual Milestone Journey */}
      <PaymentJourneyTimeline timeline={timeline} />

      {/* 6. Invoices Management */}
      <InvoicesGrid
        invoices={invoices}
        onDownloadPdf={(inv) => alert(`Downloading Invoice ${inv.invoiceNumber}...`)}
        onShareInvoice={(inv) => {
          navigator.clipboard.writeText(inv.invoiceUrl || window.location.href);
          alert(`Invoice link for ${inv.invoiceNumber} copied!`);
        }}
      />

      {/* 7. Transactions DataTable */}
      <TransactionsTable
        payments={payments}
        readOnly={readOnly}
      />

      {/* 8. Deliverables & Asset Releases */}
      <DeliverablesWorkspace
        assets={deliverables}
        projectId={activeProjectId || ''}
        onCreateAsset={async (input) => {
          await createAssetMutation.mutateAsync(input);
        }}
        onToggleManualUnlock={async (assetId, isManualUnlocked) => {
          await releaseDeliverableMutation.mutateAsync({ assetId, isManualUnlocked });
        }}
        onDeleteAsset={async (assetId) => {
          await deleteAssetMutation.mutateAsync(assetId);
        }}
        readOnly={readOnly || !activeProjectId}
      />

      {/* 9. Automated Financial Insights */}
      <FinancialInsights summary={summary} />

      {/* 10. Recent Activity Stream */}
      <RecentFinancialActivity payments={payments} assets={deliverables} />

      {/* Record Payment Modal */}
      {activeProjectId && (
        <AddPaymentModal
          isOpen={isAddPaymentOpen}
          onClose={() => setIsAddPaymentOpen(false)}
          onSubmit={async (input) => {
            await recordPaymentMutation.mutateAsync({
              projectId: input.projectId,
              amount: input.amount,
              currency: input.currency,
              paymentMethod: input.paymentMethod,
              transactionId: input.transactionId,
              paymentDate: input.paymentDate,
              notes: input.notes,
            });
            setIsAddPaymentOpen(false);
          }}
          projectId={activeProjectId}
          isSubmitting={recordPaymentMutation.isPending}
        />
      )}

      {/* Edit Budget Modal */}
      {activeProjectId && (
        <EditProjectBudgetModal
          isOpen={isEditBudgetOpen}
          onClose={() => setIsEditBudgetOpen(false)}
          onSubmit={async (budget) => {
            await updateBudgetMutation.mutateAsync({ projectId: activeProjectId, budget });
            setIsEditBudgetOpen(false);
          }}
          currentBudget={summary.totalCost}
          isSubmitting={updateBudgetMutation.isPending}
        />
      )}
    </motion.div>
  );
};

export default FinancesDashboard;
