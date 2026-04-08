import axios from 'axios'

const defaultApiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${defaultApiHost}:8000/api`
const SANCTUM_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')

const getXsrfTokenFromCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
})

export const ensureCsrfCookie = async (): Promise<void> => {
  await axios.get(`${SANCTUM_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
  })
}

api.interceptors.request.use((config) => {
  const xsrfToken = getXsrfTokenFromCookie()

  if (xsrfToken) {
    config.headers.set?.('X-XSRF-TOKEN', xsrfToken)
    config.headers['X-XSRF-TOKEN'] = xsrfToken
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !['/login', '/register'].includes(window.location.pathname)) {
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
