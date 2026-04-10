import api from './api'

export interface DashboardStats {
  total_orders: number
  new_orders: number
  in_progress_orders: number
  completed_orders: number
  cancelled_orders: number
}

export interface TopWorker {
  id?: number
  name: string
  real_name?: string | null
  email?: string | null
  completed_count: number
}

export interface DashboardResponse {
  stats: DashboardStats
  orders_by_status: {
    new: number
    in_progress: number
    completed: number
    cancelled: number
  }
  top_workers: TopWorker[]
  top_responsibles?: TopWorker[]
}

export interface OrdersTrendPoint {
  date: string
  count: number
}

export interface OrdersTrendResponse {
  data: OrdersTrendPoint[]
  period: string
}

export interface RoleStatsResponse {
  admins: number
  managers: number
  workers: number
  total: number
}

const analyticsService = {
  async dashboard(): Promise<DashboardResponse> {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  async ordersTrend(days: number = 7): Promise<OrdersTrendResponse> {
    const response = await api.get('/analytics/orders-trend', {
      params: { days },
    })
    return response.data
  },

  async roleStats(): Promise<RoleStatsResponse> {
    const response = await api.get('/analytics/role-stats')
    return response.data
  },
}

export default analyticsService
