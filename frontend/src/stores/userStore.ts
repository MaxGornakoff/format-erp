import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from '@/services/userService'
import { useAnalyticsStore } from './analyticsStore'
import type { User, CreateUserPayload, UpdateUserPayload } from '@/services/userService'

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

export const useUserStore = defineStore('user', () => {
  const analyticsStore = useAnalyticsStore()
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)

  const roleFilter = ref<string | undefined>(undefined)
  const searchQuery = ref('')
  const sortField = ref('created_at')
  const sortDirection = ref<'asc' | 'desc'>('desc')

  const totalPages = computed(() => lastPage.value || 1)
  const hasNextPage = computed(() => currentPage.value < lastPage.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const fetchUsers = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await userService.getUsers(
        currentPage.value,
        perPage.value,
        roleFilter.value,
        searchQuery.value || undefined,
        sortField.value,
        sortDirection.value
      )

      users.value = response.data
      currentPage.value = response.current_page
      total.value = response.total
      lastPage.value = response.last_page || 1
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to fetch users')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const user = await userService.getUser(id)
      currentUser.value = user
      return user
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to fetch user')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (payload: CreateUserPayload) => {
    isLoading.value = true
    error.value = null

    try {
      const user = await userService.createUser(payload)
      currentUser.value = user
      currentPage.value = 1
      await fetchUsers()
      analyticsStore.invalidateAnalytics('user-created')
      return user
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to create user')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (id: number, payload: UpdateUserPayload) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedUser = await userService.updateUser(id, payload)
      currentUser.value = updatedUser
      users.value = users.value.map((user) => (user.id === id ? updatedUser : user))
      analyticsStore.invalidateAnalytics('user-updated')
      return updatedUser
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to update user')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await userService.deleteUser(id)
      users.value = users.value.filter((user) => user.id !== id)
      total.value = Math.max(0, total.value - 1)

      if (users.value.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
        await fetchUsers()
      }

      analyticsStore.invalidateAnalytics('user-deleted')
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to delete user')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteUsersBulk = async (ids: number[]) => {
    const uniqueIds = [...new Set(ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]

    if (uniqueIds.length === 0) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      for (const id of uniqueIds) {
        await userService.deleteUser(id)
      }

      users.value = users.value.filter((user) => !uniqueIds.includes(user.id))
      total.value = Math.max(0, total.value - uniqueIds.length)

      if (currentUser.value && uniqueIds.includes(currentUser.value.id)) {
        currentUser.value = null
      }

      if (users.value.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
      }

      await fetchUsers()
      analyticsStore.invalidateAnalytics('users-bulk-deleted')
    } catch (err: any) {
      error.value = getErrorMessage(err, 'Failed to delete selected users')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setRoleFilter = (role: string | undefined) => {
    roleFilter.value = role || undefined
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
    roleFilter.value = undefined
    searchQuery.value = ''
    sortField.value = 'created_at'
    sortDirection.value = 'desc'
    currentPage.value = 1
  }

  return {
    users,
    currentUser,
    isLoading,
    error,
    currentPage,
    perPage,
    total,
    lastPage,
    roleFilter,
    searchQuery,
    sortField,
    sortDirection,
    totalPages,
    hasNextPage,
    hasPrevPage,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    deleteUsersBulk,
    setRoleFilter,
    setSearchQuery,
    setSorting,
    goToPage,
    clearError,
    resetFilters,
  }
})
