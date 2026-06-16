import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'
import type { EquipmentCreatePayload, EquipmentDto, EquipmentStatusPayload } from '../types'

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_ROOM_BUILDING_API_URL, 5285)

export const equipmentApi = {
  getEquipmentsByRoom(roomId: string) {
    return http.get<EquipmentDto[]>(`${baseUrl}/api/equipments`, { params: { roomId } })
  },
  createEquipment(payload: EquipmentCreatePayload) {
    return http.post<EquipmentDto>(`${baseUrl}/api/equipments`, payload)
  },
  updateEquipmentStatus(id: string, payload: EquipmentStatusPayload) {
    return http.patch(`${baseUrl}/api/equipments/${id}/status`, payload)
  },
  deleteEquipment(id: string) {
    return http.delete(`${baseUrl}/api/equipments/${id}`)
  },
}
