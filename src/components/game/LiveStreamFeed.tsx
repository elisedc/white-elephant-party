import React, { useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ActionLog } from '@/types/game'
import { Gift, Flame, Snowflake, Crown, Shuffle, PartyPopper, Sparkles } from 'lucide-react'

interface LiveStreamFeedProps {
  logs: ActionLog[]
}

export const LiveStreamFeed: React.FC<LiveStreamFeedProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to top or bottom when new logs arrive (logs are usually prepended or appended)
  // Let's reverse logs so earliest is at top and newest is at bottom like a real chat feed!
  const chronologicalLogs = [...logs].reverse()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs.length])

  const getLogIcon = (type: ActionLog['type']) => {
    switch (type) {
      case 'OPEN_GIFT':
        return <Gift className="w-3.5 h-3.5 text-rose-600 shrink-0" />
      case 'STEAL_GIFT':
        return <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
      case 'FREEZE_GIFT':
        return <Snowflake className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
      case 'FINAL_SWAP':
        return <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      case 'DRAW_ORDER':
        return <Shuffle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
      case 'GAME_FINISH':
        return <PartyPopper className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
    }
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="border-stone-200/90 bg-white shadow-xs h-full flex flex-col rounded-3xl overflow-hidden min-h-[480px]">
      {/* Live Stream Style Header */}
      <CardHeader className="py-3 px-4 border-b border-stone-100 bg-stone-50/70 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <CardTitle className="text-sm font-bold text-stone-900 tracking-tight">
              即時動態紀錄
            </CardTitle>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {logs.length} 則快訊
          </span>
        </div>
      </CardHeader>

      {/* Chat Messages Body */}
      <CardContent
        ref={scrollRef}
        className="p-3.5 flex-1 overflow-y-auto space-y-2.5 max-h-[520px] scroll-smooth"
      >
        {chronologicalLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-stone-400 py-12">
            等待第一位玩家行動中...
          </div>
        ) : (
          chronologicalLogs.map((log) => {
            const isSteal = log.type === 'STEAL_GIFT'
            const isFreeze = log.type === 'FREEZE_GIFT'
            const isOpen = log.type === 'OPEN_GIFT'

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-2xl border text-xs transition-all ${
                  isFreeze
                    ? 'border-cyan-200 bg-cyan-50/70 text-cyan-950'
                    : isSteal
                    ? 'border-amber-200 bg-amber-50/70 text-amber-950'
                    : isOpen
                    ? 'border-rose-200 bg-rose-50/50 text-rose-950'
                    : 'border-stone-200/80 bg-stone-50/60 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="inline-flex items-center gap-1 font-bold text-[11px] truncate">
                    {getLogIcon(log.type)}
                    <span className="truncate">{log.actorName}</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono shrink-0">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
                <p className="leading-snug text-stone-700 pl-4">
                  {log.message}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
