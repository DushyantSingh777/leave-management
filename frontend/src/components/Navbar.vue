<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span class="font-display font-bold text-lg text-gray-900">LeaveFlow</span>
      </RouterLink>

      <!-- Nav links -->
      <div class="flex items-center gap-1">
        <template v-if="auth.isEmployee">
          <RouterLink to="/employee/dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/employee/apply" class="nav-link">Apply Leave</RouterLink>
          <RouterLink to="/employee/my-leaves" class="nav-link">My Requests</RouterLink>
        </template>
        <template v-if="auth.isEmployer">
          <RouterLink to="/employer/dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/employer/requests" class="nav-link">Leave Requests</RouterLink>
        </template>
      </div>

      <!-- User Menu -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-gray-900">{{ auth.user?.name }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ auth.user?.role }}</p>
        </div>
        <button @click="handleLogout" class="btn-secondary text-sm py-1.5 px-3">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style scoped>
.nav-link {
  @apply px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors;
}
.router-link-active.nav-link {
  @apply text-blue-600 bg-blue-50;
}
</style>
