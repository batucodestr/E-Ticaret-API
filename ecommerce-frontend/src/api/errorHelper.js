/**
 * Parses API errors from the custom Django exception handler.
 *
 * Backend always returns:
 *   { success: false, error: { message: string | object, status_code: number } }
 *
 * When validation fails, message is an object:
 *   { field_name: ["error text", ...], ... }
 */
export function getApiError(err, fallback = 'Bir hata oluştu.') {
  const data = err?.response?.data
  if (!data) return fallback

  const errMsg = data?.error?.message

  if (errMsg !== undefined && errMsg !== null) {
    if (typeof errMsg === 'string') return errMsg

    if (typeof errMsg === 'object') {
      return Object.entries(errMsg)
        .map(([field, msgs]) => {
          const label = field === 'non_field_errors' ? '' : `${field}: `
          const text = Array.isArray(msgs) ? msgs.join(', ') : String(msgs)
          return `${label}${text}`
        })
        .join('\n')
    }
  }

  if (typeof data?.detail === 'string') return data.detail
  if (typeof data === 'string') return data

  return fallback
}
