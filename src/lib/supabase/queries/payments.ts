import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type {
  PaymentEntry,
  PaymentSummaryStats,
  DeliveryAsset,
  CreatePaymentInput,
  CreateDeliveryAssetInput,
} from '../../../modules/payments/types/payment';

function mapRowToPayment(row: any): PaymentEntry {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    amount: Number(row.amount || 0),
    currency: row.currency || 'INR',
    paymentMethod: row.payment_method || 'Bank Transfer',
    transactionId: row.transaction_id || null,
    paymentDate: row.payment_date || row.created_at || new Date().toISOString(),
    isVerified: Boolean(row.is_verified ?? true),
    notes: row.notes || null,
    invoiceUrl: row.invoice_url || null,
    receiptUrl: row.receipt_url || null,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export async function fetchProjectPayments(projectId?: string | null): Promise<PaymentEntry[]> {
  try {
    let query = (supabase as any)
      .from('project_payments')
      .select('id, project_id, amount, currency, payment_method, transaction_id, payment_date, is_verified, notes, invoice_url, receipt_url, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (projectId && projectId !== 'all') {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data.map(mapRowToPayment);
    }
  } catch {}

  return [];
}

export async function fetchPaymentSummary(projectId?: string | null): Promise<PaymentSummaryStats> {
  let projectBudget = 0;

  if (projectId && projectId !== 'all') {
    try {
      const { data: proj, error } = await (supabase as any)
        .from('projects')
        .select('budget')
        .eq('id', projectId)
        .maybeSingle();

      if (!error && proj && proj.budget !== undefined && proj.budget !== null) {
        projectBudget = Number(proj.budget);
      }
    } catch {}
  }

  const payments = await fetchProjectPayments(projectId);
  const verifiedPayments = payments.filter((p) => p.isVerified);

  const totalPaid = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCost = projectBudget > 0 ? projectBudget : (totalPaid > 0 ? totalPaid : 0);
  const remainingBalance = Math.max(0, totalCost - totalPaid);
  const paymentPercentage = totalCost > 0 ? Math.min(100, Math.round((totalPaid / totalCost) * 100)) : (totalPaid > 0 ? 100 : 0);

  const paymentsCount = verifiedPayments.length;
  const averagePayment = paymentsCount > 0 ? Math.round(totalPaid / paymentsCount) : 0;
  const largestPayment = paymentsCount > 0 ? Math.max(...verifiedPayments.map((p) => p.amount)) : 0;

  return {
    totalCost,
    totalPaid,
    remainingBalance,
    paymentPercentage,
    averagePayment,
    largestPayment,
    paymentsCount,
  };
}

export async function fetchDeliveryAssets(
  projectId?: string | null,
  isReadOnly = false
): Promise<DeliveryAsset[]> {
  const summary = await fetchPaymentSummary(projectId);

  let rawData: any[] = [];
  try {
    let query = (supabase as any)
      .from('delivery_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId && projectId !== 'all') {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (!error && data) {
      rawData = data;
    }
  } catch {}

  return rawData.map((row: any) => {
    const unlockType = row.unlock_type || '100_percent';
    const isManualUnlocked = Boolean(row.is_manual_unlocked);

    let isUnlocked = false;
    if (!isReadOnly) {
      isUnlocked = true;
    } else {
      if (isManualUnlocked) {
        isUnlocked = true;
      } else if (unlockType === 'manual') {
        isUnlocked = isManualUnlocked;
      } else {
        isUnlocked = summary.remainingBalance <= 0 && summary.paymentPercentage >= 100;
      }
    }

    return {
      id: String(row.id),
      projectId: String(row.project_id),
      title: row.title || 'Deliverable',
      description: row.description || null,
      assetType: row.asset_type || 'google_drive',
      assetUrl: isUnlocked ? (row.asset_url || '') : '',
      storagePath: isUnlocked ? (row.storage_path || null) : null,
      unlockType,
      isManualUnlocked,
      isArchived: Boolean(row.is_archived),
      sortOrder: Number(row.sort_order || 0),
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      isUnlocked,
    };
  });
}

// React Query Hooks

export function useProjectPayments(projectId?: string | null) {
  return useQuery<PaymentEntry[]>({
    queryKey: ['project-payments', projectId],
    queryFn: () => fetchProjectPayments(projectId),
    staleTime: 1000 * 30,
  });
}

export function usePaymentSummary(projectId?: string | null) {
  return useQuery<PaymentSummaryStats>({
    queryKey: ['payment-summary', projectId],
    queryFn: () => fetchPaymentSummary(projectId),
    staleTime: 1000 * 30,
  });
}

export function useDeliveryAssets(projectId?: string | null, isReadOnly = false) {
  return useQuery<DeliveryAsset[]>({
    queryKey: ['delivery-assets', projectId, isReadOnly],
    queryFn: () => fetchDeliveryAssets(projectId, isReadOnly),
    staleTime: 1000 * 30,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePaymentInput) => {
      let invoiceUrl: string | null = null;
      let receiptUrl: string | null = null;

      if (input.invoiceFile) {
        const fileExt = input.invoiceFile.name.split('.').pop();
        const filePath = `projects/${input.projectId}/invoices/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: invUpload, error: invErr } = await supabase.storage
          .from('project-invoices')
          .upload(filePath, input.invoiceFile);

        if (!invErr && invUpload?.path) {
          const { data: pData } = supabase.storage.from('project-invoices').getPublicUrl(invUpload.path);
          invoiceUrl = pData?.publicUrl || invUpload.path;
        }
      }

      if (input.receiptFile) {
        const fileExt = input.receiptFile.name.split('.').pop();
        const filePath = `projects/${input.projectId}/receipts/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: recUpload, error: recErr } = await supabase.storage
          .from('project-receipts')
          .upload(filePath, input.receiptFile);

        if (!recErr && recUpload?.path) {
          const { data: pData } = supabase.storage.from('project-receipts').getPublicUrl(recUpload.path);
          receiptUrl = pData?.publicUrl || recUpload.path;
        }
      }

      const { data, error } = await (supabase as any)
        .from('project_payments')
        .insert({
          project_id: input.projectId,
          amount: input.amount,
          currency: input.currency || 'INR',
          payment_method: input.paymentMethod,
          transaction_id: input.transactionId || null,
          payment_date: input.paymentDate || new Date().toISOString(),
          is_verified: input.isVerified ?? true,
          notes: input.notes || null,
          invoice_url: invoiceUrl,
          receipt_url: receiptUrl,
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-assets'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await (supabase as any)
        .from('project_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-assets'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
    },
  });
}

export function useCreateDeliveryAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDeliveryAssetInput) => {
      let finalAssetUrl = input.assetUrl;
      let storagePath = input.storagePath || null;

      if (input.deliverableFile) {
        const path = `projects/${input.projectId}/deliverables/${Date.now()}_${input.deliverableFile.name}`;
        const { data: delUpload, error: delErr } = await supabase.storage
          .from('project-deliverables')
          .upload(path, input.deliverableFile);

        if (!delErr && delUpload?.path) {
          storagePath = delUpload.path;
          const { data: pData } = supabase.storage.from('project-deliverables').getPublicUrl(delUpload.path);
          finalAssetUrl = pData?.publicUrl || delUpload.path;
        }
      }

      const { data, error } = await (supabase as any)
        .from('delivery_assets')
        .insert({
          project_id: input.projectId,
          title: input.title,
          description: input.description || null,
          asset_type: input.assetType,
          asset_url: finalAssetUrl || '',
          storage_path: storagePath,
          unlock_type: input.unlockType,
          is_manual_unlocked: input.isManualUnlocked ?? false,
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-assets'] });
    },
  });
}

export function useToggleManualUnlock() {
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
      queryClient.invalidateQueries({ queryKey: ['delivery-assets'] });
    },
  });
}

export function useDeleteDeliveryAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await (supabase as any)
        .from('delivery_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-assets'] });
    },
  });
}

export function useUpdateProjectBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, budget }: { projectId: string; budget: number }) => {
      const { data, error } = await (supabase as any)
        .from('projects')
        .update({ budget, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-assets'] });
    },
  });
}
