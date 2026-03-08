<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="font-display font-bold text-2xl text-gray-900">Apply for Leave</h1>
      <p class="text-gray-500 mt-1 text-sm">Fill in the details to submit your leave request</p>
    </div>

    <div class="card">
      <AlertMessage :message="error" type="error" />
      <AlertMessage :message="success" type="success" />

      <form @submit.prevent="handleSubmit" class="space-y-5" v-if="!submitted">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Leave Type <span class="text-red-500">*</span></label>
          <select v-model="form.leaveType" class="input-field" required>
            <option value="">Select leave type</option>
            <option v-for="type in leaveTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date <span class="text-red-500">*</span></label>
            <input v-model="form.startDate" type="date" class="input-field" :min="today" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date <span class="text-red-500">*</span></label>
            <input v-model="form.endDate" type="date" class="input-field" :min="form.startDate || today" required />
          </div>
        </div>

        <!-- Duration preview -->
        <div v-if="duration > 0" class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
          📅 Duration: <strong>{{ duration }} day{{ duration > 1 ? 's' : '' }}</strong>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Reason <span class="text-red-500">*</span></label>
          <textarea v-model="form.reason" class="input-field resize-none" rows="4"
            placeholder="Please provide a detailed reason for your leave request (min 10 characters)..."
            minlength="10" maxlength="500" required></textarea>
          <p class="text-xs text-gray-400 mt-1">{{ form.reason.length }}/500 characters</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="submit" class="btn-primary flex-1" :disabled="loading">
            {{ loading ? 'Submitting...' : 'Submit Leave Request' }}
          </button>
          <RouterLink to="/employee/dashboard" class="btn-secondary">Cancel</RouterLink>
        </div>
      </form>

      <!-- Success state -->
      <div v-if="submitted" class="text-center py-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="font-display font-semibold text-lg text-gray-900">Request Submitted!</h2>
        <p class="text-gray-500 text-sm mt-1">Your leave request has been sent for approval.</p>
        <div class="flex gap-3 justify-center mt-6">
          <button @click="resetForm" class="btn-primary">Apply Another</button>
          <RouterLink to="/employee/my-leaves" class="btn-secondary">View My Requests</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../../api';
import AlertMessage from '../../components/AlertMessage.vue';

const leaveTypes = ['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Unpaid', 'Other'];
const today = new Date().toISOString().split('T')[0];

const form = reactive({ leaveType: '', startDate: '', endDate: '', reason: '' });
const loading = ref(false);
const error = ref('');
const success = ref('');
const submitted = ref(false);

const duration = computed(() => {
  if (!form.startDate || !form.endDate) return 0;
  const diff = new Date(form.endDate) - new Date(form.startDate);
  return diff >= 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1 : 0;
});

const handleSubmit = async () => {
  error.value = '';
  if (form.endDate < form.startDate) {
    error.value = 'End date must be on or after start date.';
    return;
  }
  if (form.reason.length < 10) {
    error.value = 'Reason must be at least 10 characters.';
    return;
  }
  loading.value = true;
  try {
    await api.post('/leaves', form);
    submitted.value = true;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to submit. Please try again.';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, { leaveType: '', startDate: '', endDate: '', reason: '' });
  submitted.value = false;
  error.value = '';
};
</script>
