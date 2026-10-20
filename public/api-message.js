// API errors may be plain strings or structured objects. Only human-readable
// message fields belong in the interface; coercing an object hides the error.
export function apiErrorMessage(value, fallback = 'This request could not be completed. Please try again.') {
  const readable = candidate => typeof candidate === 'string' && candidate.trim() && candidate.trim() !== '[object Object]' ? candidate.trim() : '';
  if (readable(value)) return readable(value);
  if (!value || typeof value !== 'object') return fallback;
  for (const candidate of [value.error?.message, value.error?.detail, value.error, value.message, value.detail]) {
    const message = readable(candidate);
    if (message) return message;
  }
  return fallback;
}
