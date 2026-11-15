import React, { useState } from 'react'
import { useWhiteElephant } from '@/hooks/useWhiteElephant'
import { Snowfall } from '@/components/common/Snowfall'
import { ChristmasHeader } from '@/components/common/ChristmasHeader'
import { RulesModal } from '@/components/common/RulesModal'
import { ResetGameModal } from '@/components/common/ResetGameModal'
import { GameSetupForm } from '@/components/setup/GameSetupForm'
import { TurnStatusBanner } from '@/components/game/TurnStatusBanner'
import { OpenGiftModal } from '@/components/game/OpenGiftModal'
import { StealGiftModal } from '@/components/game/StealGiftModal'
import { FinalSwapModal } from '@/components/game/FinalSwapModal'
import { ParticipantsGrid } from '@/components/game/ParticipantsGrid'
import { OpenedGiftsGrid } from '@/components/game/OpenedGiftsGrid'
import { ActionHistoryLog } from '@/components/game/ActionHistoryLog'
import { GameSummary } from '@/components/summary/GameSummary'
import { Button } from '@/components/ui/button'
import { Sparkles, Crown } from 'lucide-react'

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

  if (isLoading || !game) {
    return (
      <div className="min-h-screen bg-[#0c1210] flex flex-col items-center justify-center text-white space-y-3">
        <div className="text-4xl animate-bounce">🎁</div>
        <p className="text-stone-300 font-semibold tracking-wide">
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
    <div className="min-h-screen flex flex-col relative selection:bg-rose-500 selection:text-white bg-[#0c1210]">
      {/* Falling Snowflakes */}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
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

        {/* Phase 2: PLAYING */}
        {game.phase === 'PLAYING' && (
          <div className="space-y-6">
            {/* Active Turn Command Center & Primary Actions */}
            <TurnStatusBanner
              game={game}
              onOpenGiftClick={() => setOpenGiftModalOpen(true)}
              onStealGiftClick={() => setStealGiftModalOpen(true)}
              onUndoClick={undoLastAction}
              canSteal={canSteal}
            />

            {/* Layout: 20-Player Grid & Opened Gifts + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ParticipantsGrid
                  participants={game.participants}
                  gifts={game.gifts}
                  activeParticipantId={game.turnState.activeParticipantId}
                  settings={game.settings}
                />

                <OpenedGiftsGrid
                  gifts={game.gifts}
                  participants={game.participants}
                  settings={game.settings}
                />
              </div>

              <div className="space-y-6">
                <ActionHistoryLog logs={game.logs} />
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: FINAL_SWAP */}
        {game.phase === 'FINAL_SWAP' && player1 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-amber-500/50 bg-[#1e170f] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                  <Crown className="w-4 h-4 text-amber-400" />
                  高潮最終交換權 (The Final Turn)
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  輪到第 1 棒【{player1.name}】行使最終特權！
                </h3>
                <p className="text-xs sm:text-sm text-stone-300">
                  所有人都已拆開禮物，第 1 棒現在可以決定保留目前禮物，或與場上任一未冰凍禮物互換！
                </p>
              </div>

              <Button
                size="lg"
                variant="gold"
                onClick={() => setFinalSwapModalOpen(true)}
                className="shrink-0 font-bold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                開啟最終決定視窗
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ParticipantsGrid
                  participants={game.participants}
                  gifts={game.gifts}
                  activeParticipantId={player1.id}
                  settings={game.settings}
                />
                <OpenedGiftsGrid
                  gifts={game.gifts}
                  participants={game.participants}
                  settings={game.settings}
                />
              </div>

              <div className="space-y-6">
                <ActionHistoryLog logs={game.logs} />
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: FINISHED */}
        {game.phase === 'FINISHED' && (
          <div className="space-y-8">
            <GameSummary
              game={game}
              onRestartNewGame={() => setResetModalOpen(true)}
              onExportJson={handleExportJson}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OpenedGiftsGrid
                  gifts={game.gifts}
                  participants={game.participants}
                  settings={game.settings}
                />
              </div>
              <div>
                <ActionHistoryLog logs={game.logs} />
              </div>
            </div>
          </div>
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

      {/* Open Gift Modal */}
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

      {/* Clean Footer */}
      <footer className="border-t border-white/5 bg-[#090e0c] py-4 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>白象禮物交換 • 祝大家聖誕快樂！</span>
          <span className="text-stone-400">本地存檔 (可切換遠端資料庫)</span>
        </div>
      </footer>
    </div>
  )
}

export default App
