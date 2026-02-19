import type { User } from '@/services/authService'
import type { Order } from '@/services/orderService'

export const useMockData = () => {
  // Mock users with credentials
  const mockUsersList: (User & { password: string })[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'worker1@example.com',
      role: 'worker',
      created_at: '2025-12-15T10:00:00Z',
      password: 'Worker123'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'manager@example.com',
      role: 'manager',
      created_at: '2025-11-20T14:00:00Z',
      password: 'Manager123'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'admin@example.com',
      role: 'admin',
      created_at: '2025-10-01T09:00:00Z',
      password: 'Admin123'
    }
  ]

  // Mock current user (default to worker)
  const currentUser: User = mockUsersList[0]

  // Mock orders
  const mockOrders: Order[] = [
    {
      id: 1,
      title: 'Fix login form styling',
      description: 'Users are having trouble with the login form on mobile devices. Please adjust the CSS.',
      status: 'in_progress',
      user_id: 1,
      user: { id: 1, name: 'John Doe' },
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-02-18T15:30:00Z'
    },
    {
      id: 2,
      title: 'Implement dashboard charts',
      description: 'Add interactive charts to the dashboard showing order statistics.',
      status: 'new',
      user_id: 2,
      user: { id: 2, name: 'Jane Smith' },
      created_at: '2026-02-18T09:00:00Z',
      updated_at: '2026-02-18T09:00:00Z'
    },
    {
      id: 3,
      title: 'Database optimization',
      description: 'Optimize queries for orders table with proper indexing.',
      status: 'completed',
      user_id: 3,
      user: { id: 3, name: 'Bob Johnson' },
      created_at: '2026-02-10T14:00:00Z',
      updated_at: '2026-02-17T16:45:00Z'
    },
    {
      id: 4,
      title: 'Add authentication refresh token',
      description: 'Implement refresh token logic for better security.',
      status: 'in_progress',
      user_id: 2,
      user: { id: 2, name: 'Jane Smith' },
      created_at: '2026-02-16T11:00:00Z',
      updated_at: '2026-02-19T08:20:00Z'
    },
    {
      id: 5,
      title: 'API documentation',
      description: 'Write comprehensive API documentation for all endpoints.',
      status: 'cancelled',
      user_id: 1,
      user: { id: 1, name: 'John Doe' },
      created_at: '2026-02-12T13:00:00Z',
      updated_at: '2026-02-14T10:00:00Z'
    }
  ]

  return {
    currentUser,
    mockOrders,
    mockUsersList
  }
}
