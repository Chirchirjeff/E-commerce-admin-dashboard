/**
 * Quza brand tokens — single source of truth for all email templates.
 * Update these values here to propagate changes across every template.
 */

export const brand = {
  name: 'Quza',
  tagline: 'Your Marketplace, Simplified',
  /** Primary brand colour (deep teal/green matching the admin UI) */
  primary: '#0f766e',
  /** Lighter variant for hover states, accents */
  primaryLight: '#14b8a6',
  /** Dark background for the header band */
  headerBg: '#0f172a',
  /** Foreground text on dark header */
  headerFg: '#f8fafc',
  /** Body background */
  bodyBg: '#f1f5f9',
  /** Card / section background */
  cardBg: '#ffffff',
  /** Primary body text */
  textPrimary: '#1e293b',
  /** Secondary / muted text */
  textMuted: '#64748b',
  /** Divider / border colour */
  border: '#e2e8f0',
  /** Success green (used for confirmed / delivered) */
  success: '#16a34a',
  /** Warning amber (used for pending states) */
  warning: '#d97706',
  /** Danger red (used for rejection, cancellation) */
  danger: '#dc2626',
  /** Info blue (used for informational notices) */
  info: '#2563eb',
  /** Footer text */
  footerText: '#94a3b8',
  /** Dispatch address — must be verified in Resend before production use */
  fromAddress:
    process.env.RESEND_FROM_ADDRESS ?? 'Quza <onboarding@resend.dev>',
  /** Public URL of the storefront (used for links inside emails) */
  storefrontUrl: process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'https://quza.app',
  /** Public URL of the admin dashboard */
  adminUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.quza.app',
  /** Optional logo URL — host in /public or a CDN */
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL ?? '',
  /** Social / support */
  supportEmail: process.env.SUPPORT_EMAIL ?? 'support.fontspree@gmail.com',
  twitterUrl: 'https://twitter.com/quzaapp',
  address: '123 Commerce Street, Nairobi, Kenya',
};

export type Brand = typeof brand;
