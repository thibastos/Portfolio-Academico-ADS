<template>
  <nav class="nav">
    <template v-if="!isAuthenticated">
      <router-link to="/login">🔐 Login</router-link>
      <router-link to="/register">📝 Cadastro</router-link>
    </template>

    <template v-else>
      <router-link to="/schedule">📅 Agendar</router-link>
      <router-link to="/my-appointments">📋 Minhas Consultas</router-link>
      <router-link v-if="isSecretary" to="/admin">⚙️ Admin</router-link>
      <button class="logout-btn" @click="handleLogout">🚪 Sair</button>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isSecretary = computed(() => authStore.role === 'secretary')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f4f4f4;
  border-bottom: 1px solid #ddd;
}

.nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

.nav a:hover {
  background-color: #e0e0e0;
}

.logout-btn {
  background: #dc3545;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #c82333;
}

.nav a.router-link-active {
  background-color: #0077cc;
  color: white;
}
</style>