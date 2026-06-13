import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/shared/stores/authStore'
import { roomRoutes } from '@/modules/room/routes'
import { contractRoutes } from '@/modules/contract/routes'
import { billingRoutes } from '@/modules/billing/routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@billing/views/LoginView.vue'),
      meta: { public: true },
    },
    { path: '/', redirect: '/dashboard' },
    {
      path: '/',
      component: () => import('@/shared/components/AppShell.vue'),
      meta: { requiresAuth: true },
      children: [
        ...roomRoutes,
        ...contractRoutes,
        ...billingRoutes,
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/shared/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Chưa đăng nhập → về trang login
  if (!to.meta.public && !auth.isLoggedIn) return '/login'

  // Đã đăng nhập → kiểm tra role
  if (auth.isLoggedIn && to.meta.roles) {
    const allowedRoles = to.meta.roles as string[]
    const userRole = auth.user?.role
    if (userRole && !allowedRoles.includes(userRole)) {
      // MANAGER và ADMIN về dashboard, STUDENT về trang phòng
      if (auth.isStudent) return '/room/browse'
      return '/dashboard'
    }
  }
})

export default router
