// Small shared validation/sanitization helpers used across routes.

export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function cleanText(value, maxLength = 500) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

export function cleanSlugPart(value) {
  return cleanText(value, 60)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function cleanTags(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((tag) => typeof tag === 'string')
    .map((tag) => cleanText(tag, 30))
    .filter(Boolean)
    .slice(0, 15)
}

export function publicUser(user) {
  if (!user) return null
  const { passwordHash: _passwordHash, ...safe } = user
  return safe
}
