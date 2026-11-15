import { StorageAdapter } from './types'
import { LocalStorageAdapter } from './localStorageAdapter'
import { RemoteApiAdapter } from './remoteApiAdapter'

// By default we use LocalStorageAdapter as requested ("storage goes to localhost for now").
// When switching to a backend or serverless database on Vercel, set VITE_USE_REMOTE_STORAGE=true
const isRemote = import.meta.env.VITE_USE_REMOTE_STORAGE === 'true'

export const storage: StorageAdapter = isRemote 
  ? new RemoteApiAdapter(import.meta.env.VITE_API_BASE_URL || '/api') 
  : new LocalStorageAdapter()

export * from './types'
export * from './localStorageAdapter'
export * from './remoteApiAdapter'
