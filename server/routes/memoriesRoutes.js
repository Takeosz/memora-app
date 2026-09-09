import { Router } from 'express'
import { nanoid } from 'nanoid'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { cleanText, cleanTags } from '../utils.js'

export const memoriesRouter = Router()

const normalizeGallery = (value) => {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry) => entry && typeof entry === 'object' && typeof entry.url === 'string' && entry.url.trim())
    .map((entry) => ({
      url: cleanText(entry.url, 300),
      mediaType: ['image', 'video', ''].includes(entry.mediaType) ? entry.mediaType : '',
    }))
    .filter((entry) => entry.url)
}

memoriesRouter.use(requireAuth)

memoriesRouter.get('/', async (req, res) => {
  await db.read()
  const memories = db.data.memories
    .filter((memory) => memory.userId === req.userId)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  res.json({ memories })
})

memoriesRouter.post('/', async (req, res) => {
  const title = cleanText(req.body?.title, 120)
  if (!title) return res.status(400).json({ error: 'Informe um t\u00edtulo para a mem\u00f3ria.' })

  const memory = {
    id: nanoid(12),
    userId: req.userId,
    title,
    description: cleanText(req.body?.description, 1000),
    date: cleanText(req.body?.date, 20),
    location: cleanText(req.body?.location, 120),
    category: cleanText(req.body?.category, 40) || 'Geral',
    people: cleanText(req.body?.people, 200),
    tags: cleanTags(req.body?.tags),
    mediaUrl: cleanText(req.body?.mediaUrl, 300),
    mediaType: ['image', 'video', ''].includes(req.body?.mediaType) ? req.body.mediaType : '',
    mediaPosition: cleanText(req.body?.mediaPosition, 30) || '50% 50%',
    coverUrl: cleanText(req.body?.coverUrl, 300),
    coverType: ['image', 'video', ''].includes(req.body?.coverType) ? req.body.coverType : '',
    coverPosition: cleanText(req.body?.coverPosition, 30) || '50% 50%',
    gallery: normalizeGallery(req.body?.gallery),
    favorite: Boolean(req.body?.favorite),
    createdAt: new Date().toISOString(),
  }

  db.data.memories.push(memory)
  await db.write()
  res.status(201).json({ memory })
})

memoriesRouter.patch('/:id', async (req, res) => {
  await db.read()
  const memory = db.data.memories.find((item) => item.id === req.params.id && item.userId === req.userId)
  if (!memory) return res.status(404).json({ error: 'Mem\u00f3ria n\u00e3o encontrada.' })

  const fields = ['description', 'date', 'location', 'category', 'people', 'mediaUrl']
  for (const field of fields) {
    if (req.body?.[field] !== undefined) memory[field] = cleanText(req.body[field], field === 'description' ? 1000 : 300)
  }
  if (req.body?.title !== undefined) {
    const title = cleanText(req.body.title, 120)
    if (title) memory.title = title
  }
  if (req.body?.tags !== undefined) memory.tags = cleanTags(req.body.tags)
  if (req.body?.favorite !== undefined) memory.favorite = Boolean(req.body.favorite)
  if (req.body?.gallery !== undefined) memory.gallery = normalizeGallery(req.body.gallery)
  if (req.body?.mediaType !== undefined) memory.mediaType = ['image', 'video', ''].includes(req.body.mediaType) ? req.body.mediaType : ''
  if (req.body?.mediaPosition !== undefined) memory.mediaPosition = cleanText(req.body.mediaPosition, 30) || '50% 50%'
  if (req.body?.coverUrl !== undefined) memory.coverUrl = cleanText(req.body.coverUrl, 300)
  if (req.body?.coverType !== undefined) memory.coverType = ['image', 'video', ''].includes(req.body.coverType) ? req.body.coverType : ''
  if (req.body?.coverPosition !== undefined) memory.coverPosition = cleanText(req.body.coverPosition, 30) || '50% 50%'

  await db.write()
  res.json({ memory })
})

memoriesRouter.delete('/:id', async (req, res) => {
  await db.read()
  const exists = db.data.memories.some((item) => item.id === req.params.id && item.userId === req.userId)
  if (!exists) return res.status(404).json({ error: 'Mem\u00f3ria n\u00e3o encontrada.' })

  db.data.memories = db.data.memories.filter((item) => item.id !== req.params.id)
  db.data.projectMemories = db.data.projectMemories.filter((link) => link.memoryId !== req.params.id)
  await db.write()
  res.json({ ok: true })
})
