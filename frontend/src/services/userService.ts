import api from './api'

export interface User {
  id: number
  name: string
  email: string
  role: 'worker' | 'manager' | 'admin'
  created_at: string
  updated_at: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: 'worker' | 'manager' | 'admin'
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  role?: 'worker' | 'manager' | 'admin'
}

export interface UsersResponse {
  data: User[]
  current_page: number
  from: number
  to: number
  total: number
  per_page: number
  last_page: number
}

const userService = {
  /**
   * Get list of users (Admin only)
   * @param page - Page number
   * @param perPage - Items per page
   * @param role - Filter by role
   * @param search - Search by name or email
   * @param sort - Sort field
   * @param direction - Sort direction (asc/desc)
   * @returns Promise with paginated users
   */
  async getUsers(
    page: number = 1,
    perPage: number = 15,
    role?: string,
    search?: string,
    sort: string = 'created_at',
    direction: string = 'desc'
  ): Promise<UsersResponse> {
    const response = await api.get('/users', {
      params: {
        page,
        per_page: perPage,
        role,
        search,
        sort,
        direction,
      },
    })
    return response.data
  },

  /**
   * Get single user by ID (Admin only)
   * @param id - User ID
   * @returns Promise with user data
   */
  async getUser(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  /**
   * Create new user (Admin only)
   * @param payload - User creation data
   * @returns Promise with created user
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await api.post('/users', payload)
    return response.data
  },

  /**
   * Update user (Admin only)
   * @param id - User ID
   * @param payload - User update data
   * @returns Promise with updated user
   */
  async updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
    const response = await api.patch(`/users/${id}`, payload)
    return response.data
  },

  /**
   * Delete user (Admin only)
   * @param id - User ID
   * @returns Promise
   */
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}

export default userService
