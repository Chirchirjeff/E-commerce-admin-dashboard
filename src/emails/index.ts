/**
 * Central re-export for all Quza email templates and their prop types.
 * Import from here to keep consumer code clean.
 */

export { default as PasswordChanged } from './templates/PasswordChanged';
export type { PasswordChangedProps } from './templates/PasswordChanged';

export { default as OrderTracking } from './templates/OrderTracking';
export type { OrderTrackingProps, OrderStatus, OrderItem } from './templates/OrderTracking';

export { default as WelcomeUser } from './templates/WelcomeUser';
export type { WelcomeUserProps, UserRole } from './templates/WelcomeUser';

export { default as KycStatus } from './templates/KycStatus';
export type { KycStatusProps, KycOutcome, KycUserType } from './templates/KycStatus';

export { default as PayoutNotification } from './templates/PayoutNotification';
export type { PayoutNotificationProps, PayoutStatus } from './templates/PayoutNotification';

export { default as VendorApproval } from './templates/VendorApproval';
export type { VendorApprovalProps, VendorApprovalOutcome } from './templates/VendorApproval';
