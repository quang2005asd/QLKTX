<template>
  <div>
    <PageHeader :title="student?.fullName || 'Chi tiết sinh viên'" />
    <v-row v-if="student">
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Thông tin cá nhân</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">Mã SV</td><td class="font-weight-medium">{{ student.studentCode }}</td></tr>
            <tr><td class="text-grey">Họ tên</td><td>{{ student.fullName }}</td></tr>
            <tr><td class="text-grey">Giới tính</td><td>{{ formatEnum(student.gender) }}</td></tr>
            <tr><td class="text-grey">Ngày sinh</td><td>{{ formatDate(student.dateOfBirth) }}</td></tr>
            <tr><td class="text-grey">CCCD</td><td>{{ student.citizenId }}</td></tr>
            <tr><td class="text-grey">Khoa</td><td>{{ student.faculty }}</td></tr>
            <tr><td class="text-grey">Lớp</td><td>{{ student.className }}</td></tr>
            <tr><td class="text-grey">Trạng thái</td><td><StatusChip :status="student.status" /></td></tr>
          </tbody></v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Liên hệ</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">SĐT</td><td>{{ student.phoneNumber }}</td></tr>
            <tr><td class="text-grey">Email</td><td>{{ student.email }}</td></tr>
            <tr><td class="text-grey">Địa chỉ</td><td>{{ student.address }}</td></tr>
            <tr><td class="text-grey">Phụ huynh</td><td>{{ student.guardianName }}</td></tr>
            <tr><td class="text-grey">SĐT PH</td><td>{{ student.guardianPhone }}</td></tr>
          </tbody></v-table>
        </v-card>
        <v-card v-if="contract" class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Hợp đồng hiện tại</h3>
          <v-table density="compact"><tbody>
            <tr><td class="text-grey" width="140">Mã HĐ</td><td><router-link :to="'/contract/contracts/'+contract.id" class="text-primary">{{ contract.contractCode }}</router-link></td></tr>
            <tr><td class="text-grey">Phòng</td><td>{{ contract.roomNumberSnapshot }}</td></tr>
            <tr><td class="text-grey">Thời hạn</td><td>{{ formatDate(contract.startDate) }} — {{ formatDate(contract.endDate) }}</td></tr>
            <tr><td class="text-grey">Trạng thái</td><td><StatusChip :status="contract.status" /></td></tr>
          </tbody></v-table>
        </v-card>
      </v-col>
    </v-row>
    <v-skeleton-loader v-else type="card" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/shared/components/PageHeader.vue'
import StatusChip from '@/shared/components/StatusChip.vue'
import { http } from '@/shared/http'
import { formatDate, formatEnum } from '@/shared/utils/formatters'

const route = useRoute()
const student = ref<any>(null); const contract = ref<any>(null)

onMounted(async () => {
  try {
    const { data } = await http.get(`/api/students/${route.params.id}/summary`)
    student.value = data.student; contract.value = data.activeContract
  } catch(e) { console.error(e) }
})
</script>
