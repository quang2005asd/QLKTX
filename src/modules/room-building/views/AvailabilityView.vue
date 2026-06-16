<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoomBuildingModule } from '../composables/useRoomBuildingModule'
import MarqueeText from '@/core/components/MarqueeText.vue'

const moduleState = useRoomBuildingModule()
onMounted(async () => {
  await moduleState.ensureLoaded()
  await moduleState.loadAvailableRooms()
})
</script>

<template>
  <div class="room-module-page">
    <div class="module-header">
      <div class="module-hero">
        <div class="module-hero-icon">
          <v-icon icon="mdi-map-search-outline" size="28" />
        </div>
        <div class="module-hero-copy">
          <div class="module-eyebrow">Khả dụng</div>
          <h1 class="module-title">Phòng khả dụng</h1>
          <p class="module-copy">Tra cứu phòng còn chỗ và xem sơ đồ tầng theo từng tòa để phục vụ đăng ký và điều phối chỗ ở.</p>
        </div>
      </div>
      <div class="module-actions">
        <v-btn color="primary" rounded="lg" prepend-icon="mdi-refresh" :loading="moduleState.loading" @click="moduleState.loadAvailableRooms">Tra cứu</v-btn>
      </div>
    </div>

    <div class="availability-grid">
      <section class="availability-panel">
        <div class="module-card-head">
          <div class="panel-kicker">Tra cứu phòng</div>
          <v-chip size="small" variant="tonal" color="success">{{ moduleState.availableRooms.length }} kết quả</v-chip>
        </div>
        <div class="filter-grid">
          <v-select v-model="moduleState.availableFilters.buildingId" :items="moduleState.buildingOptions" item-title="title" item-value="value" label="Tòa nhà" variant="outlined" hide-details clearable />
          <v-select v-model="moduleState.availableFilters.roomTypeId" :items="moduleState.roomTypeOptions" item-title="title" item-value="value" label="Loại phòng" variant="outlined" hide-details clearable />
          <v-select v-model="moduleState.availableFilters.genderType" :items="moduleState.genderOptions" item-title="title" item-value="value" label="Giới tính" variant="outlined" hide-details clearable />
          <v-text-field v-model="moduleState.availableFilters.expectedStartDate" label="Ngày bắt đầu" type="date" variant="outlined" hide-details />
          <v-text-field v-model="moduleState.availableFilters.expectedEndDate" label="Ngày kết thúc" type="date" variant="outlined" hide-details />
        </div>
        <v-btn color="primary" :loading="moduleState.loading" @click="moduleState.loadAvailableRooms">Xem phòng trống</v-btn>

        <div class="sub-list mt-4">
          <article v-for="room in moduleState.pagedAvailableRooms" :key="room.id" class="mini-row">
            <div>
              <strong>{{ room.roomNumber }}</strong>
              <div class="room-meta">{{ room.building?.name }} • {{ room.roomType?.typeName }} • Tầng {{ room.floorNumber }}</div>
            </div>
            <v-chip size="small" variant="tonal" class="status-chip status-chip-available">
              <MarqueeText :text="`Còn ${room.availableSlots} chỗ`" class="status-marquee" />
            </v-chip>
          </article>
          <div v-if="moduleState.availableRooms.length === 0" class="room-empty">Chưa có dữ liệu khả dụng.</div>
        </div>
        <div v-if="moduleState.availableRooms.length > moduleState.modulePageSize" class="pagination-wrap">
          <v-pagination v-model="moduleState.availableRoomPage" :length="moduleState.availableRoomPageCount" :total-visible="5" density="comfortable" rounded="circle" />
        </div>
      </section>

      <section class="availability-panel">
        <div class="module-card-head">
          <div class="panel-kicker">Sơ đồ tầng</div>
          <v-chip size="small" variant="tonal" color="primary">{{ moduleState.floorMapRooms.length }} phòng</v-chip>
        </div>
        <div class="filter-grid two-column">
          <v-select v-model="moduleState.floorMapBuildingId" :items="moduleState.buildingOptions" item-title="title" item-value="value" label="Tòa nhà" variant="outlined" hide-details />
          <v-text-field v-model="moduleState.floorMapFloor" label="Tầng" type="number" min="1" variant="outlined" hide-details />
        </div>
        <v-btn color="primary" :loading="moduleState.loading" @click="moduleState.loadFloorMap">Tải sơ đồ tầng</v-btn>

        <div class="floor-map-grid mt-4">
          <article v-for="room in moduleState.pagedFloorMapRooms" :key="room.id" class="floor-tile" :class="`floor-tile-${moduleState.getStatusTheme(room.status)}`">
            <div class="room-name">{{ room.roomNumber }}</div>
            <div class="room-meta">
              <span class="status-inline" :class="`status-inline-${moduleState.getStatusTheme(room.status)}`">
                {{ moduleState.getStatusLabel(room.status) }}
              </span>
            </div>
            <div class="tile-slots">{{ room.currentOccupancy }}/{{ room.roomType?.capacity ?? 0 }}</div>
          </article>
          <div v-if="moduleState.floorMapRooms.length === 0" class="room-empty">Chưa có dữ liệu sơ đồ tầng.</div>
        </div>
        <div v-if="moduleState.floorMapRooms.length > moduleState.modulePageSize" class="pagination-wrap">
          <v-pagination v-model="moduleState.floorMapPage" :length="moduleState.floorMapPageCount" :total-visible="5" density="comfortable" rounded="circle" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped src="./module.css"></style>
