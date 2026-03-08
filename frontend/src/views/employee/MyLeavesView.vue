<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-display font-bold text-2xl text-gray-900">My Leave Requests</h1>
        <p class="text-gray-500 mt-1 text-sm">Track all your submitted leave applications</p>
      </div>
      <RouterLink to="/employee/apply" class="btn-primary">+ Apply Leave</RouterLink>
    </div>

    <!-- Filter -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <button v-for="f in filters" :key="f"
        @click="activeFilter = f"
        :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50']">
        {{ f }}
      </button>
    </div>

    <AlertMessage :message="actionMsg" :type="actionMsgType" />

    <div v-if="loading" class="text-center py-16 text-gray-400">Loading your leave requests...</div>

    <div v-else-if="filteredLeaves.length === 0" class="card text-center py-12">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500">No {{ activeFilter !== 'All' ? activeFilter.toLowerCase() : '' }} leave requests found</p>
      <RouterLink to="/employee/apply" class="text-blue-600 text-sm hover:underline mt-2 block">Apply for leave</RouterLink>
    </div>

    <div v-else class="space-y-3">
      <div v-for="leave in filteredLeaves" :key="leave._id"
        class="card hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="font-semibold text-gray-900">{{ leave.leaveType }} Leave</span>
              <StatusBadge :status="leave.status" />
            </div>
            <p class="text-sm text-gray-600 mb-1">
              📅 {{ formatDate(leave.startDate) }} → {{ formatDate(leave.endDate) }}
              <span class="text-gray-400 ml-1">({{ leave.totalDays }} day{{ leave.totalDays > 1 ? 's' : '' }})</span>
            </p>
            <p class="text-sm text-gray-500">📝 {{ leave.reason }}</p>
            <div v-if="leave.reviewNote" class="mt-2 bg-gray-50 rounded p-2 text-sm text-gray-600">
              <span class="font-medium">Reviewer note:</span> {{ leave.reviewNote }}
            </div>
            <p class="text-xs text-gray-400 mt-2">Submitted {{ formatDate(leave.createdAt) }}</p>
          </div>
          <button v-if="leave.status === 'Pending'" @click="cancelLeave(leave._id)"
            class="btn-danger text-xs py-1 px-2 flex-shrink-0" :disabled="cancelling === leave._id">
            {{ cancelling === leave._id ? '...' : 'Cancel' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge.vue';
import AlertMessage from '../../components/AlertMessage.vue';

const leaves = ref([]);
const loading = ref(true);
const cancelling = ref(null);
const actionMsg = ref('');
const actionMsgType = ref('success');
const filters = ['All', 'Pending', 'Approved', 'Rejected'];
const activeFilter = ref('All');

const filteredLeaves = computed(() =>
  activeFilter.value === 'All' ? leaves.value : leaves.value.filter(l => l.status === activeFilter.value)
);

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const loadLeaves = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/leaves/my?limit=100');
    leaves.value = data.leaves;
  } finally {
    loading.value = false;
  }
};

const cancelLeave = async (id) => {
  if (!confirm('Are you sure you want to cancel this leave request?')) return;
  cancelling.value = id;
  try {
    await api.delete(`/leaves/${id}`);
    leaves.value = leaves.value.filter(l => l._id !== id);
    actionMsg.value = 'Leave request cancelled successfully.';
    actionMsgType.value = 'success';
  } catch (err) {
    actionMsg.value = err.response?.data?.message || 'Failed to cancel.';
    actionMsgType.value = 'error';
  } finally {
    cancelling.value = null;
    setTimeout(() => actionMsg.value = '', 4000);
  }
};

onMounted(loadLeaves);
</script>
