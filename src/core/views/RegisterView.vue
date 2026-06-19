<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const router = useRouter()
const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_BILLING_MAINTENANCE_API_URL, 5300)

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  username: '',
  phoneNumber: '',
  roomNumber: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  try {
    await http.post('/api/auth/register', {
      username: form.username || form.email.split('@')[0],
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      roomNumber: form.roomNumber || '101',
      role: 'Student',
    })
    successMessage.value = 'Đăng ký thành công! Đang chuyển sang trang đăng nhập...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error: any) {
    console.error(error)
    errorMessage.value = error.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-app>
    <v-main class="auth-screen">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="10" md="6" lg="5">
            <v-card elevation="0" rounded="lg" class="auth-card">
              <v-card-text class="pa-8">
                <div class="text-overline text-medium-emphasis mb-2">Dormitory Management</div>
                <h1 class="text-h4 font-weight-bold mb-2">Đăng ký</h1>
                <p class="text-body-2 text-medium-emphasis mb-6">
                  Tạo tài khoản người dùng để sử dụng khu vực dành cho sinh viên và cư dân nội trú.
                </p>

                <v-alert
                  v-if="errorMessage"
                  type="error"
                  variant="tonal"
                  class="mb-4"
                  closable
                  @click:close="errorMessage = ''"
                >
                  {{ errorMessage }}
                </v-alert>

                <v-alert
                  v-if="successMessage"
                  type="success"
                  variant="tonal"
                  class="mb-4"
                >
                  {{ successMessage }}
                </v-alert>

                <v-form @submit.prevent="handleRegister">
                  <v-text-field v-model="form.fullName" class="mb-3" label="Họ và tên" variant="outlined" required />
                  <v-text-field v-model="form.username" class="mb-3" label="Tên tài khoản (Username)" variant="outlined" required />
                  <v-text-field v-model="form.email" class="mb-3" label="Email" type="email" variant="outlined" required />
                  <v-text-field v-model="form.phoneNumber" class="mb-3" label="Số điện thoại" variant="outlined" />
                  <v-text-field v-model="form.roomNumber" class="mb-3" label="Số phòng" variant="outlined" />
                  <v-text-field
                    v-model="form.password"
                    class="mb-4"
                    label="Mật khẩu"
                    type="password"
                    variant="outlined"
                    required
                  />

                  <v-btn block color="primary" size="large" type="submit" :loading="loading">Tạo tài khoản</v-btn>
                </v-form>

                <div class="text-body-2 mt-4">
                  Đã có tài khoản?
                  <RouterLink class="auth-link" to="/login">Đăng nhập</RouterLink>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-screen {
  background: linear-gradient(180deg, #f8f5f2 0%, #f2eef6 100%);
}

.auth-card {
  box-shadow: 0 16px 34px rgba(56, 43, 77, 0.08);
}

.auth-link {
  color: #6f5aa6;
  text-decoration: none;
}
</style>
