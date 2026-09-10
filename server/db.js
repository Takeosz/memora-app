import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
fs.mkdirSync(dataDir, { recursive: true })

const defaultData = {
  users: [],
  memories: [],
  projects: [],
  projectMemories: [],
  people: [],
}

const isPostgresEnabled = Boolean(process.env.DATABASE_URL)

const ensureDefaultData = (state) => {
  const normalized = { ...structuredClone(defaultData), ...(state || {}) }
  for (const key of Object.keys(defaultData)) {
    normalized[key] ||= []
  }
  return normalized
}

const lowDb = (() => {
  const adapter = new JSONFile(path.join(dataDir, 'db.json'))
  const db = new Low(adapter, structuredClone(defaultData))
  return db
})()

const pgPool = isPostgresEnabled ? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}) : null

const postgresDb = {
  data: structuredClone(defaultData),
  async read() {
    if (!pgPool) return
    const result = await pgPool.query(
      'SELECT value FROM app_state WHERE key = $1 LIMIT 1',
      ['memora_app_data'],
    )
    const value = result.rows[0]?.value ?? structuredClone(defaultData)
    this.data = ensureDefaultData(value)
  },
  async write() {
    if (!pgPool) return
    const payload = JSON.stringify(ensureDefaultData(this.data))
    await pgPool.query(
      `INSERT INTO app_state (key, value)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      ['memora_app_data', payload],
    )
  },
}

export const db = isPostgresEnabled ? postgresDb : lowDb

if (isPostgresEnabled) {
  db.data = structuredClone(defaultData)
}

export async function ensureAdminUser() {
  try {
    if (isPostgresEnabled) {
      const client = await pgPool.connect()
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS app_state (
            key TEXT PRIMARY KEY,
            value JSONB NOT NULL
          )
        `)
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            passwordHash TEXT NOT NULL,
            avatar TEXT,
            bio TEXT,
            createdAt TEXT NOT NULL
          )
        `)
        await client.query(`
          CREATE TABLE IF NOT EXISTS memories (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT,
            location TEXT,
            category TEXT,
            people TEXT,
            tags TEXT[],
            mediaUrl TEXT,
            mediaType TEXT,
            mediaPosition TEXT,
            coverUrl TEXT,
            coverType TEXT,
            coverPosition TEXT,
            gallery JSONB DEFAULT '[]'::jsonb,
            favorite BOOLEAN DEFAULT false,
            createdAt TEXT NOT NULL
          )
        `)
        await client.query(`
          CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            type TEXT,
            template TEXT,
            description TEXT,
            visibility TEXT,
            cover TEXT,
            avatar TEXT,
            sinceDate TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
          )
        `)
        await client.query(`
          CREATE TABLE IF NOT EXISTS project_memories (
            projectId TEXT NOT NULL,
            memoryId TEXT NOT NULL,
            PRIMARY KEY (projectId, memoryId)
          )
        `)
        await client.query(`
          CREATE TABLE IF NOT EXISTS people (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            name TEXT NOT NULL,
            relation TEXT,
            notes TEXT,
            createdAt TEXT NOT NULL
          )
        `)
      } finally {
        client.release()
      }
    }

    await db.read()
    db.data = ensureDefaultData(db.data)
    for (const key of Object.keys(defaultData)) {
      db.data[key] ||= []
    }

    const adminEmail = 'admin@memora.com'
    let adminUser = db.data.users.find((user) => user.email === adminEmail)

    if (!adminUser) {
      adminUser = {
        id: 'admin-memora-01',
        name: 'Administrador',
        email: adminEmail,
        passwordHash: await bcrypt.hash('00000000', 12),
        avatar: '',
        bio: 'Acesso administrativo do dashboard principal.',
        createdAt: new Date().toISOString(),
      }
      db.data.users.push(adminUser)
      await db.write()
      return adminUser
    }

    const validDefaultPassword = await bcrypt.compare('00000000', adminUser.passwordHash)
    if (!validDefaultPassword) {
      adminUser.passwordHash = await bcrypt.hash('00000000', 12)
      await db.write()
    }

    return adminUser
  } catch (error) {
    console.error('ensureAdminUser failed:', error)
    const fallbackUser = {
      id: 'admin-memora-01',
      name: 'Administrador',
      email: 'admin@memora.com',
      passwordHash: await bcrypt.hash('00000000', 12),
      avatar: '',
      bio: 'Acesso administrativo do dashboard principal.',
      createdAt: new Date().toISOString(),
    }

    if (db && db.data) {
      db.data.users = db.data.users || []
      const existing = db.data.users.find((user) => user.email === fallbackUser.email)
      if (!existing) {
        db.data.users.push(fallbackUser)
      }
    }

    return fallbackUser
  }
}

export async function initDb() {
  if (isPostgresEnabled) {
    const client = await pgPool.connect()
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL
        )
      `)
      const existing = await client.query('SELECT count(*) FROM app_state WHERE key = $1', ['memora_app_data'])
      if (Number(existing.rows[0].count) === 0) {
        await client.query('INSERT INTO app_state (key, value) VALUES ($1, $2::jsonb)', [
          'memora_app_data',
          JSON.stringify(ensureDefaultData(defaultData)),
        ])
      }
    } finally {
      client.release()
    }
  }
  await ensureAdminUser()
}
