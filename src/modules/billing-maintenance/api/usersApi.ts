import { http } from '@/shared/http'

export const usersApi = {
  getUsers() {
    return http.get('/api/users')
  },
  getUser(id: number | string) {
    return http.get(`/api/users/${id}`)
  },
  createUser(data: any) {
    return http.post('/api/users', data)
  },
  updateUser(id: number | string, data: any) {
    return http.put(`/api/users/${id}`, data)
  },
  deleteUser(id: number | string) {
    return http.delete(`/api/users/${id}`)
  },
}
