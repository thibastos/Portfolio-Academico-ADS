import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async getAppointments() {
    try {
      const response = await api.get('/appointments/my')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/appointments', appointmentData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async getAllAppointments() {
    try {
      const response = await api.get('/appointments')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async updateAppointmentStatus(id, status) {
    try {
      const response = await api.patch(`/appointments/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  async getAddressByCep(cep) {
    try {
      const response = await api.get(`/appointments/cep/${cep}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default api