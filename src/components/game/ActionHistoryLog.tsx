import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ActionLog } from '@/types/game'
import {
  History,
  Gift,
  Flame,
  Snowflake,
  Crown,
  Sparkles,
  Shuffle,
  PartyPopper,
} from 'lucide-react'

interface ActionHistoryLogProps {
  logs: ActionLog[]
}

export const ActionHistoryLog: React.FC<ActionHistoryLogProps> = ({ logs }) => {
  const getLogIcon = (type: ActionLog['type']) => {
    switch (type) {
      case 'OPEN_GIFT':
        return <Gift className="w-4 h-4 text-emerald-400" />
      case 'STEAL_GIFT':
        return <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
      case 'FREEZE_GIFT':
        return <Snowflake className="w-4 h-4 text-cyan-400" />
      case 'FINAL_SWAP':
        return <Crown className="w-4 h-4 text-amber-400" />
      case 'DRAW_ORDER':
        return <Shuffle className="w-4 h-4 text-purple-400" />
      case 'GAME_FINISH':
        return <PartyPopper className="w-4 h-4 text-rose-400" />
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />
    }
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <Card className="border-emerald-800/40 bg-emerald-950/25">
      <CardHeader className="py-3 px-4 border-b border-emerald-800/30">
        <CardTitle className="text-sm font-bold flex items-center justify-between text-emerald-100">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-400" />
            即時戰況動態紀錄
          </span>
          <span className="text-xs font-mono text-emerald-300/60 font-normal">
            共 {logs.length} 筆事件
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 max-h-[360px] overflow-y-auto space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2.5 p-2 rounded-xl bg-black/20 border border-white/5 text-xs transition-all hover:bg-black/30"
          >
            <div className="h-6 w-6 rounded-lg bg-emerald-900/60 flex items-center justify-center shrink-0 mt-0.5">
              {getLogIcon(log.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-100 leading-snug">
                {log.message}
              </p>
              <span className="text-[10px] text-emerald-400/60 font-mono">
                {formatTime(log.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
