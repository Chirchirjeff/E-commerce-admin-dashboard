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

export interface OrderData {
  id: string
  customer: string
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