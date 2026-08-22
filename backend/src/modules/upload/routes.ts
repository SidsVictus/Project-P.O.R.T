import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../auth/middleware'
import { ensureUploadDir, saveFile } from './service'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })
const router = Router()

router.post('/', requireAuth, upload.array('files', 500), async (req, res) => {
  try {
    const dir = await ensureUploadDir()
    const files = req.files as Express.Multer.File[]

    for (const file of files) {
      const relativePath = file.originalname.replace(/\\/g, '/')
      await saveFile(dir, relativePath, file.buffer)
    }

    res.json({ uploadDir: dir, fileCount: files.length })
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' })
  }
})

export default router
