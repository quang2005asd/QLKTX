import { http } from '@/shared/http'

export const maintenanceApi = {
  getRequests() {
    return http.get('/api/maintenance')
  },
  getMyRequests() {
    return http.get('/api/maintenance/my')
  },
  submitRequest(data: any) {
    return http.post('/api/maintenance', data)
  },
  updateRequestStatus(id: number | string, data: any) {
    return http.put(`/api/maintenance/${id}/status`, data)
  },
  getTechnicians() {
    return http.get('/api/technicians')
  },
}
