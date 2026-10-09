
const asText = (value) => (Array.isArray(value) ? value.join(' ') : String(value))

export function getFieldErrors(error) {
  const data = error?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  return Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => key !== 'detail')
      .map(([key, value]) => [key, asText(value)]),
  )
}

export function getErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.',
) {
  if (!error) return fallback
  if (error.status === 'FETCH_ERROR')
    return 'Cannot reach the server. Check your connection.'
  if (error.status === 'TIMEOUT_ERROR') return 'The server took too long to respond.'

  const data = error.data
  if (typeof data === 'string' && data.length < 200 && !data.startsWith('<')) return data
  if (data?.detail) return asText(data.detail)
  if (data?.non_field_errors) return asText(data.non_field_errors)

  const first = Object.values(getFieldErrors(error))[0]
  return first || fallback
}
