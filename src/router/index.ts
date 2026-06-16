import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/core/stores/authStore'
import { roomBuildingRoutes } from '@/modules/room-building/routes'
import { studentContractRoutes } from '@/modules/student-contract/routes'
import { billingMaintenanceRoutes } from '@/modules/billing-maintenance/routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'intro',
      component: () => import('@/core/views/IntroView.vue'),
      meta: { public: true },
    },
    {
      path: '/gioi-thieu-ktx-dai-nam',
      name: 'dormitory-intro',
      component: () => import('@/core/views/DormitoryIntroView.vue'),
      meta: { public: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/core/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/core/views/RegisterView.vue'),
      meta: { public: true },
    },
    {
      path: '/app',
      component: () => import('@/core/layouts/AppShell.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'overview',
          name: 'overview',
          component: () => import('@/core/views/OverviewView.vue'),
        },
        ...roomBuildingRoutes,
        ...studentContractRoutes,
        ...billingMaintenanceRoutes,
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/core/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isLoggedIn) {
    return '/login'
  }

  if (auth.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return '/app/overview'
  }
})

export default router
