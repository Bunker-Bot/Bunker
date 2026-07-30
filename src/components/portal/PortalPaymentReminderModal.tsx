import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Tick02Icon,
  Download01Icon,
  QrCodeIcon,
  SecurityCheckIcon,
  AlertCircleIcon,
  CreditCardIcon,
  LockKeyIcon,
  SparklesIcon,
  Loading03Icon
} from '@hugeicons/core-free-icons';
import { Badge } from '../ui/badge';
import { QRCodeSVG } from './QRCodeSVG';

interface PortalPaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  payments: any[];
  assets: any[];
  milestones: any[];
  onRefetch?: () => void;
}

export const PortalPaymentReminderModal: React.FC<PortalPaymentReminderModalProps> = ({
  isOpen,
  onClose,
  project,
  payments,
  assets = [],
  milestones = [],
  onRefetch,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pollCountdown, setPollCountdown] = useState(15);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);

  // UPI Provider Slide Tabs (PhonePe & Paytm)
  const upiTabs = [
    {
      id: 'phonepe',
      label: 'PhonePe',
      upiId: import.meta.env.VITE_UPI_PHONEPE || '6300570415@axl',
    },
    {
      id: 'paytm',
      label: 'Paytm',
      upiId: import.meta.env.VITE_UPI_PAYTM || '6300570415@pthdfc',
    },
  ];
  const [activeTabId, setActiveTabId] = useState('phonepe');

  const lockedAssetsList = assets;
  const activeMilestonesCount = (milestones || []).length;

  // Calculations
  const currencySymbol =
    project?.currency === 'USD' ? '$' : project?.currency === 'EUR' ? '€' : project?.currency === 'GBP' ? '£' : '₹';
  
  const verifiedPayments = (payments || []).filter((p) => p.is_verified !== false);
  const totalPaid = verifiedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const rawBudget = Number(project?.budget || project?.amount || 0);
  const totalBudget = rawBudget > 0 ? rawBudget : (totalPaid > 0 ? totalPaid : 0);
  
  const remainingAmount = Math.max(0, totalBudget - totalPaid);
  const paymentPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalPaid / totalBudget) * 100)) : (totalPaid > 0 ? 100 : 0);

  const merchantName = project?.merchant_name || 'Bunker Enterprise Studio';

  // Selected Active UPI Details
  const activeUpiTab = upiTabs.find((t) => t.id === activeTabId) || upiTabs[0];
  const upiId = project?.upi_id || activeUpiTab.upiId;
  const invoiceNumber = project?.invoice_number || `INV-${(project?.id || '2026').substring(0, 6).toUpperCase()}`;

  // Active UPI payment QR string (literal @ in pa parameter for 100% PhonePe/Paytm scanner compatibility)
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${remainingAmount}&cu=${project?.currency || 'INR'}&tn=Invoice%20${invoiceNumber}`;

  // 15-second polling interval when user clicks "I've Completed Payment"
  useEffect(() => {
    let timer: any = null;
    if (isVerifying) {
      timer = setInterval(() => {
        setPollCountdown((prev) => {
          if (prev <= 1) {
            if (onRefetch) onRefetch();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setPollCountdown(15);
    }
    return () => clearInterval(timer);
  }, [isVerifying, onRefetch]);

  // Check if payment percentage reached 100% while modal open
  useEffect(() => {
    if (paymentPercentage >= 100 && isVerifying) {
      setIsVerifying(false);
      setPaymentSuccessToast(true);
      setTimeout(() => {
        setPaymentSuccessToast(false);
        onClose();
      }, 3000);
    }
  }, [paymentPercentage, isVerifying, onClose]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleStartVerification = () => {
    setIsVerifying(true);
    if (onRefetch) onRefetch();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop Dark Glass Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container (rounded-sm) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-[920px] rounded-sm border border-zinc-800 bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black/95 shadow-2xl backdrop-blur-2xl overflow-hidden font-mono text-xs select-none max-h-[92vh] flex flex-col"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <HugeiconsIcon icon={LockKeyIcon} size={16} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Payment & Unlock Center</span>
                  <Badge variant="outline" className="rounded-sm bg-amber-950/80 text-amber-300 border-amber-800 text-[9px] uppercase font-bold">
                    {paymentPercentage}% Paid
                  </Badge>
                </h2>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Complete remaining balance to instantly unlock all project deliverables & downloads.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-sm bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={15} />
            </button>
          </div>

          {/* Success Toast */}
          {paymentSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-4 rounded-sm bg-emerald-950/90 border border-emerald-800 text-emerald-300 flex items-center gap-3"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-xs font-bold">Payment Verified & Project Unlocked!</strong>
                <span className="text-[11px] text-emerald-200 font-sans">
                  Thank you! Your remaining balance has been verified and full lifetime access has been granted.
                </span>
              </div>
            </motion.div>
          )}

          {/* Body Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto custom-scrollbar flex-1 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
            {/* LEFT COLUMN: Project & Financial Summary (7 Cols) */}
            <div className="lg:col-span-7 p-5 sm:p-6 space-y-6">
              {/* Project Card Header */}
              <div className="p-4 rounded-sm bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Project Workspace</div>
                  <h3 className="text-sm font-bold text-white truncate">{project?.name || 'Project Workspace'}</h3>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Client: <strong className="text-zinc-200">{project?.client_name || 'Valued Enterprise Client'}</strong>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-zinc-500 font-sans block">Completion</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {project?.completion_percent || project?.completionPercent || 75}%
                  </span>
                </div>
              </div>

              {/* Outstanding Balance Banner */}
              <div className="p-4 rounded-sm bg-gradient-to-r from-amber-950/40 via-zinc-900/80 to-zinc-900/60 border border-amber-800/50 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                    Outstanding Balance
                  </span>
                  <span className="text-zinc-400 font-sans">Invoice #{invoiceNumber}</span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
                      {currencySymbol}
                      {remainingAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-amber-400/80 font-sans ml-2 font-semibold">Remaining to Pay</span>
                  </div>
                </div>

                {/* Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-[10px]">
                  <div>
                    <span className="text-zinc-500 font-sans block">Already Paid</span>
                    <strong className="text-emerald-400 font-mono">
                      {currencySymbol}
                      {totalPaid.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-sans block">Remaining</span>
                    <strong className="text-amber-300 font-mono">
                      {currencySymbol}
                      {remainingAmount.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-sans block">Total Value</span>
                    <strong className="text-zinc-300 font-mono">
                      {currencySymbol}
                      {totalBudget.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <HugeiconsIcon icon={CreditCardIcon} size={13} className="text-cyan-400" />
                    Payment Progress
                  </span>
                  <span className="font-mono text-zinc-300 font-bold">{paymentPercentage}% Paid</span>
                </div>
                <div className="w-full h-3 bg-zinc-950 rounded-sm overflow-hidden p-0.5 border border-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${paymentPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-sm"
                  />
                </div>
              </div>

              {/* Deliverable Unlock Timeline */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-white block">
                  Deliverable Milestone Unlocks ({activeMilestonesCount > 0 ? activeMilestonesCount : 4})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-sm bg-zinc-900/60 border border-emerald-800/50 space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold">
                      <span>25% Milestone</span>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-white block truncate">Requirements</span>
                    <span className="text-[9px] text-emerald-300 font-sans block">✓ Unlocked</span>
                  </div>

                  <div className="p-2.5 rounded-sm bg-zinc-900/60 border border-emerald-800/50 space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold">
                      <span>50% Milestone</span>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-white block truncate">Prototype</span>
                    <span className="text-[9px] text-emerald-300 font-sans block">✓ Unlocked</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-sm bg-zinc-900/60 border ${
                      paymentPercentage >= 75 ? 'border-emerald-800/50' : 'border-amber-800/50 opacity-90'
                    } space-y-1`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span className={paymentPercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}>75% Milestone</span>
                      <HugeiconsIcon
                        icon={paymentPercentage >= 75 ? CheckmarkCircle02Icon : LockKeyIcon}
                        size={12}
                        className={paymentPercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white block truncate">Quality Testing</span>
                    <span
                      className={`text-[9px] font-sans block ${
                        paymentPercentage >= 75 ? 'text-emerald-300' : 'text-amber-300'
                      }`}
                    >
                      {paymentPercentage >= 75 ? '✓ Unlocked' : '🔒 Locked'}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-sm bg-zinc-900/60 border ${
                      paymentPercentage >= 100 ? 'border-emerald-800/50' : 'border-zinc-800 opacity-75'
                    } space-y-1`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span className={paymentPercentage >= 100 ? 'text-emerald-400' : 'text-zinc-400'}>100% Final</span>
                      <HugeiconsIcon
                        icon={paymentPercentage >= 100 ? CheckmarkCircle02Icon : LockKeyIcon}
                        size={12}
                        className={paymentPercentage >= 100 ? 'text-emerald-400' : 'text-zinc-500'}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white block truncate">Full Delivery</span>
                    <span
                      className={`text-[9px] font-sans block ${
                        paymentPercentage >= 100 ? 'text-emerald-300' : 'text-zinc-400'
                      }`}
                    >
                      {paymentPercentage >= 100 ? '✓ Unlocked' : '🔒 Locked'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deliverable Unlock Preview Cards (Locked Assets) */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Locked Project Deliverables</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Unlocks after payment</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lockedAssetsList.slice(0, 4).map((ast: any) => {
                    const reqThreshold =
                      ast.unlock_type === '25_percent'
                        ? '25%'
                        : ast.unlock_type === '50_percent'
                        ? '50%'
                        : ast.unlock_type === '75_percent'
                        ? '75%'
                        : ast.unlock_type === '90_percent'
                        ? '90%'
                        : ast.unlock_type === '95_percent'
                        ? '95%'
                        : '100%';
                    return (
                      <div
                        key={ast.id}
                        className="p-3 rounded-sm bg-zinc-950 border border-zinc-800 relative overflow-hidden flex items-center justify-between"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <span className="text-[11px] font-bold text-white block truncate">{ast.title}</span>
                          <span className="text-[9px] text-zinc-500 font-sans block truncate">
                            {ast.description || 'Deliverable Package'}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-sm bg-amber-950/80 text-amber-300 border-amber-800 text-[9px] uppercase font-bold shrink-0"
                        >
                          🔒 {reqThreshold}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefits Card */}
              <div className="p-4 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <HugeiconsIcon icon={SparklesIcon} size={14} className="text-cyan-400" />
                  What You Instantly Unlock After Payment
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans text-zinc-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>All Production Deliverables</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Full Source Code Downloads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Architecture & Setup Docs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Deployment Scripts & Keys</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Lifetime Unrestricted Access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Dedicated Technical Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: QR Payment & Actions (5 Cols) */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-zinc-950/90 space-y-5 flex flex-col justify-between">
              {/* Payment Verification State UI */}
              {isVerifying ? (
                <div className="p-6 rounded-sm bg-zinc-900/80 border border-cyan-800/60 text-center space-y-4 my-auto">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
                    <HugeiconsIcon icon={Loading03Icon} size={32} className="text-cyan-400 animate-spin" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Payment Verification in Progress</h3>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      We're verifying your payment with the server. This usually takes less than one minute.
                    </p>
                  </div>

                  <div className="p-3 rounded-sm bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-400 font-mono">
                    Auto-checking server status in <strong className="text-cyan-400">{pollCountdown}s</strong>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (onRefetch) onRefetch();
                        setPollCountdown(15);
                      }}
                      className="px-3 py-1.5 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Check Status Now
                    </button>
                    <button
                      onClick={() => setIsVerifying(false)}
                      className="px-3 py-1.5 rounded-sm bg-transparent hover:bg-zinc-900 text-zinc-400 text-xs font-sans cursor-pointer"
                    >
                      Back to Payment
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* QR Code Section */}
                  <div className="space-y-3 text-center">
                    <div className="flex items-center justify-between text-white font-bold text-sm">
                      <span className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={QrCodeIcon} size={18} className="text-cyan-400" />
                        Scan to Pay
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded-sm border border-cyan-800">
                        {activeUpiTab.label}
                      </span>
                    </div>

                    {/* UPI Provider Slide Switcher (rounded-sm) */}
                    <div className="flex items-center justify-center p-1 rounded-sm bg-zinc-900 border border-zinc-800 gap-1 w-full">
                      {upiTabs.map((tab) => {
                        const isSelected = activeTabId === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`relative flex-1 py-1.5 px-2 rounded-sm text-[11px] font-bold transition-all cursor-pointer text-center ${
                              isSelected ? 'text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="activeUpiTab"
                                className="absolute inset-0 rounded-sm bg-zinc-800 border border-zinc-700 shadow"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10 block truncate">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 inline-block shadow-xl relative">
                      {project?.qr_code_url ? (
                        <img
                          src={project.qr_code_url}
                          alt="Payment QR"
                          className="w-44 h-44 object-contain rounded-sm bg-white p-1"
                        />
                      ) : (
                        <QRCodeSVG value={upiString} size={180} logoText={activeUpiTab.label} />
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 font-sans max-w-xs mx-auto">
                      Scan using <strong className="text-white">{activeUpiTab.label}</strong>, PhonePe, Google Pay, Paytm or CRED to complete payment.
                    </p>
                  </div>

                  {/* Payment Details Form Cards */}
                  <div className="p-4 rounded-sm bg-zinc-900/70 border border-zinc-800 space-y-2.5 text-[11px]">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-zinc-500 font-sans">Merchant</span>
                      <strong className="text-white font-bold">{merchantName}</strong>
                    </div>

                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-zinc-500 font-sans">UPI ID</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-cyan-400 font-mono">{upiId}</strong>
                        <button
                          onClick={handleCopyUpi}
                          className="p-1 rounded-sm hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                          title="Copy UPI ID"
                        >
                          <HugeiconsIcon
                            icon={copiedUpi ? Tick02Icon : Copy01Icon}
                            size={12}
                            className={copiedUpi ? 'text-emerald-400' : ''}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-zinc-500 font-sans">Amount Due</span>
                      <strong className="text-amber-300 font-mono text-xs">
                        {currencySymbol}
                        {remainingAmount.toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-sans">Invoice Ref</span>
                      <strong className="text-zinc-300 font-mono">{invoiceNumber}</strong>
                    </div>
                  </div>

                  {/* Primary & Secondary Action Buttons (rounded-sm) */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleStartVerification}
                      className="w-full py-3 rounded-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-extrabold text-xs tracking-wide shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                      <span>I've Completed Payment</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleCopyUpi}
                        className="py-2 px-3 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <HugeiconsIcon icon={copiedUpi ? Tick02Icon : Copy01Icon} size={13} />
                        <span>{copiedUpi ? 'Copied' : 'Copy UPI ID'}</span>
                      </button>

                      {project?.invoice_url ? (
                        <a
                          href={project.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <HugeiconsIcon icon={Download01Icon} size={13} />
                          <span>Download Invoice</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            alert(`Invoice #${invoiceNumber} download request initiated.`);
                          }}
                          className="py-2 px-3 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <HugeiconsIcon icon={Download01Icon} size={13} />
                          <span>Invoice</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Verified Payment History */}
              {verifiedPayments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    Verified Payment History
                  </span>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                    {verifiedPayments.map((pay: any, idx: number) => (
                      <div
                        key={pay.id || idx}
                        className="flex items-center justify-between p-2 rounded-sm bg-zinc-900/60 border border-zinc-850 text-[10px]"
                      >
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-emerald-400" />
                          <span className="text-zinc-300 font-sans">
                            {pay.payment_date ? new Date(pay.payment_date).toLocaleDateString() : 'Paid'}
                          </span>
                        </div>
                        <strong className="text-emerald-400 font-mono">
                          +{currencySymbol}
                          {Number(pay.amount).toLocaleString()}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supported Payment Methods Badges */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block text-center">
                  Accepted Payment Methods
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-mono text-zinc-400">
                  <span className="px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">UPI</span>
                  <span className="px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">Razorpay</span>
                  <span className="px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">Stripe</span>
                  <span className="px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">Google Pay</span>
                  <span className="px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">PhonePe</span>
                  <span className="px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">Paytm</span>
                  <span className="px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">Bank Transfer</span>
                </div>
              </div>

              {/* Trust Indicators Footer */}
              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-sans pt-2 border-t border-zinc-800/80">
                <span className="flex items-center gap-1 text-emerald-400">
                  <HugeiconsIcon icon={SecurityCheckIcon} size={12} />
                  256-bit Secure
                </span>
                <span>Verified Merchant</span>
                <span>Instant Unlock</span>
                <span className="text-zinc-400 font-mono">Protected by Bunker</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PortalPaymentReminderModal;
