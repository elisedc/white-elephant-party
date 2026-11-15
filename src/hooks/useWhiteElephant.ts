import { useState, useEffect, useCallback, useRef } from 'react'
import {
  GameState,
  GameSettings,
  Participant,
  Gift,
  ActionLog,
} from '@/types/game'
import { storage } from '@/services/storage'
import { sounds } from '@/lib/sound'
import confetti from 'canvas-confetti'

const DEFAULT_SETTINGS: GameSettings = {
  title: '聖誕白象交換禮物',
  priceLimit: '約 $300 - $800 元',
  maxSteals: 3,
  allowPlayer1Swap: true,
  allowImmediateStealBack: false,
}

const AVATAR_EMOJIS = ['🎅', '🎄', '⛄', '🦌', '🎁', '❄️', '🔔', '🍪', '🧦', '⭐', '🕯️', '🐧', '🧤', '🎉']

export function useWhiteElephant() {
  const [game, setGame] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [snowEnabled, setSnowEnabled] = useState(true)
  const stateRef = useRef(game)
  stateRef.current = game

  // Load initial active game or create a blank draft
  useEffect(() => {
    async function init() {
      try {
        const activeId = await storage.getActiveGameId()
        if (activeId) {
          const loaded = await storage.getGame(activeId)
          if (loaded) {
            setGame(loaded)
            setIsLoading(false)
            return
          }
        }
        // If no active game, initialize default setup
        const newGame = createInitialGameState()
        setGame(newGame)
        await storage.saveGame(newGame)
        await storage.setActiveGameId(newGame.id)
      } catch (err) {
        console.error('Failed to init game:', err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // Auto-save on state change
  const saveState = useCallback(async (nextState: GameState) => {
    setGame(nextState)
    try {
      await storage.saveGame(nextState)
      await storage.setActiveGameId(nextState.id)
    } catch (err) {
      console.error('Failed to auto-save game:', err)
    }
  }, [])

  // Helper to record history snapshot for Undo
  const pushHistorySnapshot = (currentState: GameState): string[] => {
    const serialized = JSON.stringify({
      phase: currentState.phase,
      participants: currentState.participants,
      gifts: currentState.gifts,
      logs: currentState.logs,
      turnState: currentState.turnState,
      unopenedGiftsCount: currentState.unopenedGiftsCount,
    })
    return [...(currentState.historyStack || []).slice(-15), serialized]
  }

  function createInitialGameState(): GameState {
    const id = `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    return {
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: { ...DEFAULT_SETTINGS },
      phase: 'SETUP',
      participants: [
        { id: 'p1', name: '小明', order: 0, avatarEmoji: '🎅' },
        { id: 'p2', name: '小美', order: 0, avatarEmoji: '🎄' },
        { id: 'p3', name: '阿杰', order: 0, avatarEmoji: '⛄' },
        { id: 'p4', name: '雅婷', order: 0, avatarEmoji: '🎁' },
      ],
      gifts: [],
      logs: [
        {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          type: 'GAME_START',
          actorName: '主辦人',
          message: '建立聖誕白象交換禮物聚會！',
        },
      ],
      turnState: {
        currentOrderNumber: 1,
        activeParticipantId: '',
        isStealReaction: false,
        turnStepCount: 0,
      },
      unopenedGiftsCount: 4,
      historyStack: [],
    }
  }

  // Create/Reset to fresh new game with empty participants
  const startNewGame = useCallback(async (customSettings?: Partial<GameSettings>) => {
    const freshGame: GameState = {
      ...createInitialGameState(),
      participants: [],
      unopenedGiftsCount: 0,
      settings: {
        ...DEFAULT_SETTINGS,
        ...customSettings,
      },
    }
    await saveState(freshGame)
    if (soundEnabled) sounds.playJingle()
  }, [saveState, soundEnabled])

  // Reset but keep participants for replaying
  const resetKeepParticipants = useCallback(async () => {
    if (!game) return
    const resetParticipants = game.participants.map((p) => ({
      ...p,
      order: 0,
      giftId: undefined,
      hasPlayed: false,
    }))
    const updated: GameState = {
      ...game,
      phase: 'SETUP',
      participants: resetParticipants,
      gifts: [],
      unopenedGiftsCount: resetParticipants.length,
      logs: [
        {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          type: 'GAME_START',
          actorName: '主辦人',
          message: `重設遊戲並保留 ${resetParticipants.length} 位玩家，準備重新開始！`,
        },
      ],
      turnState: {
        currentOrderNumber: 1,
        activeParticipantId: '',
        isStealReaction: false,
        turnStepCount: 0,
      },
      historyStack: [],
    }
    await saveState(updated)
    if (soundEnabled) sounds.playJingle()
  }, [game, saveState, soundEnabled])

  // Update Game Settings
  const updateSettings = useCallback(async (settings: Partial<GameSettings>) => {
    if (!game) return
    const updated: GameState = {
      ...game,
      settings: { ...game.settings, ...settings },
    }
    await saveState(updated)
  }, [game, saveState])

  // Add Participant
  const addParticipant = useCallback(async (name: string) => {
    if (!game || !name.trim()) return
    const trimmed = name.trim()
    const newParticipant: Participant = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      order: 0,
      avatarEmoji: AVATAR_EMOJIS[game.participants.length % AVATAR_EMOJIS.length],
    }
    const updatedParticipants = [...game.participants, newParticipant]
    const updated: GameState = {
      ...game,
      participants: updatedParticipants,
      unopenedGiftsCount: updatedParticipants.length,
      historyStack: pushHistorySnapshot(game),
    }
    await saveState(updated)
  }, [game, saveState])

  // Add Participants in Batch (multiline or comma-separated)
  const addParticipantsBatch = useCallback(async (rawText: string) => {
    if (!game || !rawText.trim()) return
    const names = rawText
      .split(/[\n,，、\t]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (names.length === 0) return

    const newParticipants: Participant[] = names.map((name, idx) => ({
      id: `p_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      order: 0,
      avatarEmoji: AVATAR_EMOJIS[(game.participants.length + idx) % AVATAR_EMOJIS.length],
    }))

    const updatedParticipants = [...game.participants, ...newParticipants]
    const updated: GameState = {
      ...game,
      participants: updatedParticipants,
      unopenedGiftsCount: updatedParticipants.length,
      historyStack: pushHistorySnapshot(game),
    }
    await saveState(updated)
    if (soundEnabled) sounds.playJingle()
  }, [game, saveState, soundEnabled])

  // Remove Participant
  const removeParticipant = useCallback(async (id: string) => {
    if (!game) return
    const updatedParticipants = game.participants.filter((p) => p.id !== id)
    const updated: GameState = {
      ...game,
      participants: updatedParticipants,
      unopenedGiftsCount: updatedParticipants.length,
      historyStack: pushHistorySnapshot(game),
    }
    await saveState(updated)
  }, [game, saveState])

  // Draw Turn Order (Random shuffle & assign 1 to N)
  const drawTurnOrder = useCallback(async () => {
    if (!game || game.participants.length < 2) return

    // Shuffle participants randomly
    const shuffled = [...game.participants]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const assigned = shuffled.map((p, idx) => ({
      ...p,
      order: idx + 1,
      giftId: undefined,
      hasPlayed: false,
    }))

    const firstPlayer = assigned.find((p) => p.order === 1)!

    const log: ActionLog = {
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
      type: 'DRAW_ORDER',
      actorName: '系統抽籤',
      message: `完成了順序抽籤！共 ${assigned.length} 位玩家，由第 1 棒【${firstPlayer.name}】開場拆禮物！`,
    }

    const updated: GameState = {
      ...game,
      phase: 'PLAYING',
      participants: assigned,
      gifts: [],
      unopenedGiftsCount: assigned.length,
      logs: [log, ...game.logs],
      turnState: {
        currentOrderNumber: 1,
        activeParticipantId: firstPlayer.id,
        isStealReaction: false,
        turnStepCount: 0,
      },
      historyStack: pushHistorySnapshot(game),
    }

    await saveState(updated)

    if (soundEnabled) sounds.playVictory()
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#22c55e', '#fbbf24', '#ffffff'],
    })
  }, [game, saveState, soundEnabled])

  // Advance turn to next scheduled player, or trigger Final Swap / Finished
  const advanceTurn = useCallback((
    currentState: GameState,
    currentScheduledOrder: number
  ): GameState => {
    const nextOrder = currentScheduledOrder + 1
    const totalParticipants = currentState.participants.length

    if (nextOrder > totalParticipants) {
      // All scheduled players went!
      // Check if Player 1 gets a final swap
      if (currentState.settings.allowPlayer1Swap) {
        const player1 = currentState.participants.find((p) => p.order === 1)
        const log: ActionLog = {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          type: 'FINAL_SWAP',
          actorName: player1?.name || '第 1 棒',
          message: `所有人都已完成回合！進入最後高潮：第 1 棒【${player1?.name}】獲得最終交換權！`,
        }
        return {
          ...currentState,
          phase: 'FINAL_SWAP',
          logs: [log, ...currentState.logs],
          turnState: {
            currentOrderNumber: 1,
            activeParticipantId: player1?.id || '',
            isStealReaction: false,
            turnStepCount: 0,
          },
        }
      } else {
        // Game finished directly
        const log: ActionLog = {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          type: 'GAME_FINISH',
          actorName: '主辦人',
          message: `交換禮物結束！所有人皆已獲得專屬聖誕禮物！`,
        }
        return {
          ...currentState,
          phase: 'FINISHED',
          logs: [log, ...currentState.logs],
        }
      }
    }

    // Move to next player
    const nextPlayer = currentState.participants.find((p) => p.order === nextOrder)!
    return {
      ...currentState,
      turnState: {
        currentOrderNumber: nextOrder,
        activeParticipantId: nextPlayer.id,
        isStealReaction: false,
        turnStepCount: 0,
        lastStolenGiftId: undefined,
        lastVictimId: undefined,
      },
    }
  }, [])

  // Open an unopened gift from the central pile
  const openGift = useCallback(async (data: {
    title: string
    description?: string
    tags?: string[]
    imageUrl?: string
  }) => {
    if (!game) return
    const activeParticipant = game.participants.find(
      (p) => p.id === game.turnState.activeParticipantId
    )
    if (!activeParticipant) return

    const giftId = `gift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newGift: Gift = {
      id: giftId,
      title: data.title.trim() || '神秘聖誕禮物',
      description: data.description?.trim(),
      tags: data.tags || [],
      imageUrl: data.imageUrl,
      currentOwnerId: activeParticipant.id,
      stealCount: 0,
      isFrozen: false,
      openedAtRound: game.turnState.currentOrderNumber,
    }

    const updatedParticipants = game.participants.map((p) => {
      if (p.id === activeParticipant.id) {
        return { ...p, giftId, hasPlayed: true }
      }
      return p
    })

    const log: ActionLog = {
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
      type: 'OPEN_GIFT',
      actorId: activeParticipant.id,
      actorName: activeParticipant.name,
      giftId,
      giftTitle: newGift.title,
      message: `${activeParticipant.name} 從中央禮物堆拆開了全新禮物：【${newGift.title}】！`,
    }

    const intermediateState: GameState = {
      ...game,
      participants: updatedParticipants,
      gifts: [...game.gifts, newGift],
      unopenedGiftsCount: Math.max(0, game.unopenedGiftsCount - 1),
      logs: [log, ...game.logs],
      historyStack: pushHistorySnapshot(game),
    }

    // If opening was part of a steal reaction or standard turn, opening ends that branch!
    // Turn advances to the next scheduled order
    const nextState = advanceTurn(intermediateState, game.turnState.currentOrderNumber)
    await saveState(nextState)

    if (soundEnabled) sounds.playJingle()
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#fbbf24', '#ffffff'],
    })
  }, [game, advanceTurn, saveState, soundEnabled])

  // Steal an opened gift from another player
  const stealGift = useCallback(async (targetGiftId: string) => {
    if (!game) return
    const activeParticipant = game.participants.find(
      (p) => p.id === game.turnState.activeParticipantId
    )
    const targetGift = game.gifts.find((g) => g.id === targetGiftId)
    if (!activeParticipant || !targetGift) return

    if (targetGift.isFrozen) {
      alert('這份禮物已被冰凍鎖定，不能再被搶奪囉！')
      return
    }

    const victim = game.participants.find((p) => p.id === targetGift.currentOwnerId)
    if (!victim) return

    const newStealCount = targetGift.stealCount + 1
    const shouldFreeze = newStealCount >= game.settings.maxSteals

    // Update gift owner and steal count
    const updatedGifts = game.gifts.map((g) => {
      if (g.id === targetGiftId) {
        return {
          ...g,
          currentOwnerId: activeParticipant.id,
          stealCount: newStealCount,
          isFrozen: shouldFreeze,
        }
      }
      return g
    })

    // Update participants: active participant gets targetGift, victim loses it
    const updatedParticipants = game.participants.map((p) => {
      if (p.id === activeParticipant.id) {
        return { ...p, giftId: targetGiftId, hasPlayed: true }
      }
      if (p.id === victim.id) {
        return { ...p, giftId: undefined }
      }
      return p
    })

    const logsToAdd: ActionLog[] = [
      {
        id: `log_${Date.now()}_steal`,
        timestamp: Date.now(),
        type: 'STEAL_GIFT',
        actorId: activeParticipant.id,
        actorName: activeParticipant.name,
        targetParticipantId: victim.id,
        targetParticipantName: victim.name,
        giftId: targetGift.id,
        giftTitle: targetGift.title,
        message: `${activeParticipant.name} 搶奪了 ${victim.name} 的【${targetGift.title}】！(已搶奪 ${newStealCount}/${game.settings.maxSteals} 次)`,
      },
    ]

    if (shouldFreeze) {
      logsToAdd.unshift({
        id: `log_${Date.now()}_freeze`,
        timestamp: Date.now() + 1,
        type: 'FREEZE_GIFT',
        actorId: activeParticipant.id,
        actorName: activeParticipant.name,
        giftId: targetGift.id,
        giftTitle: targetGift.title,
        message: `【${targetGift.title}】已達到 ${game.settings.maxSteals} 次搶奪上限，正式被【冰凍鎖定】！`,
      })
    }

    // Now it's the victim's turn to react!
    const nextState: GameState = {
      ...game,
      participants: updatedParticipants,
      gifts: updatedGifts,
      logs: [...logsToAdd, ...game.logs],
      turnState: {
        ...game.turnState,
        activeParticipantId: victim.id,
        isStealReaction: true,
        lastStolenGiftId: targetGiftId,
        lastVictimId: victim.id,
        turnStepCount: game.turnState.turnStepCount + 1,
      },
      historyStack: pushHistorySnapshot(game),
    }

    await saveState(nextState)

    if (soundEnabled) {
      if (shouldFreeze) sounds.playFreeze()
      else sounds.playSteal()
    }
  }, [game, saveState, soundEnabled])

  // Final swap action by Player 1
  const executeFinalSwap = useCallback(async (swapWithGiftId: string | null) => {
    if (!game || game.phase !== 'FINAL_SWAP') return
    const player1 = game.participants.find((p) => p.order === 1)
    if (!player1) return

    let nextGifts = [...game.gifts]
    let nextParticipants = [...game.participants]
    const logsToAdd: ActionLog[] = []

    if (!swapWithGiftId) {
      // Player 1 decided to KEEP their current gift
      const currentGift = game.gifts.find((g) => g.id === player1.giftId)
      logsToAdd.push({
        id: `log_${Date.now()}_keep`,
        timestamp: Date.now(),
        type: 'FINAL_SWAP',
        actorId: player1.id,
        actorName: player1.name,
        message: `第 1 棒【${player1.name}】決定保留自己手中的【${currentGift?.title || '禮物'}】，不進行最終交換！`,
      })
    } else {
      // Player 1 swaps with target gift
      const p1Gift = game.gifts.find((g) => g.id === player1.giftId)
      const targetGift = game.gifts.find((g) => g.id === swapWithGiftId)
      const otherPlayer = game.participants.find((p) => p.id === targetGift?.currentOwnerId)

      if (targetGift && otherPlayer) {
        // Swap gifts
        nextGifts = nextGifts.map((g) => {
          if (g.id === p1Gift?.id) {
            return { ...g, currentOwnerId: otherPlayer.id }
          }
          if (g.id === targetGift.id) {
            return { ...g, currentOwnerId: player1.id }
          }
          return g
        })

        nextParticipants = nextParticipants.map((p) => {
          if (p.id === player1.id) {
            return { ...p, giftId: targetGift.id }
          }
          if (p.id === otherPlayer.id) {
            return { ...p, giftId: p1Gift?.id }
          }
          return p
        })

        logsToAdd.push({
          id: `log_${Date.now()}_swap`,
          timestamp: Date.now(),
          type: 'FINAL_SWAP',
          actorId: player1.id,
          actorName: player1.name,
          message: `第 1 棒【${player1.name}】發動最終交換權！用【${p1Gift?.title}】交換了 ${otherPlayer.name} 的【${targetGift.title}】！`,
        })
      }
    }

    logsToAdd.unshift({
      id: `log_${Date.now()}_finish`,
      timestamp: Date.now() + 1,
      type: 'GAME_FINISH',
      actorName: '系統',
      message: `交換禮物完美落幕！感謝所有人的熱情參與！Merry Christmas!`,
    })

    const finalState: GameState = {
      ...game,
      phase: 'FINISHED',
      gifts: nextGifts,
      participants: nextParticipants,
      logs: [...logsToAdd, ...game.logs],
      historyStack: pushHistorySnapshot(game),
    }

    await saveState(finalState)

    if (soundEnabled) sounds.playVictory()
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#e11d48', '#22c55e', '#fbbf24', '#38bdf8', '#ffffff'],
    })
  }, [game, saveState, soundEnabled])

  // Undo last action
  const undoLastAction = useCallback(async () => {
    if (!game || !game.historyStack || game.historyStack.length === 0) return
    const prevSnapshotStr = game.historyStack[game.historyStack.length - 1]
    const remainingStack = game.historyStack.slice(0, -1)

    try {
      const prevData = JSON.parse(prevSnapshotStr)
      const restoredState: GameState = {
        ...game,
        ...prevData,
        historyStack: remainingStack,
      }
      await saveState(restoredState)
    } catch (err) {
      console.error('Failed to undo:', err)
    }
  }, [game, saveState])

  // Export game to JSON string
  const exportGameJson = useCallback(() => {
    if (!game) return ''
    return JSON.stringify(game, null, 2)
  }, [game])

  // Import game from JSON string
  const importGameJson = useCallback(async (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText) as GameState
      if (!parsed.id || !parsed.participants || !parsed.settings) {
        throw new Error('無效的白象遊戲檔案格式')
      }
      await saveState(parsed)
      return true
    } catch (err) {
      console.error('Import failed:', err)
      return false
    }
  }, [saveState])

  return {
    game,
    isLoading,
    soundEnabled,
    setSoundEnabled,
    snowEnabled,
    setSnowEnabled,
    startNewGame,
    resetKeepParticipants,
    updateSettings,
    addParticipant,
    addParticipantsBatch,
    removeParticipant,
    drawTurnOrder,
    openGift,
    stealGift,
    executeFinalSwap,
    undoLastAction,
    exportGameJson,
    importGameJson,
  }
}
