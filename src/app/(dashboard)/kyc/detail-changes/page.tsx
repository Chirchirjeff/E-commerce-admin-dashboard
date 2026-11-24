'use client';

/*
 * Seller detail-change review queue — /kyc/detail-changes
 *
 * Sellers request changes to KYC-verified details (legal name, business name,
 * business address, tax PIN) from their dashboard. Each request lands here
 * with the seller's reason and an optional supporting document. Approving
 * applies the change everywhere it is stored; rejecting requires a reason
 * that is emailed to the seller. Email/phone changes are confirmed by the
 * seller with a one-time code and appear here for the audit trail only.
 */

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingStatus, RecordCardsSkeleton } from '@/components/shared/skeletons';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import {
  CheckCircle2, XCircle, Clock, KeyRound, Ban, Loader2, RefreshCw, Paperclip, ArrowRight, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'PENDING_VERIFICATION' | 'PENDING_REVIEW' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

interface ChangeRequest {
  id: string;
  reference: string;
  field: string;
  fieldLabel: string;
  oldValue: string | null;
  newValue: string;
  reasonCode: string;
  reasonLabel: string;
  reasonNote: string | null;
  supportingDocUrl: string | null;
  channel: 'OTP_NEW_EMAIL' | 'OTP_CURRENT_EMAIL' | 'ADMIN_REVIEW';
  status: Status;
  reviewNote: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  requestIp: string | null;
  user: {
    id: string; name: string; email: string; phone: string | null;
    kyc: { businessName: string; status: string } | null;
    shops: { id: string; name: string }[];
  };
}

interface ListResponse { requests: ChangeRequest[]; counts: Record<string, number> }

const FILTERS: { value: string; label: string }[] = [
  { value: 'PENDING_REVIEW', label: 'Awaiting review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ALL', label: 'All' },
];

const STATUS: Record<Status, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  PENDING_VERIFICATION: { label: 'Awaiting seller code', icon: KeyRound, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  PENDING_REVIEW: { label: 'Awaiting review', icon: Clock, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  REJECTED: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  CANCELLED: { label: 'Cancelled', icon: Ban, className: 'bg-muted text-muted-foreground' },
  EXPIRED: { label: 'Expired', icon: Clock, className: 'bg-muted text-muted-foreground' },
};

const CHANNEL_LABEL: Record<ChangeRequest['channel'], string> = {
  OTP_NEW_EMAIL: 'Verified by code sent to the new email',
  OTP_CURRENT_EMAIL: 'Verified by code sent to the login email',
  ADMIN_REVIEW: 'Requires admin review',
};

function errorMessage(err: unknown, fallback: string) {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
}

function DetailChangesContent() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState('PENDING_REVIEW');
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['profile-change-requests', filter],
    queryFn: async () => (await apiClient.get<ListResponse>('/admin/profile-changes', { params: { status: filter } })).data,
  });

  const decide = useMutation({
    mutationFn: async ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note: string }) =>
      apiClient.post(`/admin/profile-changes/${id}/${action}`, { note }),
    onSuccess: (_res, vars) => {
      setFeedback({ type: 'success', text: vars.action === 'approve' ? 'Change approved and applied. The seller has been emailed.' : 'Request rejected. The seller has been emailed the reason.' });
      setNotes((n) => ({ ...n, [vars.id]: '' }));
      queryClient.invalidateQueries({ queryKey: ['profile-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
    onError: (err) => setFeedback({ type: 'error', text: errorMessage(err, 'Could not save this decision.') }),
  });

  const reject = (r: ChangeRequest) => {
    const note = notes[r.id]?.trim();
    if (!note) { setFeedback({ type: 'error', text: `Add a reason before rejecting ${r.reference} — it is sent to the seller.` }); return; }
    decide.mutate({ id: r.id, action: 'reject', note });
  };

  const approve = (r: ChangeRequest) => {
    if (!window.confirm(`Approve ${r.reference}? ${r.fieldLabel} will change to "${r.newValue}" immediately.`)) return;
    decide.mutate({ id: r.id, action: 'approve', note: notes[r.id]?.trim() ?? '' });
  };

  const requests = data?.requests ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Seller detail changes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review sellers&apos; requests to change KYC-verified details. Approving applies the change everywhere it is stored.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" onClick={() => setFilter(f.value)}
            className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              filter === f.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {f.label}
            {f.value !== 'ALL' && data?.counts?.[f.value] ? (
              <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-xs text-primary">{data.counts[f.value]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {feedback && (
        <div role="status" className={cn('flex items-start gap-2 rounded-lg border px-4 py-3 text-sm',
          feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                                      : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200')}>
          {feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
          <span className="flex-1">{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <LoadingStatus label="Loading change requests…">
          <RecordCardsSkeleton rows={3} detailed className="gap-4" />
        </LoadingStatus>
      ) : error ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{errorMessage(error, 'Could not load change requests.')}</CardContent></Card>
      ) : requests.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
          {filter === 'PENDING_REVIEW' ? 'No requests are waiting for review.' : 'No requests to show.'}
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const s = STATUS[r.status];
            const Icon = s.icon;
            const pending = r.status === 'PENDING_REVIEW';
            const busy = decide.isPending && decide.variables?.id === r.id;
            return (
              <Card key={r.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                        {r.fieldLabel}
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', s.className)}>
                          <Icon className="h-3 w-3" />{s.label}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-mono">{r.reference}</span> · {new Date(r.createdAt).toLocaleString()} · {CHANNEL_LABEL[r.channel]}
                      </CardDescription>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="font-medium">{r.user.name}</p>
                      <p className="text-muted-foreground">{r.user.email}{r.user.phone ? ` · ${r.user.phone}` : ''}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.user.kyc?.businessName ?? 'No KYC'}{r.user.kyc ? ` (KYC ${r.user.kyc.status.toLowerCase()})` : ''}
                        {r.user.shops.length ? ` · ${r.user.shops.map((x) => x.name).join(', ')}` : ''}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Current</p><p className="break-words">{r.oldValue || '—'}</p></div>
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
                    <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Requested</p><p className="break-words font-semibold">{r.newValue}</p></div>
                  </div>

                  <div className="text-sm">
                    <p><span className="text-muted-foreground">Reason:</span> {r.reasonLabel}</p>
                    {r.reasonNote && <p className="mt-1 rounded-md bg-muted/50 px-3 py-2 italic">&ldquo;{r.reasonNote}&rdquo;</p>}
                    {r.supportingDocUrl ? (
                      <a href={r.supportingDocUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-primary hover:underline">
                        <Paperclip className="h-4 w-4" /> View supporting document
                      </a>
                    ) : r.channel === 'ADMIN_REVIEW' && (
                      <p className="mt-2 text-xs text-muted-foreground">No supporting document attached.</p>
                    )}
                    {r.requestIp && <p className="mt-2 text-xs text-muted-foreground">Requested from IP {r.requestIp}</p>}
                  </div>

                  {r.reviewNote && !pending && (
                    <p className="rounded-md bg-muted/50 px-3 py-2 text-sm"><span className="text-muted-foreground">Review note:</span> {r.reviewNote}</p>
                  )}

                  {pending && (
                    <div className="space-y-2 border-t pt-4">
                      <label htmlFor={`note-${r.id}`} className="text-sm font-medium">
                        Note to seller <span className="font-normal text-muted-foreground">(required to reject, optional to approve)</span>
                      </label>
                      <textarea id={`note-${r.id}`} rows={2} maxLength={500} value={notes[r.id] ?? ''}
                        onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => reject(r)}
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
                          <XCircle className="mr-1.5 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" disabled={busy} onClick={() => approve(r)}>
                          {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />} Approve &amp; apply
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DetailChangesPage() {
  return (
    <ProtectedRoute requiredPermissions={['can_verify_vendors']}>
      <MainLayout>
        <DetailChangesContent />
      </MainLayout>
    </ProtectedRoute>
  );
}
