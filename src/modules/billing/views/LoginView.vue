<template>
  <v-app>
    <v-container fluid class="fill-height pa-0">
      <v-row no-gutters class="fill-height">
        <!-- Left Panel -->
        <v-col cols="12" md="6" class="d-none d-md-flex login-left align-center justify-center">
          <div class="text-center px-8">
            <v-icon size="80" color="white" class="mb-6">mdi-domain</v-icon>
            <h1 class="text-h3 font-weight-bold text-white mb-3">HỆ THỐNG QUẢN LÝ</h1>
            <h2 class="text-h4 text-white mb-4" style="opacity:0.9;">KÝ TÚC XÁ SINH VIÊN</h2>
            <p class="text-body-1 text-white" style="opacity:0.7;">Chào mừng bạn quay trở lại</p>
          </div>
        </v-col>

        <!-- Right Panel -->
        <v-col cols="12" md="6" class="d-flex align-center justify-center">
          <v-card flat max-width="420" width="100%" class="pa-6 pa-md-10" style="border:none !important;">
            <!-- Mobile logo -->
            <div class="d-md-none text-center mb-8">
              <v-icon size="48" color="primary" class="mb-2">mdi-domain</v-icon>
              <h3 class="text-h6 font-weight-bold">KTX - Ký túc xá</h3>
            </div>

            <h2 class="text-h5 font-weight-bold mb-1">Đăng nhập</h2>
            <p class="text-body-2 text-grey mb-8">Nhập thông tin tài khoản để tiếp tục</p>

            <v-form @submit.prevent="handleLogin" ref="formRef">
              <v-text-field
                v-model="username" label="Tên đăng nhập / Mã SV" prepend-inner-icon="mdi-account"
                :rules="[v => !!v || 'Vui lòng nhập tên đăng nhập']" class="mb-2"
              />
              <v-text-field
                v-model="password" label="Mật khẩu" prepend-inner-icon="mdi-lock"
                :type="showPass ? 'text' : 'password'"
                :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPass = !showPass" class="mb-4"
              />
              <v-btn type="submit" color="primary" size="large" block :loading="loading" class="mb-6">
                Đăng nhập
              </v-btn>
            </v-form>

            <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error=''">{{ error }}</v-alert>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/authStore'
import { http } from '@/shared/http'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await http.post('/api/auth/login', { username: username.value, password: password.value })
    auth.setAuth(data.token, data.user)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.title || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}


</script>

<style scoped>
.login-left {
  background: linear-gradient(135deg, #1A237E 0%, #00897B 100%);
  min-height: 100vh;
}
</style>
