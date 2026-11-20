import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useWhiteElephant } from '@/hooks/useWhiteElephant'
import { Snowfall } from '@/components/common/Snowfall'
import { ChristmasHeader } from '@/components/common/ChristmasHeader'
import { RulesModal } from '@/components/common/RulesModal'
import { ResetGameModal } from '@/components/common/ResetGameModal'
import { RoomQrCodeModal } from '@/components/common/RoomQrCodeModal'
import { GameSetupForm } from '@/components/setup/GameSetupForm'
import { TurnStatusBanner } from '@/components/game/TurnStatusBanner'
import { LiveStreamFeed } from '@/components/game/LiveStreamFeed'
import { OpenGiftModal } from '@/components/game/OpenGiftModal'
import { StealGiftModal } from '@/components/game/StealGiftModal'
import { FinalSwapModal } from '@/components/game/FinalSwapModal'
import { ParticipantsModal } from '@/components/game/ParticipantsModal'
import { OpenedGiftsModal } from '@/components/game/OpenedGiftsModal'
import { NextPlayerAnnounceModal } from '@/components/game/NextPlayerAnnounceModal'
import { DrawingRevealScreen } from '@/components/game/DrawingRevealScreen'
import { GameSummary } from '@/components/summary/GameSummary'
import { PlayerMobileView } from '@/components/player/PlayerMobileView'
import { LandingJoinScreen } from '@/components/home/LandingJoinScreen'
import { RoomRealtimeBridge } from '@/services/realtime/channel'
import { FloatingReactionsOverlay, useFloatingReactions } from '@/components/common/FloatingReactionsOverlay'
import { Button } from '@/components/ui/button'
import { Sparkles, Crown, Gift, Users } from 'lucide-react'
import { GameState } from '@/types/game'

/**
 * Mobile Player Companion View
 */
function PlayerApp({
  roomId,
  onBackToLanding,
}: {
  roomId: string
  onBackToLanding?: () => void
}) {
  const bridge = useMemo(() => new RoomRealtimeBridge(roomId), [roomId])
  const [gameState, setGameState] = useState<GameState | null>(() => {
    try {
      const activeId = localStorage.getItem('white_elephant_active_game_id')
      if (activeId === roomId || !roomId) {
        const store = JSON.parse(localStorage.getItem('white_elephant_games_store_v1') || '{}')
        return store[activeId || roomId] || null
      }
    } catch {
      // ignore
    }
    return null
  })

  useEffect(() => {
    let isCancelled = false

    // 1. Listen for state sync from host via bridge
    const unsubscribe = bridge.subscribe((msg) => {
      if (msg.type === 'SYNC_STATE' && msg.payload?.gameState) {
        setGameState(msg.payload.gameState)
      }
    })

    // 2. Fetch room state via HTTP fallback immediately (instant sync for mobile devices)
    fetch(`/api/room-state?room=${encodeURIComponent(roomId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data?.gameState) {
          setGameState(data.gameState)
        }
      })
      .catch(() => {})

    // 3. Initial state request via bridge
    bridge.send('REQUEST_SYNC', {})

    // 4. Periodic heartbeat sync request to stay in sync
    const interval = setInterval(() => {
      bridge.send('REQUEST_SYNC', {})
      fetch(`/api/room-state?room=${encodeURIComponent(roomId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isCancelled && data?.gameState) {
            setGameState(data.gameState)
          }
        })
        .catch(() => {})
    }, 2500)

    return () => {
      isCancelled = true
      unsubscribe()
      clearInterval(interval)
      bridge.destroy()
    }
  }, [bridge, roomId])

  return (
    <PlayerMobileView
      roomId={roomId}
      bridge={bridge}
      gameState={gameState}
      onBackToLanding={onBackToLanding}
    />
  )
}

/**
 * Host Big-Screen Interactive Game Console
 */
function HostApp({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const {
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
    clearParticipants,
    drawTurnOrder,
    startPlayingGame,
    backToSetup,
    openGift,
    stealGift,
    executeFinalSwap,
    undoLastAction,
    exportGameJson,
    addLiveLog,
  } = useWhiteElephant()

  const [rulesOpen, setRulesOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [openGiftModalOpen, setOpenGiftModalOpen] = useState(false)
  const [stealGiftModalOpen, setStealGiftModalOpen] = useState(false)
  const [finalSwapModalOpen, setFinalSwapModalOpen] = useState(false)

  // Modals for secondary info
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false)
  const [openedGiftsModalOpen, setOpenedGiftsModalOpen] = useState(false)

  // Auto popup announcement dialog when next scheduled player is up (not steal reactions!)
  const [announcedTurn, setAnnouncedTurn] = useState<number | null>(null)
  const [nextPlayerModalOpen, setNextPlayerModalOpen] = useState(false)

  // Google Meet style floating reactions for host screen
  const { reactions, triggerReaction } = useFloatingReactions()

  // Realtime communication bridge for remote player devices
  const bridge = useMemo(() => {
    if (!game?.id) return null
    return new RoomRealtimeBridge(game.id)
  }, [game?.id])

  const gameRef = useRef(game)
  gameRef.current = game

  // Sync state broadcast whenever game updates
  useEffect(() => {
    if (bridge && game) {
      bridge.send('SYNC_STATE', { gameState: game })
    }
  }, [bridge, game])

  // Listen to remote player events (Join, Chat comment, Emoji reaction, Sync request)
  useEffect(() => {
    if (!bridge) return

    const unsubscribe = bridge.subscribe(async (msg) => {
      const currentGame = gameRef.current
      if (!currentGame) return

      if (msg.type === 'PLAYER_JOIN') {
        const { id, name, avatarEmoji } = msg.payload
        if (currentGame.phase === 'SETUP') {
          const updated = await addParticipant(name, avatarEmoji, 'online', false, id)
          if (updated) {
            bridge.send('SYNC_STATE', { gameState: updated })
          }
        } else {
          // If already in PLAYING or later phase, still sync state so player companion has current view
          bridge.send('SYNC_STATE', { gameState: currentGame })
        }
      } else if (msg.type === 'CHAT_MESSAGE') {
        const { senderName, avatarEmoji, text } = msg.payload
        addLiveLog({
          id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          type: 'CHAT_MESSAGE',
          actorName: senderName,
          actorAvatarEmoji: avatarEmoji,
          message: text,
        })
      } else if (msg.type === 'EMOJI_REACTION') {
        const { senderName, avatarEmoji, emoji } = msg.payload
        triggerReaction(emoji, senderName, avatarEmoji)
        addLiveLog({
          id: `emoji_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          type: 'EMOJI_REACTION',
          actorName: senderName,
          actorAvatarEmoji: avatarEmoji,
          emoji,
          message: `傳送了 ${emoji}`,
        })
      } else if (msg.type === 'REQUEST_SYNC') {
        const latest = gameRef.current || currentGame
        bridge.send('SYNC_STATE', { gameState: latest })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [bridge, addParticipant, addLiveLog, triggerReaction])

  useEffect(() => {
    if (game?.phase === 'PLAYING') {
      if (!game.turnState.isStealReaction && game.turnState.currentOrderNumber >= 2) {
        if (announcedTurn !== game.turnState.currentOrderNumber) {
          setAnnouncedTurn(game.turnState.currentOrderNumber)
          setNextPlayerModalOpen(true)
        }
      }
    } else if (game?.phase === 'SETUP' || game?.phase === 'DRAWING') {
      setAnnouncedTurn(null)
      setNextPlayerModalOpen(false)
    }
  }, [game?.phase, game?.turnState?.currentOrderNumber, game?.turnState?.isStealReaction, announcedTurn])

  if (isLoading || !game) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center text-stone-700 space-y-3">
        <Gift className="w-8 h-8 text-rose-600 animate-bounce" />
        <p className="text-stone-600 font-semibold tracking-wide text-sm">
          載入白象交換禮物中...
        </p>
      </div>
    )
  }

  const activeParticipant = game.participants.find(
    (p) => p.id === game.turnState.activeParticipantId
  )
  const player1 = game.participants.find((p) => p.order === 1)
  const player1Gift = game.gifts.find((g) => g.id === player1?.giftId)

  // Can the active participant steal?
  const eligibleGiftsToSteal = game.gifts.filter(
    (g) =>
      g.currentOwnerId !== game.turnState.activeParticipantId &&
      !g.isFrozen &&
      (game.settings.allowImmediateStealBack || g.id !== game.turnState.lastStolenGiftId)
  )
  const canSteal = eligibleGiftsToSteal.length > 0 && (
    game.turnState.isStealReaction || game.turnState.currentOrderNumber > 1
  )

  const handleExportJson = () => {
    const jsonStr = exportGameJson()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `white-elephant-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen flex flex-col relative bg-[#faf7f2] overflow-hidden">
      {/* Falling Snowflakes (Clean SVG) */}
      <Snowfall enabled={snowEnabled} />

      {/* Main Header */}
      <ChristmasHeader
        title={game.settings.title}
        phase={game.phase}
        snowEnabled={snowEnabled}
        onToggleSnow={() => setSnowEnabled(!snowEnabled)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenRules={() => setRulesOpen(true)}
        onNewGame={() => setResetModalOpen(true)}
        onOpenQrCode={game.phase !== 'SETUP' ? () => setQrModalOpen(true) : undefined}
        onBackToLanding={onBackToLanding}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex flex-col min-h-0 overflow-y-auto">
        {/* Phase 1: SETUP */}
        {game.phase === 'SETUP' && (
          <GameSetupForm
            roomId={game.id}
            settings={game.settings}
            participants={game.participants}
            onUpdateSettings={updateSettings}
            onAddParticipant={addParticipant}
            onAddBatch={addParticipantsBatch}
            onRemoveParticipant={removeParticipant}
            onClearParticipants={clearParticipants}
            onStartDrawing={drawTurnOrder}
          />
        )}

        {/* Phase 1.5: DRAWING (Order Reveal Screen - announce game is starting) */}
        {game.phase === 'DRAWING' && (
          <DrawingRevealScreen
            participants={game.participants}
            onStartGame={startPlayingGame}
            onRedraw={() => drawTurnOrder(game.settings.mode)}
            onBackToSetup={backToSetup}
          />
        )}

        {/* Phase 2: PLAYING (Left: Main Turn & Actions, Right: Live Stream Chat Activity Feed) */}
        {game.phase === 'PLAYING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch flex-1 min-h-0">
            {/* Left: Main Focus Stage (Whoever is up, Whoever is up next, Two Main Actions) */}
            <div className="lg:col-span-2">
              <TurnStatusBanner
                game={game}
                onOpenGiftClick={() => setOpenGiftModalOpen(true)}
                onStealGiftClick={() => setStealGiftModalOpen(true)}
                onUndoClick={undoLastAction}
                onOpenParticipants={() => setParticipantsModalOpen(true)}
                onOpenOpenedGifts={() => setOpenedGiftsModalOpen(true)}
                canSteal={canSteal}
              />
            </div>

            {/* Right: Live Stream Style Activity Log */}
            <div className="lg:col-span-1 h-full min-h-0 flex flex-col">
              <LiveStreamFeed logs={game.logs} />
            </div>
          </div>
        )}

        {/* Phase 3: FINAL_SWAP */}
        {game.phase === 'FINAL_SWAP' && player1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch flex-1 min-h-0">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 rounded-3xl border border-amber-300 bg-amber-50/80 shadow-xs text-center space-y-4">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200">
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  最終交換權 (The Final Turn)
                </span>

                <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                  輪到第 1 棒【{player1.name}】行使特權！
                </h2>

                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  所有人都已拆開禮物，第 1 棒現在可以決定保留目前禮物，或與場上任一未冰凍禮物互換！
                </p>

                <div className="pt-2">
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => setFinalSwapModalOpen(true)}
                    className="font-bold text-base h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    進行最終決定
                  </Button>
                </div>
              </div>

              {/* Quick buttons */}
              <div className="flex items-center justify-center gap-3 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParticipantsModalOpen(true)}
                  className="border-stone-200 bg-white text-stone-700 shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 mr-1 text-stone-500" />
                  全體名單 ({game.participants.length})
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenedGiftsModalOpen(true)}
                  className="border-stone-200 bg-white text-stone-700 shadow-2xs"
                >
                  <Gift className="w-3.5 h-3.5 mr-1 text-rose-500" />
                  已開禮物 ({game.gifts.length})
                </Button>
              </div>
            </div>

            {/* Right: Live Stream Feed */}
            <div className="lg:col-span-1 h-full min-h-0 flex flex-col">
              <LiveStreamFeed logs={game.logs} />
            </div>
          </div>
        )}

        {/* Phase 4: FINISHED */}
        {game.phase === 'FINISHED' && (
          <GameSummary
            game={game}
            onRestartNewGame={() => setResetModalOpen(true)}
            onExportJson={handleExportJson}
          />
        )}
      </main>

      {/* QR Code Modal for Mobile Players */}
      <RoomQrCodeModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        roomId={game.id}
        roomTitle={game.settings.title}
        participantCount={game.participants.length}
      />

      {/* Rules Modal */}
      <RulesModal open={rulesOpen} onOpenChange={setRulesOpen} />

      {/* Reset / New Game Modal */}
      <ResetGameModal
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        participantCount={game.participants.length}
        onResetKeepParticipants={resetKeepParticipants}
        onResetFresh={startNewGame}
      />

      {/* Open Gift Modal (Simple: Title & Tags only) */}
      <OpenGiftModal
        open={openGiftModalOpen}
        onOpenChange={setOpenGiftModalOpen}
        participantName={activeParticipant?.name || '玩家'}
        onSubmit={openGift}
      />

      {/* Steal Gift Modal */}
      <StealGiftModal
        open={stealGiftModalOpen}
        onOpenChange={setStealGiftModalOpen}
        gifts={game.gifts}
        participants={game.participants}
        activeParticipantId={game.turnState.activeParticipantId}
        lastStolenGiftId={game.turnState.lastStolenGiftId}
        settings={game.settings}
        onSteal={stealGift}
      />

      {/* Final Swap Modal */}
      {player1 && (
        <FinalSwapModal
          open={finalSwapModalOpen}
          onOpenChange={setFinalSwapModalOpen}
          player1={player1}
          player1Gift={player1Gift}
          gifts={game.gifts}
          participants={game.participants}
          onExecuteSwap={executeFinalSwap}
        />
      )}

      {/* Full Participants Roster Modal (1 Column, On-demand) */}
      <ParticipantsModal
        open={participantsModalOpen}
        onOpenChange={setParticipantsModalOpen}
        participants={game.participants}
        gifts={game.gifts}
        activeParticipantId={game.turnState.activeParticipantId}
        settings={game.settings}
      />

      {/* Opened Gifts List Modal (On-demand) */}
      <OpenedGiftsModal
        open={openedGiftsModalOpen}
        onOpenChange={setOpenedGiftsModalOpen}
        gifts={game.gifts}
        participants={game.participants}
        settings={game.settings}
      />

      {/* Next Player Announcement Modal (Auto opens on next scheduled player, skipped for steal reactions) */}
      <NextPlayerAnnounceModal
        open={nextPlayerModalOpen}
        onOpenChange={setNextPlayerModalOpen}
        player={activeParticipant}
        totalParticipants={game.participants.length}
        canSteal={canSteal}
        soundEnabled={soundEnabled}
      />

      {/* Google Meet Style Live Floating Reactions Overlay on Host Screen */}
      <FloatingReactionsOverlay reactions={reactions} showSenderName={true} />

      {/* Clean Footer - NO "本地存檔" text */}
      <footer className="border-t border-stone-200/80 bg-white py-2 px-4 text-center text-[11px] text-stone-500 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span>白象禮物交換 • 祝大家聖誕快樂！</span>
        </div>
      </footer>
    </div>
  )
}

/**
 * Root Application Router: Role-based view selection with Landing Screen
 */
export function App() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search))
  const roleParam = searchParams.get('role')
  const roomParam = searchParams.get('room')

  // Initial view:
  // - If role=player in URL -> direct to player companion
  // - If role=host in URL -> direct to host dashboard
  // - Otherwise -> initial landing screen (enter 7-character code or start new game)
  const [currentView, setCurrentView] = useState<'landing' | 'player' | 'host'>(() => {
    if (roleParam === 'player') return 'player'
    if (roleParam === 'host') return 'host'
    return 'landing'
  })

  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    if (roomParam) return roomParam
    return ''
  })

  // Handle joining a party with 7-char code from landing screen
  const handleJoinParty = (code: string) => {
    const cleaned = code.trim().toUpperCase()
    setActiveRoomId(cleaned)
    setCurrentView('player')
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('role', 'player')
      url.searchParams.set('room', cleaned)
      window.history.pushState({}, '', url.toString())
    }
  }

  // Handle starting a new game as host from landing screen
  const handleStartNewGame = () => {
    setCurrentView('host')
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('role', 'host')
      url.searchParams.delete('room')
      window.history.pushState({}, '', url.toString())
    }
  }

  // Handle returning to landing screen
  const handleBackToLanding = () => {
    setCurrentView('landing')
    setActiveRoomId('')
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('role')
      url.searchParams.delete('room')
      window.history.pushState({}, '', url.pathname)
    }
  }

  if (currentView === 'player' && activeRoomId) {
    return <PlayerApp roomId={activeRoomId} onBackToLanding={handleBackToLanding} />
  }

  if (currentView === 'host') {
    return <HostApp onBackToLanding={handleBackToLanding} />
  }

  return (
    <LandingJoinScreen
      onJoinParty={handleJoinParty}
      onStartNewGame={handleStartNewGame}
    />
  )
}

export default App
