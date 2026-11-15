export type GamePhase = 'SETUP' | 'DRAWING' | 'PLAYING' | 'FINAL_SWAP' | 'FINISHED'

export interface Participant {
  id: string
  name: string
  order: number // 1 to N, 0 means not drawn yet
  giftId?: string // Current gift ID held by this participant
  avatarEmoji?: string
  hasPlayed?: boolean
}

export interface Gift {
  id: string
  title: string
  description?: string
  originalOwnerId?: string // Who brought it (optional/anonymous until opened)
  currentOwnerId: string // Current holder participant ID
  stealCount: number // How many times this gift has been stolen
  isFrozen: boolean // True if reached maxSteals
  openedAtRound: number
  imageUrl?: string
  tags?: string[]
}

export interface GameSettings {
  title: string
  priceLimit: string
  maxSteals: number // Default 3
  allowPlayer1Swap: boolean // Default true
  allowImmediateStealBack: boolean // Default false
}

export interface ActionLog {
  id: string
  timestamp: number
  type: 'GAME_START' | 'DRAW_ORDER' | 'OPEN_GIFT' | 'STEAL_GIFT' | 'FREEZE_GIFT' | 'FINAL_SWAP' | 'GAME_FINISH'
  actorId?: string
  actorName: string
  targetParticipantId?: string
  targetParticipantName?: string
  giftId?: string
  giftTitle?: string
  message: string
}

export interface TurnState {
  currentOrderNumber: number // The scheduled turn (1 to N)
  activeParticipantId: string // Person currently taking action (could be victim if stolen)
  isStealReaction: boolean // True if someone just had their gift stolen
  lastStolenGiftId?: string // Gift that was just stolen (cannot be stolen back immediately)
  lastVictimId?: string // Participant whose gift was just stolen
  turnStepCount: number // How many steals have happened in this single round
}

export interface GameState {
  id: string
  createdAt: number
  updatedAt: number
  settings: GameSettings
  phase: GamePhase
  participants: Participant[]
  gifts: Gift[]
  logs: ActionLog[]
  turnState: TurnState
  unopenedGiftsCount: number
  historyStack: string[] // Serialized snapshots for Undo support
}

export interface GameMetadata {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  participantCount: number
  phase: GamePhase
}
