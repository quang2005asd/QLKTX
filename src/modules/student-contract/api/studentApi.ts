import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_STUDENT_CONTRACT_API_URL, 5200)

export const studentApi = {
  getStudents() {
    return http.get(`${baseUrl}/api/students`)
  },
}
