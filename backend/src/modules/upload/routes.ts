import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../auth/middleware'
import { ensureUploadDir, saveFile, deleteFile, getUploadedFiles } from './service'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })
const router = Router()

router.post('/', requireAuth, upload.array('files', 500), async (req, res) => {
  try {
    const existingDir = req.body.uploadDir || req.query.uploadDir as string | undefined
    const dir = await ensureUploadDir(existingDir)
    const files = req.files as any[]

    let paths: string[] = []
    try {
      paths = JSON.parse(req.body.paths || '[]')
    } catch {}

    for (let i = 0; i < files.length; i++) {
      const relativePath = paths[i] || files[i].originalname.replace(/\\/g, '/')
      await saveFile(dir, relativePath, files[i].buffer)
    }

    const fileNames = await getUploadedFiles(dir)
    res.json({ uploadDir: dir, fileCount: fileNames.length, files: fileNames })
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
