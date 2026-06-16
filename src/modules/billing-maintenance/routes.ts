import type { RouteRecordRaw } from 'vue-router'

export const billingMaintenanceRoutes: RouteRecordRaw[] = [
  {
    path: 'billing-maintenance',
    name: 'billing-maintenance',
    component: () => import('./views/ModuleHomeView.vue'),
  },
]
