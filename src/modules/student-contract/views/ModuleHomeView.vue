<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/core/stores/authStore'
import { studentApi } from '../api/studentApi'
import { contractApi } from '../api/contractApi'

const auth = useAuthStore()

// State
const activeTab = ref('students') // 'students' or 'contracts' for admin
const loading = ref(false)
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Data Lists
const students = ref<any[]>([])
const contracts = ref<any[]>([])
const myContracts = ref<any[]>([])

// Pagination & Filtering (Students)
const studentSearch = ref('')
const studentPage = ref(1)
const studentPageSize = 6

// Pagination & Filtering (Contracts)
const contractSearch = ref('')
const contractStatusFilter = ref('All')
const contractPage = ref(1)
const contractPageSize = 6

// Dialog States
const studentDialog = ref(false)
const contractDialog = ref(false)
const contractDetailDialog = ref(false)

// Active details / form values
const editingStudentId = ref<number | null>(null)
const studentForm = ref({
  username: '',
  password: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  roomNumber: '',
  role: 'Student'
})

const editingContractId = ref<number | null>(null)
const contractForm = ref({
  userId: null as number | null,
  roomNumber: '',
  startDate: '',
  endDate: '',
  roomFee: 0,
  status: 'Active'
})

const selectedContract = ref<any>(null)

// Computed Roles
const isAdminOrManager = computed(() => {
  const role = auth.user?.role?.toLowerCase()
  return role === 'admin' || role === 'manager'
})

// Load Data
async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    if (isAdminOrManager.value) {
      const [studentRes, contractRes] = await Promise.all([
        studentApi.getStudents(),
        contractApi.getContracts()
      ])
      // Filter out only Students
      students.value = studentRes.data.filter((u: any) => u.role?.toLowerCase() === 'student')
      contracts.value = contractRes.data
    } else {
      const myContractsRes = await contractApi.getMyContracts()
      myContracts.value = myContractsRes.data
    }
  } catch (err: any) {
    console.error(err)
    errorMessage.value = 'Không thể tải dữ liệu từ API.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// Formatters
function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN')
}

// Student CRUD Operations
const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const codeMatch = s.username?.toLowerCase().includes(studentSearch.value.toLowerCase())
    const nameMatch = s.fullName?.toLowerCase().includes(studentSearch.value.toLowerCase())
    return codeMatch || nameMatch
  })
})

const pagedStudents = computed(() => {
  const start = (studentPage.value - 1) * studentPageSize
  return filteredStudents.value.slice(start, start + studentPageSize)
})

const studentPageCount = computed(() => Math.ceil(filteredStudents.value.length / studentPageSize))

function openCreateStudent() {
  editingStudentId.value = null
  studentForm.value = {
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    roomNumber: '',
    role: 'Student'
  }
  studentDialog.value = true
}

function openEditStudent(student: any) {
  editingStudentId.value = student.id
  studentForm.value = {
    username: student.username,
    password: '', // Leave empty if no change
    fullName: student.fullName,
    email: student.email,
    phoneNumber: student.phoneNumber || '',
    roomNumber: student.roomNumber || '',
    role: 'Student'
  }
  studentDialog.value = true
}

async function saveStudent() {
  if (!studentForm.value.username || !studentForm.value.fullName) {
    alert('Vui lòng điền đầy đủ mã sinh viên và họ tên.')
    return
  }
  if (!editingStudentId.value && !studentForm.value.password) {
    alert('Mật khẩu bắt buộc khi tạo tài khoản mới.')
    return
  }

  submitting.value = true
  try {
    if (editingStudentId.value) {
      await studentApi.updateStudent(editingStudentId.value, studentForm.value)
      successMessage.value = 'Cập nhật sinh viên thành công!'
    } else {
      await studentApi.createStudent(studentForm.value)
      successMessage.value = 'Tạo mới sinh viên thành công!'
    }
    studentDialog.value = false
    loadData()
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data || 'Có lỗi xảy ra khi lưu thông tin sinh viên.')
  } finally {
    submitting.value = false
  }
}

async function deleteStudent(id: number) {
  if (confirm('Bạn có chắc chắn muốn xóa sinh viên này khỏi hệ thống?')) {
    try {
      await studentApi.deleteStudent(id)
      successMessage.value = 'Xóa sinh viên thành công!'
      loadData()
    } catch (err: any) {
      alert(err.response?.data || 'Không thể xóa sinh viên.')
    }
  }
}

// Contract CRUD Operations
const filteredContracts = computed(() => {
  return contracts.value.filter(c => {
    const studentName = c.user?.fullName?.toLowerCase() || ''
    const studentCode = c.user?.username?.toLowerCase() || ''
    const room = c.roomNumber?.toLowerCase() || ''
    const query = contractSearch.value.toLowerCase()

    const searchMatch = studentName.includes(query) || studentCode.includes(query) || room.includes(query)
    const statusMatch = contractStatusFilter.value === 'All' || c.status === contractStatusFilter.value

    return searchMatch && statusMatch
  })
})

const pagedContracts = computed(() => {
  const start = (contractPage.value - 1) * contractPageSize
  return filteredContracts.value.slice(start, start + contractPageSize)
})

const contractPageCount = computed(() => Math.ceil(filteredContracts.value.length / contractPageSize))

function openCreateContract() {
  editingContractId.value = null
  contractForm.value = {
    userId: null,
    roomNumber: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 6 months
    roomFee: 1500000,
    status: 'Active'
  }
  contractDialog.value = true
}

function openEditContract(contract: any) {
  editingContractId.value = contract.id
  contractForm.value = {
    userId: contract.userId,
    roomNumber: contract.roomNumber,
    startDate: contract.startDate.split('T')[0],
    endDate: contract.endDate.split('T')[0],
    roomFee: contract.roomFee,
    status: contract.status
  }
  contractDialog.value = true
}

async function saveContract() {
  if (!contractForm.value.userId || !contractForm.value.roomNumber) {
    alert('Vui lòng chọn sinh viên và điền số phòng.')
    return
  }

  submitting.value = true
  try {
    if (editingContractId.value) {
      await contractApi.updateContract(editingContractId.value, contractForm.value)
      successMessage.value = 'Cập nhật hợp đồng thành công!'
    } else {
      await contractApi.createContract(contractForm.value)
      successMessage.value = 'Tạo mới hợp đồng thành công!'
    }
    contractDialog.value = false
    loadData()
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data || 'Có lỗi xảy ra khi lưu hợp đồng.')
  } finally {
    submitting.value = false
  }
}

async function deleteContract(id: number) {
  if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
    try {
      await contractApi.deleteContract(id)
      successMessage.value = 'Xóa hợp đồng thành công!'
      loadData()
    } catch (err: any) {
      alert(err.response?.data || 'Không thể xóa hợp đồng.')
    }
  }
}

function viewContractDetails(contract: any) {
  selectedContract.value = contract
  contractDetailDialog.value = true
}

const statusOptions = [
  { title: 'Đang hoạt động', value: 'Active' },
  { title: 'Đã hết hạn', value: 'Expired' },
  { title: 'Bị chấm dứt', value: 'Terminated' }
]

function getStatusLabel(status: string) {
  if (status === 'Active') return 'Đang hoạt động'
  if (status === 'Expired') return 'Đã hết hạn'
  if (status === 'Terminated') return 'Đã hủy'
  return status
}

function getStatusColor(status: string) {
  if (status === 'Active') return 'success'
  if (status === 'Expired') return 'warning'
  if (status === 'Terminated') return 'error'
  return 'default'
}
</script>

<template>
  <div class="student-contract-page">
    <!-- Hero / Header -->
    <div class="module-header mb-6">
      <div class="module-hero">
        <div class="module-hero-icon">
          <v-icon icon="mdi-account-school-outline" size="28" />
        </div>
        <div class="module-hero-copy">
          <div class="module-eyebrow">Sinh viên & Hợp đồng</div>
          <h1 class="module-title">
            {{ isAdminOrManager ? 'Hệ thống Quản lý Sinh viên & Hợp đồng Ký túc xá' : 'Hợp đồng lưu trú của tôi' }}
          </h1>
          <p class="module-copy">
            {{ isAdminOrManager 
              ? 'Quản lý thông tin lưu trú của sinh viên, theo dõi thời hạn hợp đồng, phân phòng ở và thực hiện cập nhật thông tin.' 
              : 'Xem chi tiết hợp đồng thuê phòng ở hiện tại, thời gian hiệu lực và các thông tin liên quan.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Feedback Banner -->
    <v-alert
      v-if="successMessage"
      class="mb-4 animate-fade-in"
      type="success"
      variant="tonal"
      closable
      rounded="xl"
      @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

    <!-- ADMIN LAYOUT -->
    <div v-if="isAdminOrManager">
      <v-tabs v-model="activeTab" class="mb-6 border-b" color="primary" density="comfortable">
        <v-tab value="students" prepend-icon="mdi-account-multiple">Quản lý Sinh viên</v-tab>
        <v-tab value="contracts" prepend-icon="mdi-file-document-edit-outline">Quản lý Hợp đồng</v-tab>
      </v-tabs>

      <!-- 1. STUDENT MANAGEMENT -->
      <div v-if="activeTab === 'students'" class="animate-fade-in">
        <div class="d-flex flex-wrap justify-between align-center mb-4 gap-3">
          <h2 class="text-h5 font-weight-bold">Danh sách sinh viên</h2>
          <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="openCreateStudent">
            Thêm sinh viên
          </v-btn>
        </div>

        <v-row class="mb-4">
          <v-col cols="12">
            <v-text-field
              v-model="studentSearch"
              label="Tìm kiếm theo mã sinh viên (Username), họ và tên..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              rounded="lg"
            />
          </v-col>
        </v-row>

        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="40" />
          <div class="mt-2 text-medium-emphasis">Đang tải danh sách sinh viên...</div>
        </div>

        <div v-else>
          <v-row v-if="pagedStudents.length > 0">
            <v-col v-for="std in pagedStudents" :key="std.id" cols="12" md="6" lg="4">
              <v-card class="student-card border hover-card" elevation="0" rounded="xl">
                <v-card-text class="pa-5">
                  <div class="d-flex align-center gap-3 mb-4">
                    <div class="student-avatar bg-primary-light">
                      <v-icon icon="mdi-account" color="primary" size="24" />
                    </div>
                    <div>
                      <div class="font-weight-black text-subtitle-1">{{ std.fullName }}</div>
                      <div class="text-caption text-medium-emphasis">MSSV: {{ std.username }}</div>
                    </div>
                  </div>

                  <v-divider class="mb-3" />

                  <div class="student-details text-body-2 mb-4">
                    <div class="detail-row mb-1">
                      <v-icon icon="mdi-email-outline" size="16" class="mr-2" />
                      <span>{{ std.email }}</span>
                    </div>
                    <div class="detail-row mb-1">
                      <v-icon icon="mdi-phone-outline" size="16" class="mr-2" />
                      <span>{{ std.phoneNumber || 'Chưa cung cấp' }}</span>
                    </div>
                    <div class="detail-row">
                      <v-icon icon="mdi-door-open" size="16" class="mr-2" />
                      <span>Phòng hiện tại: <strong class="text-primary">{{ std.roomNumber || 'Chưa xếp phòng' }}</strong></span>
                    </div>
                  </div>

                  <div class="d-flex justify-end gap-2">
                    <v-btn icon="mdi-pencil-outline" size="small" variant="tonal" color="primary" @click="openEditStudent(std)" />
                    <v-btn icon="mdi-trash-can-outline" size="small" variant="tonal" color="error" @click="deleteStudent(std.id)" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <div v-else class="text-center py-10 text-medium-emphasis border rounded-xl bg-white">
            <v-icon icon="mdi-account-off-outline" size="48" class="mb-2 text-medium-emphasis" />
            <div>Không tìm thấy sinh viên nào phù hợp.</div>
          </div>

          <div v-if="studentPageCount > 1" class="d-flex justify-end mt-4">
            <v-pagination v-model="studentPage" :length="studentPageCount" :total-visible="5" density="comfortable" />
          </div>
        </div>
      </div>

      <!-- 2. CONTRACT MANAGEMENT -->
      <div v-if="activeTab === 'contracts'" class="animate-fade-in">
        <div class="d-flex flex-wrap justify-between align-center mb-4 gap-3">
          <h2 class="text-h5 font-weight-bold">Danh sách hợp đồng lưu trú</h2>
          <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="openCreateContract">
            Tạo hợp đồng
          </v-btn>
        </div>

        <v-row class="mb-4">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="contractSearch"
              label="Tìm kiếm theo mã sinh viên, họ tên hoặc số phòng..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              rounded="lg"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="contractStatusFilter"
              :items="['All', 'Active', 'Expired', 'Terminated']"
              label="Bộ lọc trạng thái"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
            />
          </v-col>
        </v-row>

        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="40" />
          <div class="mt-2 text-medium-emphasis">Đang tải danh sách hợp đồng...</div>
        </div>

        <div v-else>
          <v-table class="border rounded-xl bg-white overflow-hidden mb-4 shadow-sm">
            <thead>
              <tr class="bg-light-grey">
                <th class="font-weight-bold py-3">Mã HĐ</th>
                <th class="font-weight-bold">Họ và tên</th>
                <th class="font-weight-bold">MSSV</th>
                <th class="font-weight-bold text-center">Phòng</th>
                <th class="font-weight-bold">Thời hạn lưu trú</th>
                <th class="font-weight-bold text-right">Giá phòng</th>
                <th class="font-weight-bold text-center">Trạng thái</th>
                <th class="font-weight-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in pagedContracts" :key="c.id" class="table-row">
                <td class="font-weight-bold text-primary">#HĐ-{{ c.id }}</td>
                <td>{{ c.user?.fullName ?? 'N/A' }}</td>
                <td><code class="text-medium-emphasis">{{ c.user?.username ?? 'N/A' }}</code></td>
                <td class="text-center"><v-chip size="small" variant="flat" color="secondary" class="font-weight-bold">{{ c.roomNumber }}</v-chip></td>
                <td class="text-caption">
                  {{ formatDate(c.startDate) }} - {{ formatDate(c.endDate) }}
                </td>
                <td class="text-right font-weight-bold text-success">{{ formatCurrency(c.roomFee) }}</td>
                <td class="text-center">
                  <v-chip size="small" :color="getStatusColor(c.status)" variant="flat" class="font-weight-bold">
                    {{ getStatusLabel(c.status) }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn icon="mdi-eye-outline" size="small" variant="text" color="info" @click="viewContractDetails(c)" />
                  <v-btn icon="mdi-pencil-outline" size="small" variant="text" color="primary" @click="openEditContract(c)" />
                  <v-btn icon="mdi-trash-can-outline" size="small" variant="text" color="error" @click="deleteContract(c.id)" />
                </td>
              </tr>
              <tr v-if="pagedContracts.length === 0">
                <td colspan="8" class="text-center text-medium-emphasis py-6">Không có hợp đồng nào phù hợp</td>
              </tr>
            </tbody>
          </v-table>

          <div v-if="contractPageCount > 1" class="d-flex justify-end">
            <v-pagination v-model="contractPage" :length="contractPageCount" :total-visible="5" density="comfortable" />
          </div>
        </div>
      </div>
    </div>

    <!-- STUDENT LAYOUT (View My Contract) -->
    <div v-else class="animate-fade-in">
      <h2 class="text-h5 font-weight-bold mb-4">Thông tin hợp đồng lưu trú của bạn</h2>

      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="40" />
        <div class="mt-2 text-medium-emphasis">Đang tải thông tin hợp đồng của bạn...</div>
      </div>

      <div v-else>
        <div v-if="myContracts.length > 0">
          <v-row>
            <v-col v-for="c in myContracts" :key="c.id" cols="12" md="8" lg="6" class="mx-auto">
              <v-card class="contract-detail-card border overflow-hidden" elevation="0" rounded="xl">
                <!-- Card Header -->
                <div class="card-gradient pa-6 text-white d-flex justify-between align-center">
                  <div>
                    <div class="text-caption text-white-50">Hợp đồng thuê phòng</div>
                    <div class="text-h6 font-weight-black">Mã hợp đồng: #HĐ-{{ c.id }}</div>
                  </div>
                  <v-chip size="comfortable" :color="getStatusColor(c.status)" variant="flat" class="font-weight-black">
                    {{ getStatusLabel(c.status) }}
                  </v-chip>
                </div>

                <!-- Card Body -->
                <v-card-text class="pa-6">
                  <div class="d-flex align-center justify-between mb-4">
                    <div class="d-flex align-center gap-3">
                      <v-icon icon="mdi-door-open" color="primary" size="28" />
                      <div>
                        <div class="text-caption text-medium-emphasis">Phòng ở đã ký</div>
                        <div class="text-h5 font-weight-black text-primary">{{ c.roomNumber }}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-caption text-medium-emphasis">Đơn giá định kỳ</div>
                      <div class="text-h6 font-weight-bold text-success">{{ formatCurrency(c.roomFee) }} / Tháng</div>
                    </div>
                  </div>

                  <v-divider class="my-4" />

                  <!-- Dates -->
                  <div class="dates-display d-flex justify-between align-center mb-6">
                    <div class="date-block text-center flex-grow-1 border-r">
                      <div class="text-caption text-medium-emphasis mb-1">Ngày bắt đầu</div>
                      <div class="text-body-1 font-weight-bold text-high-emphasis">{{ formatDate(c.startDate) }}</div>
                    </div>
                    <div class="date-block text-center flex-grow-1">
                      <div class="text-caption text-medium-emphasis mb-1">Ngày kết thúc</div>
                      <div class="text-body-1 font-weight-bold text-high-emphasis">{{ formatDate(c.endDate) }}</div>
                    </div>
                  </div>

                  <v-alert class="bg-light-blue" icon="mdi-information-outline" variant="tonal" rounded="lg">
                    <div class="text-caption text-high-emphasis">
                      Hợp đồng này quy định điều khoản lưu trú của bạn tại Ký túc xá Đại Nam. Nếu có bất kỳ thắc mắc hoặc yêu cầu thay đổi phòng ở, xin vui lòng gửi yêu cầu hỗ trợ đến Ban quản lý KTX tại Tòa A1.
                    </div>
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
        <div v-else class="text-center py-12 text-medium-emphasis border rounded-xl bg-white max-w-md mx-auto">
          <v-icon icon="mdi-file-document-alert-outline" size="54" color="warning" class="mb-3" />
          <h3 class="text-subtitle-1 font-weight-bold mb-1">Bạn chưa có hợp đồng lưu trú</h3>
          <p class="text-body-2 text-medium-emphasis">
            Vui lòng liên hệ với Ban quản lý Ký túc xá tại Tòa A1 để đăng ký phòng ở và ký kết hợp đồng.
          </p>
        </div>
      </div>
    </div>

    <!-- DIALOGS -->

    <!-- 1. Student Form Dialog -->
    <v-dialog v-model="studentDialog" max-width="600">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="font-weight-bold text-h6">
          {{ editingStudentId ? 'Chỉnh sửa tài khoản sinh viên' : 'Thêm tài khoản sinh viên mới' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="studentForm.username"
            label="Mã số sinh viên (Username)"
            variant="outlined"
            class="mb-3"
            :disabled="editingStudentId !== null"
            rounded="lg"
          />
          <v-text-field
            v-model="studentForm.password"
            type="password"
            :label="editingStudentId ? 'Mật khẩu mới (Để trống nếu giữ nguyên)' : 'Mật khẩu đăng nhập'"
            variant="outlined"
            class="mb-3"
            rounded="lg"
          />
          <v-text-field
            v-model="studentForm.fullName"
            label="Họ và tên sinh viên"
            variant="outlined"
            class="mb-3"
            rounded="lg"
          />
          <v-text-field
            v-model="studentForm.email"
            label="Địa chỉ Email"
            type="email"
            variant="outlined"
            class="mb-3"
            rounded="lg"
          />
          <v-text-field
            v-model="studentForm.phoneNumber"
            label="Số điện thoại"
            variant="outlined"
            class="mb-3"
            rounded="lg"
          />
          <v-text-field
            v-model="studentForm.roomNumber"
            label="Số phòng ở (Có thể gán sau khi tạo hợp đồng)"
            variant="outlined"
            rounded="lg"
          />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" rounded="lg" @click="studentDialog = false">Hủy bỏ</v-btn>
          <v-btn color="primary" rounded="lg" :loading="submitting" @click="saveStudent">Lưu lại</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 2. Contract Form Dialog -->
    <v-dialog v-model="contractDialog" max-width="600">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="font-weight-bold text-h6">
          {{ editingContractId ? 'Chỉnh sửa hợp đồng' : 'Tạo mới hợp đồng lưu trú' }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="contractForm.userId"
            :items="students"
            item-title="fullName"
            item-value="id"
            label="Chọn Sinh viên ký hợp đồng"
            variant="outlined"
            class="mb-3"
            :disabled="editingContractId !== null"
            rounded="lg"
            no-data-text="Không có sinh viên nào trong hệ thống"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="`MSSV: ${item.raw.username}`" />
            </template>
          </v-select>

          <v-text-field
            v-model="contractForm.roomNumber"
            label="Số phòng ở gán cho sinh viên"
            variant="outlined"
            class="mb-3"
            rounded="lg"
          />

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="contractForm.startDate"
                type="date"
                label="Ngày bắt đầu hiệu lực"
                variant="outlined"
                class="mb-3"
                rounded="lg"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="contractForm.endDate"
                type="date"
                label="Ngày kết thúc hợp đồng"
                variant="outlined"
                class="mb-3"
                rounded="lg"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model.number="contractForm.roomFee"
            type="number"
            label="Giá phòng thuê định kỳ (VND / Tháng)"
            variant="outlined"
            class="mb-3"
            rounded="lg"
          />

          <v-select
            v-model="contractForm.status"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            label="Trạng thái hợp đồng"
            variant="outlined"
            rounded="lg"
          />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" rounded="lg" @click="contractDialog = false">Hủy bỏ</v-btn>
          <v-btn color="primary" rounded="lg" :loading="submitting" @click="saveContract">Lưu lại</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 3. Contract Detail View Dialog -->
    <v-dialog v-model="contractDetailDialog" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="font-weight-bold text-center">Chi tiết hợp đồng lưu trú</v-card-title>
        <v-card-text class="py-4">
          <div class="d-flex justify-between py-2 border-b">
            <span class="text-medium-emphasis">Mã hợp đồng:</span>
            <span class="font-weight-bold text-primary">#HĐ-{{ selectedContract?.id }}</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span class="text-medium-emphasis">Sinh viên:</span>
            <span class="font-weight-bold">{{ selectedContract?.user?.fullName }}</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span class="text-medium-emphasis">Mã số sinh viên:</span>
            <span><code>{{ selectedContract?.user?.username }}</code></span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span class="text-medium-emphasis">Phòng ở:</span>
            <span class="font-weight-bold text-secondary">{{ selectedContract?.roomNumber }}</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span class="text-medium-emphasis">Ngày bắt đầu:</span>
            <span>{{ formatDate(selectedContract?.startDate) }}</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span class="text-medium-emphasis">Ngày kết thúc:</span>
            <span>{{ formatDate(selectedContract?.endDate) }}</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span class="text-medium-emphasis">Giá phòng:</span>
            <span class="font-weight-bold text-success">{{ formatCurrency(selectedContract?.roomFee || 0) }} / tháng</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span class="text-medium-emphasis">Trạng thái:</span>
            <v-chip size="small" :color="getStatusColor(selectedContract?.status)" variant="flat" class="font-weight-bold">
              {{ getStatusLabel(selectedContract?.status) }}
            </v-chip>
          </div>
          <div class="d-flex justify-between py-2">
            <span class="text-medium-emphasis">Ngày ký kết:</span>
            <span>{{ formatDate(selectedContract?.createdAt) }}</span>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pa-4">
          <v-btn color="primary" rounded="lg" block @click="contractDetailDialog = false">Đóng lại</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.student-contract-page {
  display: flex;
  flex-direction: column;
}

.module-header {
  border: 1px solid rgba(128, 109, 158, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(56, 43, 77, 0.05);
  padding: 24px;
}

.module-hero {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.module-hero-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(111, 90, 166, 0.1);
  color: #6f5aa6;
  flex-shrink: 0;
}

.module-hero-copy {
  display: flex;
  flex-direction: column;
}

.module-eyebrow {
  color: rgba(43, 36, 48, 0.58);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.module-title {
  color: #2d2732;
  font-family: var(--font-serif);
  font-size: 1.6rem;
  font-weight: 700;
  margin: 4px 0 6px;
}

.module-copy {
  color: rgba(43, 36, 48, 0.66);
  font-size: 0.95rem;
  line-height: 1.6;
}

.hover-card {
  transition: all 0.25s ease;
  background-color: var(--v-theme-surface);
}

.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(139, 120, 187, 0.08) !important;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.bg-primary-light {
  background-color: rgba(111, 90, 166, 0.1);
}

.student-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
}

.gap-3 {
  gap: 12px;
}

.gap-2 {
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.7);
}

.table-row {
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: rgba(111, 90, 166, 0.02);
}

.bg-light-grey {
  background-color: #fcfcfd;
}

.shadow-sm {
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.card-gradient {
  background: linear-gradient(135deg, #6f5aa6 0%, #8b78bb 100%);
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.7) !important;
}

.border-r {
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.bg-light-blue {
  background-color: #eef3fc;
}

.max-w-md {
  max-width: 500px;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.border-b {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
