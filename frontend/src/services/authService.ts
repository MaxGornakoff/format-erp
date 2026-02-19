import api from './api'
import { useMockData } from '@/composables/useMockData'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'worker' | 'manager' | 'admin'
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

const authService = {
  /**
   * Register a new user
   * @param payload - Registration data
   * @returns Promise with user and token
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post('/auth/register', payload)
    return response.data
  },

  /**
   * Login user
   * @param payload - Login credentials
   * @returns Promise with user and token
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    // Try mock data first for demo credentials
    const mockData = useMockData()
    const mockUser = mockData.mockUsersList.find(
      u => u.email === payload.email && u.password === payload.password
    )

    if (mockUser) {
      const { password, ...user } = mockUser
      return {
        user,
        token: 'mock-token-' + Date.now()
      }
    }

    // Otherwise try real API
    const response = await api.post('/auth/login', payload)
    return response.data
  },

  /**
   * Logout current user
   * @returns Promise
   */
  async logout(): Promise<void> {
    // For mock auth, just resolve without API call
    // In production with real backend, uncomment the API call:
    // await api.post('/auth/logout')
    return Promise.resolve()
  },

  /**
   * Get current authenticated user
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },

  /**
   * Store token in localStorage
   * @param token - Auth token
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token)
  },

  /**
   * Get token from localStorage
   * @returns Auth token or null
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem('auth_token')
  },
}

export default authService
