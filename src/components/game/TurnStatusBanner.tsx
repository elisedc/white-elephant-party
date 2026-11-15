import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Gift,
  Flame,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Users,
} from 'lucide-react'
import { GameState } from '@/types/game'

interface TurnStatusBannerProps {
  game: GameState
  onOpenGiftClick: () => void
  onStealGiftClick: () => void
  onUndoClick: () => void
  onOpenParticipants: () => void
  onOpenOpenedGifts: () => void
  canSteal: boolean
}

export const TurnStatusBanner: React.FC<TurnStatusBannerProps> = ({
  game,
  onOpenGiftClick,
  onStealGiftClick,
  onUndoClick,
  onOpenParticipants,
  onOpenOpenedGifts,
  canSteal,
}) => {
  const activeParticipant = game.participants.find(
    (p) => p.id === game.turnState.activeParticipantId
  )
  const isStealReaction = game.turnState.isStealReaction
  const hasHistory = (game.historyStack || []).length > 0
  const isFirstTurn = game.turnState.currentOrderNumber === 1 && !isStealReaction

  // Calculate next scheduled player
  const nextOrderNumber = game.turnState.currentOrderNumber + 1
  const nextParticipant = game.participants.find((p) => p.order === nextOrderNumber)

  // Eligible gifts that can be stolen right now
  const stealableGiftsCount = game.gifts.filter(
    (g) =>
      g.currentOwnerId !== game.turnState.activeParticipantId &&
      !g.isFrozen &&
      (game.settings.allowImmediateStealBack || g.id !== game.turnState.lastStolenGiftId)
  ).length

  return (
    <div className="space-y-4">
      {/* Main Turn Card */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 shadow-xs text-center transition-all ${
          isStealReaction
            ? 'border-amber-300 bg-amber-50/70'
            : 'border-stone-200 bg-white'
        }`}
      >
        {/* Phase Pill */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            第 {game.turnState.currentOrderNumber} 棒 / 共 {game.participants.length} 位
          </span>

          {isStealReaction ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              禮物被搶！反擊時間
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              輪到行動
            </span>
          )}
        </div>

        {/* Current Active Player (Whoever is up) */}
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Keep ONLY player avatar emoji */}
          <div className="h-20 w-20 rounded-3xl bg-stone-50 border border-stone-200 flex items-center justify-center text-4xl shadow-xs">
            {activeParticipant?.avatarEmoji || '🎅'}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {activeParticipant?.name || '玩家'}
          </h2>

          <p className="text-xs sm:text-sm text-stone-500 max-w-md">
            {isStealReaction
              ? '你的禮物剛剛被搶走，請選擇拆新禮物或搶奪其他人的禮物！'
              : isFirstTurn
              ? '第 1 棒開場，請先拆開一份全新的禮物'
              : '請選擇【拆開全新禮物】或【搶奪場上禮物】'}
          </p>
        </div>

        {/* Next Player Preview (Whoever is up next) */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-500">
          <span>下一位順序：</span>
          {nextParticipant ? (
            <span className="font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-stone-400" />
              第 {nextParticipant.order} 棒 • {nextParticipant.name} {nextParticipant.avatarEmoji}
            </span>
          ) : (
            <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              已是最後一位玩家！後續將進入最終高潮
            </span>
          )}
        </div>

        {/* THE TWO MAIN ACTIONS (Primary Style: Solid Color w/ White Text) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* Action 1: Open New Gift - Solid Cranberry Red with White Text */}
          <button
            type="button"
            disabled={game.unopenedGiftsCount <= 0}
            onClick={onOpenGiftClick}
            className={`group text-left p-5 rounded-2xl transition-all flex flex-col justify-between min-h-[140px] ${
              game.unopenedGiftsCount > 0
                ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white shadow-md border border-rose-500 cursor-pointer'
                : 'bg-stone-200 text-stone-400 border border-stone-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl ${
                game.unopenedGiftsCount > 0 ? 'bg-white/20 text-white' : 'bg-stone-300 text-stone-400'
              }`}>
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                game.unopenedGiftsCount > 0 ? 'bg-white/20 text-white border-white/30' : 'bg-stone-300 text-stone-500 border-stone-300'
              }`}>
                剩 {game.unopenedGiftsCount} 份未拆
              </span>
            </div>

            <div className="pt-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xl text-white">
                  拆開全新禮物
                </span>
                <ChevronRight className="w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-rose-100 mt-1">
                從中央挑選一份未開封禮物當場揭曉
              </p>
            </div>
          </button>

          {/* Action 2: Steal Opened Gift - Solid Amber Gold with White Text */}
          <button
            type="button"
            disabled={!canSteal}
            onClick={onStealGiftClick}
            className={`group text-left p-5 rounded-2xl transition-all flex flex-col justify-between min-h-[140px] ${
              canSteal
                ? 'bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white shadow-md border border-amber-500 cursor-pointer'
                : 'bg-stone-200 text-stone-400 border border-stone-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl ${
                canSteal ? 'bg-white/20 text-white' : 'bg-stone-300 text-stone-400'
              }`}>
                <Flame className="w-5 h-5 fill-current text-white" />
              </div>
              {canSteal ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/20 text-white border border-white/30">
                  {stealableGiftsCount} 份可搶奪
                </span>
              ) : (
                <span className="text-xs text-stone-500">
                  {isFirstTurn ? '第 1 棒開場無法掠奪' : '場上無可搶禮物'}
                </span>
              )}
            </div>

            <div className="pt-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xl text-white">
                  搶奪場上禮物
                </span>
                <ChevronRight className="w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-amber-100 mt-1">
                奪取前面玩家已開禮物，讓被搶者反擊
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Information Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenParticipants}
          className="text-xs h-9 px-3.5 border-stone-200 bg-white hover:bg-stone-50 text-stone-700 shadow-2xs"
        >
          <Users className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
          查看玩家名單 ({game.participants.length})
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenOpenedGifts}
          className="text-xs h-9 px-3.5 border-stone-200 bg-white hover:bg-stone-50 text-stone-700 shadow-2xs"
        >
          <Gift className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
          已開禮物清單 ({game.gifts.length})
        </Button>

        {hasHistory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndoClick}
            className="text-xs h-9 px-3 text-stone-500 hover:text-stone-800"
            title="復原上一步"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            復原上一步
          </Button>
        )}
      </div>
    </div>
  )
}
