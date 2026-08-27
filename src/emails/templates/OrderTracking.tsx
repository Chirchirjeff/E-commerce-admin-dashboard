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

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderTrackingProps {
  recipientName: string;
  orderId: string;
  orderStatus: OrderStatus;
  /** Human-readable label for the status */
  statusLabel?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  totalAmount: number;
  /** ISO date of most recent status update */
  updatedAt: string;
  vendorName?: string;
  shippingAddress?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { colour: string; bg: string; icon: string; message: string }
> = {
  pending: {
    colour: '#92400e',
    bg: '#fef3c7',
    icon: '⏳',
    message: 'Your order has been received and is awaiting confirmation.',
  },
  confirmed: {
    colour: '#1e40af',
    bg: '#dbeafe',
    icon: '✅',
    message: 'Great news — your order has been confirmed!',
  },
  processing: {
    colour: '#1e40af',
    bg: '#dbeafe',
    icon: '📦',
    message: 'Your order is being prepared by the vendor.',
  },
  shipped: {
    colour: '#065f46',
    bg: '#d1fae5',
    icon: '🚚',
    message: 'Your order is on its way! Track it with the button below.',
  },
  out_for_delivery: {
    colour: '#065f46',
    bg: '#d1fae5',
    icon: '🏍️',
    message: 'Your order is out for delivery today.',
  },
  delivered: {
    colour: '#065f46',
    bg: '#d1fae5',
    icon: '🎉',
    message: 'Your order has been delivered. Enjoy your purchase!',
  },
  cancelled: {
    colour: '#991b1b',
    bg: '#fee2e2',
    icon: '❌',
    message: 'Your order has been cancelled. Reach out if you have questions.',
  },
  returned: {
    colour: '#6b21a8',
    bg: '#f3e8ff',
    icon: '↩️',
    message: 'Your return has been initiated. We will process it shortly.',
  },
};

/** Progress steps shown for active orders */
const PROGRESS_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

function getStepIndex(status: OrderStatus) {
  const idx = PROGRESS_STEPS.indexOf(status);
  return idx === -1 ? -1 : idx;
}

export default function OrderTracking({
  recipientName,
  orderId,
  orderStatus,
  statusLabel,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  items,
  totalAmount,
  updatedAt,
  vendorName,
  shippingAddress,
}: OrderTrackingProps) {
  const config = STATUS_CONFIG[orderStatus];
  const stepIndex = getStepIndex(orderStatus);
  const showProgress =
    orderStatus !== 'cancelled' && orderStatus !== 'returned';
  const updatedDate = new Date(updatedAt).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <BaseLayout
      preview={`Order ${orderId} update — ${statusLabel ?? orderStatus}`}
    >
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
            fontWeight: '600',
            margin: 0,
          }}
        >
          {config.icon}&nbsp;&nbsp;{config.message}
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
        Order #{orderId} · Updated {updatedDate}
      </Text>

      {/* Progress bar (for non-terminal statuses) */}
      {showProgress && (
        <Section style={{ marginBottom: '32px' }}>
          <Row>
            {PROGRESS_STEPS.map((step, i) => {
              const active = i <= stepIndex;
              const current = i === stepIndex;
              return (
                <Column key={step} align="center">
                  {/* Circle */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: active ? brand.primary : brand.border,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: current
                        ? `3px solid ${brand.primaryLight}`
                        : 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Text
                    style={{
                      color: active ? brand.primary : brand.textMuted,
                      fontSize: '10px',
                      fontWeight: current ? '700' : '400',
                      margin: '4px 0 0',
                      textAlign: 'center',
                      textTransform: 'capitalize',
                    }}
                  >
                    {step.replace(/_/g, ' ')}
                  </Text>
                </Column>
              );
            })}
          </Row>
        </Section>
      )}

      {/* Order details */}
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
          Order details
        </Text>

        {items.map((item, i) => (
          <Row key={i} style={{ marginBottom: '8px' }}>
            <Column>
              <Text
                style={{
                  color: brand.textPrimary,
                  fontSize: '13px',
                  margin: 0,
                }}
              >
                {item.name}{' '}
                <span style={{ color: brand.textMuted }}>× {item.quantity}</span>
              </Text>
            </Column>
            <Column align="right">
              <Text
                style={{
                  color: brand.textPrimary,
                  fontSize: '13px',
                  fontWeight: '500',
                  margin: 0,
                }}
              >
                KES {(item.price * item.quantity).toLocaleString('en-KE')}
              </Text>
            </Column>
          </Row>
        ))}

        <Hr style={{ borderColor: brand.border, margin: '12px 0' }} />

        <Row>
          <Column>
            <Text
              style={{
                color: brand.textPrimary,
                fontSize: '14px',
                fontWeight: '700',
                margin: 0,
              }}
            >
              Total
            </Text>
          </Column>
          <Column align="right">
            <Text
              style={{
                color: brand.primary,
                fontSize: '16px',
                fontWeight: '700',
                margin: 0,
              }}
            >
              KES {totalAmount.toLocaleString('en-KE')}
            </Text>
          </Column>
        </Row>

        {(trackingNumber || estimatedDelivery || vendorName || shippingAddress) && (
          <>
            <Hr style={{ borderColor: brand.border, margin: '12px 0' }} />
            {vendorName && (
              <InfoRow label="Sold by" value={vendorName} />
            )}
            {shippingAddress && (
              <InfoRow label="Ship to" value={shippingAddress} />
            )}
            {trackingNumber && (
              <InfoRow label="Tracking #" value={trackingNumber} />
            )}
            {estimatedDelivery && (
              <InfoRow label="Est. delivery" value={estimatedDelivery} />
            )}
          </>
        )}
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center', marginBottom: '8px' }}>
        {trackingUrl ? (
          <Button
            href={trackingUrl}
            style={{
              backgroundColor: brand.primary,
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              padding: '12px 32px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Track My Order
          </Button>
        ) : (
          <Button
            href={`${brand.storefrontUrl}/orders/${orderId}`}
            style={{
              backgroundColor: brand.primary,
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              padding: '12px 32px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            View Order
          </Button>
        )}
      </Section>
    </BaseLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Text
      style={{
        color: brand.textPrimary,
        fontSize: '13px',
        lineHeight: '22px',
        margin: '0 0 4px',
      }}
    >
      <span
        style={{
          color: brand.textMuted,
          minWidth: '90px',
          display: 'inline-block',
        }}
      >
        {label}:
      </span>{' '}
      {value}
    </Text>
  );
}

OrderTracking.PreviewProps = {
  recipientName: 'Brian Otieno',
  orderId: 'QZ-20240801-0042',
  orderStatus: 'shipped',
  statusLabel: 'Shipped',
  trackingNumber: 'KE123456789',
  trackingUrl: 'https://track.example.com/KE123456789',
  estimatedDelivery: 'Thursday, 25 Aug 2026',
  items: [
    { name: 'Wireless Earbuds Pro', quantity: 1, price: 4500 },
    { name: 'Phone Case (Black)', quantity: 2, price: 850 },
  ],
  totalAmount: 6200,
  updatedAt: new Date().toISOString(),
  vendorName: 'TechHub Kenya',
  shippingAddress: 'Tom Mboya St, Nairobi',
} satisfies OrderTrackingProps;
