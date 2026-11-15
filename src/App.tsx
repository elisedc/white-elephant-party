import React, { useState } from 'react'
import { useWhiteElephant } from '@/hooks/useWhiteElephant'
import { Snowfall } from '@/components/common/Snowfall'
import { ChristmasHeader } from '@/components/common/ChristmasHeader'
import { RulesModal } from '@/components/common/RulesModal'
import { ResetGameModal } from '@/components/common/ResetGameModal'
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
import { Button } from '@/components/ui/button'
import { Sparkles, Crown, Gift, Users } from 'lucide-react'

export function App() {
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
    drawTurnOrder,
    startPlayingGame,
    backToSetup,
    openGift,
    stealGift,
    executeFinalSwap,
    undoLastAction,
    exportGameJson,
  } = useWhiteElephant()

  const [rulesOpen, setRulesOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [openGiftModalOpen, setOpenGiftModalOpen] = useState(false)
  const [stealGiftModalOpen, setStealGiftModalOpen] = useState(false)
  const [finalSwapModalOpen, setFinalSwapModalOpen] = useState(false)

  // Modals for secondary info
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false)
  const [openedGiftsModalOpen, setOpenedGiftsModalOpen] = useState(false)

  // Auto popup announcement dialog when next scheduled player is up (not steal reactions!)
  const [announcedTurn, setAnnouncedTurn] = useState<number | null>(null)
  const [nextPlayerModalOpen, setNextPlayerModalOpen] = useState(false)

  React.useEffect(() => {
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
    <div className="min-h-screen flex flex-col relative bg-[#faf7f2]">
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
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Phase 1: SETUP */}
        {game.phase === 'SETUP' && (
          <GameSetupForm
            settings={game.settings}
            participants={game.participants}
            onUpdateSettings={updateSettings}
            onAddParticipant={addParticipant}
            onAddBatch={addParticipantsBatch}
            onRemoveParticipant={removeParticipant}
            onStartDrawing={drawTurnOrder}
          />
        )}

        {/* Phase 1.5: DRAWING (Order Reveal Screen - announce game is starting) */}
        {game.phase === 'DRAWING' && (
          <DrawingRevealScreen
            participants={game.participants}
            onStartGame={startPlayingGame}
            onRedraw={drawTurnOrder}
            onBackToSetup={backToSetup}
          />
        )}

        {/* Phase 2: PLAYING (Left: Main Turn & Actions, Right: Live Stream Chat Activity Feed) */}
        {game.phase === 'PLAYING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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
            <div className="lg:col-span-1 lg:sticky lg:top-20">
              <LiveStreamFeed logs={game.logs} />
            </div>
          </div>
        )}

        {/* Phase 3: FINAL_SWAP */}
        {game.phase === 'FINAL_SWAP' && player1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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
            <div className="lg:col-span-1 lg:sticky lg:top-20">
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

      {/* Clean Footer - NO "本地存檔" text */}
      <footer className="border-t border-stone-200/80 bg-white py-4 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span>白象禮物交換 • 祝大家聖誕快樂！</span>
        </div>
      </footer>
    </div>
  )
}

export default App
