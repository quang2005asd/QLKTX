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
          <v-icon icon="mdi-office-building-cog-outline" size="28" />
        </div>
        <div class="module-hero-copy">
          <div class="module-eyebrow">Tòa nhà</div>
          <h1 class="module-title">Quản lý tòa nhà</h1>
          <p class="module-copy">Thêm, sửa, xóa và theo dõi trạng thái hoạt động của từng tòa ký túc xá trong hệ thống.</p>
        </div>
      </div>
      <div class="module-actions">
        <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="moduleState.openCreateBuildingDialog">Thêm tòa</v-btn>
      </div>
    </div>

    <v-alert v-if="moduleState.successMessage" class="mb-4" type="success" variant="tonal" closable @click:close="moduleState.successMessage = ''">{{ moduleState.successMessage }}</v-alert>
    <v-alert v-if="moduleState.errorMessage" class="mb-4" type="warning" variant="tonal" closable @click:close="moduleState.errorMessage = ''">{{ moduleState.errorMessage }}</v-alert>

    <div class="building-stack">
      <article v-for="building in moduleState.pagedBuildings" :key="building.id" class="building-card">
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
          <div class="action-row">
            <v-btn size="small" variant="tonal" color="primary" @click="moduleState.openEditBuildingDialog(building)">Sửa</v-btn>
            <v-btn size="small" variant="outlined" color="error" @click="moduleState.removeBuilding(building.id)">Xóa</v-btn>
          </div>
        </div>
        <p class="building-description">{{ building.description || 'Chưa có mô tả.' }}</p>
        <div class="building-stats">
          <div><span class="building-stat-label">Số tầng</span><strong>{{ building.totalFloors }}</strong></div>
          <div><span class="building-stat-label">Giới tính</span><strong>{{ moduleState.getGenderLabel(building.genderType) }}</strong></div>
          <div>
            <span class="building-stat-label">Trạng thái</span>
            <span class="status-inline" :class="`status-inline-${moduleState.getStatusTheme(building.status)}`">
              {{ moduleState.getStatusLabel(building.status) }}
            </span>
          </div>
        </div>
      </article>
    </div>
    <div v-if="moduleState.buildings.length > moduleState.modulePageSize" class="pagination-wrap">
      <v-pagination v-model="moduleState.buildingPage" :length="moduleState.buildingPageCount" :total-visible="5" density="comfortable" rounded="circle" />
    </div>

    <v-dialog v-model="moduleState.buildingDialog" max-width="640">
      <v-card rounded="xl">
        <v-card-title>{{ moduleState.editingBuildingId ? 'Cập nhật tòa nhà' : 'Thêm tòa nhà' }}</v-card-title>
        <v-card-text class="dialog-grid">
          <v-text-field v-model="moduleState.buildingForm.name" label="Tên tòa nhà" variant="outlined" />
          <v-text-field v-model="moduleState.buildingForm.totalFloors" label="Số tầng" type="number" min="1" variant="outlined" />
          <v-select v-model="moduleState.buildingForm.genderType" :items="moduleState.genderOptions" item-title="title" item-value="value" label="Giới tính" variant="outlined" />
          <v-select v-model="moduleState.buildingForm.status" :items="moduleState.buildingStatusOptions" item-title="title" item-value="value" label="Trạng thái" variant="outlined" />
          <v-textarea v-model="moduleState.buildingForm.description" label="Mô tả" rows="3" variant="outlined" />
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" @click="moduleState.buildingDialog = false">Đóng</v-btn>
          <v-btn color="primary" :loading="moduleState.submitting" @click="moduleState.submitBuilding">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped src="./module.css"></style>
