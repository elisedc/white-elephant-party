import React from 'react'
import { Button } from '@/components/ui/button'
import { Gift, Flame, RotateCcw, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react'
import { GameState } from '@/types/game'

interface TurnStatusBannerProps {
  game: GameState
  onOpenGiftClick: () => void
  onStealGiftClick: () => void
  onUndoClick: () => void
  canSteal: boolean
}

export const TurnStatusBanner: React.FC<TurnStatusBannerProps> = ({
  game,
  onOpenGiftClick,
  onStealGiftClick,
  onUndoClick,
  canSteal,
}) => {
  const activeParticipant = game.participants.find(
    (p) => p.id === game.turnState.activeParticipantId
  )
  const isStealReaction = game.turnState.isStealReaction
  const hasHistory = (game.historyStack || []).length > 0
  const isFirstTurn = game.turnState.currentOrderNumber === 1 && !isStealReaction

  // Eligible gifts that can be stolen right now
  const stealableGiftsCount = game.gifts.filter(
    (g) =>
      g.currentOwnerId !== game.turnState.activeParticipantId &&
      !g.isFrozen &&
      (game.settings.allowImmediateStealBack || g.id !== game.turnState.lastStolenGiftId)
  ).length

  return (
    <div className="space-y-4">
      {/* Top Turn Header */}
      <div
        className={`rounded-2xl border p-5 shadow-xs transition-all ${
          isStealReaction
            ? 'border-amber-300 bg-amber-50/70'
            : 'border-stone-200 bg-white'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Player's Avatar Icon */}
            <div className="h-14 w-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-3xl shrink-0 shadow-xs">
              {activeParticipant?.avatarEmoji || '🎅'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  第 {game.turnState.currentOrderNumber} 棒 / 共 {game.participants.length} 位
                </span>

                {isStealReaction ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    禮物剛被搶走！被搶者反擊
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    輪到抽籤順序行動
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  {activeParticipant?.name || '玩家'}
                </h3>
                <span className="text-xs text-stone-500">
                  {isStealReaction
                    ? '請從下方選擇【拆開全新禮物】或【搶奪場上禮物】'
                    : isFirstTurn
                    ? '第 1 棒開場，請先拆開中央禮物堆的一份全新禮物'
                    : '輪到你了，請選擇開箱全新禮物或搶奪場上禮物'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Undo / Overview */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            {hasHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onUndoClick}
                className="text-xs h-9 px-3 border-stone-200 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50"
                title="復原上一步動作"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-stone-400" />
                復原上一步
              </Button>
            )}
          </div>
        </div>

        {/* PRIMARY ACTIONS: Prominent, Big, Warm, Centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 mt-4 border-t border-stone-100">
          {/* Action 1: Open New Gift */}
          <button
            type="button"
            disabled={game.unopenedGiftsCount <= 0}
            onClick={onOpenGiftClick}
            className={`group text-left p-5 rounded-2xl border transition-all flex items-center justify-between ${
              game.unopenedGiftsCount > 0
                ? 'border-rose-300 bg-gradient-to-br from-rose-50 to-white hover:border-rose-400 hover:shadow-md cursor-pointer'
                : 'border-stone-200 bg-stone-50 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl text-rose-950">
                    拆開全新禮物
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200">
                    剩 {game.unopenedGiftsCount} 份未拆
                  </span>
                </div>
                <p className="text-xs text-rose-800/80 mt-0.5">
                  從中央禮物堆拿取一份未拆封禮物，當場揭曉！
                </p>
              </div>
            </div>

            <ChevronRight className="w-6 h-6 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Action 2: Steal Opened Gift */}
          <button
            type="button"
            disabled={!canSteal}
            onClick={onStealGiftClick}
            className={`group text-left p-5 rounded-2xl border transition-all flex items-center justify-between ${
              canSteal
                ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white hover:border-amber-400 hover:shadow-md cursor-pointer'
                : 'border-stone-200 bg-stone-50 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-xs shrink-0 ${
                canSteal ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-400'
              }`}>
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl text-stone-900">
                    搶奪場上禮物
                  </span>
                  {canSteal ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                      {stealableGiftsCount} 份可搶奪
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">
                      {isFirstTurn ? '第 1 棒開場無法掠奪' : '場上無可搶奪禮物'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  奪取前面玩家已開的禮物，讓被搶者重新行動！
                </p>
              </div>
            </div>

            <ChevronRight className="w-6 h-6 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}
