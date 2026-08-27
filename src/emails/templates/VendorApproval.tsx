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

export type VendorApprovalOutcome = 'approved' | 'rejected' | 'suspended';

export interface VendorApprovalProps {
  recipientName: string;
  storeName: string;
  outcome: VendorApprovalOutcome;
  /** Admin note / reason for outcome */
  adminNote?: string;
  /** Steps vendor must take next (for rejection/suspension) */
  nextSteps?: string[];
  /** Date of review (ISO) */
  reviewedAt: string;
}

const CONFIG: Record<
  VendorApprovalOutcome,
  {
    colour: string;
    bg: string;
    icon: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaUrl: (storeSlug: string) => string;
  }
> = {
  approved: {
    colour: '#065f46',
    bg: '#d1fae5',
    icon: '🎉',
    title: 'Your store is approved!',
    body: 'Congratulations! Your vendor application has been reviewed and approved. Your store is now live on Quza and customers can start finding your products.',
    ctaLabel: 'Go to Seller Dashboard',
    ctaUrl: () => `${brand.storefrontUrl}/vendor/dashboard`,
  },
  rejected: {
    colour: '#991b1b',
    bg: '#fee2e2',
    icon: '❌',
    title: 'Application not approved',
    body: 'After reviewing your vendor application, we are unable to approve it at this time. Please see the details below and you are welcome to reapply once the issues are resolved.',
    ctaLabel: 'Reapply as Vendor',
    ctaUrl: () => `${brand.storefrontUrl}/vendor/apply`,
  },
  suspended: {
    colour: '#92400e',
    bg: '#fef3c7',
    icon: '⚠️',
    title: 'Your store has been suspended',
    body: 'Your vendor account has been temporarily suspended due to a policy concern. Please review the details below and contact our support team to resolve this.',
    ctaLabel: 'Contact Support',
    ctaUrl: () => `mailto:${brand.supportEmail}`,
  },
};

export default function VendorApproval({
  recipientName,
  storeName,
  outcome,
  adminNote,
  nextSteps,
  reviewedAt,
}: VendorApprovalProps) {
  const config = CONFIG[outcome];
  const reviewDate = new Date(reviewedAt).toLocaleString('en-KE', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <BaseLayout preview={`${storeName}: ${config.title}`}>
      {/* Status banner */}
      <Section
        style={{
          backgroundColor: config.bg,
          borderRadius: '6px',
          padding: '20px 24px',
          marginBottom: '28px',
          textAlign: 'center',
        }}
      >
        <Text
          style={{ fontSize: '30px', margin: '0 0 6px', lineHeight: '1' }}
        >
          {config.icon}
        </Text>
        <Text
          style={{
            color: config.colour,
            fontSize: '17px',
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
          margin: '0 0 6px',
        }}
      >
        Hi {recipientName},
      </Heading>

      <Text
        style={{
          color: brand.textMuted,
          fontSize: '13px',
          margin: '0 0 16px',
        }}
      >
        Store: <strong>{storeName}</strong> · Reviewed on {reviewDate}
      </Text>

      <Text
        style={{
          color: brand.textPrimary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 24px',
        }}
      >
        {config.body}
      </Text>

      {/* Admin note */}
      {adminNote && (
        <Section
          style={{
            border: `1px solid ${brand.border}`,
            borderLeft: `4px solid ${
              outcome === 'approved' ? brand.primary : brand.danger
            }`,
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
              margin: '0 0 8px',
            }}
          >
            Note from Quza team
          </Text>
          <Text
            style={{
              color: brand.textPrimary,
              fontSize: '14px',
              lineHeight: '22px',
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{adminNote}&rdquo;
          </Text>
        </Section>
      )}

      {/* Next steps */}
      {nextSteps && nextSteps.length > 0 && (
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
            What to do next
          </Text>
          {nextSteps.map((step, i) => (
            <Row key={i} style={{ marginBottom: '8px' }}>
              <Column style={{ width: '24px', verticalAlign: 'top' }}>
                <Text
                  style={{
                    color: brand.primary,
                    fontSize: '13px',
                    fontWeight: '700',
                    margin: 0,
                  }}
                >
                  {i + 1}.
                </Text>
              </Column>
              <Column>
                <Text
                  style={{
                    color: brand.textPrimary,
                    fontSize: '13px',
                    lineHeight: '20px',
                    margin: 0,
                  }}
                >
                  {step}
                </Text>
              </Column>
            </Row>
          ))}
        </Section>
      )}

      {/* Only show approved perks summary */}
      {outcome === 'approved' && (
        <Section
          style={{
            backgroundColor: '#f0fdf4',
            border: `1px solid #bbf7d0`,
            borderRadius: '6px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <Text
            style={{
              color: '#065f46',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              margin: '0 0 10px',
            }}
          >
            What you can do now
          </Text>
          {[
            '📦  List unlimited products on the marketplace',
            '📊  Access real-time sales analytics',
            '💰  Receive weekly M-Pesa payouts',
            '🌟  Build customer reviews & ratings',
          ].map((item, i) => (
            <Text
              key={i}
              style={{
                color: '#166534',
                fontSize: '13px',
                lineHeight: '22px',
                margin: '0 0 4px',
              }}
            >
              {item}
            </Text>
          ))}
        </Section>
      )}

      <Section style={{ textAlign: 'center' }}>
        <Button
          href={config.ctaUrl(storeName)}
          style={{
            backgroundColor:
              outcome === 'approved'
                ? brand.primary
                : outcome === 'suspended'
                ? brand.warning
                : brand.danger,
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
        Questions? Email us at{' '}
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

VendorApproval.PreviewProps = {
  recipientName: 'James Mwangi',
  storeName: 'Organic Greens KE',
  outcome: 'approved',
  adminNote:
    'All documents verified. Welcome to the Quza marketplace — feel free to start listing your products.',
  reviewedAt: new Date().toISOString(),
} satisfies VendorApprovalProps;
