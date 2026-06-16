import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_BILLING_MAINTENANCE_API_URL, 5300)

export const maintenanceApi = {
  getRequests() {
    return http.get(`${baseUrl}/api/maintenance-requests`)
  },
}
