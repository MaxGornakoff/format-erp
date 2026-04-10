import api from './api'

export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled'
export type OrderPriority = 'low' | 'medium' | 'high'

export const ORDER_IMAGE_MAX_FILES = 10
export const ORDER_IMAGE_MAX_SIZE_MB = 5
export const ORDER_IMAGE_MAX_SIZE_BYTES = ORDER_IMAGE_MAX_SIZE_MB * 1024 * 1024
export const ORDER_IMAGE_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ORDER_IMAGE_ACCEPT_ATTRIBUTE = ORDER_IMAGE_ALLOWED_MIME_TYPES.join(',')

export interface OrderImage {
  id: number
  original_name: string
  mime_type?: string | null
  size?: number
  sort_order?: number
  url: string
  thumbnail_url?: string | null
  created_at?: string
}

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
  images?: OrderImage[]
  user: {
    id: number
    name: string
    real_name?: string | null
    email?: string
    role?: 'worker' | 'manager' | 'admin'
  }
  responsible_user?: {
    id: number
    name: string
    real_name?: string | null
    email?: string
    role?: 'worker' | 'manager' | 'admin'
  } | null
  responsibleUser?: {
    id: number
    name: string
    real_name?: string | null
    email?: string
    role?: 'worker' | 'manager' | 'admin'
  } | null
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
  images?: File[]
  deleted_image_ids?: number[]
  cover_image_id?: number | null
  cover_upload_index?: number | null
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
  images?: File[]
  deleted_image_ids?: number[]
  cover_image_id?: number | null
  cover_upload_index?: number | null
}

export interface OrderTotals {
  order_cost: number
  package_cost: number
}

export interface ResponsibleOption {
  value: string
  label: string
  real_name?: string | null
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
  responsibles?: ResponsibleOption[] | string[]
}

const shouldUseMultipart = (payload: CreateOrderPayload | UpdateOrderPayload) => {
  return Boolean(
    (Array.isArray(payload.images) && payload.images.length > 0)
    || (Array.isArray(payload.deleted_image_ids) && payload.deleted_image_ids.length > 0)
    || payload.cover_upload_index !== undefined,
  )
}

const appendFormDataValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item instanceof File) {
        formData.append(`${key}[]`, item)
      } else if (item !== undefined && item !== null) {
        formData.append(`${key}[]`, String(item))
      }
    })
    return
  }

  if (value === null) {
    formData.append(key, '')
    return
  }

  formData.append(key, String(value))
}

const buildOrderFormData = (payload: CreateOrderPayload | UpdateOrderPayload) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    appendFormDataValue(formData, key, value)
  })

  return formData
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
    if (shouldUseMultipart(payload)) {
      const response = await api.post('/orders', buildOrderFormData(payload), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    }

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
    if (shouldUseMultipart(payload)) {
      const formData = buildOrderFormData(payload)
      formData.append('_method', 'PATCH')

      const response = await api.post(`/orders/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    }

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
