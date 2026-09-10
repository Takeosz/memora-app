import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { db, ensureAdminUser } from '../db.js'
import { signSession, clearSession, requireAuth } from '../auth.js'
import { isValidEmail, cleanText, publicUser } from '../utils.js'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  const name = cleanText(req.body?.name, 80)
  const email = cleanText(req.body?.email, 120).toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const confirmPassword = typeof req.body?.confirmPassword === 'string' ? req.body.confirmPassword : ''

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Informe um nome v\u00e1lido.' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Informe um e-mail v\u00e1lido.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres.' })
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas n\u00e3o coincidem.' })
  }

  await db.read()
  const exists = db.data.users.some((user) => user.email === email)
  if (exists) {
    return res.status(409).json({ error: 'J\u00e1 existe uma conta com este e-mail.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = {
    id: nanoid(12),
    name,
    email,
    passwordHash,
    avatar: '',
    bio: 'Desde hoje, colecionando momentos.',
    createdAt: new Date().toISOString(),
  }

  db.data.users.push(user)
  await db.write()

  signSession(res, user.id)
  res.status(201).json({ user: publicUser(user) })
})

authRouter.post('/login', async (req, res) => {
  const email = cleanText(req.body?.email, 120).toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  try {
    await ensureAdminUser()
    await db.read()

    let user = db.data.users.find((item) => item.email === email)
    const genericError = () => res.status(401).json({ error: 'E-mail ou senha inválidos.' })

    if (!user && email === 'admin@memora.com' && password === '00000000') {
      user = await ensureAdminUser()
    }

    if (!user) return genericError()

    const matches = await bcrypt.compare(password, user.passwordHash)
    if (!matches) return genericError()

    signSession(res, user.id)
    return res.json({ user: publicUser(user) })
  } catch (error) {
    console.error('Login failed:', error)
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
  }
})

authRouter.post('/recover', async (req, res) => {
  const email = cleanText(req.body?.email, 120).toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const confirmPassword = typeof req.body?.confirmPassword === 'string' ? req.body.confirmPassword : ''

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas novas não coincidem.' })
  }

  await ensureAdminUser()
  await db.read()
  let user = db.data.users.find((item) => item.email === email)

  if (!user && email === 'admin@memora.com') {
    user = await ensureAdminUser()
  }

  if (!user) {
    return res.status(404).json({ error: 'Nenhuma conta foi encontrada com este e-mail.' })
  }

  user.passwordHash = await bcrypt.hash(password, 12)
  await db.write()

  res.json({ ok: true, message: 'Senha atualizada com sucesso.' })
})

authRouter.post('/logout', (_req, res) => {
  clearSession(res)
  res.json({ ok: true })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  await db.read()
  const user = db.data.users.find((item) => item.id === req.userId)
  if (!user) return res.status(404).json({ error: 'Usu\u00e1rio n\u00e3o encontrado.' })
  res.json({ user: publicUser(user) })
})
