<template>
  <span :class="badgeClass">
    <span class="w-1.5 h-1.5 rounded-full mr-1" :class="dotClass"></span>
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ status: { type: String, required: true } });

const badgeClass = computed(() => {
  const map = {
    Pending: 'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected'
  };
  return map[props.status] || 'badge-pending';
});

const dotClass = computed(() => {
  const map = {
    Pending: 'bg-yellow-500',
    Approved: 'bg-green-500',
    Rejected: 'bg-red-500'
  };
  return map[props.status] || 'bg-yellow-500';
});
</script>
