import axios from 'axios'

// API proxy prefixes defined in vite.config.ts
const CONTRACT_PROXY = '/contract-api'
const ROOM_PROXY     = '/room-api'
const BILLING_PROXY  = '/billing-api'

export const http = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT token and route to the correct proxy
http.interceptors.request.use((config) => {
  const url = config.url || ''

  // Only rewrite if it's a relative path and hasn't been prefixed with a proxy yet
  if (!url.startsWith('http') && !url.startsWith(CONTRACT_PROXY) && !url.startsWith(ROOM_PROXY) && !url.startsWith(BILLING_PROXY)) {
    // Room building prefixes (Group 1)
    const roomPrefixes = ['/api/rooms', '/api/buildings', '/api/roomtypes', '/api/beds', '/api/equipments']
    // Billing & Authentication prefixes (Group 3)
    const billingPrefixes = ['/api/auth', '/api/users', '/api/invoices', '/api/payments', '/api/maintenance', '/api/debts']
    // Contract & Student prefixes (Group 2)
    const contractPrefixes = ['/api/students', '/api/contracts', '/api/applications', '/api/occupancies']

    if (roomPrefixes.some(p => url.startsWith(p))) {
      config.url = ROOM_PROXY + url
    } else if (billingPrefixes.some(p => url.startsWith(p))) {
      config.url = BILLING_PROXY + url
    } else if (contractPrefixes.some(p => url.startsWith(p))) {
      config.url = CONTRACT_PROXY + url
    }
  }

  // Clear baseURL to prevent incorrect prepending with proxy paths
  config.baseURL = ''

  const token = localStorage.getItem('ktx_token') || localStorage.getItem('ktx_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — global error handling and auto logout on 401
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('ktx_token')
      localStorage.removeItem('ktx_access_token')
      localStorage.removeItem('ktx_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default http
