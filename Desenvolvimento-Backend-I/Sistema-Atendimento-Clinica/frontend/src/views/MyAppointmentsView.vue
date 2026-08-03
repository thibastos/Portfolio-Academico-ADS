<template>
  <div class="appointments-container">
    <div class="header">
      <h1>Minhas Consultas</h1>
      <p class="subtitle">Acompanhe suas consultas agendadas</p>
    </div>

    <!-- Alert de Mensagens -->
    <div v-if="successMessage" class="alert alert-success">
      <strong>✓ Sucesso!</strong> {{ successMessage }}
      <button @click="successMessage = ''" class="close-btn">&times;</button>
    </div>

    <div v-if="errorMessage" class="alert alert-error">
      <strong>✗ Erro!</strong> {{ errorMessage }}
      <button @click="errorMessage = ''" class="close-btn">&times;</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando suas consultas...</p>
    </div>

    <!-- Sem Consultas -->
    <div v-else-if="appointments.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h2>Nenhuma consulta agendada</h2>
      <p>Você não possui consultas agendadas no momento.</p>
      <router-link to="/schedule" class="btn btn-primary">
        Agendar Primeira Consulta
      </router-link>
    </div>

    <!-- Lista de Consultas -->
    <div v-else class="appointments-list">
      <!-- Filter/Sort Options -->
      <div class="filter-bar">
        <div class="filter-group">
          <label for="filter">Filtrar por status:</label>
          <select v-model="selectedStatus" id="filter">
            <option value="">Todos</option>
            <option value="agendada">Agendada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <!-- Appointment Cards -->
      <div v-for="appointment in filteredAppointments" :key="appointment._id" class="appointment-card">
        <div class="card-header" :class="`status-${appointment.estatus}`">
          <div class="status-badge">{{ formatStatus(appointment.estatus) }}</div>
          <div class="card-date">{{ formatDate(appointment.date) }}</div>
        </div>

        <div class="card-body">
          <div class="appointment-detail">
            <span class="label">👨‍⚕️ Médico/Especialidade:</span>
            <span class="value">{{ appointment.doctorName }}</span>
          </div>

          <div class="appointment-detail">
            <span class="label">🕐 Horário:</span>
            <span class="value">{{ appointment.time }}</span>
          </div>

          <div class="appointment-detail">
            <span class="label">📍 Endereço:</span>
            <span class="value">{{ appointment.logradouro }}, {{ appointment.bairro }} - {{ appointment.cidade }}, {{ appointment.estado }}</span>
          </div>

          <div class="appointment-detail">
            <span class="label">📮 CEP:</span>
            <span class="value">{{ formatCep(appointment.cep) }}</span>
          </div>

          <!-- Weather Alert -->
          <div v-if="appointment.weatherAlert" class="weather-alert">
            <span class="weather-icon">⚠️</span>
            <span class="weather-message">{{ appointment.weatherAlert }}</span>
          </div>
        </div>

        <div class="card-footer">
          <router-link to="/schedule" class="btn btn-small btn-info">
            Agendar Outra
          </router-link>
          <button
            v-if="appointment.estatus === 'agendada'"
            @click="cancelAppointment(appointment._id)"
            class="btn btn-small btn-danger"
            :disabled="isCanceling === appointment._id"
          >
            {{ isCanceling === appointment._id ? 'Cancelando...' : 'Cancelar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="appointments.length > 0" class="action-buttons">
      <router-link to="/schedule" class="btn btn-primary">
        Agendar Nova Consulta
      </router-link>
      <router-link to="/" class="btn btn-secondary">
        Voltar ao Início
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const appointments = ref([])
const isLoading = ref(false)
const isCanceling = ref(null)
const successMessage = ref('')
const errorMessage = ref('')
const selectedStatus = ref('')

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const filteredAppointments = computed(() => {
  if (!selectedStatus.value) {
    return appointments.value
  }
  return appointments.value.filter(app => app.estatus === selectedStatus.value)
})

onMounted(async () => {
  document.title = 'Minhas Consultas | Clínica de Atendimento'
  await loadAppointments()
})

const loadAppointments = async () => {
  clearMessages()
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await authService.getAppointments()
    appointments.value = response.appointments || []
  } catch (error) {
    errorMessage.value = error.message || 'Não foi possível carregar consultas'
  } finally {
    isLoading.value = false
  }
}

const cancelAppointment = async (appointmentId) => {
  if (!confirm('Tem certeza que deseja cancelar esta consulta?')) {
    return
  }

  isCanceling.value = appointmentId
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authService.updateAppointmentStatus(appointmentId, 'cancelada')
    successMessage.value = 'Consulta cancelada com sucesso'
    await loadAppointments()
  } catch (error) {
    errorMessage.value = error.message || 'Erro ao cancelar consulta'
  } finally {
    isCanceling.value = null
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatStatus = (status) => {
  const statusMap = {
    agendada: '📅 Agendada',
    realizada: '✅ Realizada',
    cancelada: '❌ Cancelada',
  }
  return statusMap[status] || status
}

const formatCep = (cep) => {
  if (!cep) return ''
  const cleanCep = cep.replace(/\D/g, '')
  return cleanCep.slice(0, 5) + '-' + cleanCep.slice(5)
}
</script>

<style scoped>
.appointments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1rem;
}

/* Alerts */
.alert {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease-in-out;
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

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #333;
}

.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
}

/* Appointments List */
.appointments-list {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.appointment-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.status-agendada {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.status-realizada {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.status-cancelada {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.status-badge {
  font-weight: 700;
  font-size: 0.9rem;
}

.card-date {
  font-size: 0.9rem;
  opacity: 0.9;
}

.card-body {
  padding: 1.5rem;
}

.appointment-detail {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.appointment-detail:last-of-type {
  margin-bottom: 0;
}

.appointment-detail .label {
  font-weight: 600;
  color: #333;
  min-width: 150px;
  flex-shrink: 0;
}

.appointment-detail .value {
  color: #555;
  flex: 1;
}

.weather-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff3cd;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.weather-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.weather-message {
  color: #664d03;
  font-size: 0.9rem;
}

.card-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
  display: inline-block;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.btn-small {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  flex: 1;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .btn {
  min-width: 200px;
  padding: 0.875rem 1.5rem;
}

/* Media Queries */
@media (max-width: 768px) {
  .appointments-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    width: 100%;
    flex: 1;
  }

  .card-footer {
    flex-direction: column;
  }

  .appointment-detail {
    flex-direction: column;
    gap: 0.25rem;
  }

  .appointment-detail .label {
    min-width: auto;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    min-width: auto;
    width: 100%;
  }
}
</style>