import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { requestQueue } from '../../utils/request-queue';
import {
  fetchProjectPayments,
  fetchPaymentSummary,
  fetchDeliveryAssets,
} from './payments';

export { useDeletePayment } from './payments';

export const financesKeys = {
  all: ['finances'] as const,
  overview: (projectId?: string | null) => [...financesKeys.all, 'overview', projectId] as const,
  history: (projectId?: string | null) => [...financesKeys.all, 'history', projectId] as const,
  invoices: (projectId?: string | null) => [...financesKeys.all, 'invoices', projectId] as const,
  analytics: (projectId?: string | null) => [...financesKeys.all, 'analytics', projectId] as const,
  timeline: (projectId?: string | null) => [...financesKeys.all, 'timeline', projectId] as const,
  deliverables: (projectId?: string | null) => [...financesKeys.all, 'deliverables', projectId] as const,
};

/**
 * 1. Financial Overview Hook
 */
export function useFinancialOverview(projectId?: string | null) {
  return useQuery({
    queryKey: financesKeys.overview(projectId),
    queryFn: () => requestQueue.enqueue(() => fetchPaymentSummary(projectId), 'high'),
    staleTime: 1000 * 30,
  });
}

/**
 * 2. Payment History / Transactions Hook
 */
export function usePaymentHistory(projectId?: string | null) {
  return useQuery({
    queryKey: financesKeys.history(projectId),
    queryFn: () => requestQueue.enqueue(() => fetchProjectPayments(projectId), 'high'),
    staleTime: 1000 * 30,
  });
}

/**
 * 3. Invoices Hook
 */
export function useInvoices(projectId?: string | null) {
  return useQuery({
    queryKey: financesKeys.invoices(projectId),
    queryFn: () => requestQueue.enqueue(async () => {
      const payments = await fetchProjectPayments(projectId);
      return payments.map((p, idx) => ({
        id: p.id,
        invoiceNumber: `INV-${new Date(p.paymentDate).getFullYear()}-${(idx + 1).toString().padStart(3, '0')}`,
        status: p.isVerified ? 'paid' : 'pending',
        dueDate: p.paymentDate,
        amount: p.amount,
        paidDate: p.isVerified ? p.paymentDate : null,
        invoiceUrl: p.invoiceUrl,
        receiptUrl: p.receiptUrl,
        paymentMethod: p.paymentMethod,
        notes: p.notes,
      }));
    }, 'medium'),
    staleTime: 1000 * 30,
  });
}

/**
 * 4. Revenue Analytics Hook
 */
export function useRevenueAnalytics(projectId?: string | null) {
  return useQuery({
    queryKey: financesKeys.analytics(projectId),
    queryFn: () => requestQueue.enqueue(async () => {
      const summary = await fetchPaymentSummary(projectId);
      const payments = await fetchProjectPayments(projectId);
      return { summary, payments };
    }, 'medium'),
    staleTime: 1000 * 30,
  });
}

/**
 * 5. Payment Timeline Hook
 */
export function usePaymentTimeline(projectId?: string | null) {
  return useQuery({
    queryKey: financesKeys.timeline(projectId),
    queryFn: () => requestQueue.enqueue(async () => {
      const summary = await fetchPaymentSummary(projectId);
      const pct = summary.paymentPercentage;
      return [
        { label: 'Contract Signed', threshold: 0, status: 'paid', description: 'Agreement finalized' },
        { label: 'Advance Received', threshold: 25, status: pct >= 25 ? 'paid' : 'pending', description: '25% Kickoff advance' },
        { label: 'Design Phase', threshold: 50, status: pct >= 50 ? 'paid' : 'pending', description: '50% Design sign-off' },
        { label: 'Development', threshold: 75, status: pct >= 75 ? 'paid' : 'pending', description: '75% Pre-release code' },
        { label: 'Testing & QA', threshold: 90, status: pct >= 90 ? 'paid' : 'pending', description: '90% User acceptance' },
        { label: 'Final Delivery', threshold: 100, status: pct >= 100 ? 'paid' : 'pending', description: '100% Full unlock' },
      ];
    }, 'medium'),
    staleTime: 1000 * 30,
  });
}

/**
 * 6. Deliverables Hook
 */
export function useDeliverables(projectId?: string | null, isReadOnly = false) {
  return useQuery({
    queryKey: financesKeys.deliverables(projectId),
    queryFn: () => requestQueue.enqueue(() => fetchDeliveryAssets(projectId, isReadOnly), 'high'),
    staleTime: 1000 * 30,
  });
}

/**
 * 7. Record Payment Mutation Hook
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      projectId: string;
      amount: number;
      currency?: string;
      paymentMethod: string;
      transactionId?: string;
      paymentDate?: string;
      notes?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from('project_payments')
        .insert({
          project_id: input.projectId,
          amount: input.amount,
          currency: input.currency || 'INR',
          payment_method: input.paymentMethod,
          transaction_id: input.transactionId || null,
          payment_date: input.paymentDate || new Date().toISOString(),
          is_verified: true,
          notes: input.notes || null,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['project-payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-assets'] });
    },
  });
}

/**
 * 8. Release Deliverable Mutation Hook
 */
export function useReleaseDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assetId, isManualUnlocked }: { assetId: string; isManualUnlocked: boolean }) => {
      const { error } = await (supabase as any)
        .from('delivery_assets')
        .update({
          is_manual_unlocked: isManualUnlocked,
          unlock_type: isManualUnlocked ? 'manual' : '100_percent',
          updated_at: new Date().toISOString(),
        })
        .eq('id', assetId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['delivery-assets'] });
    },
  });
}

/**
 * 9. Export Financial Report Hook
 */
export function useExportFinancialReport() {
  return useMutation({
    mutationFn: async ({ format, data }: { format: 'csv' | 'json'; data: any[] }) => {
      if (format === 'csv') {
        const headers = ['Date', 'Amount', 'Currency', 'Method', 'Transaction ID', 'Status', 'Notes'];
        const rows = data.map((p) => [
          p.paymentDate || p.created_at,
          p.amount,
          p.currency || 'INR',
          p.paymentMethod || p.payment_method,
          p.transactionId || p.transaction_id || '',
          p.isVerified ? 'Verified' : 'Pending',
          `"${(p.notes || '').replace(/"/g, '""')}"`,
        ]);
        const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_report_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      return true;
    },
  });
}
