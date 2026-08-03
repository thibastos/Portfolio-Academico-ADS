<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🔐 Acesso à Clínica</h1>
      <p>Digite seus dados para entrar</p>

      <!-- Formulário de Login -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            required
            placeholder="seu@email.com"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Senha:</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            placeholder="Digite sua senha"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || !credentials.email || !credentials.password"
          class="login-btn"
        >
          {{ loading ? '⏳ Entrando...' : '🚀 Entrar' }}
        </button>
      </form>

      <!-- Mensagens -->
      <AlertBox v-if="errorMessage" :message="errorMessage" type="error" />
      <AlertBox v-if="successMessage" :message="successMessage" type="success" />

      <!-- Links -->
      <div class="links">
        <p>Não tem conta? <router-link to="/register">Cadastre-se aqui</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authService } from '../services/api'
import { useMessages } from '@/composables/useMessages'
import AlertBox from '@/components/AlertBox.vue'

const router = useRouter()
const authStore = useAuthStore()
const { errorMessage, successMessage, loading, clearMessages, setError, setSuccess, setLoading } = useMessages()

const credentials = ref({
  email: '',
  password: '',
})

// Função de login real
const handleLogin = async () => {
  setLoading(true)
  clearMessages()

  try {
    // Chamar backend via authService.login()
    const response = await authService.login(credentials.value)

    // Extrair dados da resposta
    const { token, id, name, email, role } = response

    // Criar objeto user
    const userData = { id, name, email, role }

    // Salvar no authStore usando setAuthData()
    authStore.setAuthData(token, userData, role)

    // Mostrar mensagem de sucesso
    setSuccess('✅ Login realizado com sucesso! Redirecionando...')

    // Redirecionar baseado no perfil
    setTimeout(() => {
      if (role === 'secretary') {
        router.push('/admin')
      } else {
        router.push('/schedule')
      }
    }, 1500)
  } catch (error) {
    // Tratamento de erro
    console.error('Erro no login:', error)
    setError(error.message || 'Email ou senha incorretos. Tente novamente.')
  } finally {
    setLoading(false)
  }
}

// Título, limpeza e consistência ao abrir a página
onMounted(() => {
  document.title = 'Login | Clínica de Atendimento'
  clearMessages()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.8rem;
}

.login-card > p {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-group input {
  padding: 0.85rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: #f9f9f9;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.login-btn {
  padding: 0.9rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.links {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.links p {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

.links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.links a:hover {
  color: #764ba2;
  text-decoration: underline;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>