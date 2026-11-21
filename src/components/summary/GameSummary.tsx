import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Gift as GiftIcon,
  Flame,
  Snowflake,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
} from 'lucide-react'
import { GameState } from '@/types/game'
import confetti from 'canvas-confetti'

interface GameSummaryProps {
  game: GameState
  onRestartNewGame: () => void
  onExportJson: () => void
}

export const GameSummary: React.FC<GameSummaryProps> = ({
  game,
  onRestartNewGame,
  onExportJson,
}) => {
  const [copied, setCopied] = useState(false)

  const mostStolenGift = [...game.gifts].sort((a, b) => b.stealCount - a.stealCount)[0]

  const getGift = (p: { giftId?: string; id: string }) =>
    game.gifts.find((g) => (p.giftId && g.id === p.giftId) || g.currentOwnerId === p.id)

  const copyResultsToClipboard = () => {
    let text = `【${game.settings.title}】交換禮物結果公布\n\n`
    text += `日期：${new Date(game.createdAt).toLocaleDateString('zh-TW')}\n`
    text += `參加人數：${game.participants.length} 人\n\n`
    text += `最終禮物得主名單：\n`

    const sorted = [...game.participants].sort((a, b) => (a.order || 0) - (b.order || 0))
    sorted.forEach((p) => {
      const g = getGift(p)
      const stealTag = g && g.stealCount > 0 ? ` (被搶奪 ${g.stealCount} 次)` : ''
      const freezeTag = g && g.isFrozen ? ' (已冰凍)' : ''
      text += `• 第 ${p.order} 棒 ${p.name} ➔ 【${g?.title || '神秘禮物'}】${stealTag}${freezeTag}\n`
    })

    if (mostStolenGift && mostStolenGift.stealCount > 0) {
      text += `\n全場最搶手禮物 MVP：【${mostStolenGift.title}】（累計搶奪 ${mostStolenGift.stealCount} 次）\n`
    }

    text += `\n祝大家聖誕快樂！`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const fireCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#16a34a', '#d97706', '#0284c7'],
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Victory Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 text-center shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          遊戲圓滿落幕
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          聖誕白象交換禮物大成功！
        </h2>

        <p className="text-sm text-stone-500 max-w-lg mx-auto">
          所有參加者皆已完成抽籤、開箱與爭奪，順利獲得專屬禮物！
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-2.5">
          <Button
            variant="default"
            onClick={copyResultsToClipboard}
            className="font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                已複製到剪貼簿！
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" />
                複製得獎結果 (分享到 LINE / 社群)
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={fireCelebration}
            className="border-stone-200 text-stone-700 bg-white hover:bg-stone-50"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-600" />
            慶祝彩帶
          </Button>

          <Button
            variant="outline"
            onClick={onExportJson}
            className="border-stone-200 text-stone-700 bg-white hover:bg-stone-50"
          >
            <Download className="w-4 h-4 mr-1.5 text-cyan-600" />
            備份 JSON
          </Button>

          <Button
            variant="outline"
            onClick={onRestartNewGame}
            className="border-stone-200 text-stone-700 bg-white hover:bg-stone-50"
          >
            <RotateCcw className="w-4 h-4 mr-1.5 text-stone-500" />
            建立新局
          </Button>
        </div>
      </div>

      {/* MVP Highlight Card */}
      {mostStolenGift && mostStolenGift.stealCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-lg shrink-0">
                <Flame className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  全場最受歡迎禮物 MVP
                </span>
                <h4 className="text-lg font-extrabold text-stone-900">
                  【{mostStolenGift.title}】
                </h4>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shrink-0">
              累計被搶奪 {mostStolenGift.stealCount} 次
            </span>
          </div>
        </Card>
      )}

      {/* All Final Pairings */}
      <Card className="border-stone-200 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-stone-100">
          <CardTitle className="text-base text-stone-900 flex items-center gap-2">
            <GiftIcon className="w-4 h-4 text-rose-600" />
            最終全體得主名單一覽
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[...game.participants]
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((p) => {
                const gift = getGift(p)

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-stone-200/90 bg-stone-50/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="h-6 w-6 rounded-md bg-stone-200 text-stone-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        #{p.order}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-xs text-stone-900 block truncate">
                          {p.name} {p.avatarEmoji}
                        </span>
                        <span className="text-xs text-stone-600 font-medium truncate block mt-0.5">
                          {gift?.title || '神秘禮物'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {gift?.isFrozen ? (
                        <span className="text-[10px] text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded font-semibold">
                          已冰凍
                        </span>
                      ) : gift && gift.stealCount > 0 ? (
                        <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                          搶過 {gift.stealCount} 次
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">
                          沒被搶過
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
