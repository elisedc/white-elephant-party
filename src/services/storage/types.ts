import { GameMetadata, GameState } from '@/types/game'

export interface StorageAdapter {
  /**
   * Retrieves a list of all saved games (metadata only)
   */
  listGames(): Promise<GameMetadata[]>

  /**
   * Loads a specific game by ID
   */
  getGame(id: string): Promise<GameState | null>

  /**
   * Saves or updates a game state
   */
  saveGame(game: GameState): Promise<void>

  /**
   * Deletes a game by ID
   */
  deleteGame(id: string): Promise<void>

  /**
   * Gets the last active game ID
   */
  getActiveGameId(): Promise<string | null>

  /**
   * Sets the last active game ID
   */
  setActiveGameId(id: string): Promise<void>
}
