import {
  Heading,
  Text,
  Button,
  Section,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from '../BaseLayout';
import { brand } from '../brand';

export type KycOutcome = 'approved' | 'rejected' | 'pending_more_info';
export type KycUserType = 'customer' | 'vendor';

export interface KycStatusProps {
  recipientName: string;
  userType: KycUserType;
  outcome: KycOutcome;
  /** Specific reason shown on rejection or pending-more-info */
  reason?: string;
  /** Documents or info specifically requested (for pending_more_info) */
  requiredDocuments?: string[];
  /** Link to re-upload documents or check status */
  actionUrl?: string;
}

const OUTCOME_CONFIG: Record<
  KycOutcome,
  {
    colour: string;
    bg: string;
    icon: string;
    title: string;
    body: (userType: KycUserType) => string;
    ctaLabel: string;
  }
> = {
  approved: {
    colour: '#065f46',
    bg: '#d1fae5',
    icon: '✅',
    title: 'KYC Verification Approved',
    body: (t) =>
      t === 'vendor'
        ? 'Congratulations! Your vendor account has been fully verified. You can now list products and start selling on Quza.'
        : 'Your identity has been verified. You now have full access to all Quza features.',
    ctaLabel: 'Go to Dashboard',
  },
  rejected: {
    colour: '#991b1b',
    bg: '#fee2e2',
    icon: '❌',
    title: 'KYC Verification Rejected',
    body: (t) =>
      t === 'vendor'
        ? 'Unfortunately, we could not verify your vendor account at this time. Please review the reason below and resubmit.'
        : 'We could not verify your identity at this time. Please review the reason below and resubmit your documents.',
    ctaLabel: 'Resubmit Documents',
  },
  pending_more_info: {
    colour: '#92400e',
    bg: '#fef3c7',
    icon: '📋',
    title: 'Additional Information Required',
    body: (t) =>
      t === 'vendor'
        ? 'Your vendor KYC review is on hold — we need a few more documents before we can complete verification.'
        : 'Your identity verification is on hold. We need a bit more information to complete the process.',
    ctaLabel: 'Upload Documents',
  },
};

export default function KycStatus({
  recipientName,
  userType,
  outcome,
  reason,
  requiredDocuments,
  actionUrl,
}: KycStatusProps) {
  const config = OUTCOME_CONFIG[outcome];
  const resolvedUrl =
    actionUrl ??
    (userType === 'vendor'
      ? `${brand.storefrontUrl}/vendor/kyc`
      : `${brand.storefrontUrl}/account/kyc`);

  return (
    <BaseLayout preview={`Quza KYC update — ${config.title}`}>
      {/* Status banner */}
      <Section
        style={{
          backgroundColor: config.bg,
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '28px',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            fontSize: '28px',
            margin: '0 0 6px',
            lineHeight: '1',
          }}
        >
          {config.icon}
        </Text>
        <Text
          style={{
            color: config.colour,
            fontSize: '16px',
            fontWeight: '700',
            margin: 0,
          }}
        >
          {config.title}
        </Text>
      </Section>

      <Heading
        style={{
          color: brand.textPrimary,
          fontSize: '20px',
          fontWeight: '700',
          margin: '0 0 12px',
        }}
      >
        Hi {recipientName},
      </Heading>

      <Text
        style={{
          color: brand.textPrimary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 24px',
        }}
      >
        {config.body(userType)}
      </Text>

      {/* Reason block */}
      {reason && (
        <Section
          style={{
            border: `1px solid ${outcome === 'approved' ? brand.border : '#fca5a5'}`,
            borderLeft: `4px solid ${outcome === 'approved' ? brand.primary : brand.danger}`,
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
            {outcome === 'rejected' ? 'Reason for rejection' : 'Our note'}
          </Text>
          <Text
            style={{
              color: brand.textPrimary,
              fontSize: '14px',
              lineHeight: '22px',
              margin: 0,
            }}
          >
            {reason}
          </Text>
        </Section>
      )}

      {/* Required documents list */}
      {requiredDocuments && requiredDocuments.length > 0 && (
        <Section
          style={{
            backgroundColor: brand.bodyBg,
            borderRadius: '6px',
            padding: '16px 20px',
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
              margin: '0 0 10px',
            }}
          >
            Documents required
          </Text>
          {requiredDocuments.map((doc, i) => (
            <Text
              key={i}
              style={{
                color: brand.textPrimary,
                fontSize: '13px',
                lineHeight: '22px',
                margin: '0 0 4px',
              }}
            >
              • {doc}
            </Text>
          ))}
        </Section>
      )}

      <Section style={{ textAlign: 'center', marginBottom: '8px' }}>
        <Button
          href={resolvedUrl}
          style={{
            backgroundColor:
              outcome === 'approved' ? brand.primary : brand.warning,
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 32px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {config.ctaLabel}
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
        Questions? Contact our verification team at{' '}
        <a
          href={`mailto:${brand.supportEmail}`}
          style={{ color: brand.primary }}
        >
          {brand.supportEmail}
        </a>
        .
      </Text>
    </BaseLayout>
  );
}

KycStatus.PreviewProps = {
  recipientName: 'Samuel Kariuki',
  userType: 'vendor',
  outcome: 'rejected',
  reason:
    'The uploaded National ID image is blurry and cannot be read clearly. Please upload a clear, well-lit photograph.',
  requiredDocuments: [
    'Clear copy of National ID (front & back)',
    'Recent utility bill (last 3 months)',
  ],
} satisfies KycStatusProps;
