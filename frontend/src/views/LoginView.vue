<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Welcome to LeaveFlow</h1>
        <p class="text-gray-500 mt-1 text-sm">Sign in to manage your leave requests</p>
      </div>

      <div class="card">
        <AlertMessage :message="error" type="error" />
        <AlertMessage :message="success" type="success" />

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" class="input-field" placeholder="••••••••" required />
          </div>

          <button type="submit" class="btn-primary w-full mt-2" :disabled="loading">
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-4">
          Don't have an account?
          <RouterLink to="/register" class="text-blue-600 font-medium hover:underline">Register here</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import AlertMessage from '../components/AlertMessage.vue';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref('');
const success = ref('');

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(form.email, form.password);
    success.value = 'Login successful! Redirecting...';
    setTimeout(() => {
      router.push(auth.isEmployer ? '/employer/dashboard' : '/employee/dashboard');
    }, 500);
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>
