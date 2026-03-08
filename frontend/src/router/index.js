import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes = [
  {
    path: '/',
    redirect: () => {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) return '/login';
      return auth.isEmployer ? '/employer/dashboard' : '/employee/dashboard';
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/employee',
    meta: { requiresAuth: true, role: 'employee' },
    children: [
      {
        path: 'dashboard',
        name: 'EmployeeDashboard',
        component: () => import('../views/employee/DashboardView.vue')
      },
      {
        path: 'apply',
        name: 'ApplyLeave',
        component: () => import('../views/employee/ApplyLeaveView.vue')
      },
      {
        path: 'my-leaves',
        name: 'MyLeaves',
        component: () => import('../views/employee/MyLeavesView.vue')
      }
    ]
  },
  {
    path: '/employer',
    meta: { requiresAuth: true, role: 'employer' },
    children: [
      {
        path: 'dashboard',
        name: 'EmployerDashboard',
        component: () => import('../views/employer/DashboardView.vue')
      },
      {
        path: 'requests',
        name: 'LeaveRequests',
        component: () => import('../views/employer/LeaveRequestsView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next(auth.isEmployer ? '/employer/dashboard' : '/employee/dashboard');
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login');
  }

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    return next(auth.isEmployer ? '/employer/dashboard' : '/employee/dashboard');
  }

  next();
});

export default router;
