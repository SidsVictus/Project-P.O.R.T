import { Router } from 'express'
import multer from 'multer'
import AdmZip from 'adm-zip'
import path from 'path'
import { requireAuth } from '../auth/middleware'
import { ensureUploadDir, saveFile, deleteFile, getUploadedFiles } from './service'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })
const router = Router()

router.post('/', requireAuth, upload.single('files'), async (req, res) => {
  try {
    const existingDir = req.body.uploadDir || req.query.uploadDir as string | undefined
    const dir = await ensureUploadDir(existingDir)
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    if (file.originalname.endsWith('.zip')) {
      const zip = new AdmZip(file.buffer)
      const entries = zip.getEntries()
      for (const entry of entries) {
        if (entry.isDirectory) continue
        const relativePath = entry.entryName.replace(/\\/g, '/')
        await saveFile(dir, relativePath, entry.getData())
      }
    } else {
      await saveFile(dir, file.originalname.replace(/\\/g, '/'), file.buffer)
    }

    const fileNames = await getUploadedFiles(dir)
    res.json({ uploadDir: dir, fileCount: fileNames.length, files: fileNames })
  } catch (error: any) {
    console.error('Upload error:', error.message, error.stack)
    res.status(500).json({ error: error.message || 'Upload failed' })
  }
})

router.delete('/', requireAuth, async (req, res) => {
  try {
    const { uploadDir, filePath } = req.body
    if (!uploadDir || !filePath) {
      return res.status(400).json({ error: 'uploadDir and filePath required' })
    }
    await deleteFile(uploadDir, filePath)
    const files = await getUploadedFiles(uploadDir)
    res.json({ files, fileCount: files.length })
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' })
  }
})

export default router
