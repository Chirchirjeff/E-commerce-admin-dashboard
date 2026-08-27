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

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface WelcomeUserProps {
  recipientName: string;
  email: string;
  role: UserRole;
  /** Pre-set temporary password — only include if auto-generated */
  temporaryPassword?: string;
  /** Deep link to the relevant onboarding section */
  ctaUrl?: string;
}

const ROLE_CONFIG: Record<
  UserRole,
  { greeting: string; body: string; ctaLabel: string; highlights: string[] }
> = {
  customer: {
    greeting: 'Welcome to Quza!',
    body: "You're all set to start shopping Kenya's best marketplace. Discover thousands of products from verified vendors — all in one place.",
    ctaLabel: 'Start Shopping',
    highlights: [
      '🛍️  Browse products from hundreds of vendors',
      '🚚  Real-time order tracking on every purchase',
      '🔒  Secure M-Pesa & card payments',
      '⭐  Leave reviews to help the community',
    ],
  },
  vendor: {
    greeting: 'Welcome to Quza Seller Hub!',
    body: "Your vendor account has been created. Complete your store profile, list your first product, and start reaching customers across Kenya.",
    ctaLabel: 'Set Up Your Store',
    highlights: [
      '🏪  Customise your storefront & branding',
      '📦  Manage orders from one dashboard',
      '💰  Automated weekly payouts to your M-Pesa',
      '📊  Sales analytics & performance reports',
    ],
  },
  admin: {
    greeting: 'Welcome to the Quza Admin Panel!',
    body: 'Your administrator account is ready. Use the dashboard to manage vendors, orders, KYC verifications, and platform settings.',
    ctaLabel: 'Open Dashboard',
    highlights: [
      '👥  Manage customers, vendors & admins',
      '✅  Process KYC verifications',
      '📋  Monitor orders & disputes',
      '⚙️  Configure platform settings',
    ],
  },
};

export default function WelcomeUser({
  recipientName,
  email,
  role,
  temporaryPassword,
  ctaUrl,
}: WelcomeUserProps) {
  const config = ROLE_CONFIG[role];
  const resolvedCtaUrl =
    ctaUrl ??
    (role === 'admin' ? brand.adminUrl : brand.storefrontUrl);

  return (
    <BaseLayout preview={`Welcome to Quza, ${recipientName}!`}>
      {/* Hero accent */}
      <Section
        style={{
          background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryLight} 100%)`,
          borderRadius: '8px',
          padding: '28px 24px',
          marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            color: '#ffffff',
            fontSize: '32px',
            margin: '0 0 4px',
            lineHeight: '1',
          }}
        >
          👋
        </Text>
        <Heading
          style={{
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: '800',
            margin: '8px 0 0',
          }}
        >
          {config.greeting}
        </Heading>
      </Section>

      <Text
        style={{
          color: brand.textPrimary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 8px',
        }}
      >
        Hi <strong>{recipientName}</strong>,
      </Text>

      <Text
        style={{
          color: brand.textPrimary,
          fontSize: '15px',
          lineHeight: '24px',
          margin: '0 0 28px',
        }}
      >
        {config.body}
      </Text>

      {/* Feature highlights */}
      <Section
        style={{
          backgroundColor: brand.bodyBg,
          borderRadius: '6px',
          padding: '20px 24px',
          marginBottom: '28px',
        }}
      >
        {config.highlights.map((h, i) => (
          <Text
            key={i}
            style={{
              color: brand.textPrimary,
              fontSize: '13px',
              lineHeight: '22px',
              margin: '0 0 6px',
            }}
          >
            {h}
          </Text>
        ))}
      </Section>

      {/* Account credentials */}
      <Section
        style={{
          border: `1px solid ${brand.border}`,
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
          Your account
        </Text>
        <Row>
          <Column>
            <Text
              style={{ color: brand.textMuted, fontSize: '12px', margin: 0 }}
            >
              Email
            </Text>
            <Text
              style={{
                color: brand.textPrimary,
                fontSize: '14px',
                fontWeight: '600',
                margin: '2px 0 0',
              }}
            >
              {email}
            </Text>
          </Column>
          {temporaryPassword && (
            <Column>
              <Text
                style={{ color: brand.textMuted, fontSize: '12px', margin: 0 }}
              >
                Temporary password
              </Text>
              <Text
                style={{
                  color: brand.danger,
                  fontSize: '14px',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  margin: '2px 0 0',
                }}
              >
                {temporaryPassword}
              </Text>
            </Column>
          )}
        </Row>
        {temporaryPassword && (
          <Text
            style={{
              color: brand.warning,
              fontSize: '11px',
              margin: '12px 0 0',
              backgroundColor: '#fef3c7',
              padding: '8px 10px',
              borderRadius: '4px',
            }}
          >
            ⚠️ Please change your password after your first login.
          </Text>
        )}
      </Section>

      <Section style={{ textAlign: 'center' }}>
        <Button
          href={resolvedCtaUrl}
          style={{
            backgroundColor: brand.primary,
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: '700',
            padding: '14px 36px',
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
          textAlign: 'center',
        }}
      >
        If you did not create this account, please ignore this email or contact{' '}
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

WelcomeUser.PreviewProps = {
  recipientName: 'Grace Njoroge',
  email: 'grace@example.com',
  role: 'vendor',
  temporaryPassword: 'Tmp@8324X',
} satisfies WelcomeUserProps;
