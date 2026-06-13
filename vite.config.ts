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
      '@room': fileURLToPath(new URL('./src/modules/room', import.meta.url)),
      '@contract': fileURLToPath(new URL('./src/modules/contract', import.meta.url)),
      '@billing': fileURLToPath(new URL('./src/modules/billing', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
})
