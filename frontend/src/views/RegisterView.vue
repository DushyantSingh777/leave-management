<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="font-display font-bold text-2xl text-gray-900">Create Account</h1>
        <p class="text-gray-500 mt-1 text-sm">Join LeaveFlow to get started</p>
      </div>

      <div class="card">
        <AlertMessage :message="error" type="error" />

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input v-model="form.name" type="text" class="input-field" placeholder="John Doe" required minlength="2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" class="input-field" placeholder="Min 6 characters" required minlength="6" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" @click="form.role = 'employee'"
                :class="['border-2 rounded-lg p-3 text-sm font-medium transition-colors text-center', form.role === 'employee' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300']">
                👤 Employee
              </button>
              <button type="button" @click="form.role = 'employer'"
                :class="['border-2 rounded-lg p-3 text-sm font-medium transition-colors text-center', form.role === 'employer' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300']">
                🏢 Employer
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department <span class="text-gray-400">(optional)</span></label>
            <input v-model="form.department" type="text" class="input-field" placeholder="e.g. Engineering" />
          </div>

          <button type="submit" class="btn-primary w-full mt-2" :disabled="loading || !form.role">
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-4">
          Already have an account?
          <RouterLink to="/login" class="text-blue-600 font-medium hover:underline">Sign in</RouterLink>
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
const form = reactive({ name: '', email: '', password: '', role: 'employee', department: '' });
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  error.value = '';
  if (!form.role) { error.value = 'Please select a role.'; return; }
  loading.value = true;
  try {
    await auth.register(form);
    router.push(auth.isEmployer ? '/employer/dashboard' : '/employee/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
