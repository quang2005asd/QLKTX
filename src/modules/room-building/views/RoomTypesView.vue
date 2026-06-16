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
          <v-icon icon="mdi-bed-double-outline" size="28" />
        </div>
        <div class="module-hero-copy">
          <div class="module-eyebrow">Loại phòng</div>
          <h1 class="module-title">Loại phòng & tiện nghi</h1>
          <p class="module-copy">Quản lý sức chứa, giá thuê và danh sách tiện nghi cho từng loại phòng phục vụ sinh viên.</p>
        </div>
      </div>
      <div class="module-actions">
        <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="moduleState.openCreateRoomTypeDialog">Thêm loại</v-btn>
      </div>
    </div>

    <v-alert v-if="moduleState.successMessage" class="mb-4" type="success" variant="tonal" closable @click:close="moduleState.successMessage = ''">{{ moduleState.successMessage }}</v-alert>
    <v-alert v-if="moduleState.errorMessage" class="mb-4" type="warning" variant="tonal" closable @click:close="moduleState.errorMessage = ''">{{ moduleState.errorMessage }}</v-alert>

    <div class="room-type-grid">
      <article v-for="roomType in moduleState.pagedRoomTypes" :key="roomType.id" class="room-type-card">
        <div v-if="roomType.imageUrl" class="room-type-thumb">
          <img :src="roomType.imageUrl" :alt="roomType.typeName" class="room-type-thumb-image" />
        </div>
        <div class="room-type-top">
          <div>
            <div class="room-type-name">{{ roomType.typeName }}</div>
            <div class="room-type-meta">{{ roomType.capacity }} người • {{ moduleState.formatCurrency(roomType.basePrice) }}/tháng</div>
          </div>
          <div class="action-column">
            <v-btn size="small" variant="tonal" color="primary" @click="moduleState.openEditRoomTypeDialog(roomType)">Sửa</v-btn>
            <v-btn size="small" variant="outlined" color="error" @click="moduleState.removeRoomType(roomType.id)">Xóa</v-btn>
          </div>
        </div>
        <p class="room-type-description">{{ roomType.description || 'Chưa có mô tả.' }}</p>
        <div class="amenity-list">
          <v-chip v-for="amenity in roomType.amenities" :key="`${roomType.id}-${amenity}`" size="small" variant="tonal" color="primary">{{ amenity }}</v-chip>
        </div>
      </article>
    </div>
    <div v-if="moduleState.roomTypes.length > moduleState.modulePageSize" class="pagination-wrap">
      <v-pagination v-model="moduleState.roomTypePage" :length="moduleState.roomTypePageCount" :total-visible="5" density="comfortable" rounded="circle" />
    </div>

    <v-dialog v-model="moduleState.roomTypeDialog" max-width="680">
      <v-card rounded="xl">
        <v-card-title>{{ moduleState.editingRoomTypeId ? 'Cập nhật loại phòng' : 'Thêm loại phòng' }}</v-card-title>
        <v-card-text class="dialog-grid">
          <v-text-field v-model="moduleState.roomTypeForm.typeName" label="Tên loại phòng" variant="outlined" />
          <v-text-field v-model="moduleState.roomTypeForm.capacity" label="Sức chứa" type="number" min="1" variant="outlined" />
          <v-text-field v-model="moduleState.roomTypeForm.basePrice" label="Giá thuê / tháng" type="number" min="0" variant="outlined" />
          <v-text-field v-model="moduleState.roomTypeForm.imageUrl" label="URL ảnh loại phòng" variant="outlined" />
          <v-file-input label="Tải ảnh từ máy" accept="image/*" prepend-icon="mdi-image-plus" variant="outlined" @update:model-value="moduleState.setRoomTypeImageFromFile(Array.isArray($event) ? ($event[0] ?? null) : $event)" />
          <v-textarea v-model="moduleState.roomTypeForm.description" label="Mô tả" rows="3" variant="outlined" />
          <v-textarea v-model="moduleState.roomTypeForm.amenitiesText" label="Tiện nghi, cách nhau bởi dấu phẩy" rows="3" variant="outlined" />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" @click="moduleState.roomTypeDialog = false">Đóng</v-btn>
          <v-btn color="primary" :loading="moduleState.submitting" @click="moduleState.submitRoomType">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped src="./module.css"></style>
