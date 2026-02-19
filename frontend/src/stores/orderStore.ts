import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import orderService from '@/services/orderService'
import type { Order, CreateOrderPayload, UpdateOrderPayload, OrdersResponse } from '@/services/orderService'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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
   * Fetch orders with current filters and pagination
   */
  const fetchOrders = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response: OrdersResponse = await orderService.getOrders(
        currentPage.value,
        perPage.value,
        statusFilter.value,
        searchQuery.value,
        sortField.value,
        sortDirection.value
      )
      orders.value = response.data
      currentPage.value = response.current_page
      total.value = response.total
      lastPage.value = response.last_page
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch orders'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get single order by ID
   */
  const fetchOrder = async (id: number) => {
    try {
      currentOrder.value = await orderService.getOrder(id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch order'
      throw err
    }
  }

  /**
   * Create new order
   */
  const createOrder = async (payload: CreateOrderPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const newOrder = await orderService.createOrder(payload)
      orders.value.unshift(newOrder)
      currentPage.value = 1
      return newOrder
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update order
   */
  const updateOrder = async (id: number, payload: UpdateOrderPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const updated = await orderService.updateOrder(id, payload)
      const index = orders.value.findIndex((o: Order) => o.id === id)
      if (index !== -1) {
        orders.value[index] = updated
      }
      if (currentOrder.value?.id === id) {
        currentOrder.value = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update order'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete order
   */
  const deleteOrder = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await orderService.deleteOrder(id)
      orders.value = orders.value.filter((o: Order) => o.id !== id)
      if (currentOrder.value?.id === id) {
        currentOrder.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete order'
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
