import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FolderOpen, Trash2, X, FileCode, Image, Film, Music, File } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useDeployStore, FileInfo } from '../../stores/deployStore'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}K`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}G`
}

export function DropZone() {
  const { setUploadDir, uploadDir, uploadedFiles, setUploadedFiles, removeUploadedFile } = useDeployStore()
  const [removing, setRemoving] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      toast.loading('Uploading files...', { id: 'upload' })
      const result = await api.uploadFiles(acceptedFiles, uploadDir || undefined)
      setUploadDir(result.uploadDir)
      setUploadedFiles(result.files || [])
      toast.success(`${result.fileCount} files uploaded`, { id: 'upload' })
    } catch (err) {
      toast.error('Upload failed', { id: 'upload' })
    }
  }, [setUploadDir, setUploadedFiles, uploadDir])

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
        'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 glass',
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10'
          : uploadDir
            ? 'border-emerald-400/50 bg-emerald-50/30'
            : 'border-white/40 hover:border-primary/40 hover:bg-white/30'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {uploadDir ? (
          <>
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <FolderOpen className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-emerald-400">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
              </p>
              <p className="text-sm text-muted-foreground mt-1">Drop more files to add</p>
            </div>

            <div className="w-full space-y-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
              {uploadedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/60 hover:bg-white/80 border border-white/50 text-sm transition-colors group"
                >
                  <File className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="truncate text-foreground/80 font-mono text-xs flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                  <button
                    onClick={(e) => handleRemoveFile(file.name, e)}
                    disabled={removing === file.name}
                    className="p-0.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
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
                toast.success('All files removed')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors mt-1"
            >
              <Trash2 className="h-4 w-4" />
              Remove All
            </button>
          </>
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-slow">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">
                {isDragActive ? 'Drop your files here' : 'Drag & drop your project files'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse — HTML, CSS, JS, images, videos, all file types
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
