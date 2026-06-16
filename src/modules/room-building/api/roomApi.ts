import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'
import type {
  AvailableRoomDto,
  AvailableRoomQueryParams,
  RoomCreatePayload,
  RoomDto,
  RoomQueryParams,
  RoomStatusPayload,
  RoomUpdatePayload,
} from '../types'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_ROOM_BUILDING_API_URL, 5285)

export const roomApi = {
  getRooms(params?: RoomQueryParams) {
    return http.get<RoomDto[]>(`${baseUrl}/api/rooms`, { params })
  },
  getFloorMap(buildingId: string, floor: number) {
    return http.get<RoomDto[]>(`${baseUrl}/api/rooms/floormap`, {
      params: { buildingId, floor },
    })
  },
  getAvailableRooms(params?: AvailableRoomQueryParams) {
    return http.get<AvailableRoomDto[]>(`${baseUrl}/api/rooms/available`, { params })
  },
  createRoom(payload: RoomCreatePayload) {
    return http.post<RoomDto>(`${baseUrl}/api/rooms`, payload)
  },
  updateRoom(id: string, payload: RoomUpdatePayload) {
    return http.put<RoomDto>(`${baseUrl}/api/rooms/${id}`, payload)
  },
  updateRoomStatus(id: string, payload: RoomStatusPayload) {
    return http.patch(`${baseUrl}/api/rooms/${id}/status`, payload)
  },
  deleteRoom(id: string) {
    return http.delete(`${baseUrl}/api/rooms/${id}`)
  },
}
