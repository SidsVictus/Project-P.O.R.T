import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { randomBytes } from 'crypto'

const UPLOAD_DIR = path.join(os.tmpdir(), 'port-uploads')

export interface UploadedFileInfo {
  name: string
  size: number
}

export async function ensureUploadDir(existingDir?: string): Promise<string> {
  if (existingDir) {
    await fs.mkdir(existingDir, { recursive: true })
    return existingDir
  }
  const id = randomBytes(8).toString('hex')
  const dir = path.join(UPLOAD_DIR, id)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

export async function saveFile(uploadDir: string, relativePath: string, buffer: Buffer): Promise<string> {
  const fullPath = path.join(uploadDir, relativePath)
  const dir = path.dirname(fullPath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(fullPath, buffer)
  return fullPath
}

export async function getUploadedFiles(uploadDir: string): Promise<UploadedFileInfo[]> {
  const files: UploadedFileInfo[] = []
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else {
        const stat = await fs.stat(fullPath)
        files.push({ name: path.relative(uploadDir, fullPath), size: stat.size })
      }
    }
  }
  try {
    await walk(uploadDir)
  } catch {}
  return files
}

export async function deleteFile(uploadDir: string, relativePath: string): Promise<void> {
  const fullPath = path.join(uploadDir, relativePath)
  await fs.rm(fullPath, { force: true })
}

export async function cleanupUploadDir(uploadDir: string): Promise<void> {
  try {
    await fs.rm(uploadDir, { recursive: true, force: true })
  } catch {}
}
