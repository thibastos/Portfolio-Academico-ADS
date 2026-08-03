import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import AdminPaneView from '../views/AdminPaneView.vue'
import MyAppointmentsView from '../views/MyAppointmentsView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { requiresAuth: false },
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: { requiresAuth: false },
    },
    {
        path: '/my-appointments',
        name: 'my-appointments',
        component: MyAppointmentsView,
        meta: { requiresAuth: true },
    },
    {
        path: '/schedule',
        name: 'schedule',
        component: ScheduleView,
        meta: { requiresAuth: true },
    },
     {
        path: '/admin',
        name: 'admin',
        component: AdminPaneView,
        meta: { requiresAuth: true, requiresSecretary: true },
    },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isAuthenticated
  const userRole = authStore.role

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresSecretary && userRole !== 'secretary') {
    next('/schedule')
  } else if (!to.meta.requiresAuth && isLoggedIn) {
    if (userRole === 'secretary') {
      next('/admin')
    } else {
      next('/schedule')
    }
  } else {
    next()
  }
})

export default router
