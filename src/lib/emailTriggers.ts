/**
 * emailTriggers.ts
 * ----------------
 * Thin, fire-and-forget helpers that call POST /api/email/send from client
 * components after a user action succeeds.
 *
 * All functions are intentionally non-throwing — a failed email never
 * surfaces an error to the UI. Failures are logged to the console only.
 *
 * Import these from client components to trigger emails without coupling
 * the email logic directly into page mutation handlers.
 */

import type { SendPayload } from '@/hooks/useEmailDispatch';

async function fireEmail(payload: SendPayload): Promise<void> {
  const token =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('access_token')
      : null;

  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.warn('[emailTrigger] Send failed:', body.error ?? res.status);
    }
  } catch (err) {
    console.warn('[emailTrigger] Network error:', err);
  }
}

// ---------------------------------------------------------------------------
// KYC Vendor — approval
// ---------------------------------------------------------------------------

export interface KycApproveEmailOpts {
  /** Vendor's email address */
  recipientEmail: string;
  /** Vendor's full name */
  recipientName: string;
  /** Store / business name */
  storeName: string;
  /** Optional note left by the admin */
  adminNote?: string;
}

export function triggerVendorApprovedEmail(opts: KycApproveEmailOpts): void {
  fireEmail({
    to: opts.recipientEmail,
    type: 'vendorApproval',
    props: {
      recipientName: opts.recipientName,
      storeName: opts.storeName,
      outcome: 'approved',
      adminNote: opts.adminNote,
      reviewedAt: new Date().toISOString(),
    },
  });
}

// ---------------------------------------------------------------------------
// KYC Vendor — rejection
// ---------------------------------------------------------------------------

export interface KycRejectEmailOpts {
  recipientEmail: string;
  recipientName: string;
  storeName: string;
  /** The rejection reason to show the vendor */
  reason: string;
  /** Suggested documents to re-upload, if any */
  requiredDocuments?: string[];
}

export function triggerVendorRejectedEmail(opts: KycRejectEmailOpts): void {
  fireEmail({
    to: opts.recipientEmail,
    type: 'vendorApproval',
    props: {
      recipientName: opts.recipientName,
      storeName: opts.storeName,
      outcome: 'rejected',
      adminNote: opts.reason,
      nextSteps: opts.requiredDocuments?.length
        ? [
            'Review the reason for rejection above.',
            'Fix the flagged documents and resubmit.',
            ...opts.requiredDocuments.map((d) => `Provide: ${d}`),
          ]
        : ['Review the rejection reason and resubmit with corrected documents.'],
      reviewedAt: new Date().toISOString(),
    },
  });
}

// ---------------------------------------------------------------------------
// KYC — generic status (for clients or more granular outcomes)
// ---------------------------------------------------------------------------

export interface KycStatusEmailOpts {
  recipientEmail: string;
  recipientName: string;
  userType: 'customer' | 'vendor';
  outcome: 'approved' | 'rejected' | 'pending_more_info';
  reason?: string;
  requiredDocuments?: string[];
}

export function triggerKycStatusEmail(opts: KycStatusEmailOpts): void {
  fireEmail({
    to: opts.recipientEmail,
    type: 'kycStatus',
    props: {
      recipientName: opts.recipientName,
      userType: opts.userType,
      outcome: opts.outcome,
      reason: opts.reason,
      requiredDocuments: opts.requiredDocuments,
    },
  });
}

// ---------------------------------------------------------------------------
// Payout status update
// ---------------------------------------------------------------------------

export interface PayoutEmailOpts {
  recipientEmail: string;
  recipientName: string;
  storeName: string;
  payoutId: string;
  status: 'initiated' | 'processing' | 'completed' | 'failed';
  amount: number;
  destinationAccount: string;
  period?: string;
  orderCount?: number;
  failureReason?: string;
}

export function triggerPayoutEmail(opts: PayoutEmailOpts): void {
  fireEmail({
    to: opts.recipientEmail,
    type: 'payoutNotification',
    props: {
      recipientName: opts.recipientName,
      storeName: opts.storeName,
      payoutId: opts.payoutId,
      status: opts.status,
      amount: opts.amount,
      destinationAccount: opts.destinationAccount,
      initiatedAt: new Date().toISOString(),
      period: opts.period,
      orderCount: opts.orderCount,
      failureReason: opts.failureReason,
    },
  });
}

// ---------------------------------------------------------------------------
// Order tracking update
// ---------------------------------------------------------------------------

export interface OrderTrackingEmailOpts {
  recipientEmail: string;
  recipientName: string;
  orderId: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  statusLabel?: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  vendorName?: string;
}

export function triggerOrderTrackingEmail(opts: OrderTrackingEmailOpts): void {
  fireEmail({
    to: opts.recipientEmail,
    type: 'orderTracking',
    props: {
      recipientName: opts.recipientName,
      orderId: opts.orderId,
      orderStatus: opts.orderStatus,
      statusLabel: opts.statusLabel,
      totalAmount: opts.totalAmount,
      items: opts.items,
      trackingNumber: opts.trackingNumber,
      trackingUrl: opts.trackingUrl,
      estimatedDelivery: opts.estimatedDelivery,
      vendorName: opts.vendorName,
      updatedAt: new Date().toISOString(),
    },
  });
}

// ---------------------------------------------------------------------------
// Welcome — new user (customer / vendor / admin)
// ---------------------------------------------------------------------------

export interface WelcomeEmailOpts {
  recipientEmail: string;
  recipientName: string;
  role: 'customer' | 'vendor' | 'admin';
  temporaryPassword?: string;
  ctaUrl?: string;
}

export function triggerWelcomeEmail(opts: WelcomeEmailOpts): void {
  fireEmail({
    to: opts.recipientEmail,
    type: 'welcomeUser',
    props: {
      recipientName: opts.recipientName,
      email: opts.recipientEmail,
      role: opts.role,
      temporaryPassword: opts.temporaryPassword,
      ctaUrl: opts.ctaUrl,
    },
  });
}

// ---------------------------------------------------------------------------
// Password changed security alert
// ---------------------------------------------------------------------------

export interface PasswordChangedEmailOpts {
  recipientEmail: string;
  recipientName: string;
  ipAddress?: string;
  device?: string;
}

export function triggerPasswordChangedEmail(opts: PasswordChangedEmailOpts): void {
  fireEmail({
    to: opts.recipientEmail,
    type: 'passwordChanged',
    props: {
      recipientName: opts.recipientName,
      changedAt: new Date().toISOString(),
      ipAddress: opts.ipAddress,
      device: opts.device,
    },
  });
}
