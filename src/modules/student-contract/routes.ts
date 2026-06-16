import type { RouteRecordRaw } from 'vue-router'

export const studentContractRoutes: RouteRecordRaw[] = [
  {
    path: 'student-contract',
    name: 'student-contract',
    component: () => import('./views/ModuleHomeView.vue'),
  },
]
