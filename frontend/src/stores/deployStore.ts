import { create } from 'zustand'
import { Provider } from '../../../shared/types'

interface DeployState {
  uploadDir: string | null
  provider: Provider
  siteName: string
  hostingEmail: string
  scheduledAt: string
  showTerminal: boolean
  deploying: boolean
  deployLogs: string[]
  deployResult: { url?: string; success: boolean } | null
  setUploadDir: (dir: string | null) => void
  setProvider: (p: Provider) => void
  setSiteName: (n: string) => void
  setHostingEmail: (e: string) => void
  setScheduledAt: (t: string) => void
  setShowTerminal: (show: boolean) => void
  setDeploying: (d: boolean) => void
  addLog: (log: string) => void
  setDeployResult: (r: { url?: string; success: boolean } | null) => void
  reset: () => void
}

const initialState = {
  uploadDir: null,
  provider: 'surge' as Provider,
  siteName: '',
  hostingEmail: '',
  scheduledAt: '',
  showTerminal: false,
  deploying: false,
  deployLogs: [],
  deployResult: null,
}

export const useDeployStore = create<DeployState>((set) => ({
  ...initialState,
  setUploadDir: (dir) => set({ uploadDir: dir }),
  setProvider: (p) => set({ provider: p }),
  setSiteName: (n) => set({ siteName: n }),
  setHostingEmail: (e) => set({ hostingEmail: e }),
  setScheduledAt: (t) => set({ scheduledAt: t }),
  setShowTerminal: (show) => set({ showTerminal: show }),
  setDeploying: (d) => set({ deploying: d }),
  addLog: (log) => set((s) => ({ deployLogs: [...s.deployLogs, log] })),
  setDeployResult: (r) => set({ deployResult: r }),
  reset: () => set(initialState),
}))
