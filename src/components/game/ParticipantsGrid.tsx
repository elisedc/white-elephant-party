import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift as GiftIcon, Flame, Snowflake, Sparkles } from 'lucide-react'
import { Participant, Gift, GameSettings } from '@/types/game'

interface ParticipantsGridProps {
  participants: Participant[]
  gifts: Gift[]
  activeParticipantId: string
  settings: GameSettings
}

export const ParticipantsGrid: React.FC<ParticipantsGridProps> = ({
  participants,
  gifts,
  activeParticipantId,
  settings,
}) => {
  const sortedParticipants = [...participants].sort(
    (a, b) => (a.order || 999) - (b.order || 999)
  )

  const getGift = (giftId?: string) => gifts.find((g) => g.id === giftId)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <span>👥 玩家抽籤順序與持物現況</span>
          <span className="text-xs font-normal text-stone-400">
            ({participants.length} 位玩家)
          </span>
        </h3>

        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            行動中
          </span>
          <span className="flex items-center gap-1">
            <Snowflake className="w-3 h-3 text-cyan-400" />
            已冰凍 (安全)
          </span>
        </div>
      </div>

      {/* Responsive Grid optimized for 20 players (2 cols on mobile, 3 on tablet, 4 on desktop, 5 on wide) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {sortedParticipants.map((p) => {
          const isActive = p.id === activeParticipantId
          const gift = getGift(p.giftId)

          return (
            <div
              key={p.id}
              className={`relative rounded-xl border p-2.5 transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500/70 shadow-lg'
                  : 'border-white/10 bg-[#121a16] hover:border-white/20'
              }`}
            >
              {/* Header: Order & Name */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className={`h-5 w-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                      isActive
                        ? 'bg-rose-600 text-white'
                        : p.order === 1
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-white/10 text-stone-300'
                    }`}
                  >
                    #{p.order}
                  </span>
                  <span className="font-bold text-xs text-white truncate">
                    {p.name}
                  </span>
                </div>
                <span className="text-xs shrink-0">{p.avatarEmoji || '🎁'}</span>
              </div>

              {/* Gift status */}
              <div className="rounded-lg bg-[#0c1210] border border-white/5 p-2 min-h-[50px] flex flex-col justify-center">
                {gift ? (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs text-stone-100 truncate flex items-center gap-1">
                      <GiftIcon className="w-3 h-3 text-rose-400 shrink-0" />
                      {gift.title}
                    </p>

                    <div className="flex items-center gap-1 pt-0.5">
                      {gift.isFrozen ? (
                        <span className="text-[10px] text-cyan-300 font-medium flex items-center gap-0.5">
                          <Snowflake className="w-2.5 h-2.5" />
                          已冰凍
                        </span>
                      ) : gift.stealCount > 0 ? (
                        <span className="text-[10px] text-amber-300 font-medium flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                          搶過 {gift.stealCount}/{settings.maxSteals}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400/80">
                          原裝
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-500 text-center">
                    {p.hasPlayed ? (
                      <span className="text-orange-400 font-medium">
                        被搶 (等待行動)
                      </span>
                    ) : (
                      <span>未拆禮物</span>
                    )}
                  </div>
                )}
              </div>

              {isActive && (
                <div className="mt-1 text-[10px] text-rose-300 font-bold flex items-center justify-center gap-1 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5" />
                  目前行動中
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
