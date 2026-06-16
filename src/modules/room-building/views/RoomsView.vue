<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoomBuildingModule } from '../composables/useRoomBuildingModule'
import MarqueeText from '@/core/components/MarqueeText.vue'

const moduleState = useRoomBuildingModule()
onMounted(moduleState.ensureLoaded)
</script>

<template>
  <div class="room-module-page">
    <div class="module-header">
      <div class="module-hero">
        <div class="module-hero-icon">
          <v-icon icon="mdi-door-open" size="28" />
        </div>
        <div class="module-hero-copy">
          <div class="module-eyebrow">Phòng & giường</div>
          <h1 class="module-title">Quản lý phòng</h1>
          <p class="module-copy">Theo dõi phòng, giường, thiết bị và trạng thái sử dụng theo từng khu nội trú một cách trực quan hơn.</p>
        </div>
      </div>
      <div class="module-actions">
        <v-chip size="small" variant="tonal" color="warning" prepend-icon="mdi-tools">
          {{ moduleState.maintenanceRooms }} phòng bảo trì
        </v-chip>
        <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="moduleState.openCreateRoomDialog">Thêm phòng</v-btn>
      </div>
    </div>

    <v-card class="module-panel room-filter-panel" rounded="xl" elevation="0">
      <v-card-text class="pa-5">
        <div class="room-list-head">
          <div>
            <div class="panel-kicker">Bộ lọc phòng</div>
            <div class="module-muted"></div>
          </div>
          <v-btn size="small" variant="text" @click="moduleState.selectedBuildingId = null; moduleState.selectedStatus = null">
            Xóa lọc
          </v-btn>
        </div>
        <div class="filter-grid">
          <v-select v-model="moduleState.selectedBuildingId" :items="[{ title: 'Tất cả tòa', value: null }, ...moduleState.buildingOptions]" item-title="title" item-value="value" label="Tòa nhà" variant="outlined" hide-details />
          <v-select v-model="moduleState.selectedStatus" :items="moduleState.statusOptions" item-title="title" item-value="value" label="Trạng thái" variant="outlined" hide-details />
        </div>
      </v-card-text>
    </v-card>

    <div class="room-layout">
      <div class="room-list">
        <div class="room-list-head">
          <div>
            <div class="panel-kicker">Danh sách phòng</div>
          </div>
          <v-chip size="small" variant="tonal" color="primary">{{ moduleState.filteredRooms.length }} phòng</v-chip>
        </div>
        <article v-for="room in moduleState.pagedRooms" :key="room.id" class="room-row" :class="{ 'room-row-active': moduleState.selectedRoomId === room.id }" @click="moduleState.selectedRoomId = room.id">
          <div class="room-row-main">
            <div class="room-status-dot" :class="`room-status-dot-${moduleState.getStatusTheme(room.status)}`"></div>
            <div>
              <div class="room-name">{{ room.roomNumber }}</div>
              <div class="room-meta">{{ room.building?.name ?? 'Chưa rõ tòa' }} • Tầng {{ room.floorNumber }} • {{ room.roomType?.typeName ?? 'Chưa rõ loại' }}</div>
            </div>
          </div>
          <div class="room-tags">
            <v-chip size="small" variant="tonal" color="primary">{{ room.currentOccupancy }}/{{ room.roomType?.capacity ?? 0 }} người</v-chip>
            <v-chip size="small" variant="tonal" class="status-chip" :class="`status-chip-${moduleState.getStatusTheme(room.status)}`">
              <MarqueeText :text="moduleState.getStatusLabel(room.status)" class="status-marquee" />
            </v-chip>
          </div>
        </article>
        <div v-if="moduleState.filteredRooms.length > moduleState.modulePageSize" class="pagination-wrap">
          <v-pagination v-model="moduleState.roomPage" :length="moduleState.roomPageCount" :total-visible="5" density="comfortable" rounded="circle" />
        </div>
      </div>

      <v-card v-if="moduleState.selectedRoom" class="room-detail-card" rounded="xl" elevation="0">
        <v-card-text class="pa-5">
          <div class="section-header">
            <div>
              <div class="panel-kicker">Chi tiết phòng</div>
              <h3 class="detail-title">Phòng  {{ moduleState.selectedRoom.roomNumber }}</h3>
            </div>
            <div class="action-row">
              <v-btn size="small" variant="tonal" color="primary" @click="moduleState.openEditRoomDialog(moduleState.selectedRoom)">Sửa</v-btn>
              <v-btn size="small" variant="tonal" color="warning" @click="moduleState.openRoomStatusEditor(moduleState.selectedRoom)">Trạng thái</v-btn>
              <v-btn size="small" variant="outlined" color="error" @click="moduleState.removeRoom(moduleState.selectedRoom.id)">Xóa</v-btn>
            </div>
          </div>

          <div class="detail-meta-grid">
            <div><span class="building-stat-label">Tòa</span><strong>{{ moduleState.selectedRoom.building?.name }}</strong></div>
            <div><span class="building-stat-label">Loại</span><strong>{{ moduleState.selectedRoom.roomType?.typeName }}</strong></div>
            <div><span class="building-stat-label">Trống</span><strong>{{ moduleState.selectedRoom.availableSlots }}</strong></div>
            <div>
              <span class="building-stat-label">Trạng thái</span>
              <v-chip size="small" variant="tonal" class="status-chip" :class="`status-chip-${moduleState.getStatusTheme(moduleState.selectedRoom.status)}`">
                <MarqueeText :text="moduleState.getStatusLabel(moduleState.selectedRoom.status)" class="status-marquee" />
              </v-chip>
            </div>
          </div>

          <v-divider class="my-4" />

          <div class="subsection-grid">
            <section>
              <div class="subsection-header">
                <h4>Giường</h4>
                <v-btn size="x-small" variant="text" @click="moduleState.resetBedForm">Mới</v-btn>
              </div>
              <div class="sub-form">
                <v-text-field v-model="moduleState.bedForm.bedNumber" label="Mã giường" density="comfortable" variant="outlined" hide-details />
                <v-select v-model="moduleState.bedForm.status" :items="moduleState.bedStatusOptions" item-title="title" item-value="value" label="Trạng thái" density="comfortable" variant="outlined" hide-details />
                <v-btn color="primary" :loading="moduleState.submitting" @click="moduleState.submitBed">{{ moduleState.editingBedId ? 'Cập nhật giường' : 'Thêm giường' }}</v-btn>
              </div>
              <div class="sub-list">
                <article v-for="bed in moduleState.pagedBeds" :key="bed.id" class="mini-row">
                  <div>
                    <strong>Giường {{ bed.bedNumber }}</strong>
                  </div>
                  <v-chip size="x-small" variant="tonal" class="status-chip" :class="`status-chip-${moduleState.getStatusTheme(bed.status)}`">
                    <MarqueeText :text="moduleState.getStatusLabel(bed.status)" class="status-marquee" />
                  </v-chip>
                  <div class="action-row">
                    <v-btn size="x-small" variant="text" color="primary" @click="moduleState.editBed(bed)">Sửa</v-btn>
                    <v-btn size="x-small" variant="text" color="error" @click="moduleState.removeBed(bed.id)">Xóa</v-btn>
                  </div>
                </article>
                <div v-if="moduleState.selectedRoom.beds.length > moduleState.modulePageSize" class="pagination-wrap pagination-wrap-compact">
                  <v-pagination v-model="moduleState.bedPage" :length="moduleState.bedPageCount" :total-visible="4" density="compact" rounded="circle" />
                </div>
              </div>
            </section>

            <section>
              <div class="subsection-header">
                <h4>Thiết bị</h4>
                <v-btn size="x-small" variant="text" @click="moduleState.resetEquipmentForm">Mới</v-btn>
              </div>
              <div class="sub-form">
                <v-text-field v-model="moduleState.equipmentForm.equipmentName" label="Tên thiết bị" density="comfortable" variant="outlined" hide-details />
                <v-select v-model="moduleState.equipmentForm.status" :items="moduleState.equipmentStatusOptions" item-title="title" item-value="value" label="Trạng thái" density="comfortable" variant="outlined" hide-details />
                <v-btn color="primary" :loading="moduleState.submitting" @click="moduleState.submitEquipment">{{ moduleState.editingEquipmentId ? 'Cập nhật thiết bị' : 'Thêm thiết bị' }}</v-btn>
              </div>
              <div class="sub-list">
                <article v-for="equipment in moduleState.pagedEquipments" :key="equipment.id" class="mini-row">
                  <div>
                    <strong>{{ equipment.equipmentName }}</strong>
                  </div>
                  <v-chip size="x-small" variant="tonal" class="status-chip" :class="`status-chip-${moduleState.getStatusTheme(equipment.status)}`">
                    <MarqueeText :text="moduleState.getStatusLabel(equipment.status)" class="status-marquee" />
                  </v-chip>
                  <div class="action-row">
                    <v-btn size="x-small" variant="text" color="primary" @click="moduleState.editEquipment(equipment)">Sửa</v-btn>
                    <v-btn size="x-small" variant="text" color="error" @click="moduleState.removeEquipment(equipment.id)">Xóa</v-btn>
                  </div>
                </article>
                <div v-if="moduleState.selectedRoom.equipments.length > moduleState.modulePageSize" class="pagination-wrap pagination-wrap-compact">
                  <v-pagination v-model="moduleState.equipmentPage" :length="moduleState.equipmentPageCount" :total-visible="4" density="compact" rounded="circle" />
                </div>
              </div>
            </section>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog v-model="moduleState.roomDialog" max-width="640">
      <v-card rounded="xl">
        <v-card-title>{{ moduleState.editingRoomId ? 'Cập nhật phòng' : 'Thêm phòng' }}</v-card-title>
        <v-card-text class="dialog-grid">
          <v-select v-model="moduleState.roomForm.buildingId" :items="moduleState.buildingOptions" item-title="title" item-value="value" label="Tòa nhà" variant="outlined" />
          <v-select v-model="moduleState.roomForm.roomTypeId" :items="moduleState.roomTypeOptions" item-title="title" item-value="value" label="Loại phòng" variant="outlined" />
          <v-text-field v-model="moduleState.roomForm.roomNumber" label="Số phòng" variant="outlined" />
          <v-text-field v-model="moduleState.roomForm.floorNumber" label="Tầng" type="number" min="1" variant="outlined" />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" @click="moduleState.roomDialog = false">Đóng</v-btn>
          <v-btn color="primary" :loading="moduleState.submitting" @click="moduleState.submitRoom">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="moduleState.roomStatusDialog" max-width="560">
      <v-card rounded="xl">
        <v-card-title>Cập nhật trạng thái phòng</v-card-title>
        <v-card-text class="dialog-grid">
          <v-select v-model="moduleState.roomStatusForm.status" :items="moduleState.statusOptions.filter(item => item.value)" item-title="title" item-value="value" label="Trạng thái" variant="outlined" />
          <v-textarea v-model="moduleState.roomStatusForm.maintenanceReason" label="Lý do bảo trì" rows="3" variant="outlined" />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" @click="moduleState.roomStatusDialog = false">Đóng</v-btn>
          <v-btn color="primary" :loading="moduleState.submitting" @click="moduleState.submitRoomStatus">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped src="./module.css"></style>
