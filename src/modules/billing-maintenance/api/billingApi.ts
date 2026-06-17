import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const baseUrl = resolveServiceBaseUrl(
  import.meta.env.VITE_BILLING_MAINTENANCE_API_URL,
  5300,
  import.meta.env.VITE_BILLING_MAINTENANCE_PUBLIC_API_URL,
)

export const billingApi = {
  getInvoices() {
    return http.get(`${baseUrl}/api/invoices`)
  },
}
