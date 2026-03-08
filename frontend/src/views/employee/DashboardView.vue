<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="font-display font-bold text-2xl text-gray-900">Welcome back, {{ auth.user?.name }} 👋</h1>
      <p class="text-gray-500 mt-1">Here's an overview of your leave status</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card text-center">
        <p class="text-3xl font-display font-bold text-gray-900">{{ stats.total }}</p>
        <p class="text-sm text-gray-500 mt-1">Total Requests</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-display font-bold text-yellow-600">{{ stats.pending }}</p>
        <p class="text-sm text-gray-500 mt-1">Pending</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-display font-bold text-green-600">{{ stats.approved }}</p>
        <p class="text-sm text-gray-500 mt-1">Approved</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-display font-bold text-red-600">{{ stats.rejected }}</p>
        <p class="text-sm text-gray-500 mt-1">Rejected</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-2 gap-4 mb-8">
      <RouterLink to="/employee/apply"
        class="card flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer border-2 border-transparent">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-900">Apply for Leave</p>
          <p class="text-sm text-gray-500">Submit a new leave request</p>
        </div>
      </RouterLink>
      <RouterLink to="/employee/my-leaves"
        class="card flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer border-2 border-transparent">
        <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-900">View My Requests</p>
          <p class="text-sm text-gray-500">Track all your leave applications</p>
        </div>
      </RouterLink>
    </div>

    <!-- Recent leaves -->
    <div class="card">
      <h2 class="font-display font-semibold text-lg text-gray-900 mb-4">Recent Leave Requests</h2>
      <div v-if="loading" class="text-center py-8 text-gray-400">Loading...</div>
      <div v-else-if="recentLeaves.length === 0" class="text-center py-8 text-gray-400">
        No leave requests yet. <RouterLink to="/employee/apply" class="text-blue-600 hover:underline">Apply now</RouterLink>
      </div>
      <div v-else class="space-y-3">
        <div v-for="leave in recentLeaves" :key="leave._id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p class="font-medium text-sm text-gray-900">{{ leave.leaveType }} Leave</p>
            <p class="text-xs text-gray-500">{{ formatDate(leave.startDate) }} → {{ formatDate(leave.endDate) }} ({{ leave.totalDays }} day{{ leave.totalDays > 1 ? 's' : '' }})</p>
          </div>
          <StatusBadge :status="leave.status" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge.vue';

const auth = useAuthStore();
const leaves = ref([]);
const loading = ref(true);

const recentLeaves = computed(() => leaves.value.slice(0, 5));
const stats = computed(() => ({
  total: leaves.value.length,
  pending: leaves.value.filter(l => l.status === 'Pending').length,
  approved: leaves.value.filter(l => l.status === 'Approved').length,
  rejected: leaves.value.filter(l => l.status === 'Rejected').length
}));

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

onMounted(async () => {
  try {
    const { data } = await api.get('/leaves/my?limit=100');
    leaves.value = data.leaves;
  } finally {
    loading.value = false;
  }
});
</script>
