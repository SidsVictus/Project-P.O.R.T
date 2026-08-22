import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FolderOpen, Trash2, X, FileCode, Image, Film, Music, File } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useDeployStore } from '../../stores/deployStore'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'

export function DropZone() {
  const { setUploadDir, uploadDir, uploadedFiles, setUploadedFiles, removeUploadedFile } = useDeployStore()
  const [removing, setRemoving] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      toast.loading('Uploading files...', { id: 'upload' })
      const result = await api.uploadFiles(acceptedFiles)
      setUploadDir(result.uploadDir)
      setUploadedFiles(result.files || [])
      toast.success(`${result.fileCount} files uploaded`, { id: 'upload' })
    } catch (err) {
      toast.error('Upload failed', { id: 'upload' })
    }
  }, [setUploadDir, setUploadedFiles])

  const handleRemoveFile = useCallback(async (file: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!uploadDir) return
    setRemoving(file)
    try {
      const result = await api.deleteUploadFile(uploadDir, file)
      if (result.files.length === 0) {
        setUploadDir(null)
        setUploadedFiles([])
      } else {
        removeUploadedFile(file)
      }
      toast.success('File removed')
    } catch (err) {
      toast.error('Failed to remove file')
    } finally {
      setRemoving(null)
    }
  }, [uploadDir, setUploadDir, removeUploadedFile, setUploadedFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 500,
    noClick: false,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 glass',
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10'
          : uploadDir
            ? 'border-emerald-400/50 bg-emerald-50/30'
            : 'border-white/40 hover:border-primary/40 hover:bg-white/30'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {uploadDir ? (
          <>
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <FolderOpen className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-emerald-400">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
              </p>
              <p className="text-sm text-muted-foreground mt-1">Drop more files to add, or remove below</p>
            </div>
            <div className="w-full max-h-60 overflow-y-auto space-y-1 mt-2" onClick={(e) => e.stopPropagation()}>
              {uploadedFiles.map((file) => (
                <div
                  key={file}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/50 hover:bg-white/70 border border-white/40 text-sm text-left group"
                >
                  <span className="truncate text-foreground/80 font-mono text-xs flex-1">{file}</span>
                  <button
                    onClick={(e) => handleRemoveFile(file, e)}
                    disabled={removing === file}
                    className="ml-3 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setUploadDir(null)
                setUploadedFiles([])
                toast.success('All files removed', { id: 'upload' })
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove All
            </button>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-slow">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">
                {isDragActive ? 'Drop your files here' : 'Drag & drop your project files'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse — HTML, CSS, JS, images, videos, all file types supported
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><FileCode className="h-3 w-3" /> Code</span>
              <span className="flex items-center gap-1"><Image className="h-3 w-3" /> Images</span>
              <span className="flex items-center gap-1"><Film className="h-3 w-3" /> Video</span>
              <span className="flex items-center gap-1"><Music className="h-3 w-3" /> Audio</span>
              <span className="flex items-center gap-1"><File className="h-3 w-3" /> All</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
