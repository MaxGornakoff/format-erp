import api, { ensureCsrfCookie } from './api'

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
  updated_at?: string
}

export interface AuthResponse {
  user: User
}

const authService = {
  /**
   * Register a new user using the real backend session.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await ensureCsrfCookie()
    const response = await api.post('/auth/register', payload)
    return response.data
  },

  /**
   * Login user using secure httpOnly cookies.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await ensureCsrfCookie()
    const response = await api.post('/auth/login', payload)
    return response.data
  },

  /**
   * Logout current user.
   */
  async logout(): Promise<void> {
    await ensureCsrfCookie()
    await api.post('/auth/logout')
  },

  /**
   * Get current authenticated user from the backend session.
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },
}

export default authService
