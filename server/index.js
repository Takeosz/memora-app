import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { initDb } from './db.js'
import { authRouter } from './routes/authRoutes.js'
import { userRouter } from './routes/userRoutes.js'
import { memoriesRouter } from './routes/memoriesRoutes.js'
import { projectsRouter, publicProjectsRouter } from './routes/projectsRoutes.js'
import { uploadRouter, uploadsDir } from './routes/uploadRoutes.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET n\u00e3o configurado. Defina-o no arquivo .env antes de iniciar o servidor.')
}

const app = express()
const PORT = process.env.PORT || 4000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const allowedOrigins = [
  FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean) : []),
]

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Origem não permitida pelo CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
})

app.use('/api/auth', authLimiter, authRouter)
app.use('/api', userRouter)
app.use('/api/memories', memoriesRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/public/projects', publicProjectsRouter)
app.use('/api/upload', uploadRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Memora API rodando em http://localhost:${PORT}`)
  })
})
