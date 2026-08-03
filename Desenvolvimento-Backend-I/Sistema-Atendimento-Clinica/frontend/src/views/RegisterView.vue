<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Cadastro</h1>
      <p>Crie sua conta na clínica</p>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Campo: Nome -->
        <div class="form-group">
          <label for="name">Nome Completo:</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            placeholder="Digite seu nome"
            :disabled="loading"
          />
        </div>

        <!-- Campo: Email -->
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="seu@email.com"
            :disabled="loading"
          />
        </div>

        <!-- Campo: Senha -->
        <div class="form-group">
          <label for="password">Senha:</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="Digite uma senha (mínimo 6 caracteres)"
            minlength="6"
            :disabled="loading"
          />
        </div>

        <!-- Campo: Perfil -->
        <div class="form-group">
          <label for="role">Perfil:</label>
          <select
            id="role"
            v-model="formData.role"
            required
            :disabled="loading"
          >
            <option value="" disabled>-- Selecione um perfil --</option>
            <option value="patient">Paciente</option>
            <option value="secretary">Secretário(a)</option>
          </select>
        </div>

        <!-- Botão Submit -->
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="register-btn"
        >
          {{ loading ? 'Cadastrando...' : 'Criar Conta' }}
        </button>
      </form>

      <!-- Mensagens -->
      <AlertBox v-if="errorMessage" :message="errorMessage" type="error" />
      <AlertBox v-if="successMessage" :message="successMessage" type="success" />

      <!-- Links -->
      <div class="links">
        <router-link to="/login">Já tem conta? Fazer Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '../services/api'
import { useMessages } from '@/composables/useMessages'
import AlertBox from '@/components/AlertBox.vue'

const router = useRouter()
const authStore = useAuthStore()
const { errorMessage, successMessage, loading, clearMessages, setError, setSuccess, setLoading } = useMessages()

// Estado reativo do formulário
const formData = ref({
  name: '',
  email: '',
  password: '',
  role: '',
})

// Validação do formulário
const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.email &&
    formData.value.password &&
    formData.value.password.length >= 6 &&
    formData.value.role
  )
})

// Função de submit
onMounted(() => {
  document.title = 'Cadastro | Clínica de Atendimento'
  clearMessages()
})

const handleRegister = async () => {
  clearMessages()
  setLoading(true)

  try {
    // Enviar dados ao backend
    const response = await authService.register(formData.value)

    // Sucesso!
    setSuccess(`✅ Cadastro realizado com sucesso! Redirecionando para login...`)

    // Limpar formulário
    formData.value = {
      name: '',
      email: '',
      password: '',
      role: '',
    }

    // Redirecionar para login após 2 segundos
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    // Tratamento de erro
    console.error('Erro no cadastro:', error)
    setError(error.message || 'Erro ao cadastrar. Tente novamente.')
  } finally {
    setLoading(false)
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.register-card h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
}

.register-card > p {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.register-btn {
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 0.5rem;
}

.register-btn:hover:not(:disabled) {
  background-color: #218838;
}

.register-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.links {
  text-align: center;
  margin-top: 1.5rem;
}

.links a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.links a:hover {
  text-decoration: underline;
}
</style>