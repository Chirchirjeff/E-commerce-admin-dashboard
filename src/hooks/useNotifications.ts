import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { AdminNotification, NotificationsResponse } from '@/types';

const QUERY_KEY = ['admin', 'notifications'];
const POLL_INTERVAL_MS = 30_000; // 30 seconds

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery<NotificationsResponse>({
    queryKey: QUERY_KEY,
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
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const notifications: AdminNotification[] = query.data?.notifications ?? [];
  const unreadCount: number = query.data?.unreadCount ?? 0;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refresh,
  };
}
