import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_BILLING_MAINTENANCE_API_URL, 5300)

export const contractApi = {
  getContracts() {
    return http.get(`${baseUrl}/api/contracts`)
  },
  getMyContracts() {
    return http.get(`${baseUrl}/api/contracts/my`)
  },
  getContract(id: number | string) {
    return http.get(`${baseUrl}/api/contracts/${id}`)
  },
  createContract(data: any) {
    return http.post(`${baseUrl}/api/contracts`, data)
  },
  updateContract(id: number | string, data: any) {
    return http.put(`${baseUrl}/api/contracts/${id}`, data)
  },
  deleteContract(id: number | string) {
    return http.delete(`${baseUrl}/api/contracts/${id}`)
  },
}
