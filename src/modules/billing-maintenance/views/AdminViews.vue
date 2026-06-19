<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { billingApi } from '../api/billingApi'
import { maintenanceApi } from '../api/maintenanceApi'
import { usersApi } from '../api/usersApi'

const emit = defineEmits(['invoice-created', 'maintenance-updated'])

// Tab state
const activeTab = ref('dashboard')

// Data states
const invoices = ref<any[]>([])
const maintenanceRequests = ref<any[]>([])
const users = ref<any[]>([])
const payments = ref<any[]>([])
const debtsList = ref<any[]>([])
const debtStats = ref<any>({ totalOutstandingDebt: 0, totalInvoicedAmount: 0, totalCollectedAmount: 0, unpaidInvoiceCount: 0, overdueInvoiceCount: 0, debtPercentage: 0 })

// Loading states
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Dialog states
const invoiceDialog = ref(false)
const userDialog = ref(false)
const maintenanceDialog = ref(false)

// Editing states
const editingInvoiceId = ref<number | null>(null)
const editingUserId = ref<number | null>(null)
const editingRequest = ref<any>(null)

// Search & Filter
const invoiceSearch = ref('')
const invoiceStatusFilter = ref('All')
const invoiceMonthFilter = ref('All')
const monthItems = [
  { title: 'Tất cả các tháng', value: 'All' },
  { title: 'Tháng 1', value: '1' },
  { title: 'Tháng 2', value: '2' },
  { title: 'Tháng 3', value: '3' },
  { title: 'Tháng 4', value: '4' },
  { title: 'Tháng 5', value: '5' },
  { title: 'Tháng 6', value: '6' },
  { title: 'Tháng 7', value: '7' },
  { title: 'Tháng 8', value: '8' },
  { title: 'Tháng 9', value: '9' },
  { title: 'Tháng 10', value: '10' },
  { title: 'Tháng 11', value: '11' },
  { title: 'Tháng 12', value: '12' },
]
const invoicePage = ref(1)
const invoicePageSize = 5

// Form forms
const invoiceForm = ref({
  userId: null as number | null,
  title: '',
  description: '',
  electricityFee: 0,
  waterFee: 0,
  roomFee: 0,
  serviceFee: 0,
  dueDate: '',
  status: 'Pending',
})

const userForm = ref({
  username: '',
  password: '',
  email: '',
  fullName: '',
  phoneNumber: '',
  role: 'Student',
  roomNumber: '',
})

const maintenanceForm = ref({
  status: 'Pending',
  technicianId: null as number | null,
  repairCost: 0,
})

const technicians = ref<any[]>([])

// Load data functions
async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [invRes, maintRes, userRes, payRes, techRes, debtRes, statsRes] = await Promise.all([
      billingApi.getInvoices(),
      maintenanceApi.getRequests(),
      usersApi.getUsers(),
      billingApi.getPayments(),
      maintenanceApi.getTechnicians(),
      billingApi.getDebts(),
      billingApi.getDebtStats(),
    ])
    invoices.value = Array.isArray(invRes.data) ? invRes.data : (invRes.data?.items || [])
    maintenanceRequests.value = Array.isArray(maintRes.data) ? maintRes.data : (maintRes.data?.items || [])
    users.value = userRes.data
    payments.value = payRes.data
    technicians.value = techRes.data
    debtsList.value = debtRes.data
    debtStats.value = statsRes.data
  } catch (err: any) {
    console.error(err)
    errorMessage.value = 'Không thể tải dữ liệu từ máy chủ.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// Dashboard Computed Statistics
const totalStudents = computed(() => users.value.filter(u => u.role.toLowerCase() === 'student').length)
const totalRevenue = computed(() => {
  return payments.value
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0)
})
const pendingBillsCount = computed(() => invoices.value.filter(i => i.status === 'Pending').length)
const maintenanceCount = computed(() => maintenanceRequests.value.length)
const paidInvoicesCount = computed(() => invoices.value.filter(i => i.status === 'Paid').length)
const monthlyRevenue = computed(() => {
  const now = new Date()
  return payments.value
    .filter(p => {
      if (p.status !== 'Success') return false
      const pDate = new Date(p.paymentDate)
      return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + p.amount, 0)
})

// Helper formatters
function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN')
}

// Invoices Computed filtered
const filteredInvoices = computed(() => {
  return invoices.value.filter(inv => {
    const matchSearch =
      inv.title.toLowerCase().includes(invoiceSearch.value.toLowerCase()) ||
      (inv.user?.fullName && inv.user.fullName.toLowerCase().includes(invoiceSearch.value.toLowerCase())) ||
      (inv.user?.roomNumber && inv.user.roomNumber.toLowerCase().includes(invoiceSearch.value.toLowerCase()))

    const matchStatus = invoiceStatusFilter.value === 'All' || inv.status === invoiceStatusFilter.value

    const dateField = inv.dueDate || inv.createdAt
    const month = dateField ? new Date(dateField).getMonth() + 1 : null
    const matchMonth = invoiceMonthFilter.value === 'All' || (month !== null && month === Number(invoiceMonthFilter.value))

    return matchSearch && matchStatus && matchMonth
  })
})

const pagedInvoices = computed(() => {
  const start = (invoicePage.value - 1) * invoicePageSize
  return filteredInvoices.value.slice(start, start + invoicePageSize)
})

const invoicePageCount = computed(() => Math.ceil(filteredInvoices.value.length / invoicePageSize))

// Actions trigger
function openCreateInvoice() {
  editingInvoiceId.value = null
  invoiceForm.value = {
    userId: null,
    title: 'Hóa đơn dịch vụ tháng ' + (new Date().getMonth() + 1),
    description: '',
    electricityFee: 0,
    waterFee: 0,
    roomFee: 0,
    serviceFee: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
  }
  invoiceDialog.value = true
}

function openEditInvoice(inv: any) {
  editingInvoiceId.value = inv.id
  invoiceForm.value = {
    userId: inv.userId,
    title: inv.title,
    description: inv.description,
    electricityFee: inv.electricityFee,
    waterFee: inv.waterFee,
    roomFee: inv.roomFee,
    serviceFee: inv.serviceFee,
    dueDate: inv.dueDate.split('T')[0],
    status: inv.status,
  }
  invoiceDialog.value = true
}

async function saveInvoice() {
  if (!invoiceForm.value.userId) {
    alert('Vui lòng chọn sinh viên')
    return
  }
  submitting.value = true
  try {
    if (editingInvoiceId.value) {
      await billingApi.updateInvoice(editingInvoiceId.value, invoiceForm.value)
      successMessage.value = 'Cập nhật hóa đơn thành công!'
    } else {
      await billingApi.createInvoice(invoiceForm.value)
      successMessage.value = 'Tạo mới hóa đơn thành công!'
    }
    invoiceDialog.value = false
    loadData()
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data || 'Có lỗi xảy ra khi lưu hóa đơn.')
  } finally {
    submitting.value = false
  }
}

async function deleteInvoice(id: number) {
  if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này không?')) {
    try {
      await billingApi.deleteInvoice(id)
      successMessage.value = 'Xóa hóa đơn thành công!'
      loadData()
    } catch (err: any) {
      alert(err.response?.data || 'Không thể xóa hóa đơn.')
    }
  }
}

async function toggleInvoiceStatus(inv: any) {
  const newStatus = inv.status === 'Paid' ? 'Pending' : 'Paid'
  try {
    await billingApi.updateInvoice(inv.id, {
      userId: inv.userId,
      title: inv.title,
      description: inv.description,
      electricityFee: inv.electricityFee,
      waterFee: inv.waterFee,
      roomFee: inv.roomFee,
      serviceFee: inv.serviceFee,
      dueDate: inv.dueDate,
      status: newStatus
    })
    successMessage.value = `Đã cập nhật trạng thái hóa đơn #${inv.id} thành ${newStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}!`
    loadData()
  } catch (err: any) {
    alert(err.response?.data || 'Không thể cập nhật trạng thái hóa đơn.')
  }
}

function exportInvoices() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoices.value, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `invoice_list_${new Date().toISOString().split('T')[0]}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

// User Actions
function openCreateUser() {
  editingUserId.value = null
  userForm.value = {
    username: '',
    password: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    role: 'Student',
    roomNumber: '',
  }
  userDialog.value = true
}

function openEditUser(user: any) {
  editingUserId.value = user.id
  userForm.value = {
    username: user.username,
    password: '',
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    roomNumber: user.roomNumber || '',
  }
  userDialog.value = true
}

async function saveUser() {
  submitting.value = true
  try {
    if (editingUserId.value) {
      await usersApi.updateUser(editingUserId.value, userForm.value)
      successMessage.value = 'Cập nhật tài khoản thành công!'
    } else {
      await usersApi.createUser(userForm.value)
      successMessage.value = 'Tạo mới tài khoản thành công!'
    }
    userDialog.value = false
    loadData()
  } catch (err: any) {
    alert(err.response?.data || 'Có lỗi xảy ra khi lưu tài khoản.')
  } finally {
    submitting.value = false
  }
}

async function deleteUser(id: number) {
  if (confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
    try {
      await usersApi.deleteUser(id)
      successMessage.value = 'Xóa tài khoản thành công!'
      loadData()
    } catch (err: any) {
      alert(err.response?.data || 'Không thể xóa tài khoản.')
    }
  }
}

// Status and display helper mappings
const statusMap: Record<string, string> = {
  'Pending': 'Chờ xử lý',
  'In Progress': 'Đang xử lý',
  'Completed': 'Hoàn thành',
  'Rejected': 'Từ chối'
}

function getStatusLabel(status: string) {
  return statusMap[status] || status
}

const statusOptions = [
  { title: 'Chờ xử lý', value: 'Pending' },
  { title: 'Đang xử lý', value: 'In Progress' },
  { title: 'Hoàn thành', value: 'Completed' },
  { title: 'Từ chối', value: 'Rejected' }
]

// Maintenance Actions
function openEditMaintenance(maint: any) {
  editingRequest.value = maint
  maintenanceForm.value = {
    status: maint.status,
    technicianId: maint.technicianId || null,
    repairCost: maint.repairCost || 0,
  }
  maintenanceDialog.value = true
}

async function saveMaintenance() {
  if (!editingRequest.value) return
  submitting.value = true
  try {
    await maintenanceApi.updateRequestStatus(editingRequest.value.id, {
      status: maintenanceForm.value.status,
      technicianId: maintenanceForm.value.technicianId,
      repairCost: maintenanceForm.value.repairCost,
    })
    successMessage.value = 'Cập nhật trạng thái bảo trì thành công!'
    maintenanceDialog.value = false
    await loadData()
  } catch (err: any) {
    alert(err.response?.data || 'Có lỗi xảy ra khi cập nhật.')
  } finally {
    submitting.value = false
  }
}

async function verifyPaymentTransaction(paymentId: number, isVerified: boolean) {
  submitting.value = true
  try {
    await billingApi.verifyPayment({
      paymentId,
      isVerified,
      remarks: isVerified ? 'Duyệt thanh toán thành công' : 'Từ chối giao dịch'
    })
    successMessage.value = isVerified ? 'Đã duyệt thanh toán thành công!' : 'Đã từ chối giao dịch thanh toán!'
    await loadData()
  } catch (err: any) {
    alert(err.response?.data || 'Có lỗi xảy ra khi xác minh thanh toán.')
  } finally {
    submitting.value = false
  }
}

const studentUsers = computed(() => {
  return users.value.filter(u => u.role.toLowerCase() === 'student')
})
</script>

<template>
  <div>
    <!-- Tabs header navigation -->
    <v-tabs v-model="activeTab" class="mb-6 border-b" color="primary" density="comfortable">
      <v-tab value="dashboard" prepend-icon="mdi-chart-line">Dashboard</v-tab>
      <v-tab value="invoices" prepend-icon="mdi-receipt-text">Hóa đơn</v-tab>
      <v-tab value="maintenance" prepend-icon="mdi-wrench">Bảo trì</v-tab>
      <v-tab value="accounts" prepend-icon="mdi-account-multiple">Tài khoản</v-tab>
      <v-tab value="payments" prepend-icon="mdi-credit-card-check">Giám sát thanh toán</v-tab>
      <v-tab value="debts" prepend-icon="mdi-cash-register">Công nợ</v-tab>
    </v-tabs>

    <v-alert
      v-if="successMessage"
      class="mb-4"
      type="success"
      variant="tonal"
      closable
      @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

    <!-- DASHBOARD VIEW -->
    <div v-if="activeTab === 'dashboard'" class="dashboard-tab">
      <h2 class="text-h5 font-weight-bold mb-4">Tổng quan ban quản lý</h2>

      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="4" lg="2">
          <v-card class="stat-card border" elevation="0">
            <v-card-text>
              <div class="stat-title text-medium-emphasis">Sinh viên</div>
              <div class="stat-number text-h4 font-weight-bold">{{ totalStudents }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-card class="stat-card border" elevation="0">
            <v-card-text>
              <div class="stat-title text-medium-emphasis">Tổng doanh thu</div>
              <div class="stat-number text-h4 font-weight-bold text-success">{{ formatCurrency(totalRevenue) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="2">
          <v-card class="stat-card border" elevation="0">
            <v-card-text>
              <div class="stat-title text-medium-emphasis">Hóa đơn chờ đóng</div>
              <div class="stat-number text-h4 font-weight-bold text-warning">{{ pendingBillsCount }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="2">
          <v-card class="stat-card border" elevation="0">
            <v-card-text>
              <div class="stat-title text-medium-emphasis">Yêu cầu bảo trì</div>
              <div class="stat-number text-h4 font-weight-bold text-info">{{ maintenanceCount }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-card class="stat-card border" elevation="0">
            <v-card-text>
              <div class="stat-title text-medium-emphasis">Doanh thu tháng này</div>
              <div class="stat-number text-h4 font-weight-bold text-primary">{{ formatCurrency(monthlyRevenue) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card class="border pa-4" elevation="0" rounded="lg">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Biểu đồ Trạng thái Bảo trì</h3>
            <v-list density="comfortable">
              <v-list-item>
                <template #prepend><v-badge dot color="warning" class="mr-2" /></template>
                <v-list-item-title>Chờ xử lý</v-list-item-title>
                <template #append>{{ maintenanceRequests.filter(r => r.status === 'Pending').length }}</template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-badge dot color="info" class="mr-2" /></template>
                <v-list-item-title>Đang xử lý</v-list-item-title>
                <template #append>{{ maintenanceRequests.filter(r => r.status === 'In Progress').length }}</template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-badge dot color="success" class="mr-2" /></template>
                <v-list-item-title>Hoàn thành</v-list-item-title>
                <template #append>{{ maintenanceRequests.filter(r => r.status === 'Completed').length }}</template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-badge dot color="error" class="mr-2" /></template>
                <v-list-item-title>Từ chối</v-list-item-title>
                <template #append>{{ maintenanceRequests.filter(r => r.status === 'Rejected').length }}</template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="border pa-4" elevation="0" rounded="lg">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Trạng thái Hóa đơn</h3>
            <v-list density="comfortable">
              <v-list-item>
                <template #prepend><v-badge dot color="success" class="mr-2" /></template>
                <v-list-item-title>Đã thanh toán (Paid)</v-list-item-title>
                <template #append>{{ paidInvoicesCount }}</template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-badge dot color="warning" class="mr-2" /></template>
                <v-list-item-title>Chưa thanh toán (Pending)</v-list-item-title>
                <template #append>{{ pendingBillsCount }}</template>
              </v-list-item>
              <v-list-item>
                <template #prepend><v-badge dot color="error" class="mr-2" /></template>
                <v-list-item-title>Quá hạn (Overdue)</v-list-item-title>
                <template #append>{{ invoices.filter(i => i.status === 'Overdue').length }}</template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="border pa-4 mb-6" elevation="0" rounded="lg">
        <h3 class="text-subtitle-1 font-weight-bold mb-4">Hành động nhanh</h3>
        <div class="d-flex flex-wrap gap-3">
          <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="openCreateInvoice">Tạo hóa đơn</v-btn>
          <v-btn color="secondary" rounded="lg" prepend-icon="mdi-wrench" @click="activeTab = 'maintenance'">Duyệt bảo trì</v-btn>
          <v-btn color="info" rounded="lg" prepend-icon="mdi-account-plus" @click="openCreateUser">Tạo tài khoản</v-btn>
        </div>
      </v-card>
    </div>

    <!-- INVOICE MANAGEMENT VIEW -->
    <div v-if="activeTab === 'invoices'">
      <div class="d-flex flex-wrap justify-between align-center mb-4 gap-3">
        <h2 class="text-h5 font-weight-bold">Quản lý hóa đơn</h2>
        <div class="d-flex gap-2">
          <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="openCreateInvoice">Tạo hóa đơn</v-btn>
          <v-btn variant="outlined" color="primary" rounded="lg" prepend-icon="mdi-export" @click="exportInvoices">Xuất File</v-btn>
        </div>
      </div>

      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="invoiceSearch"
            label="Tìm kiếm hóa đơn theo tiêu đề, sinh viên, số phòng..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="invoiceStatusFilter"
            :items="[
              { title: 'Tất cả trạng thái', value: 'All' },
              { title: 'Đã thanh toán', value: 'Paid' },
              { title: 'Chưa thanh toán', value: 'Pending' },
              { title: 'Quá hạn', value: 'Overdue' }
            ]"
            item-title="title"
            item-value="value"
            label="Trạng thái"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="invoiceMonthFilter"
            :items="monthItems"
            item-title="title"
            item-value="value"
            label="Lọc theo tháng"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-table class="border rounded-lg mb-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sinh viên</th>
            <th>Phòng</th>
            <th>Tiêu đề</th>
            <th>Chi tiết phí (Điện / Nước / Phòng / Phụ phí)</th>
            <th>Tổng tiền</th>
            <th>Hạn đóng</th>
            <th>Trạng thái</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in pagedInvoices" :key="inv.id">
            <td>{{ inv.id }}</td>
            <td>{{ inv.user?.fullName ?? 'Không rõ' }}</td>
            <td>{{ inv.user?.roomNumber ?? '-' }}</td>
            <td>{{ inv.title }}</td>
            <td>
              <div class="text-caption">
                Điện: {{ formatCurrency(inv.electricityFee) }} <br />
                Nước: {{ formatCurrency(inv.waterFee) }} <br />
                Phòng: {{ formatCurrency(inv.roomFee) }} <br />
                Dịch vụ: {{ formatCurrency(inv.serviceFee) }}
              </div>
            </td>
            <td class="font-weight-bold">{{ formatCurrency(inv.amount) }}</td>
            <td>{{ formatDate(inv.dueDate) }}</td>
            <td>
              <v-chip
                size="small"
                :color="inv.status === 'Paid' ? 'success' : inv.status === 'Pending' ? 'warning' : 'error'"
                variant="flat"
              >
                {{ inv.status === 'Paid' ? 'Đã thanh toán' : inv.status === 'Pending' ? 'Chưa đóng' : 'Quá hạn' }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn
                :icon="inv.status === 'Paid' ? 'mdi-minus-circle-outline' : 'mdi-check-circle-outline'"
                size="small"
                variant="text"
                :color="inv.status === 'Paid' ? 'warning' : 'success'"
                :title="inv.status === 'Paid' ? 'Đánh dấu chưa thanh toán' : 'Đánh dấu đã thanh toán'"
                @click="toggleInvoiceStatus(inv)"
              />
              <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEditInvoice(inv)" />
              <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteInvoice(inv.id)" />
            </td>
          </tr>
          <tr v-if="pagedInvoices.length === 0">
            <td colspan="9" class="text-center text-medium-emphasis py-4">Không có hóa đơn nào</td>
          </tr>
        </tbody>
      </v-table>

      <div v-if="invoicePageCount > 1" class="d-flex justify-end">
        <v-pagination v-model="invoicePage" :length="invoicePageCount" :total-visible="5" density="comfortable" />
      </div>
    </div>

    <!-- MAINTENANCE MANAGEMENT VIEW -->
    <div v-if="activeTab === 'maintenance'">
      <h2 class="text-h5 font-weight-bold mb-4">Yêu cầu sửa chữa & bảo trì</h2>

      <v-table class="border rounded-lg">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sinh viên</th>
            <th>Phòng</th>
            <th>Nội dung</th>
            <th>Ngày yêu cầu</th>
            <th>Kỹ thuật viên</th>
            <th>Chi phí sửa</th>
            <th>Trạng thái</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in maintenanceRequests" :key="req.id">
            <td>{{ req.id }}</td>
            <td>{{ req.user?.fullName ?? 'Không rõ' }}</td>
            <td>{{ req.roomNumber || '-' }}</td>
            <td>
              <div class="font-weight-bold">{{ req.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ req.description }}</div>
            </td>
            <td>{{ formatDate(req.createdAt) }}</td>
            <td>{{ req.technician ? req.technician.name : 'Chưa phân công' }}</td>
            <td>{{ req.repairCost ? formatCurrency(req.repairCost) : '-' }}</td>
            <td>
              <v-chip
                size="small"
                :color="req.status === 'Completed' ? 'success' : req.status === 'Pending' ? 'warning' : req.status === 'In Progress' ? 'info' : 'error'"
                variant="flat"
              >
                {{ getStatusLabel(req.status) }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn size="small" rounded="lg" color="primary" variant="tonal" @click="openEditMaintenance(req)">
                Cập nhật
              </v-btn>
            </td>
          </tr>
          <tr v-if="maintenanceRequests.length === 0">
            <td colspan="9" class="text-center text-medium-emphasis py-4">Không có yêu cầu bảo trì nào</td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- ACCOUNT MANAGEMENT VIEW -->
    <div v-if="activeTab === 'accounts'">
      <div class="d-flex justify-between align-center mb-4">
        <h2 class="text-h5 font-weight-bold">Quản lý tài khoản</h2>
        <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="openCreateUser">Tạo tài khoản</v-btn>
      </div>

      <v-table class="border rounded-lg">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đăng nhập</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Số phòng</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phoneNumber || '-' }}</td>
            <td>
              <v-chip
                size="small"
                :color="user.role.toLowerCase() === 'admin' ? 'primary' : user.role.toLowerCase() === 'manager' ? 'secondary' : 'default'"
                variant="tonal"
              >
                {{ user.role }}
              </v-chip>
            </td>
            <td>{{ user.roomNumber || '-' }}</td>
            <td class="text-right">
              <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEditUser(user)" />
              <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteUser(user.id)" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- PAYMENTS MONITORING VIEW -->
    <div v-if="activeTab === 'payments'">
      <h2 class="text-h5 font-weight-bold mb-4">Lịch sử thanh toán & Giao dịch</h2>

      <v-table class="border rounded-lg">
        <thead>
          <tr>
            <th>Mã giao dịch</th>
            <th>Mã hóa đơn</th>
            <th>Sinh viên</th>
            <th>Số tiền</th>
            <th>Phương thức</th>
            <th>Ngày giao dịch</th>
            <th>Trạng thái</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pay in payments" :key="pay.id">
            <td>{{ pay.transactionId || ('PAY-' + pay.id) }}</td>
            <td>{{ pay.invoiceId }}</td>
            <td>{{ pay.invoice?.user?.fullName ?? 'Không rõ' }}</td>
            <td class="font-weight-bold">{{ formatCurrency(pay.amount) }}</td>
            <td>{{ pay.paymentMethod }}</td>
            <td>{{ formatDate(pay.paymentDate) }}</td>
            <td>
              <v-chip
                size="small"
                :color="pay.status === 'Success' ? 'success' : pay.status === 'Pending' ? 'warning' : 'error'"
                variant="flat"
              >
                {{ pay.status }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn
                v-if="pay.status === 'Pending'"
                size="small"
                color="success"
                rounded="lg"
                variant="tonal"
                @click="verifyPaymentTransaction(pay.id, true)"
                :loading="submitting"
              >
                Duyệt
              </v-btn>
              <v-btn
                v-if="pay.status === 'Pending'"
                size="small"
                color="error"
                rounded="lg"
                variant="text"
                class="ml-1"
                @click="verifyPaymentTransaction(pay.id, false)"
                :loading="submitting"
              >
                Từ chối
              </v-btn>
              <span v-else class="text-caption text-medium-emphasis">-</span>
            </td>
          </tr>
          <tr v-if="payments.length === 0">
            <td colspan="7" class="text-center text-medium-emphasis py-4">Chưa có giao dịch thanh toán nào được ghi nhận</td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- DEBT MANAGEMENT VIEW -->
    <div v-if="activeTab === 'debts'">
      <h2 class="text-h5 font-weight-bold mb-4">Quản lý Công nợ Sinh viên</h2>

      <v-row class="mb-6" v-if="debtStats">
        <v-col cols="12" sm="4">
          <v-card class="stat-card border" elevation="0">
            <v-card-text>
              <div class="stat-title text-medium-emphasis">Tổng nợ chưa thu</div>
              <div class="stat-number text-h5 font-weight-bold text-error">{{ formatCurrency(debtStats.totalOutstandingDebt) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="stat-card border" elevation="0">
            <v-card-text>
              <div class="stat-title text-medium-emphasis">Tỷ lệ công nợ</div>
              <div class="stat-number text-h5 font-weight-bold text-warning">{{ debtStats.debtPercentage }}%</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="stat-card border" elevation="0">
            <v-card-text>
              <div class="stat-title text-medium-emphasis">Hóa đơn quá hạn</div>
              <div class="stat-number text-h5 font-weight-bold text-error">{{ debtStats.overdueInvoiceCount }} hóa đơn</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-table class="border rounded-lg">
        <thead>
          <tr>
            <th>Sinh viên</th>
            <th>Email</th>
            <th>Tổng tiền đã lập</th>
            <th>Tổng tiền đã đóng</th>
            <th>Còn nợ</th>
            <th>Số hóa đơn chưa đóng</th>
            <th class="text-right">Chi tiết nợ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="debt in debtsList" :key="debt.userId">
            <td>{{ debt.fullName }} ({{ debt.username }})</td>
            <td>{{ debt.email }}</td>
            <td>{{ formatCurrency(debt.totalInvoiceAmount) }}</td>
            <td class="text-success font-weight-bold">{{ formatCurrency(debt.totalPaidAmount) }}</td>
            <td class="text-error font-weight-bold">{{ formatCurrency(debt.remainingDebt) }}</td>
            <td>
              <v-chip size="small" :color="debt.unpaidInvoices.length > 0 ? 'warning' : 'success'" variant="flat">
                {{ debt.unpaidInvoices.length }} hóa đơn
              </v-chip>
            </td>
            <td class="text-right">
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn size="small" rounded="lg" color="primary" variant="tonal" v-bind="props" :disabled="debt.unpaidInvoices.length === 0">
                    Xem hóa đơn nợ
                  </v-btn>
                </template>
                <v-list class="pa-2 border" max-width="350">
                  <v-list-item v-for="inv in debt.unpaidInvoices" :key="inv.id" class="mb-2 border-b pb-2">
                    <div class="font-weight-bold text-subtitle-2">{{ inv.title }}</div>
                    <div class="text-caption text-error font-weight-bold">Nợ: {{ formatCurrency(inv.amount) }}</div>
                    <div class="text-caption text-medium-emphasis">Hạn chót: {{ formatDate(inv.dueDate) }}</div>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
          <tr v-if="debtsList.length === 0">
            <td colspan="7" class="text-center text-medium-emphasis py-4">Không có dữ liệu công nợ</td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- DIALOGS -->

    <!-- Invoice Form Dialog -->
    <v-dialog v-model="invoiceDialog" max-width="600">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="font-weight-bold">
          {{ editingInvoiceId ? 'Chỉnh sửa hóa đơn' : 'Tạo mới hóa đơn' }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="invoiceForm.userId"
            :items="studentUsers"
            item-title="fullName"
            item-value="id"
            label="Chọn Sinh viên"
            variant="outlined"
            class="mb-3"
            :disabled="editingInvoiceId !== null"
          />
          <v-text-field v-model="invoiceForm.title" label="Tiêu đề hóa đơn" variant="outlined" class="mb-3" />
          <v-row>
            <v-col cols="6">
              <v-text-field v-model.number="invoiceForm.electricityFee" type="number" label="Tiền Điện (VND)" variant="outlined" class="mb-3" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="invoiceForm.waterFee" type="number" label="Tiền Nước (VND)" variant="outlined" class="mb-3" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model.number="invoiceForm.roomFee" type="number" label="Tiền Phòng (VND)" variant="outlined" class="mb-3" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="invoiceForm.serviceFee" type="number" label="Tiền Dịch vụ khác (VND)" variant="outlined" class="mb-3" />
            </v-col>
          </v-row>
          <v-text-field v-model="invoiceForm.dueDate" type="date" label="Hạn đóng tiền" variant="outlined" class="mb-3" />
          <v-select
            v-model="invoiceForm.status"
            :items="['Pending', 'Paid', 'Overdue']"
            label="Trạng thái"
            variant="outlined"
            class="mb-3"
          />
          <v-textarea v-model="invoiceForm.description" label="Ghi chú / Chi tiết" variant="outlined" rows="3" />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" rounded="lg" @click="invoiceDialog = false">Hủy</v-btn>
          <v-btn color="primary" rounded="lg" :loading="submitting" @click="saveInvoice">Lưu lại</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Form Dialog -->
    <v-dialog v-model="userDialog" max-width="600">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="font-weight-bold">
          {{ editingUserId ? 'Chỉnh sửa tài khoản' : 'Tạo mới tài khoản' }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="userForm.username" label="Tên đăng nhập" variant="outlined" class="mb-3" />
          <v-text-field v-model="userForm.password" type="password" label="Mật khẩu (Để trống nếu giữ nguyên)" variant="outlined" class="mb-3" />
          <v-text-field v-model="userForm.fullName" label="Họ và tên" variant="outlined" class="mb-3" />
          <v-text-field v-model="userForm.email" label="Email" type="email" variant="outlined" class="mb-3" />
          <v-text-field v-model="userForm.phoneNumber" label="Số điện thoại" variant="outlined" class="mb-3" />
          <v-select
            v-model="userForm.role"
            :items="['Admin', 'Manager', 'Student', 'Technician']"
            label="Vai trò (Role)"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field v-model="userForm.roomNumber" label="Số phòng (Nếu là Sinh viên)" variant="outlined" />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" rounded="lg" @click="userDialog = false">Hủy</v-btn>
          <v-btn color="primary" rounded="lg" :loading="submitting" @click="saveUser">Lưu tài khoản</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Maintenance Status Dialog -->
    <v-dialog v-model="maintenanceDialog" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="font-weight-bold">Phân công & Cập nhật bảo trì</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-subtitle-2 font-weight-bold">Yêu cầu:</div>
            <div class="text-body-1">{{ editingRequest?.title }}</div>
            <div class="text-caption text-medium-emphasis">{{ editingRequest?.description }}</div>
          </div>
          <v-select
            v-model="maintenanceForm.status"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            label="Trạng thái xử lý"
            variant="outlined"
            class="mb-3"
          />
          <v-select
            v-model="maintenanceForm.technicianId"
            :items="technicians"
            item-title="name"
            item-value="id"
            label="Kỹ thuật viên phụ trách"
            variant="outlined"
            class="mb-3"
            clearable
          />
          <v-text-field v-model.number="maintenanceForm.repairCost" type="number" label="Chi phí sửa chữa (VND)" variant="outlined" />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" rounded="lg" @click="maintenanceDialog = false">Hủy</v-btn>
          <v-btn color="primary" rounded="lg" :loading="submitting" @click="saveMaintenance">Cập nhật yêu cầu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.stat-card {
  transition: all 0.2s ease;
  background-color: var(--v-theme-surface);
}
.stat-card:hover {
  transform: translateY(-2px);
}
.stat-title {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}
.gap-3 {
  gap: 12px;
}
.gap-2 {
  gap: 8px;
}
</style>
