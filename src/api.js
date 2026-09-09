const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.error || 'Ocorreu um erro inesperado.')
  }

  return data
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  updateMe: (payload) => request('/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMe: () => request('/me', { method: 'DELETE' }),

  listMemories: () => request('/memories'),
  createMemory: (payload) => request('/memories', { method: 'POST', body: JSON.stringify(payload) }),
  updateMemory: (id, payload) => request(`/memories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMemory: (id) => request(`/memories/${id}`, { method: 'DELETE' }),

  listProjects: () => request('/projects'),
  createProject: (payload) => request('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  getProject: (id) => request(`/projects/${id}`),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  attachMemory: (projectId, memoryId) => request(`/projects/${projectId}/memories`, { method: 'POST', body: JSON.stringify({ memoryId }) }),
  detachMemory: (projectId, memoryId) => request(`/projects/${projectId}/memories/${memoryId}`, { method: 'DELETE' }),

  getPublicProject: (slug) => request(`/public/projects/${slug}`),

  upload: async (file) => {
    const formData = new FormData()
    formData.append('files', file)
    const result = await request('/upload', { method: 'POST', body: formData })
    return result.uploads?.[0] || result
  },
  uploadMultiple: async (files) => {
    if (!files || files.length === 0) return []
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    const result = await request('/upload', { method: 'POST', body: formData })
    return result.uploads || []
  },
}
