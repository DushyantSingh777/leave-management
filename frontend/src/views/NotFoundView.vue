<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-6xl font-display font-bold text-gray-200">404</p>
      <h1 class="font-display font-bold text-xl text-gray-900 mt-2">Page Not Found</h1>
      <p class="text-gray-500 mt-1 text-sm">The page you're looking for doesn't exist.</p>
      <RouterLink to="/" class="btn-primary inline-block mt-4">Go Home</RouterLink>
    </div>
  </div>
</template>
<script setup>
import { RouterLink } from 'vue-router';
</script>
