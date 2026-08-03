<template>
  <div class="schedule-container">
    <div class="header">
      <h1>Agendar Consulta</h1>
      <p class="subtitle">Preencha os dados abaixo para agendar sua consulta</p>
    </div>

    <!-- Alert de Sucesso -->
    <AlertBox v-if="successMessage" :message="successMessage" type="success" />

    <!-- Alert de Erro -->
    <AlertBox v-if="errorMessage" :message="errorMessage" type="error" />

    <!-- Formulário -->
    <form @submit.prevent="handleSubmit" class="appointment-form">
      <div class="form-group">
        <label for="doctor">Médico / Especialidade *</label>
        <input
          id="doctor"
          v-model="form.doctorName"
          type="text"
          placeholder="Ex: Dr. Silva ou Cardiologia"
          required
          @blur="validateDoctor"
        />
        <span v-if="fieldErrors.doctor" class="error-text">{{ fieldErrors.doctor }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="date">Data *</label>
          <input
            id="date"
            v-model="form.date"
            type="date"
            required
            @blur="validateDate"
          />
          <span v-if="fieldErrors.date" class="error-text">{{ fieldErrors.date }}</span>
        </div>

        <div class="form-group">
          <label for="time">Horário *</label>
          <input
            id="time"
            v-model="form.time"
            type="time"
            required
            @blur="validateTime"
          />
          <span v-if="fieldErrors.time" class="error-text">{{ fieldErrors.time }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="cep">CEP *</label>
        <div class="cep-input-group">
          <input
            id="cep"
            v-model="form.cep"
            type="text"
            placeholder="Ex: 01234-567"
            maxlength="9"
            @blur="handleCepChange"
          />
          <button
            v-if="!loadingCep"
            type="button"
            class="btn-search"
            @click="searchCep"
            :disabled="!form.cep || form.cep.length < 8"
          >
            Buscar
          </button>
          <div v-if="loadingCep" class="loading-spinner">Buscando...</div>
        </div>
        <span v-if="fieldErrors.cep" class="error-text">{{ fieldErrors.cep }}</span>
      </div>

      <!-- Campos preenchidos automaticamente -->
      <div v-if="form.logradouro" class="address-box">
        <h3>Endereço</h3>
        <div class="form-row">
          <div class="form-group read-only">
            <label>Logradouro</label>
            <input v-model="form.logradouro" type="text" readonly />
          </div>
          <div class="form-group read-only">
            <label>Bairro</label>
            <input v-model="form.bairro" type="text" readonly />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group read-only">
            <label>Cidade</label>
            <input v-model="form.cidade" type="text" readonly />
          </div>
          <div class="form-group read-only">
            <label>Estado</label>
            <input v-model="form.estado" type="text" readonly />
          </div>
        </div>

        <!-- Informações de Clima -->
        <div v-if="weatherInfo" class="weather-info">
          <div class="weather-icon">☁️</div>
          <div class="weather-text">
            <strong>Previsão do Tempo</strong>
            <p>{{ weatherInfo }}</p>
          </div>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? 'Agendando...' : 'Agendar Consulta' }}
        </button>
        <router-link to="/my-appointments" class="btn btn-secondary">
          Minhas Consultas
        </router-link>
      </div>

    </form>

    <!-- Resumo da Consulta -->
    <div v-if="appointmentData" class="appointment-summary">
      <h3>Consulta Agendada com Sucesso!</h3>
      <div class="summary-item">
        <strong>Médico/Especialidade:</strong> {{ appointmentData.doctorName }}
      </div>
      <div class="summary-item">
        <strong>Data:</strong> {{ formatDateTime(appointmentData.date) }}
      </div>
      <div class="summary-item">
        <strong>Horário:</strong> {{ appointmentData.time }}
      </div>
      <div class="summary-item">
        <strong>Endereço:</strong> {{ appointmentData.logradouro }}, {{ appointmentData.bairro }} - {{ appointmentData.cidade }}, {{ appointmentData.estado }}
      </div>
      <div v-if="appointmentData.weatherAlert" class="summary-item alert-info">
        <strong>Alerta:</strong> {{ appointmentData.weatherAlert }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/api'
import { useMessages } from '@/composables/useMessages'
import { formatDateTime, formatCep } from '@/composables/useFormatting'
import AlertBox from '@/components/AlertBox.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const { errorMessage, successMessage, loading, clearMessages, setError, setSuccess, setLoading } = useMessages()

const form = reactive({
  doctorName: '',
  date: '',
  time: '',
  cep: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  estado: '',
})

const fieldErrors = reactive({
  doctor: '',
  date: '',
  time: '',
  cep: '',
})

const loadingCep = ref(false)
const weatherInfo = ref('')
const appointmentData = ref(null)

// Validação
const validateDoctor = () => {
  if (!form.doctorName.trim()) {
    fieldErrors.doctor = 'Campo obrigatório'
  } else if (form.doctorName.trim().length < 3) {
    fieldErrors.doctor = 'Mínimo 3 caracteres'
  } else {
    fieldErrors.doctor = ''
  }
}

const validateDate = () => {
  if (!form.date) {
    fieldErrors.date = 'Data é obrigatória'
    return
  }

  const selectedDate = new Date(form.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (selectedDate < today) {
    fieldErrors.date = 'Data não pode ser no passado'
  } else {
    fieldErrors.date = ''
  }
}

const validateTime = () => {
  if (!form.time) {
    fieldErrors.time = 'Horário é obrigatório'
  } else {
    fieldErrors.time = ''
  }
}

const validateCep = () => {
  const cepRegex = /^\d{5}-?\d{3}$/
  if (!form.cep) {
    fieldErrors.cep = 'CEP é obrigatório'
    return false
  }
  if (!cepRegex.test(form.cep)) {
    fieldErrors.cep = 'CEP inválido (formato: 12345-678)'
    return false
  }
  fieldErrors.cep = ''
  return true
}

const isFormValid = computed(() => {
  return (
    form.doctorName.trim() &&
    form.date &&
    form.time &&
    form.cep &&
    form.logradouro &&
    !fieldErrors.doctor &&
    !fieldErrors.date &&
    !fieldErrors.time &&
    !fieldErrors.cep
  )
})

// Buscar CEP
const searchCep = async () => {
  clearMessages()

  if (!validateCep()) {
    return
  }

  loadingCep.value = true
  errorMessage.value = ''

  try {
    const cleanCep = form.cep.replace(/\D/g, '')
    const response = await authService.getAddressByCep(cleanCep)

    form.logradouro = response.logradouro || ''
    form.bairro = response.bairro || ''
    form.cidade = response.localidade || ''
    form.estado = response.uf || ''
    weatherInfo.value = `Previsão para ${response.localidade}, ${response.uf}`

    fieldErrors.cep = ''
  } catch (error) {
    errorMessage.value = error.message || 'CEP não encontrado'
    fieldErrors.cep = 'CEP inválido ou não encontrado'
    form.logradouro = ''
    form.bairro = ''
    form.cidade = ''
    form.estado = ''
    weatherInfo.value = ''
  } finally {
    loadingCep.value = false
  }
}

const handleCepChange = () => {
  if (form.cep.length === 8 && /^\d{5}\d{3}$/.test(form.cep)) {
    const formatted = form.cep.slice(0, 5) + '-' + form.cep.slice(5)
    form.cep = formatted
  }
}

// Enviar formulário
const handleSubmit = async () => {
  clearMessages()
  validateDoctor()
  validateDate()
  validateTime()

  if (!isFormValid.value) {
    setError('Preencha todos os campos corretamente')
    return
  }

  setLoading(true)

  try {
    const appointmentPayload = {
      date: form.date,
      time: form.time,
      doctorName: form.doctorName,
      cep: form.cep.replace(/\D/g, ''),
    }

    const response = await authService.createAppointment(appointmentPayload)

    appointmentData.value = response.appointment
    setSuccess('Consulta agendada com sucesso!')

    // Limpar formulário
    setTimeout(() => {
      form.doctorName = ''
      form.date = ''
      form.time = ''
      form.cep = ''
      form.logradouro = ''
      form.bairro = ''
      form.cidade = ''
      form.estado = ''
      weatherInfo.value = ''
    }, 2000)
  } catch (error) {
    const message = error.message || 'Erro ao agendar consulta'
    setError(message)

    if (message.includes('indisponível')) {
      fieldErrors.time = 'Este horário já está ocupado'
    }
  } finally {
    setLoading(false)
  }
}

onMounted(() => {
  document.title = 'Agendar Consulta | Clínica de Atendimento'
  clearMessages()
})
</script>

<style scoped>
.schedule-container {
  max-width: 800px;
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

/* Formulário */
.appointment-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-group.read-only input {
  background-color: #f9f9f9;
}

.error-text {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.cep-input-group {
  display: flex;
  gap: 0.5rem;
}

.cep-input-group input {
  flex: 1;
}

.btn-search {
  padding: 0.75rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-search:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-search:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #666;
  font-size: 0.9rem;
}

/* Address Box */
.address-box {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #007bff;
}

.address-box h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 1rem;
}

/* Weather Info */
.weather-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: #e3f2fd;
  border-radius: 6px;
  margin-top: 1rem;
}

.weather-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.weather-text {
  flex: 1;
}

.weather-text strong {
  display: block;
  color: #1976d2;
  margin-bottom: 0.25rem;
}

.weather-text p {
  margin: 0;
  color: #555;
  font-size: 0.9rem;
}

/* Botões de Ação */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

/* Resumo da Consulta */
.appointment-summary {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #28a745;
}

.appointment-summary h3 {
  color: #28a745;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.summary-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  color: #555;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item strong {
  color: #333;
  display: inline-block;
  min-width: 150px;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

/* Media Queries */
@media (max-width: 768px) {
  .schedule-container {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .cep-input-group {
    flex-direction: column;
  }

  .cep-input-group input,
  .btn-search {
    width: 100%;
  }
}
</style>