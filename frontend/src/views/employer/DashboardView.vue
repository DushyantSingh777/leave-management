<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="font-display font-bold text-2xl text-gray-900">Employer Dashboard</h1>
      <p class="text-gray-500 mt-1">Overview of all employee leave requests</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card text-center">
        <p class="text-3xl font-display font-bold text-gray-900">{{ stats.Total || 0 }}</p>
        <p class="text-sm text-gray-500 mt-1">Total Requests</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-display font-bold text-yellow-600">{{ stats.Pending || 0 }}</p>
        <p class="text-sm text-gray-500 mt-1">Pending Review</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-display font-bold text-green-600">{{ stats.Approved || 0 }}</p>
        <p class="text-sm text-gray-500 mt-1">Approved</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-display font-bold text-red-600">{{ stats.Rejected || 0 }}</p>
        <p class="text-sm text-gray-500 mt-1">Rejected</p>
      </div>
    </div>

    <!-- Pending requests section -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display font-semibold text-lg text-gray-900">Pending Requests</h2>
        <RouterLink to="/employer/requests" class="text-blue-600 text-sm hover:underline">View all →</RouterLink>
      </div>
      <div v-if="loading" class="py-8 text-center text-gray-400">Loading...</div>
      <div v-else-if="pendingLeaves.length === 0" class="py-8 text-center text-gray-400">
        ✅ No pending leave requests
      </div>
      <div v-else class="space-y-3">
        <div v-for="leave in pendingLeaves" :key="leave._id"
          class="flex items-start justify-between gap-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
          <div class="flex-1">
            <p class="font-medium text-sm text-gray-900">{{ leave.employee?.name }}</p>
            <p class="text-xs text-gray-500">{{ leave.leaveType }} · {{ formatDate(leave.startDate) }} → {{ formatDate(leave.endDate) }} ({{ leave.totalDays }} days)</p>
            <p class="text-xs text-gray-500 mt-1 truncate">{{ leave.reason }}</p>
          </div>
          <div class="flex gap-1 flex-shrink-0">
            <button @click="quickReview(leave._id, 'Approved')" class="btn-success text-xs py-1 px-2" :disabled="reviewing === leave._id">✓</button>
            <button @click="quickReview(leave._id, 'Rejected')" class="btn-danger text-xs py-1 px-2" :disabled="reviewing === leave._id">✗</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../../api';

const stats = ref({});
const pendingLeaves = ref([]);
const loading = ref(true);
const reviewing = ref(null);

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const loadData = async () => {
  loading.value = true;
  try {
    const [statsRes, leavesRes] = await Promise.all([
      api.get('/leaves/stats'),
      api.get('/leaves/all?status=Pending&limit=10')
    ]);
    stats.value = statsRes.data;
    pendingLeaves.value = leavesRes.data.leaves;
  } finally {
    loading.value = false;
  }
};

const quickReview = async (id, status) => {
  reviewing.value = id;
  try {
    await api.patch(`/leaves/${id}/review`, { status });
    pendingLeaves.value = pendingLeaves.value.filter(l => l._id !== id);
    stats.value[status] = (stats.value[status] || 0) + 1;
    stats.value.Pending = Math.max(0, (stats.value.Pending || 0) - 1);
  } finally {
    reviewing.value = null;
  }
};

onMounted(loadData);
</script>
