import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, CreateOrderPayload, UpdateOrderPayload } from '@/services/orderService'
import { useMockData } from '@/composables/useMockData'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const mockData = useMockData()

  // Pagination state
  const currentPage = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)

  // Filter and sort state
  const statusFilter = ref<string | undefined>(undefined)
  const searchQuery = ref<string>('')
  const sortField = ref('created_at')
  const sortDirection = ref<'asc' | 'desc'>('desc')

  // Computed
  const totalPages = computed(() => lastPage.value)
  const hasNextPage = computed(() => currentPage.value < lastPage.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  /**
   * Fetch orders with current filters and pagination (uses mock data for demo)
   */
  const fetchOrders = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Use mock data for demo
      let filtered = [...mockData.mockOrders]

      // Apply status filter
      if (statusFilter.value) {
        filtered = filtered.filter(o => o.status === statusFilter.value)
      }

      // Apply search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(o =>
          o.title.toLowerCase().includes(query) ||
          o.description?.toLowerCase().includes(query)
        )
      }

      // Apply sorting
      filtered.sort((a, b) => {
        const aVal = a[sortField.value as keyof Order]
        const bVal = b[sortField.value as keyof Order]
        let comparison = 0
        if (aVal instanceof Date && bVal instanceof Date) {
          comparison = aVal.getTime() - bVal.getTime()
        } else if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal)
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        }
        return sortDirection.value === 'asc' ? comparison : -comparison
      })

      // Apply pagination
      const start = (currentPage.value - 1) * perPage.value
      const paginatedData = filtered.slice(start, start + perPage.value)

      orders.value = paginatedData
      total.value = filtered.length
      lastPage.value = Math.ceil(filtered.length / perPage.value)

      error.value = null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch orders'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get single order by ID (uses mock data for demo)
   */
  const fetchOrder = async (id: number) => {
    try {
      const order = mockData.mockOrders.find(o => o.id === id)
      if (order) {
        currentOrder.value = order
      } else {
        throw new Error('Order not found')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch order'
      throw err
    }
  }

  /**
   * Create new order (uses mock data for demo)
   */
  const createOrder = async (payload: CreateOrderPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const newOrder: Order = {
        id: Math.max(...mockData.mockOrders.map(o => o.id), 0) + 1,
        ...payload,
        status: 'new',
        user_id: 1,
        user: { id: 1, name: 'Current User' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockData.mockOrders.unshift(newOrder)
      orders.value.unshift(newOrder)
      currentPage.value = 1
      error.value = null
      return newOrder
    } catch (err: any) {
      error.value = err.message || 'Failed to create order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update order (uses mock data for demo)
   */
  const updateOrder = async (id: number, payload: UpdateOrderPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const order = mockData.mockOrders.find(o => o.id === id)
      if (!order) throw new Error('Order not found')

      Object.assign(order, payload, { updated_at: new Date().toISOString() })
      const index = orders.value.findIndex((o: Order) => o.id === id)
      if (index !== -1) {
        orders.value[index] = { ...order }
      }
      error.value = null
      return order
    } catch (err: any) {
      error.value = err.message || 'Failed to update order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete order (uses mock data for demo)
   */
  const deleteOrder = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      const index = mockData.mockOrders.findIndex((o: Order) => o.id === id)
      if (index !== -1) {
        mockData.mockOrders.splice(index, 1)
      }
      orders.value = orders.value.filter((o: Order) => o.id !== id)
      error.value = null
    } catch (err: any) {
      error.value = err.message || 'Failed to delete order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set status filter
   */
  const setStatusFilter = (status: string | undefined) => {
    statusFilter.value = status
    currentPage.value = 1
  }

  /**
   * Set search query
   */
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  /**
   * Set sorting
   */
  const setSorting = (field: string, direction: 'asc' | 'desc') => {
    sortField.value = field
    sortDirection.value = direction
  }

  /**
   * Go to page
   */
  const goToPage = (page: number) => {
    currentPage.value = page
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset filters
   */
  const resetFilters = () => {
    statusFilter.value = undefined
    searchQuery.value = ''
    sortField.value = 'created_at'
    sortDirection.value = 'desc'
    currentPage.value = 1
  }

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    error,
    currentPage,
    perPage,
    total,
    lastPage,
    statusFilter,
    searchQuery,
    sortField,
    sortDirection,

    // Computed
    totalPages,
    hasNextPage,
    hasPrevPage,

    // Methods
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    setStatusFilter,
    setSearchQuery,
    setSorting,
    goToPage,
    clearError,
    resetFilters,
  }
})
