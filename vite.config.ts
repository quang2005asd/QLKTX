import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@room-building': fileURLToPath(new URL('./src/modules/room-building', import.meta.url)),
      '@student-contract': fileURLToPath(new URL('./src/modules/student-contract', import.meta.url)),
      '@billing-maintenance': fileURLToPath(new URL('./src/modules/billing-maintenance', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/contract-api': {
        target: 'https://api-contract-nhom2contract-student-api.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/contract-api/, ''),
      },
      '/room-api': {
        target: 'https://roombuildingservice-1ijx.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/room-api/, ''),
      },
      '/billing-api': {
        target: 'http://localhost:5300', // Redirect to local backend during development
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/billing-api/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})
