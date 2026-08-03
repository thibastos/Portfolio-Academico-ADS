import { defineStore } from 'pinia'
import { authService } from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user')) || null,
    role: localStorage.getItem('role') || '',
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  }),

  getters: {
    isPatient: (state) => state.role === 'patient',
    isSecretary: (state) => state.role === 'secretary',
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
  },

  actions: {
    // Ação principal de login que salva tudo no store
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.login(credentials)

        // Extrair dados da resposta
        const { token, id, name, email, role } = response

        // Criar objeto user
        const userData = { id, name, email, role }

        // Salvar no store
        this.token = token
        this.user = userData
        this.role = role
        this.isAuthenticated = true

        // Salvar no localStorage para persistência
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('role', role)

        return response
      } catch (error) {
        this.error = error.message || 'Erro ao fazer login'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Ação de registro
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.register(userData)

        // Se o registro retorna token, fazer login automático
        if (response.token) {
          const { token, id, name, email, role } = response
          const user = { id, name, email, role }

          this.token = token
          this.user = user
          this.role = role
          this.isAuthenticated = true

          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('role', role)
        }

        return response
      } catch (error) {
        this.error = error.message || 'Erro ao registrar'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Método para setar dados de autenticação (setAuthData)
    setAuthData(token, user, role) {
      this.token = token
      this.user = user
      this.role = role
      this.isAuthenticated = true

      // Salvar no localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('role', role)
    },

    // Logout completo
    logout() {
      this.token = ''
      this.user = null
      this.role = ''
      this.isAuthenticated = false
      this.error = null

      // Limpar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    },

    // Verificar se está autenticado (útil para guards de rota)
    checkAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const role = localStorage.getItem('role')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.role = role
        this.isAuthenticated = true
        return true
      }

      this.logout()
      return false
    },

    // Limpar erro
    clearError() {
      this.error = null
    },

    // Setters individuais (se precisar)
    setToken(token) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },

    setUser(user) {
      this.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        this.role = user.role
        localStorage.setItem('role', user.role)
      } else {
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        this.role = ''
      }
    },
  },
})