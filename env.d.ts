/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROOM_BUILDING_API_URL?: string
  readonly VITE_ROOM_BUILDING_PUBLIC_API_URL?: string
  readonly VITE_STUDENT_CONTRACT_API_URL?: string
  readonly VITE_STUDENT_CONTRACT_PUBLIC_API_URL?: string
  readonly VITE_BILLING_MAINTENANCE_API_URL?: string
  readonly VITE_BILLING_MAINTENANCE_PUBLIC_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
