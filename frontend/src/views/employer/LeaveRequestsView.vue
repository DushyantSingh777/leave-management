<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="font-display font-bold text-2xl text-gray-900">Leave Requests</h1>
      <p class="text-gray-500 mt-1 text-sm">Review and manage all employee leave applications</p>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <button v-for="f in filters" :key="f"
        @click="activeFilter = f; loadLeaves()"
        :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', activeFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50']">
        {{ f }}
      </button>
    </div>

    <AlertMessage :message="actionMsg" :type="actionMsgType" />

    <div v-if="loading" class="text-center py-16 text-gray-400">Loading leave requests...</div>

    <div v-else-if="leaves.length === 0" class="card text-center py-12">
      <p class="text-gray-500">No {{ activeFilter !== 'All' ? activeFilter.toLowerCase() : '' }} leave requests found</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="leave in leaves" :key="leave._id" class="card">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <!-- Employee info -->
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                {{ leave.employee?.name?.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-sm text-gray-900">{{ leave.employee?.name }}</p>
                <p class="text-xs text-gray-500">{{ leave.employee?.email }}{{ leave.employee?.department ? ' · ' + leave.employee.department : '' }}</p>
              </div>
              <StatusBadge :status="leave.status" />
            </div>

            <!-- Leave details -->
            <div class="bg-gray-50 rounded-lg p-3 space-y-1 mb-3">
              <div class="grid grid-cols-2 gap-x-4 text-sm">
                <div><span class="text-gray-500">Type:</span> <span class="font-medium">{{ leave.leaveType }}</span></div>
                <div><span class="text-gray-500">Duration:</span> <span class="font-medium">{{ leave.totalDays }} day{{ leave.totalDays > 1 ? 's' : '' }}</span></div>
                <div><span class="text-gray-500">From:</span> <span class="font-medium">{{ formatDate(leave.startDate) }}</span></div>
                <div><span class="text-gray-500">To:</span> <span class="font-medium">{{ formatDate(leave.endDate) }}</span></div>
              </div>
              <p class="text-sm text-gray-600 pt-1"><span class="text-gray-500">Reason:</span> {{ leave.reason }}</p>
            </div>

            <!-- Review info if done -->
            <div v-if="leave.reviewedBy" class="text-xs text-gray-400">
              Reviewed by {{ leave.reviewedBy?.name }}
              <span v-if="leave.reviewNote"> · "{{ leave.reviewNote }}"</span>
            </div>
            <p class="text-xs text-gray-400">Submitted {{ formatDate(leave.createdAt) }}</p>
          </div>

          <!-- Action buttons for pending -->
          <div v-if="leave.status === 'Pending'" class="flex flex-col gap-2 flex-shrink-0">
            <button @click="openReviewModal(leave, 'Approved')" class="btn-success text-xs py-1.5 px-3">
              ✓ Approve
            </button>
            <button @click="openReviewModal(leave, 'Rejected')" class="btn-danger text-xs py-1.5 px-3">
              ✗ Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="modal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="font-display font-semibold text-lg mb-1">
          {{ modal.status === 'Approved' ? '✓ Approve' : '✗ Reject' }} Leave Request
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          {{ modal.leave?.employee?.name }} · {{ modal.leave?.leaveType }} · {{ formatDate(modal.leave?.startDate) }} → {{ formatDate(modal.leave?.endDate) }}
        </p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <textarea v-model="modal.note" class="input-field resize-none" rows="3"
            placeholder="Add a note for the employee..." maxlength="300"></textarea>
        </div>
        <div class="flex gap-2">
          <button @click="submitReview"
            :class="modal.status === 'Approved' ? 'btn-primary' : 'bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors'"
            class="flex-1" :disabled="modal.loading">
            {{ modal.loading ? 'Processing...' : 'Confirm ' + modal.status }}
          </button>
          <button @click="modal.show = false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge.vue';
import AlertMessage from '../../components/AlertMessage.vue';

const leaves = ref([]);
const loading = ref(true);
const filters = ['All', 'Pending', 'Approved', 'Rejected'];
const activeFilter = ref('All');
const actionMsg = ref('');
const actionMsgType = ref('success');

const modal = reactive({ show: false, leave: null, status: '', note: '', loading: false });

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const loadLeaves = async () => {
  loading.value = true;
  try {
    const params = activeFilter.value !== 'All' ? `?status=${activeFilter.value}&limit=50` : '?limit=50';
    const { data } = await api.get(`/leaves/all${params}`);
    leaves.value = data.leaves;
  } finally {
    loading.value = false;
  }
};

const openReviewModal = (leave, status) => {
  modal.leave = leave;
  modal.status = status;
  modal.note = '';
  modal.show = true;
};

const submitReview = async () => {
  modal.loading = true;
  try {
    await api.patch(`/leaves/${modal.leave._id}/review`, { status: modal.status, reviewNote: modal.note });
    modal.show = false;
    actionMsg.value = `Leave request ${modal.status.toLowerCase()} successfully.`;
    actionMsgType.value = 'success';
    await loadLeaves();
  } catch (err) {
    actionMsg.value = err.response?.data?.message || 'Action failed.';
    actionMsgType.value = 'error';
  } finally {
    modal.loading = false;
    setTimeout(() => actionMsg.value = '', 4000);
  }
};

onMounted(loadLeaves);
</script>
