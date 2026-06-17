import axios from 'axios'

function isNgrokUrl(url: string | undefined) {
  return typeof url === 'string' && /ngrok(-free)?\.(app|dev)/i.test(url)
}

export const http = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ktx_access_token')
  const requestUrl = config.url

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (isNgrokUrl(requestUrl)) {
    config.headers['ngrok-skip-browser-warning'] = 'true'
  }

  return config
})
