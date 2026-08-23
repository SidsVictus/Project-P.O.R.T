import { create } from 'zustand'
import { Provider } from '../../../shared/types'

export interface FileInfo {
  name: string
  size: number
}

interface DeployState {
  uploadDir: string | null
  uploadedFiles: FileInfo[]
  provider: Provider
  siteName: string
  hostingEmail: string
  scheduledAt: string
  showTerminal: boolean
  deploying: boolean
  currentDeploymentId: string | null
  deployLogs: string[]
  deployResult: { url?: string; success: boolean } | null
  setUploadDir: (dir: string | null) => void
  setUploadedFiles: (files: FileInfo[]) => void
  removeUploadedFile: (file: string) => void
  setProvider: (p: Provider) => void
  setSiteName: (n: string) => void
  setHostingEmail: (e: string) => void
  setScheduledAt: (t: string) => void
  setShowTerminal: (show: boolean) => void
  setDeploying: (d: boolean) => void
  setCurrentDeploymentId: (id: string | null) => void
  addLog: (log: string) => void
  setDeployResult: (r: { url?: string; success: boolean } | null) => void
  reset: () => void
}

const initialState = {
  uploadDir: null as string | null,
  uploadedFiles: [] as FileInfo[],
  provider: 'surge' as Provider,
  siteName: '',
  hostingEmail: '',
  scheduledAt: '',
  showTerminal: false,
  deploying: false,
  currentDeploymentId: null as string | null,
  deployLogs: [] as string[],
  deployResult: null as { url?: string; success: boolean } | null,
}

export const useDeployStore = create<DeployState>((set) => ({
  ...initialState,
  setUploadDir: (dir) => set({ uploadDir: dir }),
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  removeUploadedFile: (file) => set((s) => ({ uploadedFiles: s.uploadedFiles.filter((f) => f.name !== file) })),
  setProvider: (p) => set({ provider: p }),
  setSiteName: (n) => set({ siteName: n }),
  setHostingEmail: (e) => set({ hostingEmail: e }),
  setScheduledAt: (t) => set({ scheduledAt: t }),
  setShowTerminal: (show) => set({ showTerminal: show }),
  setDeploying: (d) => set({ deploying: d }),
  setCurrentDeploymentId: (id) => set({ currentDeploymentId: id }),
  addLog: (log) => set((s) => ({ deployLogs: [...s.deployLogs, log] })),
  setDeployResult: (r) => set({ deployResult: r }),
  reset: () => set(initialState),
}))
