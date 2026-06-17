import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_BILLING_MAINTENANCE_API_URL, 5300)

export const maintenanceApi = {
  getRequests() {
    return http.get(`${baseUrl}/api/maintenance`)
  },
  getMyRequests() {
    return http.get(`${baseUrl}/api/maintenance/my`)
  },
  submitRequest(data: any) {
    return http.post(`${baseUrl}/api/maintenance`, data)
  },
  updateRequestStatus(id: number | string, data: any) {
    return http.put(`${baseUrl}/api/maintenance/${id}/status`, data)
  },
  getTechnicians() {
    return http.get(`${baseUrl}/api/technicians`)
  },
}
