<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { billingApi } from '../api/billingApi'
import { maintenanceApi } from '../api/maintenanceApi'
import { useAuthStore } from '@/core/stores/authStore'

const auth = useAuthStore()

// Tab state
const activeTab = ref('invoices')

// Data states
const invoices = ref<any[]>([])
const maintenanceRequests = ref<any[]>([])
const payments = ref<any[]>([])

// Loading states
const loading = ref(false)
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Dialog states
const paymentModal = ref(false)
const invoiceDetailDialog = ref(false)

// Active states
const selectedInvoice = ref<any>(null)
const selectedPaymentMethod = ref('QR Banking')
const mockTransactionId = ref('')

// Submit request form
const maintForm = ref({
  title: '',
  description: '',
  roomNumber: auth.user?.email.includes('student') ? 'Room 101' : '',
})

async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [invRes, maintRes, payRes] = await Promise.all([
      billingApi.getMyInvoices(),
      maintenanceApi.getMyRequests(),
      billingApi.getMyPayments(),
    ])
    invoices.value = Array.isArray(invRes.data) ? invRes.data : (invRes.data?.items || [])
    maintenanceRequests.value = Array.isArray(maintRes.data) ? maintRes.data : (maintRes.data?.items || [])
    payments.value = payRes.data
  } catch (err: any) {
    console.error(err)
    errorMessage.value = 'Không thể tải dữ liệu từ máy chủ.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN')
}

// Payment trigger
function startPayment(inv: any) {
  selectedInvoice.value = inv
  selectedPaymentMethod.value = 'QR Banking'
  mockTransactionId.value = 'TXN' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100)
  paymentModal.value = true
}

async function executePayment() {
  if (!selectedInvoice.value) return
  submitting.value = true
  try {
    const payload = {
      invoiceId: selectedInvoice.value.id,
      amount: selectedInvoice.value.amount,
      paymentMethod: selectedPaymentMethod.value,
      transactionId: mockTransactionId.value,
      status: selectedPaymentMethod.value === 'Cash' ? 'Success' : 'Pending',
    }

    await billingApi.processPayment(payload)
    successMessage.value = 'Thanh toán thành công! Hệ thống đã cập nhật trạng thái hóa đơn.'
    paymentModal.value = false
    loadData()
  } catch (err: any) {
    console.error(err)
    alert('Thanh toán thất bại, vui lòng thử lại sau.')
  } finally {
    submitting.value = false
  }
}

// Submit maintenance request
async function submitMaintenance() {
  if (!maintForm.value.title || !maintForm.value.description) {
    alert('Vui lòng nhập đầy đủ tiêu đề và nội dung mô tả.')
    return
  }
  submitting.value = true
  try {
    await maintenanceApi.submitRequest({
      userId: Number(auth.user?.id),
      title: maintForm.value.title,
      description: maintForm.value.description,
      roomNumber: maintForm.value.roomNumber || 'Room 101',
    })
    successMessage.value = 'Gửi yêu cầu sửa chữa thành công!'
    maintForm.value.title = ''
    maintForm.value.description = ''
    activeTab.value = 'maint-status'
    loadData()
  } catch (err: any) {
    console.error(err)
    alert('Không thể gửi yêu cầu sửa chữa.')
  } finally {
    submitting.value = false
  }
}

function viewInvoiceDetails(inv: any) {
  selectedInvoice.value = inv
  invoiceDetailDialog.value = true
}

// Status filter
const invoiceFilter = ref('All')
const filteredInvoices = computed(() => {
  if (invoiceFilter.value === 'All') return invoices.value
  return invoices.value.filter(i => i.status === invoiceFilter.value)
})

const statusMap: Record<string, string> = {
  'Pending': 'Chờ xử lý',
  'NEW': 'Chờ xử lý',
  'In Progress': 'Đang xử lý',
  'IN_PROGRESS': 'Đang xử lý',
  'Completed': 'Hoàn thành',
  'COMPLETED': 'Hoàn thành',
  'Rejected': 'Từ chối',
  'CANCELLED': 'Đã hủy'
}

function getStatusLabel(status: string) {
  return statusMap[status] || status
}
</script>

<template>
  <div>
    <!-- Navigation Tabs -->
    <v-tabs v-model="activeTab" class="mb-6 border-b" color="primary" density="comfortable">
      <v-tab value="invoices" prepend-icon="mdi-receipt-text">Hóa đơn của tôi</v-tab>
      <v-tab value="submit-maint" prepend-icon="mdi-wrench-outline">Gửi yêu cầu bảo trì</v-tab>
      <v-tab value="maint-status" prepend-icon="mdi-progress-wrench">Trạng thái bảo trì</v-tab>
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

    <!-- STUDENT MY INVOICES -->
    <div v-if="activeTab === 'invoices'">
      <div class="d-flex justify-between align-center mb-4">
        <h2 class="text-h5 font-weight-bold">Danh sách hóa đơn của tôi</h2>
        <v-select
          v-model="invoiceFilter"
          :items="['All', 'Paid', 'Pending', 'Overdue']"
          label="Lọc trạng thái"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 180px"
        />
      </div>

      <v-row v-if="filteredInvoices.length > 0">
        <v-col v-for="inv in filteredInvoices" :key="inv.id" cols="12" md="6" lg="4">
          <v-card class="border border-purple-light pa-4 hover-card" elevation="0" rounded="xl">
            <div class="d-flex justify-between align-start mb-3">
              <div>
                <div class="text-caption text-medium-emphasis">Mã hóa đơn: #{{ inv.id }}</div>
                <h3 class="text-subtitle-1 font-weight-bold text-truncate" style="max-width: 200px;">{{ inv.title }}</h3>
              </div>
              <v-chip
                size="small"
                :color="inv.status === 'Paid' ? 'success' : inv.status === 'Pending' ? 'warning' : 'error'"
                variant="flat"
              >
                {{ inv.status === 'Paid' ? 'Đã thanh toán' : inv.status === 'Pending' ? 'Chưa thanh toán' : 'Quá hạn' }}
              </v-chip>
            </div>

            <div class="d-flex justify-between align-center my-4">
              <span class="text-body-2 text-medium-emphasis">Tổng số tiền:</span>
              <span class="text-h6 font-weight-black text-primary">{{ formatCurrency(inv.amount) }}</span>
            </div>

            <v-divider class="mb-4" />

            <div class="text-body-2 text-medium-emphasis mb-4">
              <div>Hạn đóng: <span class="font-weight-bold text-high-emphasis">{{ formatDate(inv.dueDate) }}</span></div>
              <div class="text-caption mt-1">{{ inv.description || 'Hóa đơn dịch vụ nội trú định kỳ' }}</div>
            </div>

            <div class="d-flex gap-2">
              <v-btn variant="tonal" rounded="lg" block color="secondary" @click="viewInvoiceDetails(inv)">Chi tiết</v-btn>
              <v-btn
                v-if="inv.status !== 'Paid'"
                color="primary"
                rounded="lg"
                block
                prepend-icon="mdi-credit-card-outline"
                @click="startPayment(inv)"
              >
                Thanh toán ngay
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
      <div v-else class="text-center py-8 text-medium-emphasis border rounded-xl bg-white">
        Chưa có hóa đơn nào phù hợp với bộ lọc của bạn.
      </div>
    </div>

    <!-- SUBMIT MAINTENANCE REQUEST -->
    <div v-if="activeTab === 'submit-maint'" class="max-w-md mx-auto">
      <v-card class="border pa-6" elevation="0" rounded="xl">
        <h2 class="text-h5 font-weight-bold mb-2">Gửi yêu cầu sửa chữa</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Báo cáo hư hại thiết bị phòng ở, điện nước hoặc hạ tầng kỹ thuật ký túc xá. Ban quản lý sẽ phản hồi sớm nhất.
        </p>

        <v-form @submit.prevent="submitMaintenance">
          <v-text-field v-model="maintForm.title" label="Tiêu đề yêu cầu (Ví dụ: Hỏng bóng đèn, Rò rỉ nước)" variant="outlined" class="mb-3" required />
          <v-text-field v-model="maintForm.roomNumber" label="Số phòng" variant="outlined" class="mb-3" required />
          <v-textarea v-model="maintForm.description" label="Mô tả chi tiết tình trạng hư hỏng" variant="outlined" rows="4" class="mb-4" required />

          <!-- Optional image upload -->
          <v-file-input label="Đính kèm hình ảnh minh họa (Tùy chọn)" variant="outlined" prepend-icon="mdi-camera" class="mb-4" disabled />

          <v-btn color="primary" rounded="lg" size="large" type="submit" block :loading="submitting">Gửi yêu cầu</v-btn>
        </v-form>
      </v-card>
    </div>

    <!-- TRACK MAINTENANCE REQUESTS -->
    <div v-if="activeTab === 'maint-status'">
      <h2 class="text-h5 font-weight-bold mb-4">Lịch sử và Trạng thái yêu cầu sửa chữa</h2>

      <div v-if="maintenanceRequests.length > 0">
        <v-row>
          <v-col v-for="req in maintenanceRequests" :key="req.id" cols="12" md="6">
            <v-card class="border pa-4" elevation="0" rounded="xl">
              <div class="d-flex justify-between align-start mb-3">
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold">{{ req.title }}</h3>
                  <div class="text-caption text-medium-emphasis">Phòng: {{ req.roomNumber }} • Gửi ngày: {{ formatDate(req.createdAt) }}</div>
                </div>
                <v-chip
                  size="small"
                  :color="req.status === 'Completed' || req.status === 'COMPLETED' ? 'success' : (req.status === 'Pending' || req.status === 'NEW' ? 'warning' : (req.status === 'In Progress' || req.status === 'IN_PROGRESS' ? 'info' : 'error'))"
                  variant="flat"
                >
                  {{ getStatusLabel(req.status) }}
                </v-chip>
              </div>

              <p class="text-body-2 mb-4 bg-light pa-3 rounded-lg">{{ req.description }}</p>

              <v-divider class="mb-3" />

              <div class="text-caption text-medium-emphasis">
                <div v-if="req.technicianId">Kỹ thuật viên phụ trách: <span class="font-weight-bold text-high-emphasis">Đã phân công</span></div>
                <div v-else>Kỹ thuật viên: <span class="text-warning font-weight-bold">Đang chờ ban quản lý điều phối</span></div>
                <div v-if="req.cost" class="mt-1">Chi phí ước tính: <span class="font-weight-bold text-primary">{{ formatCurrency(req.cost) }}</span> (Miễn phí nội trú nếu do khấu hao)</div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
      <div v-else class="text-center py-8 text-medium-emphasis border rounded-xl bg-white">
        Bạn chưa gửi yêu cầu sửa chữa nào.
      </div>
    </div>

    <!-- PAYMENT MODAL -->
    <v-dialog v-model="paymentModal" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="font-weight-bold text-center">Thanh toán trực tuyến</v-card-title>
        <v-card-text class="text-center">
          <div class="text-subtitle-2 mb-1">Mã hóa đơn: #{{ selectedInvoice?.id }}</div>
          <div class="text-h5 font-weight-black text-primary mb-4">{{ formatCurrency(selectedInvoice?.amount || 0) }}</div>

          <v-divider class="mb-4" />

          <!-- Method selection -->
          <div class="text-left font-weight-bold mb-2">Chọn phương thức thanh toán:</div>
          <v-radio-group v-model="selectedPaymentMethod" column class="mb-4">
            <v-radio label="QR Banking (Quét mã ngân hàng)" value="QR Banking" color="primary" />
            <v-radio label="Ví Momo" value="Momo" color="primary" />
            <v-radio label="Cổng VNPay (Mô phỏng)" value="VNPay (mock)" color="primary" />
            <v-radio label="Tiền mặt (Đóng tại quầy)" value="Cash" color="primary" />
          </v-radio-group>

          <!-- Mock Payment interfaces -->
          <v-card v-if="selectedPaymentMethod === 'QR Banking' || selectedPaymentMethod === 'Momo'" class="bg-light pa-4 border mb-4" rounded="lg" elevation="0">
            <div class="text-caption text-medium-emphasis mb-2">Quét mã QR để hoàn tất thanh toán</div>
            <!-- Mock QR code -->
            <div class="d-flex justify-center mb-2">
              <v-icon icon="mdi-qrcode-scan" size="120" color="primary" />
            </div>
            <div class="text-body-2 font-weight-bold">Tên TK: KTX DAI NAM - BANK</div>
            <div class="text-caption text-medium-emphasis">Nội dung chuyển khoản: {{ mockTransactionId }}</div>
          </v-card>

          <v-card v-if="selectedPaymentMethod === 'VNPay (mock)'" class="bg-light pa-4 border mb-4 text-center" rounded="lg" elevation="0">
            <v-icon icon="mdi-credit-card-wireless-outline" size="40" color="primary" class="mb-2" />
            <div class="text-body-2">Bạn sẽ được chuyển hướng cổng VNPay để nhập thông tin thẻ nội địa / quốc tế.</div>
          </v-card>

          <v-card v-if="selectedPaymentMethod === 'Cash'" class="bg-light pa-4 border mb-4 text-left" rounded="lg" elevation="0">
            <v-icon icon="mdi-cash" size="28" color="success" class="mb-2" />
            <div class="text-body-2 font-weight-bold">Quy trình đóng tiền mặt:</div>
            <div class="text-caption text-medium-emphasis">Sinh viên vui lòng đến quầy thu ngân KTX tại Tòa A1 trong giờ hành chính để đóng tiền mặt và ký biên nhận.</div>
          </v-card>
        </v-card-text>
        <v-card-actions class="justify-center pa-4">
          <v-btn variant="text" rounded="lg" @click="paymentModal = false">Đóng</v-btn>
          <v-btn color="primary" rounded="lg" size="large" :loading="submitting" @click="executePayment">Xác nhận đã thanh toán</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- INVOICE DETAILS DIALOG -->
    <v-dialog v-model="invoiceDetailDialog" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="font-weight-bold">Chi tiết hóa đơn dịch vụ</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis">Tiêu đề hóa đơn</div>
            <div class="text-body-1 font-weight-bold">{{ selectedInvoice?.title }}</div>
          </div>

          <v-divider class="mb-4" />

          <div class="d-flex justify-between py-2 border-b">
            <span>Tiền điện</span>
            <span class="font-weight-bold">{{ formatCurrency(selectedInvoice?.electricityFee || 0) }}</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span>Tiền nước</span>
            <span class="font-weight-bold">{{ formatCurrency(selectedInvoice?.waterFee || 0) }}</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span>Tiền phòng ở</span>
            <span class="font-weight-bold">{{ formatCurrency(selectedInvoice?.roomFee || 0) }}</span>
          </div>
          <div class="d-flex justify-between py-2 border-b">
            <span>Phí dịch vụ khác</span>
            <span class="font-weight-bold">{{ formatCurrency(selectedInvoice?.serviceFee || 0) }}</span>
          </div>

          <div class="d-flex justify-between py-3 font-weight-black text-subtitle-1 text-primary">
            <span>Tổng cộng</span>
            <span>{{ formatCurrency(selectedInvoice?.amount || 0) }}</span>
          </div>

          <v-divider class="mb-4" />

          <div class="text-body-2">
            <div>Hạn đóng tiền: <span class="font-weight-bold">{{ formatDate(selectedInvoice?.dueDate) }}</span></div>
            <div class="mt-1">Ghi chú: {{ selectedInvoice?.description || 'Hóa đơn định kỳ hàng tháng của ban quản lý ký túc xá.' }}</div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" rounded="lg" @click="invoiceDetailDialog = false">Đóng</v-btn>
          <v-btn
            v-if="selectedInvoice?.status !== 'Paid'"
            color="primary"
            rounded="lg"
            @click="invoiceDetailDialog = false; startPayment(selectedInvoice)"
          >
            Thanh toán ngay
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.hover-card {
  transition: all 0.25s ease;
  background-color: var(--v-theme-surface);
}
.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(139, 120, 187, 0.08) !important;
}
.border-purple-light {
  border-color: rgba(139, 120, 187, 0.2) !important;
}
.max-w-md {
  max-width: 550px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.gap-2 {
  gap: 8px;
}
.bg-light {
  background-color: #fdfaf7;
}
.border-b {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
</style>
