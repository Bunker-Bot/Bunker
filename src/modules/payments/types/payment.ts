export type PaymentMethod =
  | 'Bank Transfer'
  | 'UPI'
  | 'PayPal'
  | 'Stripe'
  | 'Wise'
  | 'Cash'
  | 'Cheque'
  | 'Crypto'
  | 'Custom';

export type UnlockType =
  | 'immediate'
  | '25_percent'
  | '50_percent'
  | '75_percent'
  | '100_percent'
  | 'manual';

export type AssetType =
  | 'google_drive'
  | 'source_code'
  | 'setup_video'
  | 'deployment_guide'
  | 'credentials'
  | 'api_docs'
  | 'database_backup'
  | 'apk_ipa'
  | 'zip_archive'
  | 'license_key'
  | 'custom';

export interface PaymentEntry {
  id: string;
  projectId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionId?: string | null;
  paymentDate: string;
  isVerified: boolean;
  notes?: string | null;
  invoiceUrl?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummaryStats {
  totalCost: number;
  totalPaid: number;
  remainingBalance: number;
  paymentPercentage: number;
  averagePayment: number;
  largestPayment: number;
  paymentsCount: number;
}

export interface DeliveryAsset {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  assetType: AssetType;
  assetUrl: string;
  storagePath?: string | null;
  unlockType: UnlockType;
  isManualUnlocked: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  isUnlocked?: boolean;
}

export interface CreatePaymentInput {
  projectId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate?: string;
  isVerified?: boolean;
  notes?: string;
  invoiceFile?: File | null;
  receiptFile?: File | null;
}

export interface CreateDeliveryAssetInput {
  projectId: string;
  title: string;
  description?: string;
  assetType: AssetType;
  assetUrl: string;
  storagePath?: string;
  unlockType: UnlockType;
  isManualUnlocked?: boolean;
  deliverableFile?: File | null;
}
