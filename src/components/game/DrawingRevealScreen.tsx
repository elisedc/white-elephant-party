import React, { useEffect } from 'react'
import { Participant } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Sparkles, Play, RefreshCw, ArrowLeft, Crown } from 'lucide-react'
import confetti from 'canvas-confetti'

interface DrawingRevealScreenProps {
  participants: Participant[]
  onStartGame: () => void
  onRedraw: () => void
  onBackToSetup: () => void
}

export const DrawingRevealScreen: React.FC<DrawingRevealScreenProps> = ({
  participants,
  onStartGame,
  onRedraw,
  onBackToSetup,
}) => {
  const sorted = [...participants].sort((a, b) => a.order - b.order)
  const player1 = sorted.find((p) => p.order === 1)

  useEffect(() => {
    // Joyful celebration when reveal screen opens
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#e11d48', '#22c55e', '#fbbf24', '#ffffff'],
    })
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Announcement Banner */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          抽籤順序結果揭曉
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          順序抽籤完成，遊戲要正式開始囉！
        </h1>

        <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          全體 <strong className="text-stone-900">{participants.length}</strong> 位玩家順序已排定！
          請大家依照抽籤順序入座。由第 1 棒開場拆禮物，之後每一棒可選擇【拆新禮物】或【搶奪已開禮物】！
        </p>

        {/* Primary Call to Action */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            variant="default"
            onClick={onStartGame}
            className="font-extrabold text-base h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-[0.99] transition-all"
          >
            <Play className="w-4 h-4 mr-2 fill-white" />
            正式開始遊戲（由第 1 棒【{player1?.name || '第 1 位玩家'}】開場）
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onRedraw}
            className="text-stone-600 hover:text-stone-900 border-stone-200 bg-white h-12 px-5 text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-1.5 text-stone-500" />
            重新抽籤
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={onBackToSetup}
            className="text-stone-500 hover:text-stone-800 h-12 px-4 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            返回名單設定
          </Button>
        </div>
      </div>

      {/* Roster Order Grid */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 text-base">
              抽籤順序列表 ({sorted.length} 位)
            </span>
          </div>
          <span className="text-xs text-stone-500">
            號碼即為遊戲輪流拆禮物與反擊的順序
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {sorted.map((p) => {
            const isFirst = p.order === 1
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isFirst
                    ? 'border-amber-300 bg-amber-50/70 shadow-xs'
                    : 'border-stone-200 bg-stone-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isFirst
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-white border border-stone-200 text-stone-700'
                    }`}
                  >
                    {p.order}
                  </span>

                  <span className="text-xl shrink-0">{p.avatarEmoji || '🎅'}</span>

                  <span className="font-bold text-stone-900 text-sm truncate">
                    {p.name}
                  </span>
                </div>

                {isFirst && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    <Crown className="w-3 h-3 text-amber-600" />
                    第 1 棒開場
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
