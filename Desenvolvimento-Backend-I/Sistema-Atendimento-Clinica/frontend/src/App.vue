<template>
  <div>
    <AppNav />
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AppNav from './components/AppNav.vue'

const authStore = useAuthStore()

// Restaurar sessão ao iniciar a aplicação
onMounted(() => {
  authStore.checkAuth()
})
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.container {
  padding: 24px;
}
</style>