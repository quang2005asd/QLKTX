<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/core/stores/authStore'
import AdminViews from './AdminViews.vue'
import StudentViews from './StudentViews.vue'

const auth = useAuthStore()

const isAdminOrManager = computed(() => {
  const role = auth.user?.role?.toLowerCase()
  return role === 'admin' || role === 'manager'
})
</script>

<template>
  <div class="billing-module-page">
    <div class="module-header mb-6">
      <div class="module-hero">
        <div class="module-hero-icon">
          <v-icon icon="mdi-receipt-text-outline" size="28" />
        </div>
        <div class="module-hero-copy">
          <div class="module-eyebrow">Hóa đơn & Bảo trì</div>
          <h1 class="module-title">
            {{ isAdminOrManager ? 'Hệ thống Quản lý Tài chính & Vận hành' : 'Cổng thông tin Hóa đơn & Bảo trì của tôi' }}
          </h1>
          <p class="module-copy">
            {{ isAdminOrManager 
              ? 'Theo dõi doanh thu, phát hành hóa đơn nội trú, duyệt yêu cầu bảo trì kỹ thuật và quản lý tài khoản.' 
              : 'Tra cứu các khoản phí nội trú, đóng tiền trực tuyến qua ngân hàng/ví Momo và gửi yêu cầu sửa chữa thiết bị.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Conditional View Loading based on role -->
    <AdminViews v-if="isAdminOrManager" />
    <StudentViews v-else />
  </div>
</template>

<style scoped>
.billing-module-page {
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
</style>
