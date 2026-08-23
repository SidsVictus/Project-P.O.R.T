import { zip } from 'fflate'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const IGNORE_PATTERNS = [
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)\.git(\/|$)/,
  /(^|\/)dist(\/|$)/,
  /(^|\/)build(\/|$)/,
  /(^|\/)\.next(\/|$)/,
  /(^|\/)\.cache(\/|$)/,
  /(^|\/)coverage(\/|$)/,
  /\.log$/,
  /(^|\/)\.DS_Store$/,
]

export function shouldIgnore(relativePath: string): boolean {
  return IGNORE_PATTERNS.some(p => p.test(relativePath))
}

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    const res = await fetch(`${API_URL}${path}`, { ...options, headers })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || 'Request failed')
    }
    return res.json()
  }

  get<T>(path: string) { return this.request<T>(path) }
  post<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) }) }
  put<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) }) }
  delete<T>(path: string) { return this.request<T>(path, { method: 'DELETE' }) }

  async uploadFiles(files: File[], existingDir?: string) {
    const filtered = files.filter(f => !shouldIgnore((f as any).webkitRelativePath || f.name))
    const entries: [string, Uint8Array][] = await Promise.all(
      filtered.map(async f => {
        const name = ((f as any).webkitRelativePath || f.name).replace(/\\/g, '/')
        return [name, new Uint8Array(await f.arrayBuffer())] as [string, Uint8Array]
      })
    )
    const zipped = await new Promise<Uint8Array>((resolve, reject) => {
      zip(Object.fromEntries(entries), { level: 0 }, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    const blob = new Blob([new Uint8Array(zipped) as BlobPart], { type: 'application/zip' })
    const formData = new FormData()
    formData.append('files', blob, 'upload.zip')
    if (existingDir) formData.append('uploadDir', existingDir)
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers, body: formData })
    if (!res.ok) throw new Error('Upload failed')
    return await res.json()
  }

  async deleteUploadFile(uploadDir: string, filePath: string) {
    return this.request<{ files: { name: string; size: number }[]; fileCount: number }>('/api/upload', {
      method: 'DELETE',
      body: JSON.stringify({ uploadDir, filePath }),
    })
  }
}

export const api = new ApiClient()
