import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = computed(() => !!token.value);
  const isEmployee = computed(() => user.value?.role === 'employee');
  const isEmployer = computed(() => user.value?.role === 'employer');

  const setAuth = (tokenValue, userData) => {
    token.value = tokenValue;
    user.value = userData;
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuth(data.token, data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setAuth(data.token, data.user);
    return data;
  };

  const logout = () => {
    clearAuth();
  };

  return { token, user, isAuthenticated, isEmployee, isEmployer, login, register, logout };
});
