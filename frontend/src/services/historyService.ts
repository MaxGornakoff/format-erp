import api from './api'

export interface ActivityLog {
  id: number
  user_id: number | null
  user_name: string
  user_email: string | null
  user_role: 'worker' | 'manager' | 'admin' | null
  action: string
  subject_type: string | null
  subject_id: number | null
  description: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLogsResponse {
  data: ActivityLog[]
  current_page: number
  from: number | null
  to: number | null
  total: number
  per_page: number
  last_page: number
}

const historyService = {
  async getHistory(
    page: number = 1,
    perPage: number = 20,
    search?: string,
    action?: string,
  ): Promise<ActivityLogsResponse> {
    const response = await api.get('/history', {
      params: {
        page,
        per_page: perPage,
        search,
        action,
      },
    })

    return response.data
  },
}

export default historyService
