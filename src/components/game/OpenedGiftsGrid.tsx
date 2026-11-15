import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  const getOwnerName = (ownerId: string) => {
    const p = participants.find((part) => part.id === ownerId)
    return p ? `${p.name} (${p.avatarEmoji || '🎁'})` : '未知'
  }

  const filteredGifts = gifts.filter((g) => {
    if (filter === 'ACTIVE') return !g.isFrozen
    if (filter === 'FROZEN') return g.isFrozen
    return true
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <span>🎁 場上已開禮物 ({gifts.length})</span>
        </h3>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#0c1210] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'ALL'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            全部 ({gifts.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'ACTIVE'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            可搶奪 ({gifts.filter((g) => !g.isFrozen).length})
          </button>
          <button
            onClick={() => setFilter('FROZEN')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'FROZEN'
                ? 'bg-cyan-800 text-white font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            已冰凍 ({gifts.filter((g) => g.isFrozen).length})
          </button>
        </div>
      </div>

      {gifts.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-xl bg-[#121a16]/40 p-6 text-center text-stone-400">
          <p className="text-sm">目前尚無已拆封禮物。請由第一棒開始開箱！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGifts.map((gift) => {
            const remainingSteals = settings.maxSteals - gift.stealCount

            return (
              <div
                key={gift.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  gift.isFrozen
                    ? 'border-cyan-500/30 bg-cyan-950/20'
                    : 'border-white/10 bg-[#121a16] hover:border-white/20'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <GiftIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {gift.title}
                    </h4>

                    {gift.isFrozen ? (
                      <Badge variant="frozen" className="shrink-0 text-[10px]">
                        <Snowflake className="w-2.5 h-2.5 mr-0.5" />
                        已冰凍
                      </Badge>
                    ) : gift.stealCount > 0 ? (
                      <Badge variant="gold" className="shrink-0 text-[10px]">
                        <Flame className="w-2.5 h-2.5 mr-0.5 text-orange-600" />
                        已搶 {gift.stealCount}/{settings.maxSteals} 次
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        原裝未搶
                      </span>
                    )}
                  </div>

                  {gift.description && (
                    <p className="text-xs text-stone-300 line-clamp-2">
                      {gift.description}
                    </p>
                  )}

                  {gift.tags && gift.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {gift.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-stone-300 border border-white/5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-stone-300">
                  <span className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3 text-amber-400 shrink-0" />
                    目前持有人：
                    <strong className="text-white truncate">
                      {getOwnerName(gift.currentOwnerId)}
                    </strong>
                  </span>

                  {!gift.isFrozen && (
                    <span className="text-[11px] text-amber-300 shrink-0">
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
