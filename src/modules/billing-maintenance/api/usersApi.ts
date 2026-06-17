import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_BILLING_MAINTENANCE_API_URL, 5300)

export const usersApi = {
  getUsers() {
    return http.get(`${baseUrl}/api/users`)
  },
  getUser(id: number | string) {
    return http.get(`${baseUrl}/api/users/${id}`)
  },
  createUser(data: any) {
    return http.post(`${baseUrl}/api/users`, data)
  },
  updateUser(id: number | string, data: any) {
    return http.put(`${baseUrl}/api/users/${id}`, data)
  },
  deleteUser(id: number | string) {
    return http.delete(`${baseUrl}/api/users/${id}`)
  },
}
