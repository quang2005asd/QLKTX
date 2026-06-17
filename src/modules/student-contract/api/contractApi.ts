import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const baseUrl = resolveServiceBaseUrl(
  import.meta.env.VITE_STUDENT_CONTRACT_API_URL,
  5200,
  import.meta.env.VITE_STUDENT_CONTRACT_PUBLIC_API_URL,
)

export const contractApi = {
  getContracts() {
    return http.get(`${baseUrl}/api/contracts`)
  },
}
