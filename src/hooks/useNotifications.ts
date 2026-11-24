import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { AdminNotification, NotificationsResponse } from '@/types';

export const NOTIFICATIONS_QUERY_KEY = ['admin', 'notifications'];
const POLL_INTERVAL_MS = 30_000; // 30 seconds

const NO_COUNTS: Record<string, number> = {};

/**
 * Pending admin work: the bell's notification list plus per-section counts
 * for the sidebar badges. Every caller shares one polled query.
 */
export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery<NotificationsResponse>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationsResponse>(
        '/admin/notifications',
      );
      return data;
    },
    refetchInterval: POLL_INTERVAL_MS,
    // Keep previous data visible while refetching so the badge doesn't flicker
    placeholderData: (prev) => prev,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  }, [queryClient]);

  /** Re-send a seller email that failed. Resolves to whether it went through. */
  const retryEmail = useMutation({
    mutationFn: async (failureId: string) => {
      const { data } = await apiClient.post<{ sent: boolean; error?: string }>(
        `/admin/notifications/email-failures/${failureId}/retry`,
      );
      return data;
    },
    onSettled: refresh,
  });

  /** Clear a failed-email alert without re-sending. */
  const dismissEmail = useMutation({
    mutationFn: async (failureId: string) =>
      apiClient.post(`/admin/notifications/email-failures/${failureId}/dismiss`),
    onSettled: refresh,
  });

  const notifications: AdminNotification[] = query.data?.notifications ?? [];
  const unreadCount: number = query.data?.unreadCount ?? 0;
  const counts = query.data?.counts ?? NO_COUNTS;

  return {
    notifications,
    unreadCount,
    counts,
    isLoading: query.isLoading,
    isError: query.isError,
    refresh,
    retryEmail,
    dismissEmail,
  };
}
