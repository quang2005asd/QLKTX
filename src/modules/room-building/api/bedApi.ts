import { http } from '@/core/api/http'
import { resolveServiceBaseUrlWithProductionFallback } from '@/core/api/serviceBaseUrl'
import type { BedCreatePayload, BedDto, BedUpdatePayload } from '../types'

const baseUrl = resolveServiceBaseUrlWithProductionFallback(
  import.meta.env.VITE_ROOM_BUILDING_API_URL,
  5285,
  'https://roombuildingservice-1ijx.onrender.com',
)

export const bedApi = {
  getBedsByRoom(roomId: string) {
    return http.get<BedDto[]>(`${baseUrl}/api/beds`, { params: { roomId } })
  },
  createBed(payload: BedCreatePayload) {
    return http.post<BedDto>(`${baseUrl}/api/beds`, payload)
  },
  updateBed(id: string, payload: BedUpdatePayload) {
    return http.put<BedDto>(`${baseUrl}/api/beds/${id}`, payload)
  },
  deleteBed(id: string) {
    return http.delete(`${baseUrl}/api/beds/${id}`)
  },
}
