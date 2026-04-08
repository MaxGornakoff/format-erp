import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import historyService from '@/services/historyService'
import type { ActivityLog } from '@/services/historyService'

const getErrorMessage = (err: any, fallback: string): string => {
  return err?.response?.data?.message || err?.message || fallback
}

export const useHistoryStore = defineStore('history', () => {
  const logs = ref<ActivityLog[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const perPage = ref(20)
  const total = ref(0)
  const lastPage = ref(1)

  const searchQuery = ref('')
  const actionFilter = ref('')

  const totalPages = computed(() => lastPage.value || 1)
  const hasNextPage = computed(() => currentPage.value < lastPage.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const fetchHistory = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await historyService.getHistory(
        currentPage.value,
        perPage.value,
        searchQuery.value || undefined,
        actionFilter.value || undefined,
      )

      logs.value = response.data
      currentPage.value = response.current_page
      total.value = response.total
      lastPage.value = response.last_page || 1
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to fetch history')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  const setActionFilter = (action: string) => {
    actionFilter.value = action
    currentPage.value = 1
  }

  const goToPage = (page: number) => {
    currentPage.value = page
  }

  const clearError = () => {
    error.value = null
  }

  return {
    logs,
    isLoading,
    error,
    currentPage,
    perPage,
    total,
    lastPage,
    searchQuery,
    actionFilter,
    totalPages,
    hasNextPage,
    hasPrevPage,
    fetchHistory,
    setSearchQuery,
    setActionFilter,
    goToPage,
    clearError,
  }
})
