import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'

const sidebarItems = [
  { key: 'inicio', label: '🏠 Início' },
  { key: 'memorias', label: '❤️ Memórias' },
  { key: 'timeline', label: '🗓️ Timeline' },
  { key: 'projetos', label: '🌐 Projetos' },
  { key: 'perfil', label: '👤 Perfil' },
  { key: 'config', label: '⚙️ Configurações' },
]

const projectTypes = [
  { name: 'Relacionamento', icon: '❤️' },
  { name: 'Viagem', icon: '✈️' },
  { name: 'Família', icon: '👨‍👩‍👧' },
  { name: 'Minha trajetória', icon: '🎓' },
  { name: 'Evento', icon: '🎂' },
  { name: 'Álbum', icon: '📸' },
  { name: 'Diário', icon: '📝' },
  { name: 'Personalizado', icon: '✨' },
]

const templates = ['Romantic', 'Travel', 'Family', 'Memories', 'Minimal', 'Classic', 'Journal']

const filterOptions = [
  { key: 'todas', label: 'todas' },
  { key: 'image', label: 'fotos' },
  { key: 'video', label: 'vídeos' },
  { key: 'Viagem', label: 'viagens' },
  { key: 'Evento', label: 'eventos' },
  { key: 'favorite', label: 'favoritos' },
]

const EMPTY_MEMORY = {
  title: '', date: '', location: '', description: '', category: 'Evento', people: '', tags: '', favorite: false,
}

const EMPTY_PROJECT = { name: '', description: '', template: 'Memories', visibility: 'private' }

function formatDate(value) {
  if (!value) return 'sem data'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match) {
    const [, year, month, day] = match
    return `${day}/${month}/${year}`
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
}

function yearOf(value) {
  const match = /^(\d{4})-/.exec(value || '')
  if (match) return Number(match[1])
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'Sem data' : parsed.getFullYear()
}

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [activeNav, setActiveNav] = useState(() => {
    const saved = window.localStorage.getItem('memora-dashboard-tab')
    return saved || 'inicio'
  })
  const [memories, setMemories] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [notice, setNotice] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [memoryFilter, setMemoryFilter] = useState('todas')
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [editingMemoryId, setEditingMemoryId] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [memoryForm, setMemoryForm] = useState(EMPTY_MEMORY)
  const [memoryFile, setMemoryFile] = useState(null)
  const [memoryFiles, setMemoryFiles] = useState([])
  const [memoryLogo, setMemoryLogo] = useState(null)
  const [memoryCover, setMemoryCover] = useState(null)
  const [cropBaseImage, setCropBaseImage] = useState(null)
  const [memoryOriginalSource, setMemoryOriginalSource] = useState(null)
  const [memoryLogoRemoved, setMemoryLogoRemoved] = useState(false)
  const [memoryCoverRemoved, setMemoryCoverRemoved] = useState(false)
  const [memoryLogoPosition, setMemoryLogoPosition] = useState({ x: 50, y: 50 })
  const [memoryCoverPosition, setMemoryCoverPosition] = useState({ x: 50, y: 50 })
  const [savingMemory, setSavingMemory] = useState(false)
  const [cropTarget, setCropTarget] = useState('profile')
  const [cropEditorOpen, setCropEditorOpen] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState('')
  const [cropBox, setCropBox] = useState({ x: 18, y: 18, width: 64, height: 64 })
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const cropStageRef = useRef(null)
  const cropInteractionRef = useRef(null)

  const [projectType, setProjectType] = useState(null)
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT)
  const [savingProject, setSavingProject] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const saved = window.localStorage.getItem('memora-dashboard-project')
    return saved || null
  })
  const [projectDetail, setProjectDetail] = useState(null)
  const [projectTab, setProjectTab] = useState(() => {
    const saved = window.localStorage.getItem('memora-dashboard-project-tab')
    return saved || 'edit'
  })
  const [projectEditor, setProjectEditor] = useState({ name: '', description: '', template: 'Memories', visibility: 'private' })
  const [attachMemoryId, setAttachMemoryId] = useState('')

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' })

  const loadAll = async () => {
    setLoading(true)
    try {
      const [memoriesData, projectsData] = await Promise.all([api.listMemories(), api.listProjects()])
      setMemories(memoriesData.memories)
      setProjects(projectsData.projects)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, bio: user.bio || '' })
  }, [user])

  useEffect(() => {
    window.localStorage.setItem('memora-dashboard-tab', activeNav)
  }, [activeNav])

  useEffect(() => {
    if (selectedProjectId) {
      window.localStorage.setItem('memora-dashboard-project', selectedProjectId)
    } else {
      window.localStorage.removeItem('memora-dashboard-project')
    }
  }, [selectedProjectId])

  useEffect(() => {
    window.localStorage.setItem('memora-dashboard-project-tab', projectTab)
  }, [projectTab])

  useEffect(() => {
    if (!notice) return

    const timeoutId = window.setTimeout(() => {
      setNotice('')
    }, 4000)

    return () => window.clearTimeout(timeoutId)
  }, [notice])

  useEffect(() => {
    setNotice('')
  }, [activeNav])

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectDetail(null)
      return
    }
    api.getProject(selectedProjectId)
      .then((detail) => {
        setProjectDetail(detail)
        setProjectEditor({
          name: detail.project.name,
          description: detail.project.description || '',
          template: detail.project.template || 'Memories',
          visibility: detail.project.visibility || 'private',
        })
      })
      .catch((err) => setErrorMsg(err.message))
  }, [selectedProjectId])

  const stats = useMemo(() => {
    const photos = memories.filter((memory) => memory.mediaType === 'image').length
    const videos = memories.filter((memory) => memory.mediaType === 'video').length
    return {
      memories: memories.length,
      projects: projects.length,
      photos,
      videos,
      last: memories.find((memory) => memory.mediaUrl) || memories[0],
    }
  }, [memories, projects])

  const filteredMemories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    let result = memories

    if (memoryFilter === 'favorite') result = result.filter((memory) => memory.favorite)
    else if (memoryFilter === 'image' || memoryFilter === 'video') result = result.filter((memory) => memory.mediaType === memoryFilter)
    else if (memoryFilter !== 'todas') result = result.filter((memory) => memory.category === memoryFilter)

    if (!normalizedSearch) return result

    return result.filter((memory) => {
      const values = [
        memory.title,
        memory.description,
        memory.location,
        memory.category,
        memory.people,
        ...(memory.tags || [])
      ].filter(Boolean).join(' ').toLowerCase()
      return values.includes(normalizedSearch)
    })
  }, [memories, memoryFilter, searchTerm])

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    let result = projects

    if (!normalizedSearch) return result

    return result.filter((project) => {
      const values = [project.name, project.description, project.type, project.slug].filter(Boolean).join(' ').toLowerCase()
      return values.includes(normalizedSearch)
    })
  }, [projects, searchTerm])

  const timelineByYear = useMemo(() => {
    const groups = new Map()
    for (const memory of memories) {
      const year = memory.date ? yearOf(memory.date) : 'Sem data'
      if (!groups.has(year)) groups.set(year, [])
      groups.get(year).push(memory)
    }
    return Array.from(groups.entries()).sort((a, b) => Number(a[0]) - Number(b[0]))
  }, [memories])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const hasProfileImage = Boolean(!memoryLogoRemoved && (memoryLogo || (editingMemoryId && memories.find((memory) => memory.id === editingMemoryId)?.mediaUrl)))
  const hasCoverImage = Boolean(!memoryCoverRemoved && (memoryCover || (editingMemoryId && memories.find((memory) => memory.id === editingMemoryId)?.coverUrl)))
  const showProfileActions = Boolean(memoryLogo || (!memoryLogoRemoved && editingMemoryId && memories.find((memory) => memory.id === editingMemoryId)?.mediaUrl) || memoryLogoRemoved)
  const showCoverActions = Boolean(memoryCover || (!memoryCoverRemoved && editingMemoryId && memories.find((memory) => memory.id === editingMemoryId)?.coverUrl) || memoryCoverRemoved)
  const showProfilePreview = !memoryLogoRemoved && hasProfileImage
  const showCoverPreview = !memoryCoverRemoved && hasCoverImage

  const clearMemoryImage = (target) => {
    if (target === 'cover') {
      setMemoryCover(null)
      setMemoryCoverRemoved(true)
      setMemoryCoverPosition({ x: 50, y: 50 })

      if (editingMemoryId) {
        setMemories((prev) => prev.map((memory) => memory.id === editingMemoryId
          ? { ...memory, coverUrl: '', coverType: '', coverPosition: '50% 50%' }
          : memory))
      }
      return
    }

    setMemoryLogo(null)
    setMemoryLogoRemoved(true)
    setMemoryLogoPosition({ x: 50, y: 50 })

    if (editingMemoryId) {
      setMemories((prev) => prev.map((memory) => memory.id === editingMemoryId
        ? { ...memory, mediaUrl: '', mediaType: '', mediaPosition: '50% 50%' }
        : memory))
    }
  }

  const getMemoryPreviewUrl = () => {
    if (memoryLogo) return URL.createObjectURL(memoryLogo)
    if (memoryLogoRemoved) return ''
    if (editingMemoryId) {
      const currentMemory = memories.find((memory) => memory.id === editingMemoryId)
      return currentMemory?.mediaUrl || ''
    }
    return ''
  }

  const getMemoryCoverPreviewUrl = () => {
    if (memoryCover) return URL.createObjectURL(memoryCover)
    if (memoryCoverRemoved) return ''
    if (editingMemoryId) {
      const currentMemory = memories.find((memory) => memory.id === editingMemoryId)
      return currentMemory?.coverUrl || currentMemory?.mediaUrl || ''
    }
    return ''
  }

  const getMemoryThumbUrl = (memory) => memory?.mediaUrl || ''
  const getMemoryCoverUrl = (memory) => memory?.coverUrl || memory?.mediaUrl || ''

  const getMemoryBackgroundStyle = (memory, fallbackPosition = 'center') => {
    const imageUrl = getMemoryThumbUrl(memory)
    const position = typeof memory?.mediaPosition === 'string' && memory.mediaPosition.trim()
      ? memory.mediaPosition
      : fallbackPosition

    return imageUrl
      ? {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: position,
          backgroundRepeat: 'no-repeat',
        }
      : undefined
  }

  const getMemoryVisualBackgroundStyle = (memory, fallbackPosition = 'center') => {
    const imageUrl = getMemoryCoverUrl(memory)
    const position = typeof memory?.coverPosition === 'string' && memory.coverPosition.trim()
      ? memory.coverPosition
      : fallbackPosition

    return imageUrl
      ? {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: position,
          backgroundRepeat: 'no-repeat',
        }
      : undefined
  }

  const syncMemoryList = (updatedMemory) => {
    setMemories((prev) => {
      const exists = prev.some((entry) => entry.id === updatedMemory.id)
      if (!exists) return [updatedMemory, ...prev]
      return prev.map((entry) => (entry.id === updatedMemory.id ? updatedMemory : entry))
    })
  }

  const resetMemoryModal = () => {
    setShowMemoryModal(false)
    setEditingMemoryId(null)
    setMemoryForm(EMPTY_MEMORY)
    setMemoryFile(null)
    setMemoryFiles([])
    setMemoryLogo(null)
    setMemoryCover(null)
    setCropBaseImage(null)
    setMemoryOriginalSource(null)
    setMemoryLogoRemoved(false)
    setMemoryCoverRemoved(false)
    setMemoryLogoPosition({ x: 50, y: 50 })
    setMemoryCoverPosition({ x: 50, y: 50 })
    setCropTarget('profile')
  }

  const openMemoryEditor = (memory) => {
    setEditingMemoryId(memory.id)
    setMemoryForm({
      title: memory.title || '',
      date: memory.date || '',
      location: memory.location || '',
      description: memory.description || '',
      category: memory.category || 'Evento',
      people: memory.people || '',
      tags: Array.isArray(memory.tags) ? memory.tags.join(', ') : '',
      favorite: Boolean(memory.favorite),
    })

    const parsedPosition = typeof memory.mediaPosition === 'string' && memory.mediaPosition.includes('%')
      ? memory.mediaPosition.split(' ').map((part) => Number.parseInt(part, 10)).filter((value) => !Number.isNaN(value))
      : []

    const nextX = parsedPosition[0] ?? 50
    const nextY = parsedPosition[1] ?? 50
    setMemoryLogoPosition({ x: nextX, y: nextY })
    setMemoryCoverPosition(typeof memory.coverPosition === 'string' && memory.coverPosition.includes('%')
      ? {
          x: Number.parseInt(memory.coverPosition.split(' ')[0], 10) || 50,
          y: Number.parseInt(memory.coverPosition.split(' ')[1], 10) || 50,
        }
      : { x: 50, y: 50 })
    setMemoryLogo(null)
    setMemoryCover(null)
    setMemoryLogoRemoved(false)
    setMemoryCoverRemoved(false)
    setMemoryFiles([])
    setShowMemoryModal(true)
  }

  const handleMemorySubmit = async (event) => {
    event.preventDefault()
    setSavingMemory(true)
    setErrorMsg('')
    try {
      let mediaUrl = ''
      let mediaType = ''
      let coverUrl = ''
      let coverType = ''
      const uploads = []

      if (memoryLogo) {
        const upload = await api.upload(memoryLogo)
        mediaUrl = upload.url
        mediaType = upload.mediaType
        uploads.push(upload)
      }

      if (memoryCover) {
        const upload = await api.upload(memoryCover)
        coverUrl = upload.url
        coverType = upload.mediaType
        uploads.push(upload)
      }

      if (memoryLogoRemoved && editingMemoryId) {
        mediaUrl = ''
        mediaType = ''
      }

      if (memoryCoverRemoved && editingMemoryId) {
        coverUrl = ''
        coverType = ''
      }

      if (memoryFiles.length > 0) {
        const uploaded = await api.uploadMultiple(memoryFiles)
        uploaded.forEach((item) => uploads.push(item))
        if (!mediaUrl && uploaded[0]) {
          mediaUrl = uploaded[0].url
          mediaType = uploaded[0].mediaType
        }
      }

      const currentMemory = editingMemoryId ? memories.find((memory) => memory.id === editingMemoryId) : null

      const payload = {
        ...memoryForm,
        tags: memoryForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        mediaUrl: mediaUrl || currentMemory?.mediaUrl || '',
        mediaType: mediaType || currentMemory?.mediaType || '',
        coverUrl: coverUrl || currentMemory?.coverUrl || '',
        coverType: coverType || currentMemory?.coverType || '',
        mediaPosition: `${memoryLogoPosition.x}% ${memoryLogoPosition.y}%`,
        coverPosition: `${memoryCoverPosition.x}% ${memoryCoverPosition.y}%`,
        gallery: uploads.length > 0
          ? uploads.map((item) => ({ url: item.url, mediaType: item.mediaType }))
          : currentMemory?.gallery || [],
      }

      if (editingMemoryId) {
        const { memory } = await api.updateMemory(editingMemoryId, payload)
        syncMemoryList(memory)
        setNotice('Memória atualizada com sucesso.')
      } else {
        const { memory } = await api.createMemory(payload)
        syncMemoryList(memory)
        setNotice('Memória salva com sucesso.')
      }

      resetMemoryModal()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSavingMemory(false)
    }
  }

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setSavingProject(true)
    setErrorMsg('')
    try {
      const { project } = await api.createProject({ ...projectForm, type: projectType.name })
      setProjects((prev) => [project, ...prev])
      setProjectType(null)
      setProjectForm(EMPTY_PROJECT)
      setSelectedProjectId(project.id)
      setProjectDetail(null)
      setProjectTab('edit')
      setNotice('Projeto criado com sucesso.')
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSavingProject(false)
    }
  }

  const handleAttachMemory = async () => {
    if (!attachMemoryId || !selectedProjectId) return
    await api.attachMemory(selectedProjectId, attachMemoryId)
    const detail = await api.getProject(selectedProjectId)
    setProjectDetail(detail)
    setProjects((prev) => prev.map((project) => (project.id === detail.project.id ? detail.project : project)))
    setAttachMemoryId('')
  }

  const handleDetachMemory = async (memoryId) => {
    await api.detachMemory(selectedProjectId, memoryId)
    const detail = await api.getProject(selectedProjectId)
    setProjectDetail(detail)
    setProjects((prev) => prev.map((project) => (project.id === detail.project.id ? detail.project : project)))
  }

  const handleProjectUpdate = async (event) => {
    event.preventDefault()
    if (!selectedProjectId) return

    try {
      const { project: updated } = await api.updateProject(selectedProjectId, projectEditor)
      setProjects((prev) => prev.map((project) => (project.id === updated.id ? updated : project)))
      setProjectDetail((prev) => (prev ? { ...prev, project: updated } : prev))
      setProjectEditor({
        name: updated.name,
        description: updated.description || '',
        template: updated.template || 'Memories',
        visibility: updated.visibility || 'private',
      })
      setSelectedProjectId(null)
      setProjectDetail(null)
      setProjectTab('edit')
      setNotice('Projeto atualizado com sucesso.')
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleDeleteMemory = (memoryId) => {
    const memory = memories.find((entry) => entry.id === memoryId)
    if (!memory) return

    setConfirmTarget({
      type: 'memory',
      id: memoryId,
      title: memory.title,
      message: `Tem certeza que deseja excluir a memória “${memory.title}”? Esta ação remove o registro por completo.`,
    })
  }

  const handleDeleteProject = (projectId) => {
    const project = projects.find((entry) => entry.id === projectId)
    if (!project) return

    setConfirmTarget({
      type: 'project',
      id: projectId,
      title: project.name,
      message: `Tem certeza que deseja excluir o projeto “${project.name}” e todas as conexões relacionadas?`,
    })
  }

  const confirmDeleteAction = async () => {
    if (!confirmTarget) return

    try {
      if (confirmTarget.type === 'memory') {
        await api.deleteMemory(confirmTarget.id)
        setMemories((prev) => prev.filter((entry) => entry.id !== confirmTarget.id))
        if (selectedProjectId) {
          const detail = await api.getProject(selectedProjectId)
          setProjectDetail(detail)
          setProjects((prev) => prev.map((project) => (project.id === detail.project.id ? detail.project : project)))
        }
        setNotice('Memória excluída com sucesso.')
      } else {
        await api.deleteProject(confirmTarget.id)
        setProjects((prev) => prev.filter((entry) => entry.id !== confirmTarget.id))
        if (selectedProjectId === confirmTarget.id) {
          setSelectedProjectId(null)
          setProjectDetail(null)
        }
        setNotice('Projeto excluído com sucesso.')
      }
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setConfirmTarget(null)
    }
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    const { user: updated } = await api.updateMe(profileForm)
    refreshUser(updated)
    setNotice('Perfil atualizado.')
  }

  const handleExport = async () => {
    const response = await fetch('/api/me/export', { credentials: 'include' })
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'memora-dados.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta e todos os dados? Esta ação é irreversível.')) return
    await api.deleteMe()
    navigate('/')
  }

  const initials = (user?.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

  const openCropEditor = (target, file = null) => {
    const sourceTarget = target === 'cover' ? memoryCover : memoryLogo
    const currentMemory = editingMemoryId ? memories.find((memory) => memory.id === editingMemoryId) : null
    const selectedFile = file || sourceTarget || (target === 'cover' ? currentMemory?.coverUrl || null : currentMemory?.mediaUrl || null)
    const source = selectedFile instanceof File
      ? URL.createObjectURL(selectedFile)
      : selectedFile
        ? selectedFile
        : ''

    if (!source) return

    const baseSource = selectedFile instanceof File ? selectedFile : (cropBaseImage || memoryOriginalSource || null)
    const editorSource = baseSource instanceof File ? URL.createObjectURL(baseSource) : baseSource || source

    setCropBaseImage(baseSource || selectedFile)
    setMemoryOriginalSource(baseSource || selectedFile)
    setCropTarget(target)
    if (target === 'cover') {
      setMemoryCoverRemoved(false)
      if (selectedFile instanceof File) setMemoryCover(selectedFile)
    } else {
      setMemoryLogoRemoved(false)
      if (selectedFile instanceof File) setMemoryLogo(selectedFile)
    }

    setCropImageUrl(editorSource)
    setCropOffset({ x: 0, y: 0 })
    setCropBox({ x: 12, y: 12, width: 76, height: 76 })
    setCropEditorOpen(true)
  }

  const handleMemoryImageSelect = (event, target = 'profile') => {
    const file = event.target.files?.[0] || null
    if (!file) return

    if (target === 'cover') {
      setMemoryCover(file)
      setMemoryCoverRemoved(false)
    } else {
      setMemoryLogo(file)
      setMemoryLogoRemoved(false)
    }

    setCropBaseImage(file)
    setMemoryOriginalSource(file)
    setCropTarget(target)
    setCropImageUrl(URL.createObjectURL(file))
    setCropOffset({ x: 0, y: 0 })
    setCropBox({ x: 12, y: 12, width: 76, height: 76 })
    setCropEditorOpen(true)
    event.target.value = ''
  }

  const closeCropEditor = () => {
    setCropEditorOpen(false)
    setCropImageUrl('')
    setCropBox({ x: 12, y: 12, width: 76, height: 76 })
    setCropOffset({ x: 0, y: 0 })
    cropInteractionRef.current = null
  }

  const handleCropPointerDown = (event, mode = 'move') => {
    event.preventDefault()
    event.stopPropagation()
    cropInteractionRef.current = { mode, startX: event.clientX, startY: event.clientY, startBox: { ...cropBox }, startOffset: { ...cropOffset } }
  }

  const handleCropPointerMove = (event) => {
    if (!cropInteractionRef.current || !cropStageRef.current) return

    const { mode, startX, startY, startBox, startOffset } = cropInteractionRef.current
    const stage = cropStageRef.current
    const dx = ((event.clientX - startX) / stage.clientWidth) * 100
    const dy = ((event.clientY - startY) / stage.clientHeight) * 100

    if (mode === 'move') {
      const nextX = clamp(startBox.x + dx, 0, 100 - startBox.width)
      const nextY = clamp(startBox.y + dy, 0, 100 - startBox.height)
      setCropBox((prev) => ({ ...prev, x: nextX, y: nextY }))
      return
    }

    if (mode === 'pan') {
      setCropOffset({
        x: clamp(startOffset.x + (event.clientX - startX) * 0.9, -180, 180),
        y: clamp(startOffset.y + (event.clientY - startY) * 0.9, -180, 180),
      })
      return
    }

    const handleName = mode
    const nextBox = { ...startBox }
    if (handleName.includes('e')) nextBox.width = clamp(startBox.width + dx, 20, 100 - startBox.x)
    if (handleName.includes('s')) nextBox.height = clamp(startBox.height + dy, 20, 100 - startBox.y)
    if (handleName.includes('w')) {
      const diff = clamp(startBox.width - dx, 20, startBox.x + startBox.width)
      nextBox.x = clamp(startBox.x + (startBox.width - diff), 0, startBox.x + startBox.width - 20)
      nextBox.width = diff
    }
    if (handleName.includes('n')) {
      const diff = clamp(startBox.height - dy, 20, startBox.y + startBox.height)
      nextBox.y = clamp(startBox.y + (startBox.height - diff), 0, startBox.y + startBox.height - 20)
      nextBox.height = diff
    }

    setCropBox(nextBox)
  }

  const handleCropPointerUp = () => {
    cropInteractionRef.current = null
  }

  const applyCrop = async () => {
    if (!cropImageUrl) return

    const baseSource = cropBaseImage || memoryOriginalSource || (cropTarget === 'cover' ? memoryCover : memoryLogo) || (editingMemoryId ? memories.find((memory) => memory.id === editingMemoryId)?.[cropTarget === 'cover' ? 'coverUrl' : 'mediaUrl'] || null : null)
    const image = await loadImage(baseSource instanceof File ? URL.createObjectURL(baseSource) : baseSource)
    const canvas = document.createElement('canvas')
    const cropX = Math.max(0, Math.round((image.naturalWidth * cropBox.x) / 100))
    const cropY = Math.max(0, Math.round((image.naturalHeight * cropBox.y) / 100))
    const cropWidth = Math.max(1, Math.round((image.naturalWidth * cropBox.width) / 100))
    const cropHeight = Math.max(1, Math.round((image.naturalHeight * cropBox.height) / 100))

    canvas.width = cropWidth
    canvas.height = cropHeight

    const context = canvas.getContext('2d')
    context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) return

    const nextFile = new File([blob], (cropBaseImage instanceof File ? cropBaseImage.name : memoryLogo?.name) || 'memory-crop.jpg', {
      type: 'image/jpeg',
    })

    if (cropTarget === 'cover') {
      setMemoryCover(nextFile)
      setMemoryCoverPosition({ x: 50, y: 50 })
    } else {
      setMemoryLogo(nextFile)
      setMemoryLogoPosition({ x: 50, y: 50 })
    }
    setCropBaseImage(baseSource)
    setMemoryOriginalSource(baseSource)
    closeCropEditor()
  }

  const renderContent = () => {
    if (loading) return <div className="panel-box full-panel">Carregando sua história...</div>

    switch (activeNav) {
      case 'inicio':
        return (
          <>
            <div className="dashboard-header" data-reveal="up"><div className="dashboard-greeting"><span className="eyebrow dark">Dashboard</span><h2>Olá, {user?.name?.split(' ')[0]} ❤️</h2><p>Seu espaço pessoal para guardar histórias, fotos e projetos importantes.</p></div><button type="button" className="primary-button" onClick={() => setShowMemoryModal(true)}>+ Nova Memória</button></div>
            <div className="stats-grid"><div className="metric-card" data-reveal="up"><div className="metric-icon">❤️</div><div><span>Memórias</span><strong>{stats.memories}</strong></div></div><div className="metric-card" data-reveal="up"><div className="metric-icon">🌐</div><div><span>Projetos</span><strong>{stats.projects}</strong></div></div><div className="metric-card" data-reveal="up"><div className="metric-icon">📸</div><div><span>Fotos</span><strong>{stats.photos}</strong></div></div><div className="metric-card" data-reveal="up"><div className="metric-icon">🎥</div><div><span>Vídeos</span><strong>{stats.videos}</strong></div></div></div>
            <div className="content-two-col"><div className="panel-box"><h3>Última memória</h3>{stats.last ? (<div className="memory-highlight"><div className="memory-visual" aria-label="Capa da última memória"><div className="memory-visual-image" style={getMemoryVisualBackgroundStyle(stats.last, 'center')} /><div className="memory-visual-overlay" /><button type="button" className="memory-visual-edit" onClick={() => openMemoryEditor(stats.last)}>Editar foto</button></div><div><strong>{stats.last.title}</strong><p>{formatDate(stats.last.date)} · {stats.last.location || 'local não informado'}</p><span>Categoria: {stats.last.category}</span></div></div>) : (<p>Você ainda não guardou nenhuma memória. Comece agora.</p>)}</div><div className="panel-box" data-reveal="up"><h3>Crie seu próximo projeto</h3><p>Quer guardar sua próxima viagem? Ou criar a história do seu relacionamento?</p><button type="button" className="secondary-button full-width" onClick={() => setActiveNav('projetos')}>+ Criar Projeto</button></div></div>
          </>
        )

      case 'memorias':
        return (
          <div className="panel-box full-panel">
            <div className="section-title-row">
              <h2>❤️ Minhas Memórias</h2>
              <button type="button" className="primary-button" onClick={() => setShowMemoryModal(true)}>+ Nova Memória</button>
            </div>

            <div className="filter-group">
              {filterOptions.map((option) => (
                <span
                  key={option.key}
                  className={memoryFilter === option.key ? 'filter-active' : ''}
                  onClick={() => setMemoryFilter(option.key)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setMemoryFilter(option.key)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {option.label}
                </span>
              ))}
            </div>

            {filteredMemories.length === 0 ? (
              <p className="empty-state">Nenhuma memória encontrada com esse filtro.</p>
            ) : (
              <div className="memory-grid">
                {filteredMemories.map((memory) => (
                  <article key={memory.id} className="memory-card">
                    <div className="memory-thumb" style={getMemoryVisualBackgroundStyle(memory, 'center')} />
                    <div className="memory-info">
                      <div className="memory-card-header">
                        <h4>{memory.favorite ? '⭐ ' : ''}{memory.title}</h4>
                        <div className="memory-card-actions">
                          <button
                            type="button"
                            className="ghost-button small"
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              openMemoryEditor(memory)
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="ghost-button small danger-button"
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              handleDeleteMemory(memory.id)
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                      <p>{memory.description || 'Sem descrição.'}</p>
                      <ul>
                        <li>{formatDate(memory.date)}</li>
                        <li>{memory.location || 'sem local'}</li>
                        <li>{memory.category}</li>
                      </ul>
                      <div className="meta-row">
                        <span>{memory.people || 'sem pessoas'}</span>
                        <span>{memory.tags?.join(' • ') || 'sem tags'}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )

      case 'timeline':
        return (
          <div className="panel-box full-panel" data-reveal="up">
            <h2>🗓️ Linha do tempo</h2>
            {timelineByYear.length === 0 ? (
              <p className="empty-state">Assim que você guardar memórias, elas aparecerão aqui organizadas por ano.</p>
            ) : (
              <div className="timeline-vertical">
                {timelineByYear.map(([year, items]) => (
                  <div key={year} className="year-block">
                    <div className="year-label">{year}</div>
                    <div className="year-items">
                      {items.map((memory) => (
                        <div key={memory.id} className="year-item">{memory.title} — {formatDate(memory.date)}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'projetos':
        return (
          <div className="panel-box full-panel projects-panel-shell">
            <div className="section-title-row">
              <h2>🌐 Meus Projetos</h2>
              <button type="button" className="primary-button" onClick={() => setProjectType(projectTypes[0])}>+ Criar novo projeto</button>
            </div>

            {projects.length === 0 && !projectType ? (
              <p className="empty-state">Você ainda não criou nenhum projeto. Que tal começar agora?</p>
            ) : (
              <div className="project-grid">
                {filteredProjects.map((project) => {
                  const isSelected = selectedProjectId === project.id
                  const importantMemories = (projectDetail && projectDetail.project.id === project.id ? projectDetail.memories : []).filter((memory) => memory.favorite || memory.mediaUrl).slice(0, 4)

                  return (
                    <article
                      key={project.id}
                      className={`project-card ${isSelected ? 'selected' : ''} ${project.type === 'Relacionamento' ? 'rose' : project.type === 'Viagem' ? 'gold' : project.type === 'Família' ? 'violet' : project.type === 'Evento' ? 'rose' : 'violet'}`}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div className="project-cover-card" />
                      <div className="project-card-body">
                        <div className="project-card-header">
                          <div>
                            <h3>{project.name}</h3>
                            <p>{project.memoryCount} memória(s)</p>
                          </div>
                          <div className="project-card-actions">
                            <button
                              type="button"
                              className="ghost-button small"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedProjectId(project.id)
                                setProjectTab('edit')
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="ghost-button small danger-button"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteProject(project.id)
                              }}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                        <span>{project.type}</span>
                        <div className="project-card-meta">
                          <small>/{project.slug}</small>
                          <small>{project.visibility === 'public' ? 'Público' : project.visibility === 'link' ? 'Link' : 'Privado'}</small>
                        </div>

                        {isSelected && projectDetail && projectDetail.project.id === project.id && (
                          <div className="project-card-panel">
                            <div className="project-card-tabs">
                              <button type="button" className={projectTab === 'edit' ? 'active' : ''} onClick={() => setProjectTab('edit')}>Editar projeto</button>
                              <button type="button" className={projectTab === 'photos' ? 'active' : ''} onClick={() => setProjectTab('photos')}>Fotos importantes</button>
                            </div>

                            {projectTab === 'edit' ? (
                              <form onSubmit={handleProjectUpdate} className="project-inline-form">
                                <label>
                                  Nome
                                  <input value={projectEditor.name} onChange={(event) => setProjectEditor((prev) => ({ ...prev, name: event.target.value }))} />
                                </label>
                                <label>
                                  Descrição
                                  <textarea value={projectEditor.description} onChange={(event) => setProjectEditor((prev) => ({ ...prev, description: event.target.value }))} />
                                </label>
                                <div className="inline-form-row compact-row">
                                  <label>
                                    Template
                                    <select value={projectEditor.template} onChange={(event) => setProjectEditor((prev) => ({ ...prev, template: event.target.value }))}>
                                      {templates.map((template) => <option key={template} value={template}>{template}</option>)}
                                    </select>
                                  </label>
                                  <label>
                                    Privacidade
                                    <select value={projectEditor.visibility} onChange={(event) => setProjectEditor((prev) => ({ ...prev, visibility: event.target.value }))}>
                                      <option value="private">Privado</option>
                                      <option value="link">Compartilhado por link</option>
                                      <option value="public">Público</option>
                                    </select>
                                  </label>
                                </div>

                                {projectDetail?.project?.slug && (
                                  <div className="project-link-panel">
                                    <span>Link do projeto</span>
                                    <a
                                      href={`${window.location.origin}/p/${projectDetail.project.slug}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="project-link-anchor"
                                    >
                                      {`${window.location.origin}/p/${projectDetail.project.slug}`}
                                    </a>
                                  </div>
                                )}

                                <button type="submit" className="primary-button small-button">Salvar projeto</button>
                              </form>
                            ) : (
                              <div className="important-photos-grid">
                                {importantMemories.length === 0 ? (
                                  <p className="empty-state small-empty">Nenhuma foto importante marcada ainda.</p>
                                ) : (
                                  importantMemories.map((memory) => (
                                    <div key={memory.id} className="important-photo-card" style={memory.mediaUrl ? { backgroundImage: `url(${memory.mediaUrl})` } : undefined}>
                                      <span>{memory.title}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {projectType && (
              <div className="project-create-overlay">
                <div className="project-create-panel">
                  <div className="project-create-header">
                    <div>
                      <span className="eyebrow dark">Novo projeto</span>
                      <h3>“O que você quer criar?”</h3>
                    </div>
                    <button type="button" className="icon-close" onClick={() => setProjectType(null)} aria-label="Fechar painel">×</button>
                  </div>

                  <div className="type-grid project-type-grid">
                    {projectTypes.map((type) => (
                      <button
                        key={type.name}
                        type="button"
                        className={`type-option ${projectType?.name === type.name ? 'selected' : ''}`}
                        onClick={() => setProjectType(type)}
                      >
                        <span>{type.icon}</span>
                        <strong>{type.name}</strong>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleCreateProject} className="inline-form project-create-form">
                    <label>
                      Nome do projeto
                      <input
                        type="text"
                        required
                        value={projectForm.name}
                        onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder={`Ex.: ${projectType.name}`}
                      />
                    </label>
                    <label>
                      Descrição
                      <textarea
                        value={projectForm.description}
                        onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))}
                      />
                    </label>
                    <div className="inline-form-row">
                      <label>
                        Template
                        <select value={projectForm.template} onChange={(event) => setProjectForm((prev) => ({ ...prev, template: event.target.value }))}>
                          {templates.map((template) => <option key={template} value={template}>{template}</option>)}
                        </select>
                      </label>
                      <label>
                        Privacidade
                        <select value={projectForm.visibility} onChange={(event) => setProjectForm((prev) => ({ ...prev, visibility: event.target.value }))}>
                          <option value="private">🔒 Privado</option>
                          <option value="link">🔗 Compartilhado por link</option>
                          <option value="public">🌎 Público</option>
                        </select>
                      </label>
                    </div>
                    <div className="inline-form-actions">
                      <button type="button" className="ghost-button" onClick={() => setProjectType(null)}>Cancelar</button>
                      <button type="submit" className="primary-button" disabled={savingProject}>{savingProject ? 'Publicando...' : 'Publicar Projeto'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )

      case 'perfil':
        return (
          <div className="panel-box profile-panel" data-reveal="up">
            <div className="profile-header">
              <div className="avatar-large">{initials}</div>
              <div>
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
              </div>
            </div>
            <form className="profile-grid" onSubmit={handleProfileSave}>
              <label>
                Nome
                <input type="text" value={profileForm.name} onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))} />
              </label>
              <label>
                Biografia
                <textarea value={profileForm.bio} onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))} />
              </label>
              <button type="submit" className="primary-button">Salvar alterações</button>
            </form>
          </div>
        )

      case 'config':
        return (
          <div className="panel-box full-panel" data-reveal="up">
            <h2>⚙️ Configurações</h2>
            <div className="config-list">
              <div><span>Exportar meus dados</span><button type="button" onClick={handleExport}>Baixar</button></div>
              <div><span>Excluir conta</span><button type="button" className="danger-button" onClick={handleDeleteAccount}>Excluir</button></div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="dashboard-shell">
      {confirmTarget && (
        <div className="modal-overlay" onClick={() => setConfirmTarget(null)}>
          <div className="modal-card confirm-card" onClick={(event) => event.stopPropagation()}>
            <div className="confirm-content">
              <div className="confirm-header">
                <h3>Confirmar exclusão</h3>
                <button type="button" className="icon-close" onClick={() => setConfirmTarget(null)} aria-label="Fechar confirmação">×</button>
              </div>

              <p className="confirm-message">{confirmTarget.message}</p>

              <div className="confirm-actions">
                <button type="button" className="ghost-button" onClick={() => setConfirmTarget(null)}>Cancelar</button>
                <button type="button" className="primary-button" onClick={confirmDeleteAction}>Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div className="brand-wrap sidebar-brand">
          <div className="brand-mark">M</div>
          <span>Memora</span>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeNav === item.key ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveNav(item.key)}
            >
              {item.label}
            </button>
          ))}
          <button type="button" className="nav-item" onClick={handleLogout}>🚪 Sair</button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <label className="search-box">
            <span aria-hidden="true">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar memórias, pessoas, lugares..."
            />
          </label>
          <div className="topbar-actions">
            <div className="user-mini">{initials}</div>
          </div>
        </header>

        {notice && <p className="success-banner">{notice}</p>}
        {errorMsg && <p className="form-error">{errorMsg}</p>}

        <section className="dashboard-content">
          {renderContent()}
        </section>
      </main>


      {showMemoryModal && (
        <div className="modal-overlay" onClick={resetMemoryModal}>
          <div className="modal-card modal-card-memory" onClick={(event) => event.stopPropagation()}>
            <div className="memory-modal-header">
              <div>
                <span className="eyebrow dark">{editingMemoryId ? 'Editar memória' : 'Nova memória'}</span>
                <h3>{editingMemoryId ? 'Atualizar um momento importante' : 'Guardar um momento importante'}</h3>
              </div>
              <button type="button" className="icon-close" onClick={resetMemoryModal} aria-label="Fechar">×</button>
            </div>

            {cropEditorOpen && (
              <div className="crop-editor-overlay" onClick={(event) => event.stopPropagation()}>
                <div className="crop-editor-panel">
                  <div className="crop-editor-header">
                    <div>
                      <span className="eyebrow dark">Recorte da foto</span>
                      <h3>Ajuste a área que deseja usar</h3>
                    </div>
                    <button type="button" className="icon-close" onClick={closeCropEditor} aria-label="Fechar recorte">×</button>
                  </div>

                  <div
                    ref={cropStageRef}
                    className="crop-editor-stage"
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    onPointerLeave={handleCropPointerUp}
                  >
                    <div
                      className="crop-image-layer"
                      onPointerDown={(event) => handleCropPointerDown(event, 'pan')}
                      style={{
                        backgroundImage: `url(${cropImageUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                      }}
                    />

                    <div className="crop-mask" />

                    <div
                      className="crop-selection"
                      style={{
                        left: `${cropBox.x}%`,
                        top: `${cropBox.y}%`,
                        width: `${cropBox.width}%`,
                        height: `${cropBox.height}%`,
                      }}
                      onPointerDown={(event) => handleCropPointerDown(event, 'move')}
                    >
                      <div className="crop-selection-handle nw" onPointerDown={(event) => handleCropPointerDown(event, 'nw')} />
                      <div className="crop-selection-handle ne" onPointerDown={(event) => handleCropPointerDown(event, 'ne')} />
                      <div className="crop-selection-handle sw" onPointerDown={(event) => handleCropPointerDown(event, 'sw')} />
                      <div className="crop-selection-handle se" onPointerDown={(event) => handleCropPointerDown(event, 'se')} />
                    </div>
                  </div>

                  <div className="crop-guidance">
                    <span>Arraste a imagem para ajustar o enquadramento e use os cantos para definir o corte.</span>
                  </div>

                  <div className="inline-form-actions">
                    <button type="button" className="ghost-button" onClick={closeCropEditor}>Cancelar</button>
                    <button type="button" className="primary-button" onClick={applyCrop}>Aplicar recorte</button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleMemorySubmit} className="modal-form memory-form">
              <div className="memory-media-block">
                <div className="upload-group">
                  <label className="upload-label">
                    <span>Foto de perfil da memória</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleMemoryImageSelect(event, 'profile')}
                    />
                  </label>

                  {showProfileActions && (
                    <div className="memory-image-actions">
                      <button type="button" className="primary-button small-button" onClick={() => openCropEditor('profile')}>
                        Editar &gt; Recortar foto
                      </button>
                      <button
                        type="button"
                        className="ghost-button small"
                        onClick={() => {
                          clearMemoryImage('profile')
                          setCropBaseImage(null)
                          setMemoryOriginalSource(null)
                          setCropImageUrl('')
                          setCropEditorOpen(false)
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>

                <div className="upload-group">
                  <label className="upload-label">
                    <span>Foto destaque da memória</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleMemoryImageSelect(event, 'cover')}
                    />
                  </label>

                  {showCoverActions && (
                    <div className="memory-image-actions">
                      <button type="button" className="primary-button small-button" onClick={() => openCropEditor('cover')}>
                        Editar &gt; Recortar foto
                      </button>
                      <button
                        type="button"
                        className="ghost-button small"
                        onClick={() => {
                          clearMemoryImage('cover')
                          setCropBaseImage(null)
                          setMemoryOriginalSource(null)
                          setCropImageUrl('')
                          setCropEditorOpen(false)
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>

                <div className="memory-image-preview-shell">
                  {showProfilePreview ? (
                    <div className="memory-image-preview-card profile-preview">
                      <span>Perfil</span>
                      <div
                        className="memory-image-preview"
                        style={{
                          backgroundImage: `url(${getMemoryPreviewUrl() || 'linear-gradient(135deg, rgba(255,126,166,0.16), rgba(142,106,255,0.14))'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {hasProfileImage && !memoryLogoRemoved && (
                          <button
                            type="button"
                            className="mini-edit-button"
                            onClick={() => openCropEditor('profile')}
                            aria-label="Editar foto de perfil"
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="memory-image-preview-card profile-preview empty-preview-card">
                      <span>Perfil</span>
                      <div className="memory-image-preview is-empty profile-empty">
                        <div className="empty-preview-content">
                          <span className="empty-preview-icon">＋</span>
                          <span>Adicionar foto</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showCoverPreview ? (
                    <div className="memory-image-preview-card cover-preview">
                      <span>Capa</span>
                      <div
                        className="memory-image-preview is-cover"
                        style={{
                          backgroundImage: `url(${getMemoryCoverPreviewUrl() || 'linear-gradient(135deg, rgba(255,182,94,0.14), rgba(142,106,255,0.18))'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {hasCoverImage && !memoryCoverRemoved && (
                          <button
                            type="button"
                            className="mini-edit-button"
                            onClick={() => openCropEditor('cover')}
                            aria-label="Editar capa da memória"
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="memory-image-preview-card cover-preview empty-preview-card">
                      <span>Capa</span>
                      <div className="memory-image-preview is-empty cover-empty">
                        <div className="empty-preview-content">
                          <span className="empty-preview-icon">＋</span>
                          <span>Adicionar foto</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="upload-group">
                  <label className="upload-label">
                    <span>Fotos e vídeos</span>
                    <input type="file" accept="image/*,video/mp4,video/webm" multiple onChange={(event) => setMemoryFiles(Array.from(event.target.files || []))} />
                  </label>

                  {memoryFiles.length > 0 && (
                    <div className="media-preview-grid">
                      {memoryFiles.slice(0, 6).map((file, index) => (
                        <div key={`${file.name}-${index}`} className="media-thumb" style={{ backgroundImage: `url(${URL.createObjectURL(file)})` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="memory-form-grid">
                <label>
                  Título
                  <input type="text" required value={memoryForm.title} onChange={(event) => setMemoryForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Nosso primeiro jantar" />
                </label>

                <label>
                  Local
                  <input type="text" value={memoryForm.location} onChange={(event) => setMemoryForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="Paris, França" />
                </label>

                <label>
                  Data
                  <input type="date" value={memoryForm.date} onChange={(event) => setMemoryForm((prev) => ({ ...prev, date: event.target.value }))} />
                </label>

                <label>
                  Categoria
                  <select value={memoryForm.category} onChange={(event) => setMemoryForm((prev) => ({ ...prev, category: event.target.value }))}>
                    <option>Evento</option>
                    <option>Viagem</option>
                    <option>Texto</option>
                    <option>Geral</option>
                  </select>
                </label>
              </div>

              <label>
                Descrição
                <textarea value={memoryForm.description} onChange={(event) => setMemoryForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Escreva o que você quer lembrar sobre esse momento..." />
              </label>

              <div className="inline-form-row">
                <label>
                  Pessoas
                  <input type="text" value={memoryForm.people} onChange={(event) => setMemoryForm((prev) => ({ ...prev, people: event.target.value }))} placeholder="Você e Miguel" />
                </label>
                <label>
                  Tags
                  <input type="text" value={memoryForm.tags} onChange={(event) => setMemoryForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="amor, viagem, verão" />
                </label>
              </div>

              <label className="checkbox-row">
                <input type="checkbox" checked={memoryForm.favorite} onChange={(event) => setMemoryForm((prev) => ({ ...prev, favorite: event.target.checked }))} />
                Marcar como favorita
              </label>

              <div className="inline-form-actions">
                <button type="button" className="ghost-button" onClick={resetMemoryModal}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={savingMemory}>{savingMemory ? (editingMemoryId ? 'Atualizando...' : 'Salvando...') : (editingMemoryId ? 'Salvar alterações' : 'Salvar memória')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
