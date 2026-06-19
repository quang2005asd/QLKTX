import { http } from '@/shared/http'

export const billingApi = {
  getInvoices() {
    return http.get('/api/invoices')
  },
  getMyInvoices() {
    return http.get('/api/invoices/my')
  },
  getInvoice(id: number | string) {
    return http.get(`/api/invoices/${id}`)
  },
  createInvoice(data: any) {
    return http.post('/api/invoices', data)
  },
  updateInvoice(id: number | string, data: any) {
    return http.put(`/api/invoices/${id}`, data)
  },
  deleteInvoice(id: number | string) {
    return http.delete(`/api/invoices/${id}`)
  },
  processPayment(data: any) {
    return http.post('/api/payments', data)
  },
  getPayments() {
    return http.get('/api/payments')
  },
  getMyPayments() {
    return http.get('/api/payments/my')
  },
  getDebts() {
    return http.get('/api/debts')
  },
  getStudentDebt(studentId: number | string) {
    return http.get(`/api/debts/student/${studentId}`)
  },
  getDebtStats() {
    return http.get('/api/debts/stats')
  },
  verifyPayment(data: { paymentId: number; isVerified: boolean; remarks?: string }) {
    return http.post('/api/payments/verify', data)
  },
}
