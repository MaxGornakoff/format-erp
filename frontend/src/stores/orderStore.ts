import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import orderService from '@/services/orderService'
import { useAnalyticsStore } from './analyticsStore'
import type { Order, CreateOrderPayload, UpdateOrderPayload, ResponsibleOption } from '@/services/orderService'

const getErrorMessage = (err: any, fallback: string): string => {
  const validationErrors = err?.response?.data?.errors

  if (validationErrors) {
    const firstError = Object.values(validationErrors).flat()[0]
    if (typeof firstError === 'string') {
      return firstError
    }
  }

  return err?.response?.data?.message || err?.message || fallback
}

export const useOrderStore = defineStore('order', () => {
  const analyticsStore = useAnalyticsStore()
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)
  const filteredOrderCostTotal = ref(0)
  const filteredPackageCostTotal = ref(0)
  const responsibleOptions = ref<ResponsibleOption[]>([])

  const statusFilter = ref<string | undefined>(undefined)
  const executorFilter = ref<string | undefined>(undefined)
  const mineOnlyFilter = ref(false)
  const searchQuery = ref('')
  const sortField = ref('created_at')
  const sortDirection = ref<'asc' | 'desc'>('desc')

  const totalPages = computed(() => lastPage.value || 1)
  const hasNextPage = computed(() => currentPage.value < lastPage.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const fetchOrders = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await orderService.getOrders(
        currentPage.value,
        perPage.value,
        statusFilter.value,
        searchQuery.value || undefined,
        sortField.value,
        sortDirection.value,
        executorFilter.value,
        mineOnlyFilter.value,
      )

      orders.value = response.data
      currentPage.value = response.current_page
      total.value = response.total
      lastPage.value = response.last_page || 1
      filteredOrderCostTotal.value = Number(response.totals?.order_cost ?? 0)
      filteredPackageCostTotal.value = Number(response.totals?.package_cost ?? 0)
      responsibleOptions.value = Array.isArray(response.responsibles)
        ? response.responsibles
            .map((responsible) => {
              if (typeof responsible === 'string') {
                return { value: responsible, label: responsible, real_name: null }
              }

              return {
                value: responsible.value,
                label: responsible.label || responsible.value,
                real_name: responsible.real_name ?? null,
              }
            })
            .filter((responsible) => responsible.value.trim() !== '')
        : []
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to fetch orders')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchOrder = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const order = await orderService.getOrder(id)
      currentOrder.value = order
      return order
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to fetch order')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (payload: CreateOrderPayload) => {
    isLoading.value = true
    error.value = null

    try {
      const newOrder = await orderService.createOrder(payload)
      currentOrder.value = newOrder
      currentPage.value = 1
      await fetchOrders()
      analyticsStore.invalidateAnalytics('order-created')
      return newOrder
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to create order')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateOrder = async (id: number, payload: UpdateOrderPayload) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedOrder = await orderService.updateOrder(id, payload)
      currentOrder.value = updatedOrder
      orders.value = orders.value.map((order) => (order.id === id ? updatedOrder : order))
      analyticsStore.invalidateAnalytics('order-updated')
      return updatedOrder
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to update order')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteOrder = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await orderService.deleteOrder(id)
      orders.value = orders.value.filter((order) => order.id !== id)
      total.value = Math.max(0, total.value - 1)

      if (currentOrder.value?.id === id) {
        currentOrder.value = null
      }

      if (orders.value.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
        await fetchOrders()
      }

      analyticsStore.invalidateAnalytics('order-deleted')
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to delete order')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteOrdersBulk = async (ids: number[]) => {
    const uniqueIds = [...new Set(ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]

    if (uniqueIds.length === 0) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      for (const id of uniqueIds) {
        await orderService.deleteOrder(id)
      }

      orders.value = orders.value.filter((order) => !uniqueIds.includes(order.id))
      total.value = Math.max(0, total.value - uniqueIds.length)

      if (currentOrder.value && uniqueIds.includes(currentOrder.value.id)) {
        currentOrder.value = null
      }

      if (orders.value.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
      }

      await fetchOrders()
      analyticsStore.invalidateAnalytics('orders-bulk-deleted')
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to delete selected orders')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setStatusFilter = (status: string | undefined) => {
    statusFilter.value = status || undefined
    currentPage.value = 1
  }

  const setExecutorFilter = (executorId: string | undefined) => {
    executorFilter.value = executorId || undefined
    currentPage.value = 1
  }

  const setMineOnlyFilter = (enabled: boolean) => {
    mineOnlyFilter.value = enabled
    currentPage.value = 1
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  const setSorting = (field: string, direction: 'asc' | 'desc') => {
    sortField.value = field
    sortDirection.value = direction
  }

  const goToPage = (page: number) => {
    currentPage.value = page
  }

  const clearError = () => {
    error.value = null
  }

  const resetFilters = () => {
    statusFilter.value = undefined
    executorFilter.value = undefined
    mineOnlyFilter.value = false
    searchQuery.value = ''
    sortField.value = 'created_at'
    sortDirection.value = 'desc'
    currentPage.value = 1
  }

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    currentPage,
    perPage,
    total,
    lastPage,
    filteredOrderCostTotal,
    filteredPackageCostTotal,
    responsibleOptions,
    statusFilter,
    executorFilter,
    mineOnlyFilter,
    searchQuery,
    sortField,
    sortDirection,
    totalPages,
    hasNextPage,
    hasPrevPage,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    deleteOrdersBulk,
    setStatusFilter,
    setExecutorFilter,
    setMineOnlyFilter,
    setSearchQuery,
    setSorting,
    goToPage,
    clearError,
    resetFilters,
  }
})
