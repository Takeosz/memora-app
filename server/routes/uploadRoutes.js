import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { nanoid } from 'nanoid'
import { requireAuth } from '../auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsDir = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype] || ''
    cb(null, `${nanoid(16)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      cb(new Error('Tipo de arquivo n\u00e3o permitido.'))
      return
    }
    cb(null, true)
  },
})

export const uploadRouter = Router()

uploadRouter.post('/', requireAuth, (req, res) => {
  upload.any()(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Falha no upload.' })

    const files = Array.isArray(req.files) ? req.files : []
    if (files.length === 0) return res.status(400).json({ error: 'Nenhum arquivo enviado.' })

    const uploads = files.map((file) => ({
      url: `/uploads/${file.filename}`,
      mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
    }))

    res.status(201).json({ uploads })
  })
})
