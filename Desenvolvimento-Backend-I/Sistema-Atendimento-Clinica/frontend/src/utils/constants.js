export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const USER_ROLES = {
  PATIENT: 'patient',
  SECRETARY: 'secretary'
}

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'agendada',
  COMPLETED: 'realizada',
  CANCELLED: 'cancelada'
}

export const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'your_weather_api_key_here'