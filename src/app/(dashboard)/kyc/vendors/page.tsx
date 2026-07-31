'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import {
  Building2, UserCheck, UserX, Clock, Eye, CheckCircle2,
  XCircle, Loader2, RefreshCw, AlertCircle, X, FileText,
  ExternalLink, User, Phone, Mail, MapPin, Hash, Calendar,
  ChevronDown, ChevronUp, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KYCReview {
  id: string;
  status: string;
  comment: string | null;
  createdAt: string;
  admin: { id: string; name: string; email: string };
}

interface KYCRecord {
  id: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  businessName: string;
  businessAddress: string;
  taxId: string;
  phone: string;
  description: string | null;
  idFile: string;
  businessLicense: string;
  message: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  user: { id: string; name: string; email: string; phone: string | null };
  reviews?: KYCReview[];
}

// ---------------------------------------------------------------------------
// Toast system
// ---------------------------------------------------------------------------

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; type: ToastType; title: string; message: string }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur animate-in slide-in-from-bottom-4 duration-300',
            t.type === 'success' && 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
            t.type === 'error'   && 'bg-red-50   border-red-200   dark:bg-red-950   dark:border-red-800',
            t.type === 'info'    && 'bg-blue-50  border-blue-200  dark:bg-blue-950  dark:border-blue-800',
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
            {t.type === 'error'   && <XCircle      className="h-5 w-5 text-red-600   dark:text-red-400"   />}
            {t.type === 'info'    && <AlertCircle  className="h-5 w-5 text-blue-600  dark:text-blue-400"  />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-semibold',
              t.type === 'success' && 'text-green-800 dark:text-green-200',
              t.type === 'error'   && 'text-red-800   dark:text-red-200',
              t.type === 'info'    && 'text-blue-800  dark:text-blue-200',
            )}>{t.title}</p>
            <p className={cn('text-xs mt-0.5',
              t.type === 'success' && 'text-green-700 dark:text-green-300',
              t.type === 'error'   && 'text-red-700   dark:text-red-300',
              t.type === 'info'    && 'text-blue-700  dark:text-blue-300',
            )}>{t.message}</p>
          </div>
          <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const counter = React.useRef(0);
  const add = React.useCallback((type: ToastType, title: string, message: string) => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);
  const dismiss = React.useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, dismiss, success: (t: string, m: string) => add('success', t, m), error: (t: string, m: string) => add('error', t, m) };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function fileUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(path);
}

function fmt(date: string | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

function StatusBadge({ status }: { status: KYCRecord['status'] }) {
  switch (status) {
    case 'PENDING':   return <Badge variant="warning"     className="gap-1"><Clock        className="h-3 w-3" />Pending</Badge>;
    case 'VERIFIED':  return <Badge variant="success"     className="gap-1"><CheckCircle2 className="h-3 w-3" />Verified</Badge>;
    case 'REJECTED':  return <Badge variant="destructive" className="gap-1"><XCircle      className="h-3 w-3" />Rejected</Badge>;
    default:          return <Badge variant="outline">Not Submitted</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Document viewer
// ---------------------------------------------------------------------------

function DocViewer({ label, path }: { label: string; path: string }) {
  const url = fileUrl(path);
  const img = isImage(path);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="relative rounded-xl border overflow-hidden bg-muted min-h-[180px] flex items-center justify-center">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="max-h-64 w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-muted-foreground">
            <FileText className="h-10 w-10 opacity-40" />
            <span className="text-xs">PDF / Document</span>
          </div>
        )}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        Open in new tab
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

interface DrawerProps {
  record: KYCRecord | null;
  onClose: () => void;
  onApprove: (id: string, comment: string) => void;
  onReject: (id: string, reason: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function DetailDrawer({ record, onClose, onApprove, onReject, isApproving, isRejecting }: DrawerProps) {
  const [comment, setComment] = React.useState('');
  const [rejectReason, setRejectReason] = React.useState('');
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);

  // Reset local state when the drawer opens for a new record
  React.useEffect(() => {
    setComment('');
    setRejectReason('');
    setShowRejectForm(false);
    setShowHistory(false);
  }, [record?.id]);

  // Trap scroll behind drawer
  React.useEffect(() => {
    if (record) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [record]);

  if (!record) return null;

  const isPending = record.status === 'PENDING';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-2xl bg-background shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">

        {/* Drawer header */}
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold">{record.businessName}</h2>
            <p className="text-sm text-muted-foreground">
              {record.user.name} · {record.user.email}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={record.status} />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Applicant info ── */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Applicant</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={User}     label="Full name"   value={record.user.name} />
              <InfoRow icon={Mail}     label="Email"       value={record.user.email} />
              <InfoRow icon={Phone}    label="Phone"       value={record.phone || record.user.phone || '—'} />
              <InfoRow icon={Calendar} label="Submitted"   value={fmt(record.submittedAt)} />
            </div>
          </section>

          {/* ── Business info ── */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Building2} label="Business name"    value={record.businessName} />
              <InfoRow icon={Hash}      label="Tax ID / EIN"     value={record.taxId} />
              <InfoRow icon={MapPin}    label="Address"          value={record.businessAddress} className="sm:col-span-2" />
            </div>
            {record.description && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                {record.description}
              </div>
            )}
          </section>

          {/* ── Documents side-by-side ── */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Submitted Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocViewer label="Government ID" path={record.idFile} />
              <DocViewer label="Business License" path={record.businessLicense} />
            </div>
          </section>

          {/* ── Previous admin note ── */}
          {record.message && (
            <section className="rounded-lg border border-muted bg-muted/40 p-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Previous Review Note</p>
              <p className="text-sm">{record.message}</p>
              {record.reviewedAt && (
                <p className="text-xs text-muted-foreground">Reviewed: {fmt(record.reviewedAt)}</p>
              )}
            </section>
          )}

          {/* ── Review history ── */}
          {record.reviews && record.reviews.length > 0 && (
            <section className="space-y-2">
              <button
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowHistory(h => !h)}
              >
                {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Review History ({record.reviews.length})
              </button>
              {showHistory && (
                <div className="space-y-2 border rounded-lg divide-y overflow-hidden">
                  {record.reviews.map(r => (
                    <div key={r.id} className="p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.admin.name}</span>
                        <StatusBadge status={r.status as KYCRecord['status']} />
                      </div>
                      {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
                      <p className="text-xs text-muted-foreground">{fmt(r.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Action forms (only for PENDING) ── */}
          {isPending && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Review Decision</h3>

              {/* Approve comment */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Approval note <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Add a note for the seller (optional)…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              {/* Reject reason (toggled) */}
              {showRejectForm && (
                <div className="space-y-1.5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <label className="text-sm font-semibold text-destructive">Rejection reason <span className="text-destructive">*</span></label>
                  <textarea
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Explain why this submission is being rejected so the seller can resubmit correctly…"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── Sticky action footer ── */}
        {isPending && (
          <div className="flex-shrink-0 border-t bg-background px-6 py-4 space-y-3">
            {!showRejectForm ? (
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isApproving}
                  onClick={() => onApprove(record.id, comment)}
                >
                  {isApproving
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving…</>
                    : <><UserCheck className="mr-2 h-4 w-4" />Approve Vendor</>
                  }
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowRejectForm(true)}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={!rejectReason.trim() || isRejecting}
                  onClick={() => onReject(record.id, rejectReason)}
                >
                  {isRejecting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rejecting…</>
                    : <><UserX className="mr-2 h-4 w-4" />Confirm Rejection</>
                  }
                </Button>
                <Button variant="outline" onClick={() => { setShowRejectForm(false); setRejectReason(''); }}>
                  Cancel
                </Button>
              </div>
            )}
            <p className="text-xs text-center text-muted-foreground">
              {showRejectForm
                ? 'The seller will be notified and can resubmit with the corrected documents.'
                : 'Approving will create the seller\'s shop and grant full dashboard access.'}
            </p>
          </div>
        )}

        {/* Footer for non-pending records */}
        {!isPending && (
          <div className="flex-shrink-0 border-t px-6 py-4">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function InfoRow({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border bg-muted/30 px-3 py-2.5', className)}>
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

const FILTERS = ['PENDING', 'VERIFIED', 'REJECTED', 'ALL'] as const;

function KYCVendorsContent() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = React.useState<string>('PENDING');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // ── List query ──
  const { data: records = [], isLoading, isError, refetch } = useQuery<KYCRecord[]>({
    queryKey: ['kyc', 'all', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const { data } = await apiClient.get(`/kyc/admin/all${params}`);
      return data;
    },
  });

  // ── Detail query — fetches full record with docs + reviews ──
  const { data: detail } = useQuery<KYCRecord>({
    queryKey: ['kyc', 'detail', selectedId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/kyc/${selectedId}`);
      return data;
    },
    enabled: !!selectedId,
  });

  // ── Approve ──
  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      apiClient.post(`/kyc/${id}/approve`, { comment }),
    onSuccess: (_, { id }) => {
      toast.success('Vendor approved', 'The seller has been verified and their shop is now active.');
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
      setSelectedId(null);
    },
    onError: () => toast.error('Approval failed', 'Something went wrong. Please try again.'),
  });

  // ── Reject ──
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(`/kyc/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Vendor rejected', 'The seller has been notified and can resubmit.');
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
      setSelectedId(null);
    },
    onError: () => toast.error('Rejection failed', 'Something went wrong. Please try again.'),
  });

  const pending = records.filter(r => r.status === 'PENDING').length;

  return (
    <>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      <DetailDrawer
        record={detail ?? null}
        onClose={() => setSelectedId(null)}
        onApprove={(id, comment) => approveMutation.mutate({ id, comment })}
        onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Vendor Verification</h1>
            <p className="text-sm text-muted-foreground">Review and approve seller KYC submissions</p>
          </div>
          <div className="flex items-center gap-2">
            {pending > 0 && (
              <Badge variant="warning" className="gap-1">
                <Clock className="h-3 w-3" />{pending} Pending
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <Button
              key={f}
              size="sm"
              variant={statusFilter === f ? 'default' : 'outline'}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading KYC submissions…</span>
          </div>
        )}
        {isError && (
          <Card className="border-destructive/40">
            <CardContent className="flex items-center gap-3 p-4 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">Failed to load records. Check your connection and try again.</p>
            </CardContent>
          </Card>
        )}
        {!isLoading && !isError && records.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <ShieldCheck className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">No submissions for this filter</p>
              <p className="text-xs">All {statusFilter.toLowerCase()} KYC records will appear here.</p>
            </CardContent>
          </Card>
        )}

        {/* Record list */}
        <div className="grid gap-3">
          {records.map(record => (
            <Card
              key={record.id}
              className="cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setSelectedId(record.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5 min-w-0">
                    <CardTitle className="text-base truncate">{record.businessName}</CardTitle>
                    <CardDescription className="truncate">
                      {record.user.name} · {record.user.email}
                    </CardDescription>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    {record.submittedAt && <span>Submitted {fmt(record.submittedAt)}</span>}
                    {record.reviewedAt  && <span>Reviewed {fmt(record.reviewedAt)}</span>}
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={e => { e.stopPropagation(); setSelectedId(record.id); }}>
                    <Eye className="h-3.5 w-3.5" />
                    Review
                  </Button>
                </div>
                {record.message && (
                  <p className="mt-2 text-xs text-muted-foreground border-l-2 border-muted pl-2 line-clamp-1 italic">
                    {record.message}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function KYCVendorsPage() {
  return (
    <ProtectedRoute requiredPermissions={['can_verify_vendors']}>
      <MainLayout>
        <KYCVendorsContent />
      </MainLayout>
    </ProtectedRoute>
  );
}
