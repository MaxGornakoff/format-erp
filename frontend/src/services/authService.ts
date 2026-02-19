import api from './api'

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
    const response = await api.post('/auth/login', payload)
    return response.data
  },

  /**
   * Logout current user
   * @returns Promise
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout')
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
