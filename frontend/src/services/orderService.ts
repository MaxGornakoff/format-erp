import api from './api'

export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled'
export type OrderPriority = 'low' | 'medium' | 'high'

export interface Order {
  id: number
  title: string
  description: string
  note?: string | null
  package_cost?: string | number | null
  order_cost?: string | number | null
  priority: OrderPriority
  status: OrderStatus
  user_id: number
  responsible_name?: string | null
  user: {
    id: number
    name: string
    email?: string
    role?: 'worker' | 'manager' | 'admin'
  }
  created_at: string
  updated_at: string
}

export interface CreateOrderPayload {
  title?: string
  description: string
  note?: string
  package_cost?: number | null
  order_cost?: number | null
  priority: OrderPriority
  responsible_name?: string
}

export interface UpdateOrderPayload {
  title?: string
  description?: string
  note?: string | null
  package_cost?: number | null
  order_cost?: number | null
  priority?: OrderPriority
  status?: OrderStatus
  responsible_name?: string
}

export interface OrderTotals {
  order_cost: number
  package_cost: number
}

export interface OrdersResponse {
  data: Order[]
  current_page: number
  from: number
  to: number
  total: number
  per_page: number
  last_page: number
  totals?: OrderTotals
  responsibles?: string[]
}

const orderService = {
  /**
   * Get list of orders with filtering, sorting and search
   * @param page - Page number
   * @param perPage - Items per page
   * @param status - Filter by status
   * @param search - Search by title or description
   * @param sort - Sort field
   * @param direction - Sort direction (asc/desc)
   * @returns Promise with paginated orders
   */
  async getOrders(
    page: number = 1,
    perPage: number = 15,
    status?: string,
    search?: string,
    sort: string = 'created_at',
    direction: string = 'desc',
    responsible?: string,
    mineOnly?: boolean,
  ): Promise<OrdersResponse> {
    const response = await api.get('/orders', {
      params: {
        page,
        per_page: perPage,
        status,
        search,
        sort,
        direction,
        responsible,
        mine: mineOnly ? '1' : undefined,
      },
    })
    return response.data
  },

  /**
   * Get single order by ID
   * @param id - Order ID
   * @returns Promise with order data
   */
  async getOrder(id: number): Promise<Order> {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  async exportOrders(
    status?: string,
    search?: string,
    sort: string = 'created_at',
    direction: string = 'desc',
    responsible?: string,
  ): Promise<Blob> {
    const response = await api.get('/orders/export', {
      params: {
        status,
        search,
        sort,
        direction,
        responsible,
      },
      responseType: 'blob',
    })

    return response.data
  },

  /**
   * Create new order
   * @param payload - Order creation data
   * @returns Promise with created order
   */
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await api.post('/orders', payload)
    return response.data
  },

  /**
   * Update order
   * @param id - Order ID
   * @param payload - Order update data
   * @returns Promise with updated order
   */
  async updateOrder(id: number, payload: UpdateOrderPayload): Promise<Order> {
    const response = await api.patch(`/orders/${id}`, payload)
    return response.data
  },

  /**
   * Delete order (Admin only)
   * @param id - Order ID
   * @returns Promise
   */
  async deleteOrder(id: number): Promise<void> {
    await api.delete(`/orders/${id}`)
  },
}

export default orderService
