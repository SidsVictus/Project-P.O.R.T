import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../auth/middleware'
import { ensureUploadDir, saveFile, deleteFile, getUploadedFiles } from './service'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })
const router = Router()

router.post('/', requireAuth, upload.array('files', 500), async (req, res) => {
  try {
    const dir = await ensureUploadDir()
    const files = req.files as any[]

    for (const file of files) {
      const relativePath = file.originalname.replace(/\\/g, '/')
      await saveFile(dir, relativePath, file.buffer)
    }

    const fileNames = await getUploadedFiles(dir)
    res.json({ uploadDir: dir, fileCount: files.length, files: fileNames })
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' })
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
