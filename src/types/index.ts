// Dashboard Types
export interface DashboardStats {
  totalRevenue: number
  activeVendors: number
  totalOrders: number
  platformCommission: number
  totalCustomers: number
  averageRating: number
  pendingOrders: number
  growthRate: number
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface VendorData {
  name: string
  revenue: number
  orders: number
  rating: number
  status: 'active' | 'suspended' | 'pending'
}

/** Public profile fields the backend exposes for buyers and reviewers. */
export interface PublicUserProfile {
  id?: string
  name?: string | null
  /** Lowercase public handle without the leading "@", e.g. "jane.doe". */
  username?: string | null
  /** Square Cloudinary image (res.cloudinary.com), or null when unset. */
  avatarUrl?: string | null
}

export interface OrderData {
  id: string
  customer: string
  customerUsername?: string | null
  customerAvatarUrl?: string | null
  vendor: string
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled'
  date: string
}

export interface ProductData {
  id?: string
  name: string
  vendor: string
  category: string
  price: number
  stock: number
  status: 'active' | 'low_stock' | 'out_of_stock' | 'inactive'
  sales: number
  rating: number
}

export interface Column {
  key: string
  label: string
  className?: string
  render?: (value: any, row: any) => React.ReactNode
}

export interface DataTableProps {
  title?: string
  description?: string
  data: any[]
  columns: Column[]
  className?: string
  onRowClick?: (row: any) => void
}

// Notifications
export type NotificationType = 'kyc_pending' | 'profile_change_pending' | 'new_vendor'

export interface AdminNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  resourceId: string
  href: string
  createdAt: string
}

export interface NotificationsResponse {
  notifications: AdminNotification[]
  unreadCount: number
}