<template>
  <div>
    <PageHeader title="Xem phòng trống" subtitle="Tìm phòng phù hợp để đăng ký" />
    <v-card class="pa-4 mb-4">
      <v-row dense>
        <v-col cols="12" sm="4"><v-select v-model="buildingFilter" :items="[{title:'Tất cả',value:''},...buildingOptions]" label="Tòa nhà" density="compact" @update:model-value="loadData" /></v-col>
        <v-col cols="12" sm="3"><v-select v-model="typeFilter" :items="[{title:'Tất cả',value:''},...typeOptions]" label="Loại phòng" density="compact" @update:model-value="loadData" /></v-col>
      </v-row>
    </v-card>
    <div v-if="loading" class="d-flex justify-center py-12"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else-if="!items.length"><EmptyState icon="mdi-bed-empty" title="Không tìm thấy phòng trống" description="Thử thay đổi bộ lọc." /></div>
    <v-row v-else>
      <v-col v-for="room in items" :key="room.roomId" cols="12" sm="6" md="4">
        <v-card class="pa-4">
          <div class="d-flex align-center mb-2"><v-icon color="primary" class="mr-2">mdi-door</v-icon><span class="text-subtitle-1 font-weight-bold">{{ room.roomNumber }}</span><v-spacer /><v-chip size="small" variant="tonal" color="success">{{ room.availableSlots }} chỗ trống</v-chip></div>
          <div class="text-body-2 text-grey mb-1"><v-icon size="14">mdi-office-building</v-icon> {{ room.buildingName }}</div>
          <div class="text-body-2 text-grey mb-1"><v-icon size="14">mdi-bed</v-icon> {{ room.roomTypeName }} ({{ room.capacity }} người)</div>
          <div class="text-body-2 text-grey mb-3"><v-icon size="14">mdi-stairs</v-icon> Tầng {{ room.floorNumber }}</div>
          <div class="text-h6 font-weight-bold text-primary mb-3">{{ formatCurrency(room.basePrice) }}/tháng</div>
          <v-progress-linear :model-value="(room.currentOccupancy/room.capacity)*100" color="primary" height="8" rounded class="mb-2" />
          <div class="text-caption text-grey">{{ room.currentOccupancy }}/{{ room.capacity }} đã ở</div>
          <v-btn block variant="flat" color="primary" class="mt-3" prepend-icon="mdi-clipboard-text" to="/contract/my-application">Đăng ký</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import { http } from '@/shared/http'
import { formatCurrency } from '@/shared/utils/formatters'

const items = ref<any[]>([]); const loading = ref(false)
const buildingFilter = ref(''); const typeFilter = ref('')
const buildingOptions = ref<any[]>([]); const typeOptions = ref<any[]>([])

async function loadData() {
  loading.value = true
  try { const { data } = await http.get('/api/room-references/available'); items.value = data } catch(e) { console.error(e) } finally { loading.value = false }
}

onMounted(async () => {
  try {
    const [bRes, rtRes] = await Promise.all([http.get('/api/buildings'), http.get('/api/roomtypes')])
    buildingOptions.value = bRes.data.map((b:any)=>({title:b.name,value:b.id}))
    typeOptions.value = rtRes.data.map((rt:any)=>({title:rt.typeName,value:rt.id}))
  } catch(e) { console.error(e) }
  loadData()
})
</script>
