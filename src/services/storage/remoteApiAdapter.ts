import { GameMetadata, GameState } from '@/types/game'
import { StorageAdapter } from './types'

/**
 * RemoteApiAdapter provides a plug-and-play adapter ready for backend database integration
 * (e.g., PostgreSQL, MongoDB, Prisma, Supabase, or REST API endpoints) when transitioning from localhost.
 */
export class RemoteApiAdapter implements StorageAdapter {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  async listGames(): Promise<GameMetadata[]> {
    const res = await fetch(`${this.baseUrl}/games`)
    if (!res.ok) throw new Error('Failed to fetch games list from server')
    return res.json()
  }

  async getGame(id: string): Promise<GameState | null> {
    const res = await fetch(`${this.baseUrl}/games/${id}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Failed to fetch game ${id} from server`)
    return res.json()
  }

  async saveGame(game: GameState): Promise<void> {
    const res = await fetch(`${this.baseUrl}/games/${game.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game),
    })
    if (!res.ok) throw new Error(`Failed to save game ${game.id} to server`)
  }

  async deleteGame(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/games/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(`Failed to delete game ${id} from server`)
  }

  async getActiveGameId(): Promise<string | null> {
    try {
      const res = await fetch(`${this.baseUrl}/games/active`)
      if (!res.ok) return null
      const data = await res.json()
      return data.id || null
    } catch {
      return null
    }
  }

  async setActiveGameId(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/games/active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }
}
