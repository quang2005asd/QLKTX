<template>
  <div>
    <PageHeader title="Đăng ký phòng" />
    <v-card class="pa-6" max-width="700">
      <v-stepper v-model="step" :items="['Chọn phòng', 'Thông tin', 'Xác nhận']" flat>
        <template #item.1>
          <div class="pa-4">
            <v-select v-model="form.buildingId" :items="buildingOptions" label="Chọn tòa nhà *" class="mb-3" />
            <v-select v-model="form.roomTypeId" :items="roomTypeOptions" label="Loại phòng *" class="mb-3" />
            <v-text-field v-model.number="form.preferredFloor" label="Tầng mong muốn (không bắt buộc)" type="number" class="mb-3" />
            <v-btn color="primary" @click="step=2" :disabled="!form.buildingId||!form.roomTypeId">Tiếp theo</v-btn>
          </div>
        </template>
        <template #item.2>
          <div class="pa-4">
            <v-row dense>
              <v-col cols="6"><v-text-field v-model="form.expectedStartDate" label="Ngày bắt đầu *" type="date" /></v-col>
              <v-col cols="6"><v-text-field v-model="form.expectedEndDate" label="Ngày kết thúc *" type="date" /></v-col>
            </v-row>
            <v-textarea v-model="form.note" label="Ghi chú" rows="3" class="mt-3 mb-4" />
            <div class="d-flex ga-3"><v-btn variant="text" @click="step=1">Quay lại</v-btn><v-btn color="primary" @click="step=3" :disabled="!form.expectedStartDate||!form.expectedEndDate">Tiếp theo</v-btn></div>
          </div>
        </template>
        <template #item.3>
          <div class="pa-4">
            <v-alert type="info" variant="tonal" class="mb-4">Kiểm tra thông tin trước khi gửi đơn</v-alert>
            <v-table density="compact"><tbody>
              <tr><td class="text-grey">Tòa nhà</td><td>{{ buildingOptions.find(b=>b.value===form.buildingId)?.title }}</td></tr>
              <tr><td class="text-grey">Loại phòng</td><td>{{ roomTypeOptions.find(r=>r.value===form.roomTypeId)?.title }}</td></tr>
              <tr><td class="text-grey">Tầng</td><td>{{ form.preferredFloor || 'Không chỉ định' }}</td></tr>
              <tr><td class="text-grey">Thời gian</td><td>{{ form.expectedStartDate }} — {{ form.expectedEndDate }}</td></tr>
              <tr><td class="text-grey">Ghi chú</td><td>{{ form.note || '—' }}</td></tr>
            </tbody></v-table>
            <div class="d-flex ga-3 mt-4"><v-btn variant="text" @click="step=2">Quay lại</v-btn><v-btn color="primary" variant="flat" :loading="submitting" @click="submitApp" prepend-icon="mdi-send">Gửi đơn</v-btn></div>
          </div>
        </template>
      </v-stepper>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import { http } from '@/shared/http'
import { useAuthStore } from '@/shared/stores/authStore'
import { useNotify } from '@/shared/composables/useNotify'

const router = useRouter(); const auth = useAuthStore(); const { success } = useNotify()
const step = ref(1); const submitting = ref(false)
const buildingOptions = ref<any[]>([]); const roomTypeOptions = ref<any[]>([])
const form = ref({ buildingId: '', roomTypeId: '', preferredFloor: null as number|null, expectedStartDate: '', expectedEndDate: '', note: '' })

async function submitApp() {
  submitting.value = true
  try {
    const { data } = await http.post('/api/room-applications', { ...form.value, studentId: auth.user?.studentId })
    await http.patch(`/api/room-applications/${data.id}/submit`)
    success('Đã gửi đơn đăng ký')
    router.push('/contract/my-application/status')
  } catch(e) { console.error(e) } finally { submitting.value = false }
}

onMounted(async () => {
  try {
    const [bRes, rtRes] = await Promise.all([http.get('/api/buildings'), http.get('/api/roomtypes')])
    buildingOptions.value = bRes.data.filter((b:any)=>b.status==='ACTIVE').map((b:any)=>({title:b.name,value:b.id}))
    roomTypeOptions.value = rtRes.data.map((rt:any)=>({title:`${rt.typeName} (${rt.capacity} người)`,value:rt.id}))
  } catch(e) { console.error(e) }
})
</script>
