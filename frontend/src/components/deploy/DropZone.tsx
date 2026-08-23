import { useCallback, useRef, useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FolderPlus, Folder, FolderOpen, File, Paperclip } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useDeployStore } from '../../stores/deployStore'
import { api, shouldIgnore } from '../../lib/api'
import toast from 'react-hot-toast'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}K`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}G`
}

interface TreeNode {
  name: string
  path: string
  size: number
  isDir: boolean
  children: TreeNode[]
}

function buildTree(files: { name: string; size: number }[]): TreeNode[] {
  const root: TreeNode[] = []
  for (const f of files) {
    const parts = f.name.split('/')
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const existing = current.find(n => n.name === part)
      if (existing) {
        if (!isLast) { current = existing.children }
        else { existing.size = f.size }
      } else {
        const node: TreeNode = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          size: isLast ? f.size : 0,
          isDir: !isLast,
          children: [],
        }
        current.push(node)
        if (!isLast) { current = node.children }
      }
    }
  }
  return root
}

function TreeItem({ node, depth, onRemove }: { node: TreeNode; depth: number; onRemove: (path: string) => void }) {
  const [open, setOpen] = useState(true)
  const totalSize = useMemo(() => {
    if (!node.isDir) return node.size
    return node.children.reduce((s, c) => s + (c.isDir ? c.children.reduce((s2, cc) => s2 + cc.size, 0) : c.size), 0)
  }, [node])

  if (node.isDir) {
    return (
      <div>
        <div
          className="flex items-center gap-2 px-2 py-1 hover:bg-white/30 transition-colors cursor-pointer select-none"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => setOpen(!open)}
        >
          {open ? <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" /> : <Folder className="h-4 w-4 text-amber-500 shrink-0" />}
          <span className="text-sm font-medium text-foreground">{node.name}/</span>
          <span className="text-xs text-muted-foreground ml-auto shrink-0">({formatSize(totalSize)})</span>
        </div>
        {open && node.children.map(child => (
          <TreeItem key={child.path} node={child} depth={depth + 1} onRemove={onRemove} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 hover:bg-white/30 transition-colors group"
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <File className="h-4 w-4 text-blue-500 shrink-0" />
      <span className="truncate text-sm font-medium text-blue-600 flex-1 min-w-0">{node.name}</span>
      <span className="text-xs text-muted-foreground shrink-0">({formatSize(node.size)})</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(node.path) }}
        className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors shrink-0 opacity-60 group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function DropZone() {
  const { setUploadDir, uploadDir, uploadedFiles, setUploadedFiles, removeUploadedFile } = useDeployStore()
  const folderInputRef = useRef<HTMLInputElement>(null)

  const tree = useMemo(() => buildTree(uploadedFiles), [uploadedFiles])

  const upload = useCallback(async (files: File[]) => {
    if (!files.length) return
    const currentDir = useDeployStore.getState().uploadDir
    const currentFiles = useDeployStore.getState().uploadedFiles
    const kept = files.filter(f => !shouldIgnore((f as any).webkitRelativePath || f.name))
    const skipped = files.length - kept.length
    try {
      toast.loading(`Zipping ${kept.length} files${skipped ? ` (${skipped} skipped)` : ''}...`, { id: 'upload' })
      const result = await api.uploadFiles(files, currentDir || undefined)
      setUploadDir(result.uploadDir)
      const serverFiles = result.files
      if (serverFiles && serverFiles.length > 0) {
        setUploadedFiles(serverFiles)
      } else {
        const clientFiles = kept.map(f => ({ name: f.webkitRelativePath || f.name, size: f.size }))
        const existing = currentDir ? currentFiles : []
        const merged = [...existing]
        for (const cf of clientFiles) {
          if (!merged.some(m => m.name === cf.name)) merged.push(cf)
        }
        setUploadedFiles(merged)
      }
      toast.success(`${kept.length} files uploaded${skipped ? ` (${skipped} junk skipped)` : ''}`, { id: 'upload' })
    } catch (err) {
      toast.error('Upload failed', { id: 'upload' })
    }
  }, [setUploadDir, setUploadedFiles])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    upload(acceptedFiles)
  }, [upload])

  const onFolderDrop = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    upload(Array.from(files))
    e.target.value = ''
  }, [upload])

  const handleRemoveFile = useCallback(async (file: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!uploadDir) return
    try {
      const result = await api.deleteUploadFile(uploadDir, file)
      if (result.files && result.files.length === 0) {
        setUploadDir(null)
        setUploadedFiles([])
      } else {
        removeUploadedFile(file)
      }
    } catch (err) {
      removeUploadedFile(file)
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
            : uploadedFiles.length > 0
              ? 'border border-white/40'
              : 'border-2 border-dashed border-white/40 hover:border-primary/40 hover:bg-white/30 cursor-pointer p-10 text-center'
        )}
      >
        <input {...getInputProps()} />

        {uploadedFiles.length === 0 && (
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

        {uploadedFiles.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <div className="px-4 pt-3 pb-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Attachments ({uploadedFiles.length})
            </div>
            <div className="py-1">
              {tree.map(node => (
                <TreeItem key={node.path} node={node} depth={0} onRemove={handleRemoveFile} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-1">
        <button
          onClick={(e) => { e.stopPropagation(); open() }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Paperclip className="h-3.5 w-3.5" />
          Add files
        </button>
        <span className="text-muted-foreground/40">|</span>
        <button
          onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click() }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          Add folder
        </button>
        {uploadedFiles.length > 0 && (
          <>
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
          </>
        )}
      </div>

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
