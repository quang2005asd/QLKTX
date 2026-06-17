<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/authStore'
import { http } from '@/core/api/http'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const router = useRouter()
const auth = useAuthStore()

const baseUrl = resolveServiceBaseUrl(import.meta.env.VITE_BILLING_MAINTENANCE_API_URL, 5300)

type AccountMode = 'user' | 'admin'

const accountMode = reactive<{ value: AccountMode }>({
  value: 'user',
})

const form = reactive({
  email: 'student',
  password: '123456',
})

const errorMessage = ref('')
const loading = ref(false)

function setAccountMode(mode: AccountMode) {
  accountMode.value = mode
  form.email = mode === 'admin' ? 'admin' : 'student'
  form.password = mode === 'admin' ? 'admin123' : '123456'
}

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    const response = await http.post(`${baseUrl}/api/auth/login`, {
      username: form.email,
      password: form.password,
    })

    const data = response.data
    auth.login({
      token: data.token,
      user: {
        id: String(data.user.id),
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role.toLowerCase() as any,
      },
    })

    router.push('/app/overview')
  } catch (error: any) {
    console.error(error)
    errorMessage.value = error.response?.data || 'Đăng nhập thất bại. Tài khoản hoặc mật khẩu không chính xác.'
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
          <v-col cols="12" sm="10" md="6" lg="4">
            <v-card elevation="0" rounded="lg" class="auth-card">
              <v-card-text class="pa-8">
                <div class="text-overline text-medium-emphasis mb-2">Dormitory Management</div>
                <h1 class="text-h4 font-weight-bold mb-2">Đăng nhập</h1>
                <p class="text-body-2 text-medium-emphasis mb-6">
                  Chọn đúng loại tài khoản để vào khu vực dành cho người dùng hoặc quản trị viên.
                </p>

                <div class="account-switch mb-5">
                  <button
                    :class="['account-switch__item', { 'account-switch__item--active': accountMode.value === 'user' }]"
                    type="button"
                    @click="setAccountMode('user')"
                  >
                    Người dùng (Sinh viên)
                  </button>
                  <button
                    :class="['account-switch__item', { 'account-switch__item--active': accountMode.value === 'admin' }]"
                    type="button"
                    @click="setAccountMode('admin')"
                  >
                    Quản trị viên
                  </button>
                </div>

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

                <v-form @submit.prevent="handleLogin">
                  <v-text-field v-model="form.email" class="mb-3" label="Tài khoản hoặc Email" variant="outlined" />
                  <v-text-field
                    v-model="form.password"
                    class="mb-4"
                    label="Mật khẩu"
                    type="password"
                    variant="outlined"
                  />

                  <v-btn block color="primary" size="large" type="submit" :loading="loading">Đăng nhập</v-btn>
                </v-form>

                <div class="text-body-2 mt-4">
                  Chưa có tài khoản?
                  <RouterLink class="auth-link" to="/register">Đăng ký</RouterLink>
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

.account-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.account-switch__item {
  padding: 12px 14px;
  border: 1px solid #ddd5e7;
  border-radius: 8px;
  background: #fff;
  color: #5c5467;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.account-switch__item:hover {
  transform: translateY(-1px);
}

.account-switch__item--active {
  border-color: #8b78bb;
  background: #f3effa;
  color: #5f4d92;
}

.auth-link {
  color: #6f5aa6;
  text-decoration: none;
}
</style>
