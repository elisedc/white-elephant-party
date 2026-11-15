import { GameState } from '@/types/game'

export type RealtimeMessageType =
  | 'PLAYER_JOIN'
  | 'SYNC_STATE'
  | 'REQUEST_SYNC'
  | 'CHAT_MESSAGE'
  | 'EMOJI_REACTION'

export interface RealtimeMessage {
  type: RealtimeMessageType
  roomId: string
  payload: any
  timestamp: number
}

export interface PlayerJoinPayload {
  id: string
  name: string
  avatarEmoji: string
}

export interface ChatMessagePayload {
  id: string
  playerId: string
  playerName: string
  playerEmoji: string
  text: string
  timestamp: number
}

export interface EmojiReactionPayload {
  id: string
  playerId: string
  playerName: string
  playerEmoji: string
  emoji: string
  timestamp: number
}

export interface SyncStatePayload {
  gameState: GameState
}
