import { computed, reactive, ref, watch } from 'vue'
import axios from 'axios'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'
import { bedApi } from '../api/bedApi'
import { buildingApi } from '../api/buildingApi'
import { equipmentApi } from '../api/equipmentApi'
import { roomApi } from '../api/roomApi'
import { roomTypeApi } from '../api/roomTypeApi'
import type {
  AvailableRoomDto,
  BedDto,
  BuildingCreatePayload,
  BuildingDto,
  BuildingUpdatePayload,
  EquipmentDto,
  RoomCreatePayload,
  RoomDto,
  RoomStatusPayload,
  RoomTypeDto,
  RoomTypePayload,
  RoomUpdatePayload,
} from '../types'

const apiBaseUrl = resolveServiceBaseUrl(
  import.meta.env.VITE_ROOM_BUILDING_API_URL,
  5285,
  import.meta.env.VITE_ROOM_BUILDING_PUBLIC_API_URL,
)
const modulePageSize = 6

const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const initialized = ref(false)

const buildings = ref<BuildingDto[]>([])
const rooms = ref<RoomDto[]>([])
const roomTypes = ref<RoomTypeDto[]>([])
const availableRooms = ref<AvailableRoomDto[]>([])
const floorMapRooms = ref<RoomDto[]>([])

const selectedBuildingId = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)
const selectedRoomId = ref<string | null>(null)
const floorMapBuildingId = ref<string | null>(null)
const floorMapFloor = ref<number | null>(null)

const availableFilters = reactive({
  buildingId: null as string | null,
  roomTypeId: null as string | null,
  genderType: null as string | null,
  expectedStartDate: '',
  expectedEndDate: '',
})

const buildingDialog = ref(false)
const roomTypeDialog = ref(false)
const roomDialog = ref(false)
const roomStatusDialog = ref(false)

const editingBuildingId = ref<string | null>(null)
const editingRoomTypeId = ref<string | null>(null)
const editingRoomId = ref<string | null>(null)

const buildingForm = reactive<BuildingUpdatePayload>({
  name: '',
  totalFloors: 1,
  genderType: 'MIXED',
  status: 'ACTIVE',
  description: '',
})

const roomTypeForm = reactive({
  typeName: '',
  capacity: 4,
  basePrice: 0,
  imageUrl: '',
  description: '',
  amenitiesText: '',
})

const roomForm = reactive<RoomCreatePayload>({
  buildingId: '',
  roomTypeId: '',
  roomNumber: '',
  floorNumber: 1,
  imageUrl: '',
})

const roomStatusForm = reactive<RoomStatusPayload>({
  status: 'AVAILABLE',
  maintenanceReason: '',
})

const bedForm = reactive({
  bedNumber: '',
  status: 'AVAILABLE',
})

const equipmentForm = reactive({
  equipmentName: '',
  status: 'ACTIVE',
})

const editingBedId = ref<string | null>(null)
const editingEquipmentId = ref<string | null>(null)

const overviewBuildingPage = ref(1)
const overviewRoomTypePage = ref(1)
const buildingPage = ref(1)
const roomTypePage = ref(1)
const roomPage = ref(1)
const availableRoomPage = ref(1)
const floorMapPage = ref(1)
const bedPage = ref(1)
const equipmentPage = ref(1)

const buildingOptions = computed(() =>
  buildings.value.map((building) => ({
    title: building.name,
    value: building.id,
  })),
)

const roomTypeOptions = computed(() =>
  roomTypes.value.map((roomType) => ({
    title: roomType.typeName,
    value: roomType.id,
  })),
)

const selectedRoom = computed(() => rooms.value.find((room) => room.id === selectedRoomId.value) ?? null)
const totalAvailableSlots = computed(() => rooms.value.reduce((sum, room) => sum + room.availableSlots, 0))
const totalOccupancy = computed(() => rooms.value.reduce((sum, room) => sum + room.currentOccupancy, 0))
const maintenanceRooms = computed(() => rooms.value.filter((room) => room.status === 'UNDER_MAINTENANCE').length)

const buildingSummaries = computed(() =>
  buildings.value.map((building) => {
    const buildingRooms = rooms.value.filter((room) => room.buildingId === building.id)
    return {
      ...building,
      totalRooms: buildingRooms.length,
      totalAvailableSlots: buildingRooms.reduce((sum, room) => sum + room.availableSlots, 0),
      totalOccupancy: buildingRooms.reduce((sum, room) => sum + room.currentOccupancy, 0),
    }
  }),
)

function paginateArray<T>(items: T[], page: number) {
  const start = (page - 1) * modulePageSize
  return items.slice(start, start + modulePageSize)
}

function getPageCount(totalItems: number) {
  return Math.max(1, Math.ceil(totalItems / modulePageSize))
}

const filteredRooms = computed(() =>
  rooms.value.filter((room) => {
    if (selectedBuildingId.value && room.buildingId !== selectedBuildingId.value) return false
    if (selectedStatus.value && room.status !== selectedStatus.value) return false
    return true
  }),
)

const pagedBuildingSummaries = computed(() => paginateArray(buildingSummaries.value, overviewBuildingPage.value))
const pagedOverviewRoomTypes = computed(() => paginateArray(roomTypes.value, overviewRoomTypePage.value))
const pagedBuildings = computed(() => paginateArray(buildings.value, buildingPage.value))
const pagedRoomTypes = computed(() => paginateArray(roomTypes.value, roomTypePage.value))
const pagedRooms = computed(() => paginateArray(filteredRooms.value, roomPage.value))
const pagedAvailableRooms = computed(() => paginateArray(availableRooms.value, availableRoomPage.value))
const pagedFloorMapRooms = computed(() => paginateArray(floorMapRooms.value, floorMapPage.value))
const pagedBeds = computed(() => paginateArray(selectedRoom.value?.beds ?? [], bedPage.value))
const pagedEquipments = computed(() => paginateArray(selectedRoom.value?.equipments ?? [], equipmentPage.value))

const overviewBuildingPageCount = computed(() => getPageCount(buildingSummaries.value.length))
const overviewRoomTypePageCount = computed(() => getPageCount(roomTypes.value.length))
const buildingPageCount = computed(() => getPageCount(buildings.value.length))
const roomTypePageCount = computed(() => getPageCount(roomTypes.value.length))
const roomPageCount = computed(() => getPageCount(filteredRooms.value.length))
const availableRoomPageCount = computed(() => getPageCount(availableRooms.value.length))
const floorMapPageCount = computed(() => getPageCount(floorMapRooms.value.length))
const bedPageCount = computed(() => getPageCount(selectedRoom.value?.beds.length ?? 0))
const equipmentPageCount = computed(() => getPageCount(selectedRoom.value?.equipments.length ?? 0))

const statusOptions = [
  { title: 'Tất cả', value: null },
  { title: 'Còn chỗ', value: 'AVAILABLE' },
  { title: 'Đã đầy', value: 'FULL' },
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
  { title: 'Ngưng', value: 'INACTIVE' },
]

const buildingStatusOptions = [
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Ngưng', value: 'INACTIVE' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
]

const genderOptions = [
  { title: 'Nam', value: 'MALE' },
  { title: 'Nữ', value: 'FEMALE' },
  { title: 'Hỗn hợp', value: 'MIXED' },
]

const bedStatusOptions = [
  { title: 'Trống', value: 'AVAILABLE' },
  { title: 'Đang dùng', value: 'OCCUPIED' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
]

const equipmentStatusOptions = [
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
  { title: 'Hỏng', value: 'BROKEN' },
  { title: 'Ngưng dùng', value: 'RETIRED' },
]

function setError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    errorMessage.value = error.response?.data?.message ?? fallback
    return
  }
  errorMessage.value = fallback
}

function setSuccess(message: string) {
  successMessage.value = message
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'Còn chỗ'
    case 'ACTIVE':
      return 'Hoạt động'
    case 'FULL':
      return 'Đã đầy'
    case 'UNDER_MAINTENANCE':
      return 'Bảo trì'
    case 'INACTIVE':
      return 'Ngưng'
    case 'OCCUPIED':
      return 'Đang dùng'
    case 'BROKEN':
      return 'Hỏng'
    case 'RETIRED':
      return 'Ngưng dùng'
    default:
      return status
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'AVAILABLE':
    case 'ACTIVE':
      return 'success'
    case 'FULL':
      return 'error'
    case 'UNDER_MAINTENANCE':
      return 'warning'
    case 'INACTIVE':
    case 'RETIRED':
      return 'default'
    case 'OCCUPIED':
      return 'info'
    case 'BROKEN':
      return 'error'
    default:
      return 'default'
  }
}

function getStatusTheme(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'available'
    case 'ACTIVE':
      return 'active'
    case 'FULL':
      return 'full'
    case 'UNDER_MAINTENANCE':
      return 'maintenance'
    case 'INACTIVE':
      return 'inactive'
    case 'OCCUPIED':
      return 'occupied'
    case 'BROKEN':
      return 'broken'
    case 'RETIRED':
      return 'retired'
    default:
      return 'default'
  }
}

function getGenderLabel(genderType: string) {
  switch (genderType) {
    case 'MALE':
      return 'Nam'
    case 'FEMALE':
      return 'Nữ'
    case 'MIXED':
      return 'Hỗn hợp'
    default:
      return genderType
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function parseAmenities(text: string) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getDefaultEquipmentsByRoomType(roomTypeId: string) {
  const roomType = roomTypes.value.find((item) => item.id === roomTypeId)
  if (!roomType) return []

  return Array.from(new Set(roomType.amenities.map((item) => item.trim()).filter(Boolean)))
}

function resetBuildingForm() {
  buildingForm.name = ''
  buildingForm.totalFloors = 1
  buildingForm.genderType = 'MIXED'
  buildingForm.status = 'ACTIVE'
  buildingForm.description = ''
  editingBuildingId.value = null
}

function resetRoomTypeForm() {
  roomTypeForm.typeName = ''
  roomTypeForm.capacity = 4
  roomTypeForm.basePrice = 0
  roomTypeForm.imageUrl = ''
  roomTypeForm.description = ''
  roomTypeForm.amenitiesText = ''
  editingRoomTypeId.value = null
}

function resetRoomForm() {
  roomForm.buildingId = selectedBuildingId.value ?? buildings.value[0]?.id ?? ''
  roomForm.roomTypeId = roomTypes.value[0]?.id ?? ''
  roomForm.roomNumber = ''
  roomForm.floorNumber = 1
  roomForm.imageUrl = ''
  editingRoomId.value = null
}

function resetRoomStatusForm() {
  roomStatusForm.status = 'AVAILABLE'
  roomStatusForm.maintenanceReason = ''
}

function resetBedForm() {
  bedForm.bedNumber = ''
  bedForm.status = 'AVAILABLE'
  editingBedId.value = null
}

function resetEquipmentForm() {
  equipmentForm.equipmentName = ''
  equipmentForm.status = 'ACTIVE'
  editingEquipmentId.value = null
}

async function loadReferenceData() {
  const [buildingsResponse, roomTypesResponse] = await Promise.all([
    buildingApi.getBuildings(),
    roomTypeApi.getRoomTypes(),
  ])
  buildings.value = buildingsResponse.data
  roomTypes.value = roomTypesResponse.data
}

async function loadRooms() {
  const roomsResponse = await roomApi.getRooms()
  rooms.value = roomsResponse.data
}

async function loadAllData() {
  loading.value = true
  clearMessages()
  try {
    await Promise.all([loadReferenceData(), loadRooms()])
    if (!selectedRoomId.value && rooms.value.length > 0) selectedRoomId.value = rooms.value[0].id
    if (!floorMapBuildingId.value && buildings.value.length > 0) {
      floorMapBuildingId.value = buildings.value[0].id
      floorMapFloor.value = 1
    }
  } catch (error) {
    setError(error, `Không gọi được RoomBuildingService tại ${apiBaseUrl}.`)
  } finally {
    loading.value = false
  }
}

async function ensureLoaded() {
  if (initialized.value) return
  await loadAllData()
  initialized.value = true
}

async function runAction(action: () => Promise<void>, successMessageText: string) {
  submitting.value = true
  clearMessages()
  try {
    await action()
    await loadAllData()
    setSuccess(successMessageText)
  } catch (error) {
    setError(error, 'Thao tác với RoomBuildingService không thành công.')
  } finally {
    submitting.value = false
  }
}

function openCreateBuildingDialog() {
  resetBuildingForm()
  buildingDialog.value = true
}

function openEditBuildingDialog(building: BuildingDto) {
  editingBuildingId.value = building.id
  buildingForm.name = building.name
  buildingForm.totalFloors = building.totalFloors
  buildingForm.genderType = building.genderType
  buildingForm.status = building.status
  buildingForm.description = building.description ?? ''
  buildingDialog.value = true
}

async function submitBuilding() {
  await runAction(async () => {
    const payload: BuildingCreatePayload = {
      name: buildingForm.name,
      totalFloors: Number(buildingForm.totalFloors),
      genderType: buildingForm.genderType,
      description: buildingForm.description || null,
    }
    if (editingBuildingId.value) {
      await buildingApi.updateBuilding(editingBuildingId.value, { ...payload, status: buildingForm.status })
    } else {
      await buildingApi.createBuilding(payload)
    }
    buildingDialog.value = false
    resetBuildingForm()
  }, editingBuildingId.value ? 'Đã cập nhật tòa nhà.' : 'Đã tạo tòa nhà.')
}

async function removeBuilding(id: string) {
  if (!window.confirm('Xóa tòa nhà này?')) return
  await runAction(async () => {
    await buildingApi.deleteBuilding(id)
  }, 'Đã xóa tòa nhà.')
}

function openCreateRoomTypeDialog() {
  resetRoomTypeForm()
  roomTypeDialog.value = true
}

function openEditRoomTypeDialog(roomType: RoomTypeDto) {
  editingRoomTypeId.value = roomType.id
  roomTypeForm.typeName = roomType.typeName
  roomTypeForm.capacity = roomType.capacity
  roomTypeForm.basePrice = roomType.basePrice
  roomTypeForm.imageUrl = roomType.imageUrl ?? ''
  roomTypeForm.description = roomType.description ?? ''
  roomTypeForm.amenitiesText = roomType.amenities.join(', ')
  roomTypeDialog.value = true
}

async function setRoomTypeImageFromFile(file: File | null) {
  if (!file) return

  roomTypeForm.imageUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Không đọc được file ảnh loại phòng.'))
    reader.readAsDataURL(file)
  })
}

async function submitRoomType() {
  await runAction(async () => {
    const payload: RoomTypePayload = {
      typeName: roomTypeForm.typeName,
      capacity: Number(roomTypeForm.capacity),
      basePrice: Number(roomTypeForm.basePrice),
      imageUrl: roomTypeForm.imageUrl || null,
      description: roomTypeForm.description || null,
      amenities: parseAmenities(roomTypeForm.amenitiesText),
    }
    if (editingRoomTypeId.value) {
      await roomTypeApi.updateRoomType(editingRoomTypeId.value, payload)
    } else {
      await roomTypeApi.createRoomType(payload)
    }
    roomTypeDialog.value = false
    resetRoomTypeForm()
  }, editingRoomTypeId.value ? 'Đã cập nhật loại phòng.' : 'Đã tạo loại phòng.')
}

async function removeRoomType(id: string) {
  if (!window.confirm('Xóa loại phòng này?')) return
  await runAction(async () => {
    await roomTypeApi.deleteRoomType(id)
  }, 'Đã xóa loại phòng.')
}

function openCreateRoomDialog() {
  resetRoomForm()
  roomDialog.value = true
}

function openEditRoomDialog(room: RoomDto) {
  editingRoomId.value = room.id
  roomForm.buildingId = room.buildingId
  roomForm.roomTypeId = room.roomTypeId
  roomForm.roomNumber = room.roomNumber
  roomForm.floorNumber = room.floorNumber
  roomForm.imageUrl = room.imageUrl ?? ''
  roomDialog.value = true
}

async function setRoomImageFromFile(file: File | null) {
  if (!file) return

  roomForm.imageUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Không đọc được file ảnh.'))
    reader.readAsDataURL(file)
  })
}

async function submitRoom() {
  await runAction(async () => {
    const createPayload: RoomCreatePayload = {
      buildingId: roomForm.buildingId,
      roomTypeId: roomForm.roomTypeId,
      roomNumber: roomForm.roomNumber,
      floorNumber: Number(roomForm.floorNumber),
      imageUrl: roomForm.imageUrl || null,
    }
    if (editingRoomId.value) {
      const updatePayload: RoomUpdatePayload = {
        roomTypeId: createPayload.roomTypeId,
        roomNumber: createPayload.roomNumber,
        floorNumber: createPayload.floorNumber,
        imageUrl: createPayload.imageUrl,
      }
      await roomApi.updateRoom(editingRoomId.value, updatePayload)
    } else {
      const createdRoomResponse = await roomApi.createRoom(createPayload)
      const defaultEquipments = getDefaultEquipmentsByRoomType(createPayload.roomTypeId)

      if (defaultEquipments.length > 0) {
        await Promise.all(
          defaultEquipments.map((equipmentName) =>
            equipmentApi.createEquipment({
              roomId: createdRoomResponse.data.id,
              equipmentName,
            }),
          ),
        )
      }
    }
    roomDialog.value = false
    resetRoomForm()
  }, editingRoomId.value ? 'Đã cập nhật phòng.' : 'Đã tạo phòng và thêm thiết bị mặc định.')
}

function openRoomStatusEditor(room: RoomDto) {
  editingRoomId.value = room.id
  roomStatusForm.status = room.status
  roomStatusForm.maintenanceReason = room.maintenanceReason ?? ''
  roomStatusDialog.value = true
}

async function submitRoomStatus() {
  if (!editingRoomId.value) return
  await runAction(async () => {
    await roomApi.updateRoomStatus(editingRoomId.value!, {
      status: roomStatusForm.status,
      maintenanceReason: roomStatusForm.maintenanceReason || null,
    })
    roomStatusDialog.value = false
    resetRoomStatusForm()
    editingRoomId.value = null
  }, 'Đã cập nhật trạng thái phòng.')
}

async function removeRoom(id: string) {
  if (!window.confirm('Xóa phòng này?')) return
  await runAction(async () => {
    await roomApi.deleteRoom(id)
    if (selectedRoomId.value === id) selectedRoomId.value = null
  }, 'Đã xóa phòng.')
}

function editBed(bed: BedDto) {
  editingBedId.value = bed.id
  bedForm.bedNumber = bed.bedNumber
  bedForm.status = bed.status
}

async function submitBed() {
  if (!selectedRoom.value) return
  const roomId = selectedRoom.value.id
  await runAction(async () => {
    if (editingBedId.value) {
      await bedApi.updateBed(editingBedId.value, {
        bedNumber: bedForm.bedNumber,
        status: bedForm.status,
      })
    } else {
      await bedApi.createBed({ roomId, bedNumber: bedForm.bedNumber })
    }
    resetBedForm()
  }, editingBedId.value ? 'Đã cập nhật giường.' : 'Đã thêm giường.')
}

async function removeBed(id: string) {
  if (!window.confirm('Xóa giường này?')) return
  await runAction(async () => {
    await bedApi.deleteBed(id)
    resetBedForm()
  }, 'Đã xóa giường.')
}

function editEquipment(equipment: EquipmentDto) {
  editingEquipmentId.value = equipment.id
  equipmentForm.equipmentName = equipment.equipmentName
  equipmentForm.status = equipment.status
}

async function submitEquipment() {
  if (!selectedRoom.value) return
  const roomId = selectedRoom.value.id
  await runAction(async () => {
    if (editingEquipmentId.value) {
      await equipmentApi.updateEquipmentStatus(editingEquipmentId.value, { status: equipmentForm.status })
    } else {
      await equipmentApi.createEquipment({ roomId, equipmentName: equipmentForm.equipmentName })
    }
    resetEquipmentForm()
  }, editingEquipmentId.value ? 'Đã cập nhật thiết bị.' : 'Đã thêm thiết bị.')
}

async function removeEquipment(id: string) {
  if (!window.confirm('Xóa thiết bị này?')) return
  await runAction(async () => {
    await equipmentApi.deleteEquipment(id)
    resetEquipmentForm()
  }, 'Đã xóa thiết bị.')
}

async function loadAvailableRooms() {
  loading.value = true
  clearMessages()
  availableRoomPage.value = 1
  try {
    const response = await roomApi.getAvailableRooms({
      buildingId: availableFilters.buildingId ?? undefined,
      roomTypeId: availableFilters.roomTypeId ?? undefined,
      genderType: availableFilters.genderType ?? undefined,
      expectedStartDate: availableFilters.expectedStartDate || undefined,
      expectedEndDate: availableFilters.expectedEndDate || undefined,
    })
    availableRooms.value = response.data
  } catch (error) {
    setError(error, 'Không tải được danh sách phòng khả dụng.')
  } finally {
    loading.value = false
  }
}

async function loadFloorMap() {
  if (!floorMapBuildingId.value || !floorMapFloor.value) return
  loading.value = true
  clearMessages()
  floorMapPage.value = 1
  try {
    const response = await roomApi.getFloorMap(floorMapBuildingId.value, floorMapFloor.value)
    floorMapRooms.value = response.data
  } catch (error) {
    setError(error, 'Không tải được sơ đồ tầng.')
  } finally {
    loading.value = false
  }
}

watch(selectedRoom, () => {
  resetBedForm()
  resetEquipmentForm()
  bedPage.value = 1
  equipmentPage.value = 1
})

watch(buildingSummaries, () => {
  if (overviewBuildingPage.value > overviewBuildingPageCount.value) overviewBuildingPage.value = overviewBuildingPageCount.value
})

watch(roomTypes, () => {
  if (overviewRoomTypePage.value > overviewRoomTypePageCount.value) overviewRoomTypePage.value = overviewRoomTypePageCount.value
  if (roomTypePage.value > roomTypePageCount.value) roomTypePage.value = roomTypePageCount.value
})

watch(buildings, () => {
  if (buildingPage.value > buildingPageCount.value) buildingPage.value = buildingPageCount.value
})

watch(filteredRooms, () => {
  if (roomPage.value > roomPageCount.value) roomPage.value = roomPageCount.value
  if (roomPage.value < 1) roomPage.value = 1
}, { immediate: true })

watch(availableRooms, () => {
  if (availableRoomPage.value > availableRoomPageCount.value) availableRoomPage.value = availableRoomPageCount.value
})

watch(floorMapRooms, () => {
  if (floorMapPage.value > floorMapPageCount.value) floorMapPage.value = floorMapPageCount.value
})

watch(selectedBuildingId, () => {
  roomPage.value = 1
})

watch(selectedStatus, () => {
  roomPage.value = 1
})

watch(() => selectedRoom.value?.beds.length ?? 0, () => {
  if (bedPage.value > bedPageCount.value) bedPage.value = bedPageCount.value
})

watch(() => selectedRoom.value?.equipments.length ?? 0, () => {
  if (equipmentPage.value > equipmentPageCount.value) equipmentPage.value = equipmentPageCount.value
})

export function useRoomBuildingModule() {
  return reactive({
    apiBaseUrl,
    loading,
    submitting,
    errorMessage,
    successMessage,
    buildings,
    rooms,
    roomTypes,
    availableRooms,
    floorMapRooms,
    selectedBuildingId,
    selectedStatus,
    selectedRoomId,
    floorMapBuildingId,
    floorMapFloor,
    availableFilters,
    buildingDialog,
    roomTypeDialog,
    roomDialog,
    roomStatusDialog,
    editingBuildingId,
    editingRoomTypeId,
    editingRoomId,
    editingBedId,
    editingEquipmentId,
    buildingForm,
    roomTypeForm,
    roomForm,
    roomStatusForm,
    bedForm,
    equipmentForm,
    buildingOptions,
    roomTypeOptions,
    selectedRoom,
    totalAvailableSlots,
    totalOccupancy,
    maintenanceRooms,
    buildingSummaries,
    filteredRooms,
    modulePageSize,
    overviewBuildingPage,
    overviewRoomTypePage,
    buildingPage,
    roomTypePage,
    roomPage,
    availableRoomPage,
    floorMapPage,
    bedPage,
    equipmentPage,
    pagedBuildingSummaries,
    pagedOverviewRoomTypes,
    pagedBuildings,
    pagedRoomTypes,
    pagedRooms,
    pagedAvailableRooms,
    pagedFloorMapRooms,
    pagedBeds,
    pagedEquipments,
    overviewBuildingPageCount,
    overviewRoomTypePageCount,
    buildingPageCount,
    roomTypePageCount,
    roomPageCount,
    availableRoomPageCount,
    floorMapPageCount,
    bedPageCount,
    equipmentPageCount,
    statusOptions,
    buildingStatusOptions,
    genderOptions,
    bedStatusOptions,
    equipmentStatusOptions,
    getStatusLabel,
    getStatusColor,
    getStatusTheme,
    getGenderLabel,
    formatCurrency,
    ensureLoaded,
    loadAllData,
    loadAvailableRooms,
    loadFloorMap,
    clearMessages,
    openCreateBuildingDialog,
    openEditBuildingDialog,
    submitBuilding,
    removeBuilding,
    openCreateRoomTypeDialog,
    openEditRoomTypeDialog,
    submitRoomType,
    setRoomTypeImageFromFile,
    removeRoomType,
    openCreateRoomDialog,
    openEditRoomDialog,
    submitRoom,
    setRoomImageFromFile,
    openRoomStatusEditor,
    submitRoomStatus,
    removeRoom,
    resetBedForm,
    editBed,
    submitBed,
    removeBed,
    resetEquipmentForm,
    editEquipment,
    submitEquipment,
    removeEquipment,
  })
}
