export interface ModuleApiConfig {
  baseUrl: string
}

export interface BuildingDto {
  id: string
  name: string
  totalFloors: number
  floors: number[]
  genderType: string
  status: string
  description?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface RoomTypeDto {
  id: string
  typeName: string
  capacity: number
  basePrice: number
  imageUrl?: string | null
  description?: string | null
  amenities: string[]
  createdAt: string
  updatedAt?: string | null
}

export interface BedDto {
  id: string
  roomId: string
  bedNumber: string
  status: string
  createdAt: string
  updatedAt?: string | null
}

export interface EquipmentDto {
  id: string
  roomId: string
  equipmentName: string
  equipmentIndex: string
  status: string
  createdAt: string
  updatedAt?: string | null
}

export interface RoomDto {
  id: string
  buildingId: string
  roomTypeId: string
  roomNumber: string
  floorNumber: number
  imageUrl?: string | null
  currentOccupancy: number
  availableSlots: number
  status: string
  maintenanceReason?: string | null
  building?: BuildingDto | null
  roomType?: RoomTypeDto | null
  beds: BedDto[]
  equipments: EquipmentDto[]
  createdAt: string
  updatedAt?: string | null
}

export interface RoomQueryParams {
  buildingId?: string
  floor?: number
  status?: string
}

export interface AvailableRoomQueryParams {
  buildingId?: string
  roomTypeId?: string
  genderType?: string
  expectedStartDate?: string
  expectedEndDate?: string
}

export interface AvailableRoomDto {
  id: string
  buildingId: string
  roomTypeId: string
  roomNumber: string
  floorNumber: number
  status: string
  currentOccupancy: number
  availableSlots: number
  building?: BuildingDto | null
  roomType?: RoomTypeDto | null
  expectedStartDate?: string | null
  expectedEndDate?: string | null
}

export interface BuildingCreatePayload {
  name: string
  totalFloors: number
  genderType: string
  description?: string | null
}

export interface BuildingUpdatePayload extends BuildingCreatePayload {
  status: string
}

export interface RoomTypePayload {
  typeName: string
  capacity: number
  basePrice: number
  imageUrl?: string | null
  description?: string | null
  amenities: string[]
}

export interface RoomCreatePayload {
  buildingId: string
  roomTypeId: string
  roomNumber: string
  floorNumber: number
  imageUrl?: string | null
}

export interface RoomUpdatePayload {
  roomTypeId: string
  roomNumber: string
  floorNumber: number
  imageUrl?: string | null
}

export interface RoomStatusPayload {
  status: string
  maintenanceReason?: string | null
}

export interface BedCreatePayload {
  roomId: string
  bedNumber: string
}

export interface BedUpdatePayload {
  bedNumber: string
  status: string
}

export interface EquipmentCreatePayload {
  roomId: string
  equipmentName: string
}

export interface EquipmentStatusPayload {
  status: string
}
