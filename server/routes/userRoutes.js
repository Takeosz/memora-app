import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, clearSession } from '../auth.js'
import { cleanText, publicUser } from '../utils.js'

export const userRouter = Router()

userRouter.patch('/me', requireAuth, async (req, res) => {
  await db.read()
  const user = db.data.users.find((item) => item.id === req.userId)
  if (!user) return res.status(404).json({ error: 'Usu\u00e1rio n\u00e3o encontrado.' })

  if (req.body?.name !== undefined) {
    const name = cleanText(req.body.name, 80)
    if (name.length < 2) return res.status(400).json({ error: 'Informe um nome v\u00e1lido.' })
    user.name = name
  }
  if (req.body?.bio !== undefined) {
    user.bio = cleanText(req.body.bio, 280)
  }
  if (req.body?.avatar !== undefined) {
    user.avatar = cleanText(req.body.avatar, 300)
  }

  await db.write()
  res.json({ user: publicUser(user) })
})

userRouter.delete('/me', requireAuth, async (req, res) => {
  await db.read()
  const projectIds = db.data.projects.filter((project) => project.userId === req.userId).map((project) => project.id)

  db.data.users = db.data.users.filter((item) => item.id !== req.userId)
  db.data.memories = db.data.memories.filter((memory) => memory.userId !== req.userId)
  db.data.projects = db.data.projects.filter((project) => project.userId !== req.userId)
  db.data.projectMemories = db.data.projectMemories.filter((link) => !projectIds.includes(link.projectId))
  db.data.people = db.data.people.filter((person) => person.userId !== req.userId)

  await db.write()
  clearSession(res)
  res.json({ ok: true })
})

userRouter.get('/me/export', requireAuth, async (req, res) => {
  await db.read()
  const user = db.data.users.find((item) => item.id === req.userId)
  const memories = db.data.memories.filter((memory) => memory.userId === req.userId)
  const projects = db.data.projects.filter((project) => project.userId === req.userId)

  res.setHeader('Content-Disposition', 'attachment; filename="memora-dados.json"')
  res.json({ user: publicUser(user), memories, projects })
})
