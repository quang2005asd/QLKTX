<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

type AccountMode = 'user' | 'admin'

const accountMode = reactive<{ value: AccountMode }>({
  value: 'user',
})

const form = reactive({
  email: 'student@ktx.local',
  password: '123456',
})

function setAccountMode(mode: AccountMode) {
  accountMode.value = mode
  form.email = mode === 'admin' ? 'admin@ktx.local' : 'student@ktx.local'
  form.password = '123456'
}

function handleLogin() {
  const isAdmin = accountMode.value === 'admin'

  auth.login({
    token: 'demo-token',
    user: {
      id: isAdmin ? 'demo-admin' : 'demo-user',
      fullName: isAdmin ? 'Quản trị viên KTX' : 'Người dùng KTX',
      email: form.email,
      role: isAdmin ? 'admin' : 'student',
    },
  })

  router.push('/app/overview')
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
                    Người dùng
                  </button>
                  <button
                    :class="['account-switch__item', { 'account-switch__item--active': accountMode.value === 'admin' }]"
                    type="button"
                    @click="setAccountMode('admin')"
                  >
                    Quản trị viên
                  </button>
                </div>

                <v-form @submit.prevent="handleLogin">
                  <v-text-field v-model="form.email" class="mb-3" label="Email" variant="outlined" />
                  <v-text-field
                    v-model="form.password"
                    class="mb-4"
                    label="Mật khẩu"
                    type="password"
                    variant="outlined"
                  />

                  <v-btn block color="primary" size="large" type="submit">Đăng nhập</v-btn>
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
