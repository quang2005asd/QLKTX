<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoomBuildingModule } from '../composables/useRoomBuildingModule'

const moduleState = useRoomBuildingModule()
onMounted(moduleState.ensureLoaded)
</script>

<template>
  <div class="room-module-page">
    <div class="module-header">
      <div class="module-hero">
        <div class="module-hero-icon">
          <v-icon icon="mdi-view-dashboard-outline" size="28" />
        </div>
        <div class="module-hero-copy">
          <div class="module-eyebrow">Room & Building</div>
          <h1 class="module-title">Tổng quan </h1>
        </div>
      </div>
      <div class="module-actions">
        <v-chip variant="tonal" color="primary" prepend-icon="mdi-api">{{ moduleState.apiBaseUrl }}</v-chip>
        <v-btn color="primary" rounded="lg" prepend-icon="mdi-refresh" :loading="moduleState.loading" @click="moduleState.loadAllData">Làm mới</v-btn>
      </div>
    </div>

    <v-alert v-if="moduleState.errorMessage" class="mb-4" type="warning" variant="tonal" closable @click:close="moduleState.errorMessage = ''">
      {{ moduleState.errorMessage }}
    </v-alert>

    <div class="summary-grid">
      <v-card class="summary-card" rounded="xl" elevation="0"><v-card-text><div class="summary-label">Tổng Tòa nhà</div><div class="summary-value">{{ moduleState.buildings.length }}</div><div class="module-muted"></div></v-card-text></v-card>
      <v-card class="summary-card" rounded="xl" elevation="0"><v-card-text><div class="summary-label">Tổng Sô Phòng</div><div class="summary-value">{{ moduleState.rooms.length }}</div><div class="module-muted"></div></v-card-text></v-card>
      <v-card class="summary-card" rounded="xl" elevation="0"><v-card-text><div class="summary-label">Phòng Đang ở</div><div class="summary-value">{{ moduleState.totalOccupancy }}</div><div class="module-muted"></div></v-card-text></v-card>
      <v-card class="summary-card" rounded="xl" elevation="0"><v-card-text><div class="summary-label">Chỗ trống</div><div class="summary-value">{{ moduleState.totalAvailableSlots }}</div><div class="module-muted"></div></v-card-text></v-card>
    </div>

    <v-card class="module-panel" rounded="xl" elevation="0">
      <v-card-text class="pa-6">
        <div class="dashboard-grid">
          <section>
            <div class="module-card-head">
              <div class="panel-kicker">Tòa nhà</div>
              <v-chip size="small" variant="tonal" color="primary">{{ moduleState.buildingSummaries.length }} tòa</v-chip>
            </div>
            <div class="building-stack">
              <article v-for="building in moduleState.pagedBuildingSummaries" :key="building.id" class="building-card">
                <div class="building-head">
                  <div>
                    <div class="building-name">{{ building.name }}</div>
                    <div class="building-meta">
                      {{ moduleState.getGenderLabel(building.genderType) }}
                      <span class="status-inline" :class="`status-inline-${moduleState.getStatusTheme(building.status)}`">
                        {{ moduleState.getStatusLabel(building.status) }}
                      </span>
                    </div>
                  </div>
                  <v-chip size="small" variant="tonal" color="primary">{{ building.totalFloors }} tầng</v-chip>
                </div>
                <p class="building-description">{{ building.description || 'Chưa có mô tả.' }}</p>
                <div class="building-stats">
                  <div><span class="building-stat-label">Phòng</span><strong>{{ building.totalRooms }}</strong></div>
                  <div><span class="building-stat-label">Đang ở</span><strong>{{ building.totalOccupancy }}</strong></div>
                  <div><span class="building-stat-label">Trống</span><strong>{{ building.totalAvailableSlots }}</strong></div>
                </div>
              </article>
            </div>
            <div v-if="moduleState.buildingSummaries.length > moduleState.modulePageSize" class="pagination-wrap">
              <v-pagination v-model="moduleState.overviewBuildingPage" :length="moduleState.overviewBuildingPageCount" :total-visible="4" density="comfortable" rounded="circle" />
            </div>
          </section>

          <section>
            <div class="module-card-head">
              <div class="panel-kicker">Loại phòng</div>
              <v-chip size="small" variant="tonal" color="primary">{{ moduleState.roomTypes.length }} loại</v-chip>
            </div>
            <div class="room-type-grid compact-grid">
              <article v-for="roomType in moduleState.pagedOverviewRoomTypes" :key="roomType.id" class="room-type-card">
                <div class="room-type-name">{{ roomType.typeName }}</div>
                <div class="room-type-meta">{{ roomType.capacity }} người • {{ moduleState.formatCurrency(roomType.basePrice) }}/tháng</div>
                <div class="amenity-list">
                  <v-chip v-for="amenity in roomType.amenities" :key="`${roomType.id}-${amenity}`" size="x-small" variant="tonal" color="primary">{{ amenity }}</v-chip>
                </div>
              </article>
            </div>
            <div v-if="moduleState.roomTypes.length > moduleState.modulePageSize" class="pagination-wrap">
              <v-pagination v-model="moduleState.overviewRoomTypePage" :length="moduleState.overviewRoomTypePageCount" :total-visible="4" density="comfortable" rounded="circle" />
            </div>
          </section>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped src="./module.css"></style>
