import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type UserRole = 'admin' | 'manager' | 'student'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('ktx_access_token') ?? '')
  const user = ref<AuthUser | null>(null)

  const isLoggedIn = computed(() => Boolean(token.value))

  function login(payload: { token: string; user: AuthUser }) {
    token.value = payload.token
    user.value = payload.user
    localStorage.setItem('ktx_access_token', payload.token)
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('ktx_access_token')
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    logout,
  }
})
