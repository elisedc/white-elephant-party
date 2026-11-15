import React, { useState } from 'react'
import { Gift as GiftIcon, Flame, Snowflake, User } from 'lucide-react'
import { Gift, Participant, GameSettings } from '@/types/game'

interface OpenedGiftsGridProps {
  gifts: Gift[]
  participants: Participant[]
  settings: GameSettings
}

export const OpenedGiftsGrid: React.FC<OpenedGiftsGridProps> = ({
  gifts,
  participants,
  settings,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'FROZEN'>('ALL')

  const getOwner = (ownerId: string) => {
    return participants.find((part) => part.id === ownerId)
  }

  const filteredGifts = gifts.filter((g) => {
    if (filter === 'ACTIVE') return !g.isFrozen
    if (filter === 'FROZEN') return g.isFrozen
    return true
  })

  return (
    <div className="space-y-3">
      {/* Filter buttons bar without duplicate title */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'ALL'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            全部 ({gifts.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'ACTIVE'
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            可搶奪 ({gifts.filter((g) => !g.isFrozen).length})
          </button>
          <button
            onClick={() => setFilter('FROZEN')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'FROZEN'
                ? 'bg-cyan-100 text-cyan-900 font-bold border border-cyan-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            已冰凍 ({gifts.filter((g) => g.isFrozen).length})
          </button>
        </div>
      </div>

      {gifts.length === 0 ? (
        <div className="border border-dashed border-stone-200 rounded-xl bg-white/60 p-6 text-center text-stone-400">
          <p className="text-sm">目前尚無已拆封禮物。請由第 1 棒開始開箱！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGifts.map((gift) => {
            const owner = getOwner(gift.currentOwnerId)
            const remainingSteals = settings.maxSteals - gift.stealCount

            return (
              <div
                key={gift.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between shadow-xs ${
                  gift.isFrozen
                    ? 'border-cyan-200 bg-cyan-50/50'
                    : 'border-stone-200/90 bg-white hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                      <GiftIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      {gift.title}
                    </h4>

                    {gift.isFrozen ? (
                      <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-100 border border-cyan-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                        <Snowflake className="w-2.5 h-2.5" />
                        已冰凍
                      </span>
                    ) : gift.stealCount > 0 ? (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                        <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                        搶過 {gift.stealCount}/{settings.maxSteals}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                        沒被搶過
                      </span>
                    )}
                  </div>

                  {gift.tags && gift.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {gift.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3 text-amber-600 shrink-0" />
                    持有人：
                    <strong className="text-stone-900 truncate">
                      {owner?.name} {owner?.avatarEmoji}
                    </strong>
                  </span>

                  {!gift.isFrozen && (
                    <span className="text-[11px] text-amber-700 font-medium shrink-0">
                      剩 {remainingSteals} 次
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
