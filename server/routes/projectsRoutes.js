import { Router } from 'express'
import { nanoid } from 'nanoid'
import { db } from '../db.js'
import { requireAuth, optionalAuth } from '../auth.js'
import { cleanText, cleanSlugPart, publicUser } from '../utils.js'

export const projectsRouter = Router()
export const publicProjectsRouter = Router()

const VISIBILITIES = ['private', 'link', 'public']

async function uniqueSlug(base) {
  await db.read()
  let slug = base || 'projeto'
  let suffix = 0
  const taken = new Set(db.data.projects.map((project) => project.slug))
  while (taken.has(slug)) {
    suffix += 1
    slug = `${base}-${suffix}`
  }
  return slug
}

function withMemoryCount(project) {
  const count = db.data.projectMemories.filter((link) => link.projectId === project.id).length
  return { ...project, memoryCount: count }
}

projectsRouter.use(requireAuth)

projectsRouter.get('/', async (req, res) => {
  await db.read()
  const projects = db.data.projects
    .filter((project) => project.userId === req.userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(withMemoryCount)
  res.json({ projects })
})

projectsRouter.post('/', async (req, res) => {
  const name = cleanText(req.body?.name, 80)
  if (!name) return res.status(400).json({ error: 'Informe um nome para o projeto.' })

  const baseSlug = cleanSlugPart(req.body?.slug || name) || 'projeto'
  const slug = await uniqueSlug(baseSlug)
  const visibility = VISIBILITIES.includes(req.body?.visibility) ? req.body.visibility : 'private'

  const project = {
    id: nanoid(12),
    userId: req.userId,
    name,
    slug,
    type: cleanText(req.body?.type, 40) || 'Personalizado',
    template: cleanText(req.body?.template, 40) || 'Memories',
    description: cleanText(req.body?.description, 300),
    visibility,
    cover: cleanText(req.body?.cover, 300),
    avatar: cleanText(req.body?.avatar, 300),
    sinceDate: cleanText(req.body?.sinceDate, 20),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  db.data.projects.push(project)
  await db.write()
  res.status(201).json({ project: withMemoryCount(project) })
})

projectsRouter.get('/:id', async (req, res) => {
  await db.read()
  const project = db.data.projects.find((item) => item.id === req.params.id && item.userId === req.userId)
  if (!project) return res.status(404).json({ error: 'Projeto n\u00e3o encontrado.' })

  const memoryIds = db.data.projectMemories.filter((link) => link.projectId === project.id).map((link) => link.memoryId)
  const memories = db.data.memories.filter((memory) => memoryIds.includes(memory.id))
  res.json({ project: withMemoryCount(project), memories })
})

projectsRouter.patch('/:id', async (req, res) => {
  await db.read()
  const project = db.data.projects.find((item) => item.id === req.params.id && item.userId === req.userId)
  if (!project) return res.status(404).json({ error: 'Projeto n\u00e3o encontrado.' })

  const fields = ['name', 'type', 'template', 'description', 'cover', 'avatar', 'sinceDate']
  for (const field of fields) {
    if (req.body?.[field] !== undefined) project[field] = cleanText(req.body[field], field === 'description' ? 300 : 120)
  }
  if (req.body?.visibility !== undefined && VISIBILITIES.includes(req.body.visibility)) {
    project.visibility = req.body.visibility
  }
  project.updatedAt = new Date().toISOString()

  await db.write()
  res.json({ project: withMemoryCount(project) })
})

projectsRouter.delete('/:id', async (req, res) => {
  await db.read()
  const exists = db.data.projects.some((item) => item.id === req.params.id && item.userId === req.userId)
  if (!exists) return res.status(404).json({ error: 'Projeto n\u00e3o encontrado.' })

  db.data.projects = db.data.projects.filter((item) => item.id !== req.params.id)
  db.data.projectMemories = db.data.projectMemories.filter((link) => link.projectId !== req.params.id)
  await db.write()
  res.json({ ok: true })
})

projectsRouter.post('/:id/memories', async (req, res) => {
  await db.read()
  const project = db.data.projects.find((item) => item.id === req.params.id && item.userId === req.userId)
  if (!project) return res.status(404).json({ error: 'Projeto n\u00e3o encontrado.' })

  const memory = db.data.memories.find((item) => item.id === req.body?.memoryId && item.userId === req.userId)
  if (!memory) return res.status(404).json({ error: 'Mem\u00f3ria n\u00e3o encontrada.' })

  const alreadyLinked = db.data.projectMemories.some((link) => link.projectId === project.id && link.memoryId === memory.id)
  if (!alreadyLinked) {
    db.data.projectMemories.push({ projectId: project.id, memoryId: memory.id })
    project.updatedAt = new Date().toISOString()
    await db.write()
  }

  res.status(201).json({ ok: true })
})

projectsRouter.delete('/:id/memories/:memoryId', async (req, res) => {
  await db.read()
  const project = db.data.projects.find((item) => item.id === req.params.id && item.userId === req.userId)
  if (!project) return res.status(404).json({ error: 'Projeto n\u00e3o encontrado.' })

  db.data.projectMemories = db.data.projectMemories.filter(
    (link) => !(link.projectId === project.id && link.memoryId === req.params.memoryId),
  )
  project.updatedAt = new Date().toISOString()
  await db.write()
  res.json({ ok: true })
})

publicProjectsRouter.get('/:slug', optionalAuth, async (req, res) => {
  await db.read()
  const project = db.data.projects.find((item) => item.slug === req.params.slug)
  if (!project) return res.status(404).json({ error: 'Projeto n\u00e3o encontrado.' })

  const isOwner = req.userId === project.userId
  if (project.visibility === 'private' && !isOwner) {
    return res.status(403).json({ error: 'Este projeto \u00e9 privado.' })
  }

  const owner = db.data.users.find((user) => user.id === project.userId)
  const memoryIds = db.data.projectMemories.filter((link) => link.projectId === project.id).map((link) => link.memoryId)
  const memories = db.data.memories
    .filter((memory) => memoryIds.includes(memory.id))
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))

  res.json({ project: withMemoryCount(project), memories, owner: publicUser(owner), isOwner })
})
