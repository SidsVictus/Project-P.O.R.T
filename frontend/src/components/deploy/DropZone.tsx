import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FolderPlus, Paperclip } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useDeployStore } from '../../stores/deployStore'
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
  const folderInputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (files: File[]) => {
    if (!files.length) return
    try {
      toast.loading('Uploading files...', { id: 'upload' })
      const result = await api.uploadFiles(files, uploadDir || undefined)
      setUploadDir(result.uploadDir)
      setUploadedFiles(result.files || [])
      toast.success(`${result.fileCount} files uploaded`, { id: 'upload' })
    } catch (err) {
      toast.error('Upload failed', { id: 'upload' })
    }
  }, [setUploadDir, setUploadedFiles, uploadDir])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    upload(acceptedFiles)
  }, [upload])

  const onFolderDrop = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    upload(Array.from(files))
    e.target.value = ''
  }, [upload])

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
    } catch (err) {
      toast.error('Failed to remove file')
    } finally {
      setRemoving(null)
    }
  }, [uploadDir, setUploadDir, removeUploadedFile, setUploadedFiles])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles: 500,
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-300 glass',
          isDragActive
            ? 'border-2 border-dashed border-primary bg-primary/5 shadow-lg shadow-primary/10'
            : uploadDir
              ? 'border border-white/40'
              : 'border-2 border-dashed border-white/40 hover:border-primary/40 hover:bg-white/30 cursor-pointer p-10 text-center'
        )}
      >
        <input {...getInputProps()} />

        {!uploadDir && (
          <div className="flex flex-col items-center gap-3" onClick={open}>
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-slow">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">
                {isDragActive ? 'Drop your files here' : 'Drag & drop your project files'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
            </div>
          </div>
        )}

        {uploadDir && (
          <div onClick={(e) => e.stopPropagation()}>
            <div className="px-4 pt-3 pb-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Attachments ({uploadedFiles.length})
            </div>
            {uploadedFiles.length > 0 && (
              <div className="divide-y divide-border/40">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/30 transition-colors group"
                  >
                    <span className="truncate text-sm font-medium text-blue-600 flex-1 min-w-0">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({formatSize(file.size)})
                    </span>
                    <button
                      onClick={(e) => handleRemoveFile(file.name, e)}
                      disabled={removing === file.name}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors shrink-0 opacity-60 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {uploadDir && (
        <div className="flex items-center gap-3 px-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              open()
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Add files
          </button>
          <span className="text-muted-foreground/40">|</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              folderInputRef.current?.click()
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            Add folder
          </button>
          <span className="text-muted-foreground/40">|</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setUploadDir(null)
              setUploadedFiles([])
              toast.success('All files removed')
            }}
            className="text-sm text-destructive hover:text-destructive/80 font-medium transition-colors"
          >
            Remove all
          </button>
        </div>
      )}

      <input
        ref={folderInputRef}
        type="file"
        /* @ts-ignore */
        webkitdirectory=""
        /* @ts-ignore */
        directory=""
        multiple
        className="hidden"
        onChange={onFolderDrop}
      />
    </div>
  )
}
