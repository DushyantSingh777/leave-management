<template>
  <div id="app-root">
    <Navbar v-if="auth.isAuthenticated" />
    <main :class="auth.isAuthenticated ? 'pt-16' : ''">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from './store/auth';
import Navbar from './components/Navbar.vue';

const auth = useAuthStore();
</script>
