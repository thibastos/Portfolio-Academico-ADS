<template>
  <div class="admin-container">
    <div class="header">
      <h1>Painel Administrativo</h1>
      <p class="subtitle">Gerencie as consultas da clínica</p>
    </div>

    <!-- Alerts -->
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
      <p>Carregando consultas...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="admin-content">
      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ totalAppointments }}</div>
          <div class="stat-label">Total de Consultas</div>
        </div>
        <div class="stat-card stat-scheduled">
          <div class="stat-number">{{ stats.agendada }}</div>
          <div class="stat-label">Agendadas</div>
        </div>
        <div class="stat-card stat-completed">
          <div class="stat-number">{{ stats.realizada }}</div>
          <div class="stat-label">Realizadas</div>
        </div>
        <div class="stat-card stat-canceled">
          <div class="stat-number">{{ stats.cancelada }}</div>
          <div class="stat-label">Canceladas</div>
        </div>
      </div>

      <!-- Filter and Search -->
      <div class="filter-section">
        <div class="filter-group">
          <label for="status-filter">Status:</label>
          <select v-model="filters.status" id="status-filter">
            <option value="">Todos</option>
            <option value="agendada">Agendada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="date-filter">Data:</label>
          <input v-model="filters.date" type="date" id="date-filter" />
        </div>

        <div class="filter-group">
          <label for="search">Buscar (Paciente/Médico):</label>
          <input
            v-model="filters.search"
            type="text"
            id="search"
            placeholder="Digite aqui..."
          />
        </div>

        <button @click="resetFilters" class="btn btn-secondary">
          Limpar Filtros
        </button>
      </div>

      <!-- Appointments Table -->
      <div class="table-container" v-if="filteredAppointments.length > 0">
        <table class="appointments-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Paciente</th>
              <th>Médico/Especialidade</th>
              <th>Endereço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in paginatedAppointments" :key="appointment._id" class="appointment-row">
              <td>{{ formatDate(appointment.date) }}</td>
              <td>{{ appointment.time }}</td>
              <td>
                <div class="patient-info">
                  <div class="patient-name">{{ appointment.patient?.name || 'N/A' }}</div>
                  <div class="patient-email">{{ appointment.patient?.email || 'N/A' }}</div>
                </div>
              </td>
              <td>{{ appointment.doctorName }}</td>
              <td>
                <div class="address-info">
                  {{ appointment.logradouro }}, {{ appointment.bairro }}
                  <br />
                  {{ appointment.cidade }} - {{ appointment.estado }}
                </div>
              </td>
              <td>
                <select
                  :value="appointment.estatus"
                  @change="(e) => updateStatus(appointment._id, e.target.value)"
                  class="status-select"
                  :class="`status-${appointment.estatus}`"
                >
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </td>
              <td>
                <div class="actions">
                  <button
                    @click="toggleDetails(appointment._id)"
                    class="btn btn-small btn-info"
                  >
                    {{ expandedId === appointment._id ? 'Ocultar' : 'Detalhes' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Expanded Details -->
        <div v-if="expandedId" class="expanded-details">
          <div v-for="appointment in filteredAppointments" :key="appointment._id">
            <div v-if="expandedId === appointment._id" class="detail-box">
              <h4>Detalhes da Consulta</h4>
              <div class="detail-row">
                <span class="label">CEP:</span>
                <span>{{ formatCep(appointment.cep) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Paciente Email:</span>
                <span>{{ appointment.patient?.email || 'N/A' }}</span>
              </div>
              <div v-if="appointment.weatherAlert" class="detail-row">
                <span class="label">Alerta de Clima:</span>
                <span class="weather-alert">{{ appointment.weatherAlert }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Data de Criação:</span>
                <span>{{ formatDateTime(appointment.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <h2>Nenhuma consulta encontrada</h2>
        <p>Não há consultas com os filtros selecionados.</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn btn-secondary"
        >
          ← Anterior
        </button>
        <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn btn-secondary"
        >
          Próximo →
        </button>
      </div>
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
const successMessage = ref('')
const errorMessage = ref('')
const expandedId = ref(null)
const currentPage = ref(1)
const itemsPerPage = 10

const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const filters = ref({
  status: '',
  date: '',
  search: '',
})

const stats = computed(() => {
  return {
    agendada: appointments.value.filter(a => a.estatus === 'agendada').length,
    realizada: appointments.value.filter(a => a.estatus === 'realizada').length,
    cancelada: appointments.value.filter(a => a.estatus === 'cancelada').length,
  }
})

const totalAppointments = computed(() => appointments.value.length)

const filteredAppointments = computed(() => {
  let result = appointments.value

  if (filters.value.status) {
    result = result.filter(a => a.estatus === filters.value.status)
  }

  if (filters.value.date) {
    result = result.filter(a => a.date === filters.value.date)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(a =>
      (a.doctorName?.toLowerCase().includes(search) ||
        a.patient?.name?.toLowerCase().includes(search) ||
        a.patient?.email?.toLowerCase().includes(search))
    )
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredAppointments.value.length / itemsPerPage)
})

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAppointments.value.slice(start, end)
})

onMounted(async () => {
  document.title = 'Admin | Clínica de Atendimento'
  await loadAppointments()
})

const loadAppointments = async () => {
  clearMessages()
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await authService.getAllAppointments()
    appointments.value = response.appointments || []
  } catch (error) {
    errorMessage.value = error.message || 'Não foi possível carregar consultas'
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (appointmentId, newStatus) => {
  clearMessages()

  try {
    await authService.updateAppointmentStatus(appointmentId, newStatus)
    successMessage.value = `Status atualizado para ${newStatus}`
    await loadAppointments()
  } catch (error) {
    errorMessage.value = error.message || 'Não foi possível atualizar status'
  }
}

const toggleDetails = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const resetFilters = () => {
  filters.value = {
    status: '',
    date: '',
    search: '',
  }
  currentPage.value = 1
}

const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR')
}

const formatCep = (cep) => {
  if (!cep) return ''
  const cleanCep = cep.replace(/\D/g, '')
  return cleanCep.slice(0, 5) + '-' + cleanCep.slice(5)
}
</script>

<style scoped>
.admin-container {
  max-width: 1400px;
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
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
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

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  border-left: 4px solid #007bff;
}

.stat-scheduled {
  border-left-color: #667eea;
}

.stat-completed {
  border-left-color: #84fab0;
}

.stat-canceled {
  border-left-color: #fa709a;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Filters */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #333;
}

.filter-group input,
.filter-group select {
  padding: 0.6rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
}

/* Table */
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: auto;
  margin-bottom: 2rem;
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
}

.appointments-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.appointments-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.appointments-table td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.appointment-row:hover {
  background-color: #f8f9fa;
}

.patient-info {
  line-height: 1.4;
}

.patient-name {
  font-weight: 600;
  color: #333;
}

.patient-email {
  font-size: 0.85rem;
  color: #666;
}

.address-info {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.4;
}

.status-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  font-weight: 600;
}

.status-agendada {
  border-color: #667eea;
  color: #667eea;
}

.status-realizada {
  border-color: #84fab0;
  color: #333;
}

.status-cancelada {
  border-color: #fa709a;
  color: #fa709a;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

/* Expanded Details */
.expanded-details {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-top: 2px solid #dee2e6;
}

.detail-box {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.detail-box h4 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  padding: 0.5rem 0;
}

.detail-row .label {
  font-weight: 600;
  color: #333;
}

.weather-alert {
  color: #ff6b6b;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.page-info {
  font-weight: 600;
  color: #333;
}

/* Buttons */
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-small {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
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

.btn-danger:hover {
  background-color: #c82333;
}

/* Footer */
.footer-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Media Queries */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .appointments-table {
    font-size: 0.9rem;
  }

  .appointments-table th,
  .appointments-table td {
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-section {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: auto;
  }

  .appointments-table {
    min-width: 600px;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }
}
</style>