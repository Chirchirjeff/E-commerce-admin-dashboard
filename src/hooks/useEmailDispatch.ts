'use client';

import { useState, useCallback } from 'react';
import type { EmailTemplate } from '@/lib/email';

export type DispatchStatus = 'idle' | 'sending' | 'success' | 'error';

export interface DispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface UseEmailDispatchReturn {
  status: DispatchStatus;
  lastResult: DispatchResult | null;
  send: (payload: SendPayload) => Promise<DispatchResult>;
  reset: () => void;
}

export interface SendPayload {
  to: string | string[];
  type: EmailTemplate['type'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
  subject?: string;
  replyTo?: string;
}

/**
 * Client-side hook for dispatching emails via POST /api/email/send.
 * Reads the admin access token from sessionStorage (matching AuthContext).
 */
export function useEmailDispatch(): UseEmailDispatchReturn {
  const [status, setStatus] = useState<DispatchStatus>('idle');
  const [lastResult, setLastResult] = useState<DispatchResult | null>(null);

  const send = useCallback(async (payload: SendPayload): Promise<DispatchResult> => {
    setStatus('sending');
    setLastResult(null);

    const token =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('access_token')
        : null;

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data: DispatchResult = await res.json();

      if (!res.ok || !data.success) {
        const result: DispatchResult = {
          success: false,
          error: data.error ?? `Server returned ${res.status}`,
        };
        setStatus('error');
        setLastResult(result);
        return result;
      }

      setStatus('success');
      setLastResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      const result: DispatchResult = { success: false, error: message };
      setStatus('error');
      setLastResult(result);
      return result;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setLastResult(null);
  }, []);

  return { status, lastResult, send, reset };
}
