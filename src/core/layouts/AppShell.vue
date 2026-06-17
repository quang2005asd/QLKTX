<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/authStore'
import MarqueeText from '@/core/components/MarqueeText.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const roomBuildingItems = [
  { title: 'Tổng quan', to: '/app/room-building/overview', icon: 'mdi-chart-box-outline' },
  { title: 'Tòa nhà', to: '/app/room-building/buildings', icon: 'mdi-office-building-cog-outline' },
  { title: 'Loại phòng', to: '/app/room-building/room-types', icon: 'mdi-bed-double-outline' },
  { title: 'Phòng & giường', to: '/app/room-building/rooms', icon: 'mdi-door-open' },
  { title: 'Khả dụng', to: '/app/room-building/availability', icon: 'mdi-map-search-outline' },
]

const visibleNavigationItems = computed(() => {
  const role = auth.user?.role?.toLowerCase()
  if (role === 'student') {
    return [
      { title: 'Tổng quan', to: '/app/overview', icon: 'mdi-view-dashboard-outline' },
      { title: 'Hợp đồng', to: '/app/student-contract', icon: 'mdi-file-document-outline' },
      { title: 'Hóa đơn & Bảo trì', to: '/app/billing-maintenance', icon: 'mdi-receipt-text-outline' },
    ]
  }
  return [
    { title: 'Tổng quan', to: '/app/overview', icon: 'mdi-view-dashboard-outline' },
    { title: 'Sinh viên', to: '/app/student-contract', icon: 'mdi-account-school-outline' },
    { title: 'Hóa đơn & Bảo trì', to: '/app/billing-maintenance', icon: 'mdi-receipt-text-outline' },
  ]
})

const roleLabel = computed(() => {
  if (auth.user?.role === 'admin') return 'Quản trị viên'
  if (auth.user?.role === 'manager') return 'Quản lý'
  return 'Sinh viên'
})

const isRoomBuildingOpen = computed(() => route.path.startsWith('/app/room-building'))

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <v-app>
    <v-layout class="app-shell">
      <v-navigation-drawer class="shell-drawer" width="292" permanent>
        <div class="drawer-top">
          <div class="brand-chip">
            <v-icon icon="mdi-office-building-outline" size="20" />
          </div>
          <div>
            <div class="drawer-eyebrow">KTX Frontend</div>
            <div class="drawer-title">Bảng điều khiển</div>
          </div>
        </div>

        <div class="drawer-section">
          <div class="drawer-section-label">Điều hướng</div>
          <v-list nav density="comfortable" class="nav-list">
            <v-list-item
              v-for="item in visibleNavigationItems"
              :key="item.to"
              :to="item.to"
              :prepend-icon="item.icon"
              rounded="lg"
            >
              <template #title>
                <MarqueeText :text="item.title" class="nav-marquee" />
              </template>
            </v-list-item>

            <v-list-group v-if="auth.user?.role?.toLowerCase() !== 'student'" :value="isRoomBuildingOpen">
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-office-building-outline"
                  rounded="lg"
                >
                  <template #title>
                    <MarqueeText text="Phòng & Tòa nhà" class="nav-marquee" />
                  </template>
                </v-list-item>
              </template>

              <v-list-item
                v-for="item in roomBuildingItems"
                :key="item.to"
                :to="item.to"
                :prepend-icon="item.icon"
                rounded="lg"
                class="nav-sub-item"
              >
                <template #title>
                  <MarqueeText :text="item.title" class="nav-marquee" />
                </template>
              </v-list-item>
            </v-list-group>
          </v-list>
        </div>

        <div class="drawer-bottom">
          <div class="drawer-section-label">Phiên đăng nhập</div>
          <div class="session-card">
            <div class="session-name">{{ auth.user?.fullName ?? 'Khách' }}</div>
            <div class="session-role">{{ roleLabel }}</div>
            <div class="session-email">{{ auth.user?.email ?? 'Chưa có phiên đăng nhập' }}</div>
          </div>
        </div>
      </v-navigation-drawer>

      <v-main class="shell-main">
        <v-container class="py-6 px-6" fluid>
          <div class="shell-header">
            <div>
              <div class="shell-eyebrow">Dormitory Management</div>
              <div class="shell-title">Qly_ktx</div>
            </div>

            <div class="shell-actions">
              <v-btn color="primary" variant="tonal" rounded="lg" @click="handleLogout">Đăng xuất</v-btn>
            </div>
          </div>

          <div class="shell-content">
            <router-view />
          </div>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<style scoped src="./AppShell.css"></style>
