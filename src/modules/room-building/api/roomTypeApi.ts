import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'
import type { RoomTypeDto, RoomTypePayload } from '../types'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_ROOM_BUILDING_API_URL, 5285)

export const roomTypeApi = {
  getRoomTypes() {
    return http.get<RoomTypeDto[]>(`${baseUrl}/api/roomtypes`)
  },
  createRoomType(payload: RoomTypePayload) {
    return http.post<RoomTypeDto>(`${baseUrl}/api/roomtypes`, payload)
  },
  updateRoomType(id: string, payload: RoomTypePayload) {
    return http.put<RoomTypeDto>(`${baseUrl}/api/roomtypes/${id}`, payload)
  },
  deleteRoomType(id: string) {
    return http.delete(`${baseUrl}/api/roomtypes/${id}`)
  },
}
