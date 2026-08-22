const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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

  async uploadFiles(files: File[]) {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers, body: formData })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  }

  async deleteUploadFile(uploadDir: string, filePath: string) {
    return this.request<{ files: string[]; fileCount: number }>('/api/upload', {
      method: 'DELETE',
      body: JSON.stringify({ uploadDir, filePath }),
    })
  }
}

export const api = new ApiClient()
