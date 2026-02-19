import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import type { User, LoginPayload, RegisterPayload } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isWorker = computed(() => user.value?.role === 'worker')
  const isManager = computed(() => user.value?.role === 'manager')
  const isAdmin = computed(() => user.value?.role === 'admin')

  /**
   * Initialize auth state from localStorage or use mock data for demo
   */
  const initAuth = async () => {
    const savedToken = authService.getToken()
    if (savedToken) {
      token.value = savedToken
      try {
        user.value = await authService.getCurrentUser()
      } catch (err) {
        authService.removeToken()
        token.value = null
        user.value = null
      }
    } else {
      // User is not authenticated - no auto-login
      user.value = null
      token.value = null
    }
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
      token.value = response.token
      authService.setToken(response.token)
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
      token.value = response.token
      authService.setToken(response.token)
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
      token.value = null
      authService.removeToken()
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
    token,
    isLoading,
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
