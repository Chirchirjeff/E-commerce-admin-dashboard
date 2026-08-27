import {
  Heading,
  Text,
  Button,
  Section,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from '../BaseLayout';
import { brand } from '../brand';

export type PayoutStatus = 'initiated' | 'processing' | 'completed' | 'failed';

export interface PayoutNotificationProps {
  recipientName: string;
  storeName: string;
  payoutId: string;
  status: PayoutStatus;
  amount: number;
  /** M-Pesa number or bank account (masked) */
  destinationAccount: string;
  /** ISO date */
  initiatedAt: string;
  /** ISO date — only for completed/failed */
  settledAt?: string;
  /** Number of orders included in this payout */
  orderCount?: number;
  /** Period covered e.g. "1 Aug – 7 Aug 2026" */
  period?: string;
  /** Failure reason — only for failed status */
  failureReason?: string;
}

const STATUS_CONFIG: Record<
  PayoutStatus,
  { colour: string; bg: string; icon: string; label: string }
> = {
  initiated: {
    colour: '#1e40af',
    bg: '#dbeafe',
    icon: '🏦',
    label: 'Payout Initiated',
  },
  processing: {
    colour: '#92400e',
    bg: '#fef3c7',
    icon: '⏳',
    label: 'Payout Processing',
  },
  completed: {
    colour: '#065f46',
    bg: '#d1fae5',
    icon: '💸',
    label: 'Payout Completed',
  },
  failed: {
    colour: '#991b1b',
    bg: '#fee2e2',
    icon: '⚠️',
    label: 'Payout Failed',
  },
};

export default function PayoutNotification({
  recipientName,
  storeName,
  payoutId,
  status,
  amount,
  destinationAccount,
  initiatedAt,
  settledAt,
  orderCount,
  period,
  failureReason,
}: PayoutNotificationProps) {
  const config = STATUS_CONFIG[status];
  const initiatedDate = new Date(initiatedAt).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const settledDate = settledAt
    ? new Date(settledAt).toLocaleString('en-KE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <BaseLayout preview={`${config.label} — KES ${amount.toLocaleString('en-KE')}`}>
      {/* Status banner */}
      <Section
        style={{
          backgroundColor: config.bg,
          borderRadius: '6px',
          padding: '14px 18px',
          marginBottom: '28px',
        }}
      >
        <Text
          style={{
            color: config.colour,
            fontSize: '14px',
            fontWeight: '700',
            margin: 0,
          }}
        >
          {config.icon}&nbsp;&nbsp;{config.label}
        </Text>
      </Section>

      <Heading
        style={{
          color: brand.textPrimary,
          fontSize: '22px',
          fontWeight: '700',
          margin: '0 0 6px',
        }}
      >
        Hi {recipientName},
      </Heading>

      <Text
        style={{
          color: brand.textMuted,
          fontSize: '13px',
          margin: '0 0 28px',
        }}
      >
        Store: <strong>{storeName}</strong> · Payout #{payoutId}
      </Text>

      {/* Amount hero */}
      <Section
        style={{
          backgroundColor:
            status === 'completed' ? brand.primary : brand.bodyBg,
          borderRadius: '8px',
          padding: '28px 24px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            color: status === 'completed' ? 'rgba(255,255,255,0.8)' : brand.textMuted,
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: '0 0 6px',
          }}
        >
          Payout amount
        </Text>
        <Text
          style={{
            color: status === 'completed' ? '#ffffff' : brand.textPrimary,
            fontSize: '38px',
            fontWeight: '800',
            margin: 0,
            lineHeight: '1',
          }}
        >
          KES {amount.toLocaleString('en-KE')}
        </Text>
      </Section>

      {/* Details */}
      <Section
        style={{
          backgroundColor: brand.bodyBg,
          borderRadius: '6px',
          padding: '20px 24px',
          marginBottom: '24px',
        }}
      >
        <Text
          style={{
            color: brand.textMuted,
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            margin: '0 0 12px',
          }}
        >
          Payout details
        </Text>

        <DetailRow label="To" value={destinationAccount} />
        <DetailRow label="Initiated" value={initiatedDate} />
        {settledDate && (
          <DetailRow
            label={status === 'failed' ? 'Failed at' : 'Completed'}
            value={settledDate}
          />
        )}
        {period && <DetailRow label="Period" value={period} />}
        {orderCount !== undefined && (
          <DetailRow label="Orders" value={`${orderCount} orders`} />
        )}
      </Section>

      {/* Failure reason */}
      {status === 'failed' && failureReason && (
        <Section
          style={{
            border: `1px solid #fca5a5`,
            borderLeft: `4px solid ${brand.danger}`,
            borderRadius: '4px',
            padding: '14px 18px',
            marginBottom: '24px',
          }}
        >
          <Text
            style={{
              color: brand.textMuted,
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              margin: '0 0 6px',
            }}
          >
            Reason
          </Text>
          <Text
            style={{
              color: brand.danger,
              fontSize: '14px',
              lineHeight: '22px',
              margin: 0,
            }}
          >
            {failureReason}
          </Text>
        </Section>
      )}

      <Section style={{ textAlign: 'center' }}>
        <Button
          href={`${brand.storefrontUrl}/vendor/payouts`}
          style={{
            backgroundColor: status === 'failed' ? brand.danger : brand.primary,
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 32px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {status === 'failed' ? 'View Payout Issue' : 'View Payout History'}
        </Button>
      </Section>

      <Hr style={{ borderColor: brand.border, margin: '32px 0 20px' }} />

      <Text
        style={{
          color: brand.textMuted,
          fontSize: '12px',
          lineHeight: '20px',
          margin: 0,
        }}
      >
        Payout questions? Contact{' '}
        <a
          href={`mailto:${brand.supportEmail}`}
          style={{ color: brand.primary }}
        >
          {brand.supportEmail}
        </a>
        . M-Pesa transactions may take up to 24 hours to reflect.
      </Text>
    </BaseLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ marginBottom: '6px' }}>
      <Column style={{ width: '120px' }}>
        <Text
          style={{
            color: brand.textMuted,
            fontSize: '12px',
            margin: 0,
          }}
        >
          {label}
        </Text>
      </Column>
      <Column>
        <Text
          style={{
            color: brand.textPrimary,
            fontSize: '13px',
            fontWeight: '500',
            margin: 0,
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );
}

PayoutNotification.PreviewProps = {
  recipientName: 'Faith Kamau',
  storeName: 'FashionHub KE',
  payoutId: 'PY-20260825-007',
  status: 'completed',
  amount: 47850,
  destinationAccount: 'M-Pesa ****2234',
  initiatedAt: new Date(Date.now() - 3600000).toISOString(),
  settledAt: new Date().toISOString(),
  orderCount: 12,
  period: '18 Aug – 24 Aug 2026',
} satisfies PayoutNotificationProps;
