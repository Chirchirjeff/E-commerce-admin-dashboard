import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
  Link,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import { brand } from './brand';

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

/**
 * Quza base email layout — wraps every template with a consistent
 * branded header, outer container and footer.
 */
export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>

      <Tailwind>
        <Body
          style={{
            backgroundColor: brand.bodyBg,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            margin: 0,
            padding: 0,
          }}
        >
          <Preview>{preview}</Preview>

          {/* Outer wrapper */}
          <Container
            style={{
              maxWidth: '600px',
              margin: '32px auto',
              backgroundColor: brand.bodyBg,
            }}
          >
            {/* ── Header band ── */}
            <Section
              style={{
                backgroundColor: brand.headerBg,
                borderRadius: '8px 8px 0 0',
                padding: '24px 32px',
              }}
            >
              <Row>
                <Column>
                  {brand.logoUrl ? (
                    <Img
                      src={brand.logoUrl}
                      width="120"
                      height="40"
                      alt="Quza"
                      style={{ display: 'block' }}
                    />
                  ) : (
                    <Text
                      style={{
                        color: brand.headerFg,
                        fontSize: '26px',
                        fontWeight: '800',
                        margin: 0,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      Quza
                    </Text>
                  )}
                </Column>
                <Column align="right">
                  <Text
                    style={{
                      color: brand.primaryLight,
                      fontSize: '11px',
                      fontWeight: '500',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {brand.tagline}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* ── Content card ── */}
            <Section
              style={{
                backgroundColor: brand.cardBg,
                padding: '40px 40px 32px',
                borderLeft: `1px solid ${brand.border}`,
                borderRight: `1px solid ${brand.border}`,
              }}
            >
              {children}
            </Section>

            {/* ── Footer ── */}
            <Section
              style={{
                backgroundColor: brand.cardBg,
                borderTop: `1px solid ${brand.border}`,
                borderLeft: `1px solid ${brand.border}`,
                borderRight: `1px solid ${brand.border}`,
                borderRadius: '0 0 8px 8px',
                padding: '24px 40px',
              }}
            >
              <Hr style={{ borderColor: brand.border, margin: '0 0 16px' }} />
              <Row>
                <Column>
                  <Text
                    style={{
                      color: brand.footerText,
                      fontSize: '11px',
                      margin: '0 0 4px',
                      lineHeight: '18px',
                    }}
                  >
                    {brand.address}
                  </Text>
                  <Text
                    style={{
                      color: brand.footerText,
                      fontSize: '11px',
                      margin: 0,
                      lineHeight: '18px',
                    }}
                  >
                    Need help?{' '}
                    <Link
                      href={`mailto:${brand.supportEmail}`}
                      style={{ color: brand.primary, textDecoration: 'none' }}
                    >
                      {brand.supportEmail}
                    </Link>
                  </Text>
                </Column>
                <Column align="right">
                  <Link
                    href={brand.storefrontUrl}
                    style={{
                      color: brand.primary,
                      fontSize: '11px',
                      textDecoration: 'none',
                    }}
                  >
                    quza.app
                  </Link>
                </Column>
              </Row>
              <Text
                style={{
                  color: brand.footerText,
                  fontSize: '10px',
                  margin: '12px 0 0',
                  textAlign: 'center',
                }}
              >
                © {new Date().getFullYear()} Quza. All rights reserved. · You
                received this because you have an account on Quza.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
