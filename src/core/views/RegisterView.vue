<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
})

function handleRegister() {
  router.push('/login')
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
                <h1 class="text-h4 font-weight-bold mb-2">Đăng ký</h1>
                <p class="text-body-2 text-medium-emphasis mb-6">
                  Tạo tài khoản người dùng để sử dụng khu vực dành cho sinh viên và cư dân nội trú.
                </p>

                <v-form @submit.prevent="handleRegister">
                  <v-text-field v-model="form.fullName" class="mb-3" label="Họ và tên" variant="outlined" />
                  <v-text-field v-model="form.email" class="mb-3" label="Email" variant="outlined" />
                  <v-text-field
                    v-model="form.password"
                    class="mb-4"
                    label="Mật khẩu"
                    type="password"
                    variant="outlined"
                  />

                  <v-btn block color="primary" size="large" type="submit">Tạo tài khoản</v-btn>
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
