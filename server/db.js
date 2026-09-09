import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

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

const adapter = new JSONFile(path.join(dataDir, 'db.json'))
export const db = new Low(adapter, defaultData)

export async function initDb() {
  await db.read()
  db.data ||= structuredClone(defaultData)
  for (const key of Object.keys(defaultData)) {
    db.data[key] ||= []
  }
  await db.write()
}
