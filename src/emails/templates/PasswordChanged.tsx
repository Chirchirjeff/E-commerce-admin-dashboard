import { Heading, Text, Button, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from '../BaseLayout';
import { brand } from '../brand';

export interface PasswordChangedProps {
  recipientName: string;
  /** ISO timestamp of when the change occurred */
  changedAt: string;
  /** IP address that initiated the change, if available */
  ipAddress?: string;
  /** Device / user-agent hint, if available */
  device?: string;
}

/**
 * Sent to a user immediately after their password is successfully changed.
 */
export default function PasswordChanged({
  recipientName,
  changedAt,
  ipAddress,
  device,
}: PasswordChangedProps) {
  const formattedDate = new Date(changedAt).toLocaleString('en-KE', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <BaseLayout preview="Your Quza password was changed">
      {/* Alert banner */}
      <Section
        style={{
          backgroundColor: '#fff7ed',
          border: `1px solid #fed7aa`,
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '28px',
        }}
      >
        <Text
          style={{
            color: '#c2410c',
            fontSize: '13px',
            fontWeight: '600',
            margin: 0,
          }}
        >
          🔐 Security notice — your password was changed
        </Text>
      </Section>

      <Heading
        style={{
          color: brand.textPrimary,
          fontSize: '22px',
          fontWeight: '700',
          margin: '0 0 16px',
        }}
      >
        Hi {recipientName},
      </Heading>

      <Text
        style={{
          color: brand.textPrimary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 20px',
        }}
      >
        Your Quza account password was successfully changed. If you made this
        change, you can safely ignore this email.
      </Text>

      {/* Details table */}
      <Section
        style={{
          backgroundColor: brand.bodyBg,
          borderRadius: '6px',
          padding: '20px 24px',
          marginBottom: '28px',
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
          Change details
        </Text>
        <Row label="Date &amp; time" value={formattedDate} />
        {ipAddress && <Row label="IP address" value={ipAddress} />}
        {device && <Row label="Device" value={device} />}
      </Section>

      <Text
        style={{
          color: brand.textPrimary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 28px',
        }}
      >
        If you did <strong>not</strong> make this change, your account may be
        compromised. Please reset your password immediately and contact our
        support team.
      </Text>

      <Button
        href={`${brand.storefrontUrl}/forgot-password`}
        style={{
          backgroundColor: brand.danger,
          color: '#ffffff',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          padding: '12px 28px',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Reset My Password
      </Button>

      <Hr style={{ borderColor: brand.border, margin: '32px 0 20px' }} />

      <Text
        style={{
          color: brand.textMuted,
          fontSize: '12px',
          lineHeight: '20px',
          margin: 0,
        }}
      >
        If you have any questions, reply to this email or contact us at{' '}
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

/** Inline label/value row used inside the details box */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text
      style={{
        color: brand.textPrimary,
        fontSize: '13px',
        lineHeight: '22px',
        margin: '0 0 4px',
      }}
    >
      <span style={{ color: brand.textMuted, minWidth: '110px', display: 'inline-block' }}>
        {label}:
      </span>{' '}
      <strong>{value}</strong>
    </Text>
  );
}

PasswordChanged.PreviewProps = {
  recipientName: 'Alice Mwangi',
  changedAt: new Date().toISOString(),
  ipAddress: '41.90.64.1',
  device: 'Chrome on macOS',
} satisfies PasswordChangedProps;
