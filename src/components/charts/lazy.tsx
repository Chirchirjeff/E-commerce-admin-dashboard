'use client';

/*
 * Lazy (code-split) chart components.
 * recharts is a large client-only bundle and ResponsiveContainer needs the DOM,
 * so the trend chart loads on the client only and shows a matching skeleton
 * meanwhile. The lighter HTML charts (StatusBreakdown, RankedBars, StatTile)
 * live in ./chart-kit and need no lazy loading.
 */

import dynamic from 'next/dynamic';
import { ChartBodySkeleton, LoadingStatus } from '@/components/shared/skeletons';

export const LazyTrendChart = dynamic(
  () => import('./trend-chart').then((m) => m.TrendChart),
  {
    ssr: false,
    loading: () => (
      <LoadingStatus label="Loading chart…" className="h-[300px] sm:h-[360px] xl:h-[400px]">
        <ChartBodySkeleton variant="line" />
      </LoadingStatus>
    ),
  }
);
