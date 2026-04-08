import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import type { User, LoginPayload, RegisterPayload } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitializing = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)
  let initPromise: Promise<void> | null = null

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const isWorker = computed(() => user.value?.role === 'worker')
  const isManager = computed(() => user.value?.role === 'manager')
  const isAdmin = computed(() => user.value?.role === 'admin')

  /**
   * Initialize auth state from the real backend session.
   */
  const initAuth = async () => {
    if (isInitialized.value) {
      return
    }

    if (initPromise) {
      await initPromise
      return
    }

    isInitializing.value = true
    initPromise = (async () => {
      try {
        user.value = await authService.getCurrentUser()
        error.value = null
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.error('Init auth error:', err)
        }

        if (!user.value) {
          user.value = null
        }
      } finally {
        isInitializing.value = false
        isInitialized.value = true
        initPromise = null
      }
    })()

    await initPromise
  }

  /**
   * Login user
   */
  const login = async (payload: LoginPayload) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(payload)
      user.value = response.user
      isInitializing.value = false
      isInitialized.value = true
      initPromise = null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register user
   */
  const register = async (payload: RegisterPayload) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.register(payload)
      user.value = response.user
      isInitializing.value = false
      isInitialized.value = true
      initPromise = null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      isInitializing.value = false
      isInitialized.value = true
      initPromise = null
    }
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    isInitializing,
    isInitialized,
    error,

    // Computed
    isAuthenticated,
    isWorker,
    isManager,
    isAdmin,

    // Methods
    initAuth,
    login,
    register,
    logout,
    clearError,
  }
})
