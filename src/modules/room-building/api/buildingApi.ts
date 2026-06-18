import { http } from '@/core/api/http'
import { resolveServiceBaseUrlWithProductionFallback } from '@/core/api/serviceBaseUrl'
import type { BuildingCreatePayload, BuildingDto, BuildingUpdatePayload } from '../types'

const baseUrl = resolveServiceBaseUrlWithProductionFallback(
  import.meta.env.VITE_ROOM_BUILDING_API_URL,
  5285,
  'https://roombuildingservice-1ijx.onrender.com',
)

export const buildingApi = {
  getBuildings() {
    return http.get<BuildingDto[]>(`${baseUrl}/api/buildings`)
  },
  createBuilding(payload: BuildingCreatePayload) {
    return http.post<BuildingDto>(`${baseUrl}/api/buildings`, payload)
  },
  updateBuilding(id: string, payload: BuildingUpdatePayload) {
    return http.put<BuildingDto>(`${baseUrl}/api/buildings/${id}`, payload)
  },
  deleteBuilding(id: string) {
    return http.delete(`${baseUrl}/api/buildings/${id}`)
  },
}
