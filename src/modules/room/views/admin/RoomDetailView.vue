<template>
  <div>
    <PageHeader :title="'Chi tiết phòng ' + (room?.roomNumber || '')" />
    <v-card v-if="room" class="pa-4 mb-4">
      <v-row>
        <v-col cols="6" sm="3"><div class="text-caption text-grey">Phòng</div><div class="text-h6 font-weight-bold">{{ room.roomNumber }}</div></v-col>
        <v-col cols="6" sm="3"><div class="text-caption text-grey">Loại</div><div>{{ room.roomType?.typeName }}</div></v-col>
        <v-col cols="6" sm="3"><div class="text-caption text-grey">Sức chứa</div><div>{{ room.currentOccupancy }}/{{ room.roomType?.capacity }}</div></v-col>
        <v-col cols="6" sm="3"><div class="text-caption text-grey">Trạng thái</div><StatusChip :status="room.status" /></v-col>
      </v-row>
    </v-card>
    <v-tabs v-model="tab" color="primary" class="mb-4"><v-tab value="beds">Giường</v-tab><v-tab value="equipment">Thiết bị</v-tab></v-tabs>
    <v-card v-if="tab==='beds'" class="pa-4">
      <v-data-table-server :headers="bedHeaders" :items="beds" :items-length="beds.length" items-per-page="-1">
        <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
      </v-data-table-server>
    </v-card>
    <v-card v-if="tab==='equipment'" class="pa-4">
      <v-data-table-server :headers="eqHeaders" :items="equipments" :items-length="equipments.length" items-per-page="-1">
        <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
        <template #item.actions="{ item }"><v-btn icon size="small" variant="text" @click="eqItem=item;showEqStatus=true"><v-icon>mdi-swap-horizontal</v-icon></v-btn></template>
      </v-data-table-server>
    </v-card>
    <v-dialog v-model="showEqStatus" max-width="360">
      <v-card>
        <v-card-title class="pt-5 px-6">Đổi trạng thái thiết bị</v-card-title>
        <v-card-text class="px-6"><v-select v-model="newEqStatus" :items="EQUIPMENT_STATUS_OPTIONS" label="Trạng thái" /></v-card-text>
        <v-card-actions class="px-6 pb-5"><v-spacer /><v-btn variant="text" @click="showEqStatus=false">Hủy</v-btn><v-btn color="primary" variant="flat" @click="changeEqStatus">Cập nhật</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-skeleton-loader v-if="!room" type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import StatusChip from '@/shared/components/StatusChip.vue'
import { http } from '@/shared/http'
import { EQUIPMENT_STATUS_OPTIONS } from '@/shared/utils/constants'
import { useNotify } from '@/shared/composables/useNotify'

const route = useRoute()
const { success } = useNotify()
const room = ref<any>(null)
const beds = ref<any[]>([])
const equipments = ref<any[]>([])
const tab = ref('beds')
const showEqStatus = ref(false)
const eqItem = ref<any>(null)
const newEqStatus = ref('')

const bedHeaders = [{ title: 'Mã giường', key: 'bedNumber' }, { title: 'Trạng thái', key: 'status', width: 130 }]
const eqHeaders = [{ title: 'Thiết bị', key: 'equipmentName' }, { title: 'Trạng thái', key: 'status', width: 130 }, { title: '', key: 'actions', width: 60, sortable: false }]

async function changeEqStatus() {
  try { await http.patch(`/api/equipments/${eqItem.value.id}/status`, { status: newEqStatus.value }); success('Đã cập nhật'); showEqStatus.value = false; loadData() } catch(e) { console.error(e) }
}

async function loadData() {
  try {
    const [rRes, bRes, eRes] = await Promise.all([http.get(`/api/rooms/${route.params.id}`), http.get('/api/beds', { params: { roomId: route.params.id } }), http.get('/api/equipments', { params: { roomId: route.params.id } })])
    room.value = rRes.data; beds.value = bRes.data; equipments.value = eRes.data
  } catch(e) { console.error(e) }
}
onMounted(loadData)
</script>
