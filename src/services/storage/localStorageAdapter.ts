import { GameMetadata, GameState } from '@/types/game'
import { StorageAdapter } from './types'

const GAMES_KEY = 'white_elephant_games_store_v1'
const ACTIVE_ID_KEY = 'white_elephant_active_game_id'

export class LocalStorageAdapter implements StorageAdapter {
  private getStore(): Record<string, GameState> {
    try {
      const data = localStorage.getItem(GAMES_KEY)
      return data ? JSON.parse(data) : {}
    } catch (err) {
      console.error('Failed to parse games from localStorage:', err)
      return {}
    }
  }

  private setStore(store: Record<string, GameState>): void {
    try {
      localStorage.setItem(GAMES_KEY, JSON.stringify(store))
    } catch (err) {
      console.error('Failed to save games to localStorage:', err)
    }
  }

  async listGames(): Promise<GameMetadata[]> {
    const store = this.getStore()
    return Object.values(store)
      .map((g) => ({
        id: g.id,
        title: g.settings.title,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        participantCount: g.participants.length,
        phase: g.phase,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getGame(id: string): Promise<GameState | null> {
    const store = this.getStore()
    return store[id] || null
  }

  async saveGame(game: GameState): Promise<void> {
    const store = this.getStore()
    const updated = {
      ...game,
      updatedAt: Date.now(),
    }
    store[game.id] = updated
    this.setStore(store)
  }

  async deleteGame(id: string): Promise<void> {
    const store = this.getStore()
    delete store[id]
    this.setStore(store)

    const activeId = await this.getActiveGameId()
    if (activeId === id) {
      localStorage.removeItem(ACTIVE_ID_KEY)
    }
  }

  async getActiveGameId(): Promise<string | null> {
    return localStorage.getItem(ACTIVE_ID_KEY)
  }

  async setActiveGameId(id: string): Promise<void> {
    localStorage.setItem(ACTIVE_ID_KEY, id)
  }
}
