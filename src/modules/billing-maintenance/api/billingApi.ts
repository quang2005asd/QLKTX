import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_BILLING_MAINTENANCE_API_URL, 5300)

export const billingApi = {
  getInvoices() {
    return http.get(`${baseUrl}/api/invoices`)
  },
  getMyInvoices() {
    return http.get(`${baseUrl}/api/invoices/my`)
  },
  getInvoice(id: number | string) {
    return http.get(`${baseUrl}/api/invoices/${id}`)
  },
  createInvoice(data: any) {
    return http.post(`${baseUrl}/api/invoices`, data)
  },
  updateInvoice(id: number | string, data: any) {
    return http.put(`${baseUrl}/api/invoices/${id}`, data)
  },
  deleteInvoice(id: number | string) {
    return http.delete(`${baseUrl}/api/invoices/${id}`)
  },
  processPayment(data: any) {
    return http.post(`${baseUrl}/api/payments`, data)
  },
  getPayments() {
    return http.get(`${baseUrl}/api/payments`)
  },
  getMyPayments() {
    return http.get(`${baseUrl}/api/payments/my`)
  },
}
