import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { requireAuth } from '../auth/middleware'
import { ensureUploadDir, saveFile, deleteFile, getUploadedFiles } from './service'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })
const router = Router()

router.post('/', requireAuth, upload.array('files', 500), async (req, res) => {
  try {
    const existingDir = req.body.uploadDir || req.query.uploadDir as string | undefined
    const dir = await ensureUploadDir(existingDir)
    const files = req.files as Express.Multer.File[] | undefined

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' })
    }

    for (const file of files) {
      const relativePath = file.originalname.replace(/\\/g, '/')
      await saveFile(dir, relativePath, file.buffer)
    }

    const fileNames = await getUploadedFiles(dir)
    console.log(`Upload complete: ${fileNames.length} files in ${dir}`)
    if (fileNames.length > 0) {
      console.log('Files:', fileNames.map(f => f.name).join(', '))
    }
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
