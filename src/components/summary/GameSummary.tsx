import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  // Find most stolen gift (MVP)
  const mostStolenGift = [...game.gifts].sort((a, b) => b.stealCount - a.stealCount)[0]

  const getGift = (giftId?: string) => game.gifts.find((g) => g.id === giftId)

  // Format text for sharing in chat apps (LINE, Discord, Slack)
  const copyResultsToClipboard = () => {
    let text = `🎄【${game.settings.title}】交換禮物結果公布 🎁\n\n`
    text += `📅 日期：${new Date(game.createdAt).toLocaleDateString('zh-TW')}\n`
    text += `👥 參加人數：${game.participants.length} 人\n\n`
    text += `🏆 最終禮物得主名單：\n`

    const sorted = [...game.participants].sort((a, b) => (a.order || 0) - (b.order || 0))
    sorted.forEach((p) => {
      const g = getGift(p.giftId)
      const stealTag = g && g.stealCount > 0 ? ` (被搶奪 ${g.stealCount} 次)` : ''
      const freezeTag = g && g.isFrozen ? ' ❄️已冰凍' : ''
      text += `• 第 ${p.order} 棒 ${p.name} ➔ 🎁【${g?.title || '神秘禮物'}】${stealTag}${freezeTag}\n`
    })

    if (mostStolenGift && mostStolenGift.stealCount > 0) {
      text += `\n🔥 全場最搶手禮物 MVP：【${mostStolenGift.title}】（累計搶奪 ${mostStolenGift.stealCount} 次！）\n`
    }

    text += `\n祝大家聖誕快樂！Merry Christmas! 🎅✨`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const fireCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#22c55e', '#fbbf24', '#38bdf8', '#ffffff'],
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Victory Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-rose-950/70 via-emerald-950/80 to-amber-950/60 p-6 sm:p-8 backdrop-blur-xl text-center shadow-2xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            遊戲圓滿落幕
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            🎉 聖誕白象交換禮物大成功！
          </h2>

          <p className="text-sm text-emerald-200/80 max-w-lg mx-auto">
            所有參加者皆已完成抽籤、開箱與爭奪，順利獲得屬於自己的專屬聖誕驚喜！
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button
              variant="gold"
              onClick={copyResultsToClipboard}
              className="shadow-lg font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-900" />
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
              className="border-emerald-600/50 text-emerald-200"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
              慶祝彩帶
            </Button>

            <Button
              variant="outline"
              onClick={onExportJson}
              className="border-emerald-600/50 text-emerald-200"
            >
              <Download className="w-4 h-4 mr-1.5 text-cyan-300" />
              備份 JSON
            </Button>

            <Button
              variant="secondary"
              onClick={onRestartNewGame}
              className="border-rose-500/40 text-rose-200"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 text-rose-400" />
              再玩一局 / 重新開局
            </Button>
          </div>
        </div>
      </div>

      {/* MVP Highlight Card */}
      {mostStolenGift && mostStolenGift.stealCount > 0 && (
        <Card className="border-amber-500/40 bg-amber-950/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                🔥
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  全場最受歡迎禮物 MVP
                </span>
                <h4 className="text-xl font-extrabold text-white">
                  【{mostStolenGift.title}】
                </h4>
                {mostStolenGift.description && (
                  <p className="text-xs text-amber-200/70 mt-0.5">
                    {mostStolenGift.description}
                  </p>
                )}
              </div>
            </div>

            <Badge variant="gold" className="text-sm px-3 py-1 font-bold shrink-0 self-start sm:self-auto">
              累計被搶奪 {mostStolenGift.stealCount} 次
            </Badge>
          </div>
        </Card>
      )}

      {/* All Final Pairings */}
      <Card className="border-emerald-800/40 bg-emerald-950/25">
        <CardHeader>
          <CardTitle className="text-lg text-emerald-100 flex items-center gap-2">
            <GiftIcon className="w-5 h-5 text-rose-400" />
            最終全體得主名單一覽
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {game.participants
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((p) => {
                const gift = getGift(p.giftId)

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-emerald-800/40 bg-emerald-950/40 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="h-7 w-7 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-700/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        #{p.order}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-sm text-white block truncate">
                          {p.name} {p.avatarEmoji}
                        </span>
                        <span className="text-xs text-emerald-300 font-semibold truncate block mt-0.5">
                          🎁 {gift?.title || '神秘禮物'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {gift?.isFrozen ? (
                        <Badge variant="frozen" className="text-[10px]">
                          <Snowflake className="w-3 h-3 mr-0.5" />
                          已冰凍
                        </Badge>
                      ) : gift && gift.stealCount > 0 ? (
                        <Badge variant="gold" className="text-[10px]">
                          被搶 {gift.stealCount} 次
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-emerald-400/60">
                          原裝
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
