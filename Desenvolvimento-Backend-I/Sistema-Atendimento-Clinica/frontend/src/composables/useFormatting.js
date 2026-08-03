export function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

export function formatDateTime(dateString) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCep(cep) {
  if (!cep) return ''
  const cleanCep = cep.replace(/\D/g, '')
  return cleanCep.slice(0, 5) + '-' + cleanCep.slice(5)
}

export function formatStatus(status) {
  const statusMap = {
    agendada: '📅 Agendada',
    realizada: '✅ Realizada',
    cancelada: '❌ Cancelada',
  }
  return statusMap[status] || status
}