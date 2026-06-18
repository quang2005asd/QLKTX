import axios from 'axios'

export const http = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ktx_access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
