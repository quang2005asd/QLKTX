export const APP_NAME = 'Hệ thống Quản lý Ký túc xá'
export const APP_SHORT_NAME = 'KTX'

export const GENDER_OPTIONS = [
  { title: 'Nam', value: 'MALE' },
  { title: 'Nữ', value: 'FEMALE' },
  { title: 'Hỗn hợp', value: 'MIXED' },
]

export const BUILDING_STATUS_OPTIONS = [
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Không hoạt động', value: 'INACTIVE' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
]

export const ROOM_STATUS_OPTIONS = [
  { title: 'Còn chỗ', value: 'AVAILABLE' },
  { title: 'Đầy', value: 'FULL' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
  { title: 'Không hoạt động', value: 'INACTIVE' },
]

export const STUDENT_STATUS_OPTIONS = [
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Không hoạt động', value: 'INACTIVE' },
  { title: 'Đình chỉ', value: 'SUSPENDED' },
  { title: 'Đã tốt nghiệp', value: 'GRADUATED' },
]

export const CONTRACT_STATUS_OPTIONS = [
  { title: 'Chờ xử lý', value: 'PENDING' },
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Hết hạn', value: 'EXPIRED' },
  { title: 'Chấm dứt', value: 'TERMINATED' },
  { title: 'Đã hủy', value: 'CANCELLED' },
]

export const APPLICATION_STATUS_OPTIONS = [
  { title: 'Bản nháp', value: 'DRAFT' },
  { title: 'Đã gửi', value: 'SUBMITTED' },
  { title: 'Đã duyệt', value: 'APPROVED' },
  { title: 'Từ chối', value: 'REJECTED' },
  { title: 'Đã hủy', value: 'CANCELLED' },
]

export const INVOICE_STATUS_OPTIONS = [
  { title: 'Đã thanh toán', value: 'PAID' },
  { title: 'Chưa thanh toán', value: 'UNPAID' },
  { title: 'Quá hạn', value: 'OVERDUE' },
  { title: 'Đã hủy', value: 'CANCELLED' },
]

export const EQUIPMENT_STATUS_OPTIONS = [
  { title: 'Hoạt động', value: 'ACTIVE' },
  { title: 'Bảo trì', value: 'UNDER_MAINTENANCE' },
  { title: 'Hỏng', value: 'BROKEN' },
  { title: 'Thanh lý', value: 'RETIRED' },
]

export const MAINTENANCE_TYPE_OPTIONS = [
  { title: 'Điện', value: 'ELECTRICAL' },
  { title: 'Nước', value: 'PLUMBING' },
  { title: 'Điều hòa', value: 'AC' },
  { title: 'Khóa cửa', value: 'LOCK' },
  { title: 'Tường/Sàn', value: 'STRUCTURE' },
  { title: 'Khác', value: 'OTHER' },
]

export const MAINTENANCE_STATUS_OPTIONS = [
  { title: 'Mới', value: 'NEW' },
  { title: 'Đang xử lý', value: 'IN_PROGRESS' },
  { title: 'Hoàn thành', value: 'COMPLETED' },
  { title: 'Đã hủy', value: 'CANCELLED' },
]

export const PAYMENT_CYCLE_OPTIONS = [
  { title: 'Hàng tháng', value: 'MONTHLY' },
  { title: 'Học kỳ', value: 'SEMESTER' },
  { title: 'Hàng năm', value: 'YEARLY' },
]

export const PAYMENT_METHOD_OPTIONS = [
  { title: 'Tiền mặt', value: 'CASH' },
  { title: 'Chuyển khoản', value: 'TRANSFER' },
]
