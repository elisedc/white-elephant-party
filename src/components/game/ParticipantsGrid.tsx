import React from 'react'
import { Gift as GiftIcon, Flame, Snowflake, Sparkles, Users } from 'lucide-react'
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
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1 border-b border-stone-100">
        <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-stone-600" />
          <span>抽籤順序與持物名單</span>
          <span className="text-xs font-normal text-stone-500">
            ({participants.length} 位)
          </span>
        </h3>

        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            輪到行動
          </span>
          <span className="flex items-center gap-1">
            <Snowflake className="w-3 h-3 text-cyan-600" />
            已冰凍保護
          </span>
        </div>
      </div>

      {/* Single Column Player List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {sortedParticipants.map((p) => {
          const isActive = p.id === activeParticipantId
          const gift = getGift(p.giftId)

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
                isActive
                  ? 'border-rose-400 bg-rose-50/80 shadow-xs ring-1 ring-rose-400/60'
                  : 'border-stone-200/80 bg-white hover:bg-stone-50/80 shadow-2xs'
              }`}
            >
              {/* Left: Order, Avatar, Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`h-6 w-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isActive
                      ? 'bg-rose-600 text-white'
                      : p.order === 1
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  {p.order}
                </span>

                {/* Keep ONLY player avatar emoji */}
                <span className="text-base shrink-0">{p.avatarEmoji || '🎅'}</span>

                <span className="font-semibold text-sm text-stone-800 truncate">
                  {p.name}
                </span>

                {isActive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    行動中
                  </span>
                )}
              </div>

              {/* Right: Gift info */}
              <div className="shrink-0 flex items-center gap-2 ml-2">
                {gift ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60 flex items-center gap-1 max-w-[160px] truncate">
                      <GiftIcon className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{gift.title}</span>
                    </span>

                    {gift.isFrozen ? (
                      <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Snowflake className="w-2.5 h-2.5" />
                        已冰凍
                      </span>
                    ) : gift.stealCount > 0 ? (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                        搶過 {gift.stealCount}/{settings.maxSteals}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        原裝
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-stone-400">
                    {p.hasPlayed ? (
                      <span className="text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                        被搶待反擊
                      </span>
                    ) : (
                      '待拆禮物'
                    )}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
