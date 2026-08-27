import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Types
export interface DashboardStats {
  totalRevenue: number;
  platformCommission: number;
  activeVendors: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  averageRating: number;
  revenueGrowth: number;
  orderGrowth: number;
  vendorGrowth: number;
  commissionGrowth: number;
  growthRate: number;
  orderStatus: Array<{ name: string; value: number }>;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface VendorData {
  name: string;
  revenue: number;
  orders: number;
  rating: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  vendor: string;
  amount: number;
  status: string;
  date: string;
}

export interface OrderStatus {
  name: string;
  value: number;
}

// Dashboard Stats
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/dashboard');
      return data;
    },
  });
}

// Revenue Data
export function useRevenueData(range: string = '30d') {
  return useQuery<RevenueData[]>({
    queryKey: ['analytics', 'revenue', range],
    queryFn: async () => {
      const { data } = await apiClient.get(`/analytics/revenue?range=${range}`);
      return data;
    },
  });
}

// Top Vendors
export function useTopVendors(limit: number = 8) {
  return useQuery<VendorData[]>({
    queryKey: ['analytics', 'top-vendors', limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/analytics/vendors?limit=${limit}`);
      return data;
    },
  });
}

// Order Status
export function useOrderStatus() {
  return useQuery<OrderStatus[]>({
    queryKey: ['analytics', 'order-status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/order-status');
      return data;
    },
  });
}

// Recent Orders
export function useRecentOrders(limit: number = 5) {
  return useQuery<RecentOrder[]>({
    queryKey: ['orders', 'recent', limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/orders/recent?limit=${limit}`);
      // Transform data to match frontend format
      return data.map((order: any) => ({
        id: order.id,
        customer: order.deliveryName || order.buyer?.name || 'Unknown',
        vendor: order.shop?.name || 'Unknown',
        amount: order.total,
        status: order.status,
        date: new Date(order.createdAt).toISOString().split('T')[0],
      }));
    },
  });
}

// Vendors (for vendors page)
export function useVendors(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['vendors', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/shops?page=${page}&limit=${limit}`);
      return data;
    },
  });
}

// Products (for products page)
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await apiClient.get('/products');
      return data;
    },
  });
}