/**
 * Quza Email Service
 * ------------------
 * Server-side only. Renders a React Email template to HTML and dispatches it
 * through the backend's central Gmail SMTP transport. Import this module exclusively from API Route Handlers or
 * Server Actions — never from client components.
 *
 * Usage:
 *   import { sendEmail } from '@/lib/email';
 *   await sendEmail('orderTracking', { to: 'user@example.com', props: { ... } });
 */

import { render } from '@react-email/components';
import * as React from 'react';

import { brand } from '@/emails/brand';
import PasswordChanged, {
  type PasswordChangedProps,
} from '@/emails/templates/PasswordChanged';
import OrderTracking, {
  type OrderTrackingProps,
} from '@/emails/templates/OrderTracking';
import WelcomeUser, {
  type WelcomeUserProps,
} from '@/emails/templates/WelcomeUser';
import KycStatus, {
  type KycStatusProps,
} from '@/emails/templates/KycStatus';
import PayoutNotification, {
  type PayoutNotificationProps,
} from '@/emails/templates/PayoutNotification';
import VendorApproval, {
  type VendorApprovalProps,
} from '@/emails/templates/VendorApproval';

// ---------------------------------------------------------------------------
// Backend SMTP transport
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Template registry — maps a string key to its React component + subject line
// ---------------------------------------------------------------------------

export type EmailTemplate =
  | { type: 'passwordChanged'; props: PasswordChangedProps }
  | { type: 'orderTracking'; props: OrderTrackingProps }
  | { type: 'welcomeUser'; props: WelcomeUserProps }
  | { type: 'kycStatus'; props: KycStatusProps }
  | { type: 'payoutNotification'; props: PayoutNotificationProps }
  | { type: 'vendorApproval'; props: VendorApprovalProps };

type TemplateType = EmailTemplate['type'];

/** Derive the props type for a given template key (narrows the union) */
type PropsForTemplate<T extends TemplateType> = Extract<
  EmailTemplate,
  { type: T }
>['props'];

interface TemplateDefinition<P> {
  component: React.ComponentType<P>;
  subject: (props: P) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEMPLATE_REGISTRY: Record<TemplateType, TemplateDefinition<any>> = {
  passwordChanged: {
    component: PasswordChanged,
    subject: (p: PasswordChangedProps) =>
      `[Quza] Your password was changed — ${p.recipientName}`,
  },
  orderTracking: {
    component: OrderTracking,
    subject: (p: OrderTrackingProps) =>
      `[Quza] Order ${p.orderId} — ${p.statusLabel ?? p.orderStatus}`,
  },
  welcomeUser: {
    component: WelcomeUser,
    subject: (p: WelcomeUserProps) => `Welcome to Quza, ${p.recipientName}!`,
  },
  kycStatus: {
    component: KycStatus,
    subject: (p: KycStatusProps) => {
      const labels: Record<string, string> = {
        approved: 'KYC Approved',
        rejected: 'KYC Rejected',
        pending_more_info: 'Action Required: KYC Pending Info',
      };
      return `[Quza] ${labels[p.outcome] ?? 'KYC Update'} — ${p.recipientName}`;
    },
  },
  payoutNotification: {
    component: PayoutNotification,
    subject: (p: PayoutNotificationProps) => {
      const labels: Record<string, string> = {
        initiated: 'Payout Initiated',
        processing: 'Payout Processing',
        completed: 'Payout Sent',
        failed: 'Payout Failed',
      };
      return `[Quza] ${labels[p.status] ?? 'Payout Update'} — KES ${p.amount.toLocaleString('en-KE')}`;
    },
  },
  vendorApproval: {
    component: VendorApproval,
    subject: (p: VendorApprovalProps) => {
      const labels: Record<string, string> = {
        approved: '🎉 Your store is approved!',
        rejected: 'Vendor Application Update',
        suspended: 'Important: Store Suspended',
      };
      return `[Quza] ${labels[p.outcome] ?? 'Vendor Update'} — ${p.storeName}`;
    },
  },
};

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

export interface SendEmailOptions<T extends TemplateType> {
  /** Recipient address, or array of addresses (max 50 via Resend) */
  to: string | string[];
  /** Override the computed subject line */
  subjectOverride?: string;
  /** Reply-To address */
  replyTo?: string;
  /** Admin bearer token forwarded by the authenticated API route */
  authorization?: string;
  /** Template type key */
  type: T;
  /** Strongly-typed props for the chosen template */
  props: PropsForTemplate<T>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Render a Quza email template and send it via Resend.
 *
 * @example
 * const result = await sendEmail({
 *   to: 'customer@example.com',
 *   type: 'orderTracking',
 *   props: { recipientName: 'Alice', orderId: 'QZ-001', ... },
 * });
 */
export async function sendEmail<T extends TemplateType>(
  options: SendEmailOptions<T>
): Promise<SendEmailResult> {
  const { to, subjectOverride, replyTo, authorization, type, props } = options;

  const definition = TEMPLATE_REGISTRY[type];
  if (!definition) {
    return { success: false, error: `Unknown email template type: "${type}"` };
  }

  let html: string;
  try {
    html = await render(React.createElement(definition.component, props));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Quza Email] Template render failed (${type}):`, message);
    return { success: false, error: `Template render error: ${message}` };
  }

  const subject = subjectOverride ?? definition.subject(props);

  try {
    if (!authorization) {
      return { success: false, error: 'Authentication is required to send email.' };
    }

    const backendUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
    const response = await fetch(`${backendUrl}/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authorization },
      body: JSON.stringify({
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { replyTo } : {}),
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = Array.isArray(payload.message) ? payload.message.join(', ') : payload.message;
      console.error(`[Quza Email] SMTP API error (${type}):`, error ?? response.status);
      return { success: false, error: error ?? 'Email delivery failed.' };
    }

    return { success: true, messageId: payload.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Quza Email] Unexpected send error (${type}):`, message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Convenience wrappers — thin typed helpers for each template
// ---------------------------------------------------------------------------

type BaseOpts = Pick<
  SendEmailOptions<TemplateType>,
  'to' | 'subjectOverride' | 'replyTo'
>;

export const emailService = {
  sendPasswordChanged: (opts: BaseOpts & { props: PasswordChangedProps }) =>
    sendEmail({ ...opts, type: 'passwordChanged' }),

  sendOrderTracking: (opts: BaseOpts & { props: OrderTrackingProps }) =>
    sendEmail({ ...opts, type: 'orderTracking' }),

  sendWelcome: (opts: BaseOpts & { props: WelcomeUserProps }) =>
    sendEmail({ ...opts, type: 'welcomeUser' }),

  sendKycStatus: (opts: BaseOpts & { props: KycStatusProps }) =>
    sendEmail({ ...opts, type: 'kycStatus' }),

  sendPayoutNotification: (opts: BaseOpts & { props: PayoutNotificationProps }) =>
    sendEmail({ ...opts, type: 'payoutNotification' }),

  sendVendorApproval: (opts: BaseOpts & { props: VendorApprovalProps }) =>
    sendEmail({ ...opts, type: 'vendorApproval' }),
};
