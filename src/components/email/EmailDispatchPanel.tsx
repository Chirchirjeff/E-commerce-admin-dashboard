'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  Mail, Send, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  RefreshCw, Info, User, Package, ShieldCheck, DollarSign,
  Store, KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEmailDispatch, type SendPayload } from '@/hooks/useEmailDispatch';
import type { EmailTemplate } from '@/lib/email';

// ---------------------------------------------------------------------------
// Template catalogue — one entry per template type
// ---------------------------------------------------------------------------

type TemplateKey = EmailTemplate['type'];

interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

interface TemplateDef {
  key: TemplateKey;
  label: string;
  description: string;
  icon: React.ElementType;
  fields: TemplateField[];
  /** Build props object from form values */
  buildProps: (values: Record<string, string>) => Record<string, unknown>;
}

const TEMPLATES: TemplateDef[] = [
  {
    key: 'passwordChanged',
    label: 'Password Changed',
    description: 'Security alert sent after a password change.',
    icon: KeyRound,
    fields: [
      { key: 'recipientName', label: 'Recipient name', type: 'text', required: true, placeholder: 'Alice Mwangi' },
      { key: 'changedAt', label: 'Changed at (ISO)', type: 'text', required: true, placeholder: new Date().toISOString(), defaultValue: new Date().toISOString() },
      { key: 'ipAddress', label: 'IP address (optional)', type: 'text', placeholder: '41.90.64.1' },
      { key: 'device', label: 'Device (optional)', type: 'text', placeholder: 'Chrome on macOS' },
    ],
    buildProps: (v) => ({
      recipientName: v.recipientName,
      changedAt: v.changedAt,
      ...(v.ipAddress ? { ipAddress: v.ipAddress } : {}),
      ...(v.device ? { device: v.device } : {}),
    }),
  },
  {
    key: 'orderTracking',
    label: 'Order Tracking',
    description: 'Order status update with tracking details.',
    icon: Package,
    fields: [
      { key: 'recipientName', label: 'Recipient name', type: 'text', required: true, placeholder: 'Brian Otieno' },
      { key: 'orderId', label: 'Order ID', type: 'text', required: true, placeholder: 'QZ-20240801-0042' },
      {
        key: 'orderStatus', label: 'Status', type: 'select', required: true,
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'processing', label: 'Processing' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'out_for_delivery', label: 'Out for delivery' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'returned', label: 'Returned' },
        ],
        defaultValue: 'shipped',
      },
      { key: 'statusLabel', label: 'Status label', type: 'text', placeholder: 'Shipped' },
      { key: 'trackingNumber', label: 'Tracking number', type: 'text', placeholder: 'KE123456789' },
      { key: 'trackingUrl', label: 'Tracking URL', type: 'text', placeholder: 'https://track.example.com/...' },
      { key: 'estimatedDelivery', label: 'Est. delivery', type: 'text', placeholder: 'Thursday, 25 Aug 2026' },
      { key: 'vendorName', label: 'Vendor name', type: 'text', placeholder: 'TechHub Kenya' },
      { key: 'totalAmount', label: 'Total (KES)', type: 'number', required: true, placeholder: '4500' },
      {
        key: 'itemsJson',
        label: 'Items JSON',
        type: 'textarea',
        required: true,
        placeholder: '[{"name":"Product","quantity":1,"price":4500}]',
        defaultValue: '[{"name":"Sample Product","quantity":1,"price":4500}]',
      },
      { key: 'updatedAt', label: 'Updated at (ISO)', type: 'text', required: true, placeholder: new Date().toISOString(), defaultValue: new Date().toISOString() },
    ],
    buildProps: (v) => {
      let items = [];
      try { items = JSON.parse(v.itemsJson || '[]'); } catch { items = []; }
      return {
        recipientName: v.recipientName,
        orderId: v.orderId,
        orderStatus: v.orderStatus,
        ...(v.statusLabel ? { statusLabel: v.statusLabel } : {}),
        ...(v.trackingNumber ? { trackingNumber: v.trackingNumber } : {}),
        ...(v.trackingUrl ? { trackingUrl: v.trackingUrl } : {}),
        ...(v.estimatedDelivery ? { estimatedDelivery: v.estimatedDelivery } : {}),
        ...(v.vendorName ? { vendorName: v.vendorName } : {}),
        totalAmount: Number(v.totalAmount) || 0,
        items,
        updatedAt: v.updatedAt,
      };
    },
  },
  {
    key: 'welcomeUser',
    label: 'Welcome User',
    description: 'Onboarding email for new customers, vendors, or admins.',
    icon: User,
    fields: [
      { key: 'recipientName', label: 'Recipient name', type: 'text', required: true, placeholder: 'Grace Njoroge' },
      { key: 'email', label: 'Account email', type: 'email', required: true, placeholder: 'grace@example.com' },
      {
        key: 'role', label: 'Role', type: 'select', required: true,
        options: [
          { value: 'customer', label: 'Customer' },
          { value: 'vendor', label: 'Vendor' },
          { value: 'admin', label: 'Admin' },
        ],
        defaultValue: 'customer',
      },
      { key: 'temporaryPassword', label: 'Temporary password (optional)', type: 'text', placeholder: 'Tmp@8324X' },
      { key: 'ctaUrl', label: 'CTA URL (optional)', type: 'text', placeholder: 'https://quza.app/dashboard' },
    ],
    buildProps: (v) => ({
      recipientName: v.recipientName,
      email: v.email,
      role: v.role,
      ...(v.temporaryPassword ? { temporaryPassword: v.temporaryPassword } : {}),
      ...(v.ctaUrl ? { ctaUrl: v.ctaUrl } : {}),
    }),
  },
  {
    key: 'kycStatus',
    label: 'KYC Status',
    description: 'KYC verification outcome — approved, rejected, or pending.',
    icon: ShieldCheck,
    fields: [
      { key: 'recipientName', label: 'Recipient name', type: 'text', required: true, placeholder: 'Samuel Kariuki' },
      {
        key: 'userType', label: 'User type', type: 'select', required: true,
        options: [
          { value: 'customer', label: 'Customer' },
          { value: 'vendor', label: 'Vendor' },
        ],
        defaultValue: 'vendor',
      },
      {
        key: 'outcome', label: 'Outcome', type: 'select', required: true,
        options: [
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'pending_more_info', label: 'Pending more info' },
        ],
        defaultValue: 'approved',
      },
      { key: 'reason', label: 'Reason / note (optional)', type: 'textarea', placeholder: 'Documents were blurry...' },
      {
        key: 'requiredDocumentsJson', label: 'Required documents JSON (optional)',
        type: 'textarea',
        placeholder: '["National ID (front & back)", "Utility bill"]',
      },
      { key: 'actionUrl', label: 'Action URL (optional)', type: 'text', placeholder: 'https://quza.app/kyc' },
    ],
    buildProps: (v) => {
      let docs: string[] = [];
      try { docs = JSON.parse(v.requiredDocumentsJson || '[]'); } catch { docs = []; }
      return {
        recipientName: v.recipientName,
        userType: v.userType,
        outcome: v.outcome,
        ...(v.reason ? { reason: v.reason } : {}),
        ...(docs.length ? { requiredDocuments: docs } : {}),
        ...(v.actionUrl ? { actionUrl: v.actionUrl } : {}),
      };
    },
  },
  {
    key: 'payoutNotification',
    label: 'Payout Notification',
    description: 'Vendor payout status update.',
    icon: DollarSign,
    fields: [
      { key: 'recipientName', label: 'Recipient name', type: 'text', required: true, placeholder: 'Faith Kamau' },
      { key: 'storeName', label: 'Store name', type: 'text', required: true, placeholder: 'FashionHub KE' },
      { key: 'payoutId', label: 'Payout ID', type: 'text', required: true, placeholder: 'PY-20260825-007' },
      {
        key: 'status', label: 'Status', type: 'select', required: true,
        options: [
          { value: 'initiated', label: 'Initiated' },
          { value: 'processing', label: 'Processing' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' },
        ],
        defaultValue: 'completed',
      },
      { key: 'amount', label: 'Amount (KES)', type: 'number', required: true, placeholder: '47850' },
      { key: 'destinationAccount', label: 'Destination account', type: 'text', required: true, placeholder: 'M-Pesa ****2234' },
      { key: 'initiatedAt', label: 'Initiated at (ISO)', type: 'text', required: true, defaultValue: new Date().toISOString(), placeholder: new Date().toISOString() },
      { key: 'settledAt', label: 'Settled at (ISO, optional)', type: 'text', placeholder: new Date().toISOString() },
      { key: 'period', label: 'Period (optional)', type: 'text', placeholder: '18 Aug – 24 Aug 2026' },
      { key: 'orderCount', label: 'Order count (optional)', type: 'number', placeholder: '12' },
      { key: 'failureReason', label: 'Failure reason (optional)', type: 'textarea', placeholder: 'Insufficient M-Pesa float...' },
    ],
    buildProps: (v) => ({
      recipientName: v.recipientName,
      storeName: v.storeName,
      payoutId: v.payoutId,
      status: v.status,
      amount: Number(v.amount) || 0,
      destinationAccount: v.destinationAccount,
      initiatedAt: v.initiatedAt,
      ...(v.settledAt ? { settledAt: v.settledAt } : {}),
      ...(v.period ? { period: v.period } : {}),
      ...(v.orderCount ? { orderCount: Number(v.orderCount) } : {}),
      ...(v.failureReason ? { failureReason: v.failureReason } : {}),
    }),
  },
  {
    key: 'vendorApproval',
    label: 'Vendor Approval',
    description: 'Vendor store approval, rejection, or suspension.',
    icon: Store,
    fields: [
      { key: 'recipientName', label: 'Recipient name', type: 'text', required: true, placeholder: 'James Mwangi' },
      { key: 'storeName', label: 'Store name', type: 'text', required: true, placeholder: 'Organic Greens KE' },
      {
        key: 'outcome', label: 'Outcome', type: 'select', required: true,
        options: [
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'suspended', label: 'Suspended' },
        ],
        defaultValue: 'approved',
      },
      { key: 'adminNote', label: 'Admin note (optional)', type: 'textarea', placeholder: 'All documents verified...' },
      {
        key: 'nextStepsJson', label: 'Next steps JSON (optional)',
        type: 'textarea',
        placeholder: '["Fix your ID document","Resubmit application"]',
      },
      { key: 'reviewedAt', label: 'Reviewed at (ISO)', type: 'text', required: true, defaultValue: new Date().toISOString(), placeholder: new Date().toISOString() },
    ],
    buildProps: (v) => {
      let steps: string[] = [];
      try { steps = JSON.parse(v.nextStepsJson || '[]'); } catch { steps = []; }
      return {
        recipientName: v.recipientName,
        storeName: v.storeName,
        outcome: v.outcome,
        ...(v.adminNote ? { adminNote: v.adminNote } : {}),
        ...(steps.length ? { nextSteps: steps } : {}),
        reviewedAt: v.reviewedAt,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
  value: string;
  onChange: (val: string) => void;
}) {
  if (field.type === 'select' && field.options) {
    return (
      <Select value={value || field.defaultValue || ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="min-h-[70px] font-mono text-xs"
      />
    );
  }

  return (
    <Input
      type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function EmailDispatchPanel() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDef>(TEMPLATES[0]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subjectOverride, setSubjectOverride] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sentLog, setSentLog] = useState<
    Array<{ id: string; template: string; to: string; time: string; success: boolean; error?: string }>
  >([]);

  const { status, send, reset } = useEmailDispatch();

  // Reset form when template changes
  const handleTemplateChange = useCallback((key: string) => {
    const tmpl = TEMPLATES.find((t) => t.key === key)!;
    setSelectedTemplate(tmpl);
    // Seed defaults
    const defaults: Record<string, string> = {};
    tmpl.fields.forEach((f) => {
      if (f.defaultValue) defaults[f.key] = f.defaultValue;
    });
    setFormValues(defaults);
    reset();
  }, [reset]);

  const handleFieldChange = useCallback((key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSend = useCallback(async () => {
    if (!recipientEmail.trim()) return;

    const props = selectedTemplate.buildProps(formValues);
    const payload: SendPayload = {
      to: recipientEmail.trim(),
      type: selectedTemplate.key,
      props,
      ...(subjectOverride.trim() ? { subject: subjectOverride.trim() } : {}),
    };

    const result = await send(payload);

    setSentLog((prev) => [
      {
        id: result.messageId ?? `local-${Date.now()}`,
        template: selectedTemplate.label,
        to: recipientEmail.trim(),
        time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
        success: result.success,
        error: result.error,
      },
      ...prev.slice(0, 19), // keep last 20
    ]);
  }, [recipientEmail, selectedTemplate, formValues, subjectOverride, send]);

  const isSending = status === 'sending';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const TemplateIcon = selectedTemplate.icon;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ── Left: composer ── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Template picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Email Template
            </CardTitle>
            <CardDescription>Choose the notification type to send.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                const active = tmpl.key === selectedTemplate.key;
                return (
                  <button
                    key={tmpl.key}
                    onClick={() => handleTemplateChange(tmpl.key)}
                    className={cn(
                      'flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:bg-accent',
                      active && 'border-primary bg-primary/5 ring-1 ring-primary'
                    )}
                  >
                    <Icon
                      className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')}
                    />
                    <span
                      className={cn(
                        'text-xs font-medium leading-tight',
                        active ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {tmpl.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Template description */}
            <div className="mt-4 flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>{selectedTemplate.description}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recipient */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recipient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="recipient-email">To *</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            {/* Advanced toggle */}
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Advanced options
            </button>

            {showAdvanced && (
              <div className="space-y-3 border-t pt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="subject-override">Subject override (optional)</Label>
                  <Input
                    id="subject-override"
                    placeholder="Leave blank to use the auto-generated subject"
                    value={subjectOverride}
                    onChange={(e) => setSubjectOverride(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template fields */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TemplateIcon className="h-4 w-4" />
              {selectedTemplate.label} — Template Data
            </CardTitle>
            <CardDescription>
              Fill in the data that will appear inside the email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedTemplate.fields.map((field) => (
                <div
                  key={field.key}
                  className={cn(
                    'space-y-1.5',
                    (field.type === 'textarea') && 'sm:col-span-2'
                  )}
                >
                  <Label htmlFor={`field-${field.key}`}>
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </Label>
                  <FieldInput
                    field={field}
                    value={
                      formValues[field.key] ??
                      (field.defaultValue || '')
                    }
                    onChange={(val) => handleFieldChange(field.key, val)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Send button + feedback */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={handleSend}
            disabled={isSending || !recipientEmail.trim()}
            className="sm:w-auto"
            size="lg"
          >
            {isSending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>

          {isSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Email dispatched successfully.
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              Failed — see dispatch log for details.
            </div>
          )}
        </div>
      </div>

      {/* ── Right: dispatch log ── */}
      <div className="space-y-4">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dispatch Log</CardTitle>
            <CardDescription>Last 20 emails sent this session.</CardDescription>
          </CardHeader>
          <CardContent>
            {sentLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No emails sent yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {sentLog.map((entry, i) => (
                  <li
                    key={`${entry.id}-${i}`}
                    className="flex flex-col gap-1 rounded-md border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{entry.template}</span>
                      <Badge
                        variant={entry.success ? 'success' : 'destructive'}
                        className="flex-shrink-0"
                      >
                        {entry.success ? 'Sent' : 'Failed'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      To: {entry.to}
                    </span>
                    <span className="text-xs text-muted-foreground">{entry.time}</span>
                    {!entry.success && entry.error && (
                      <span className="text-xs text-destructive mt-0.5">
                        {entry.error}
                      </span>
                    )}
                    {entry.success && entry.id && !entry.id.startsWith('local-') && (
                      <span className="text-xs text-muted-foreground font-mono truncate">
                        ID: {entry.id}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick reference */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Templates Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <li key={tmpl.key} className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">{tmpl.label}</p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {tmpl.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
