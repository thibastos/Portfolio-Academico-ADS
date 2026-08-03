import { ref } from 'vue'

export function useMessages() {
  const errorMessage = ref('')
  const successMessage = ref('')
  const loading = ref(false)

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const setError = (message) => {
    clearMessages()
    errorMessage.value = message
  }

  const setSuccess = (message) => {
    clearMessages()
    successMessage.value = message
  }

  const setLoading = (value) => {
    loading.value = value
  }

  return {
    errorMessage,
    successMessage,
    loading,
    clearMessages,
    setError,
    setSuccess,
    setLoading
  }
}