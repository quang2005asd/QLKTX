import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#dd8f68',
          secondary: '#e8bfa4',
          surface: '#fffaf7',
          background: '#fdf7f1',
          error: '#c34f3f',
          info: '#c27a57',
          success: '#7d9453',
          warning: '#d9a062',
        },
      },
    },
  },
})
