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
        return <Gift className="w-3.5 h-3.5 text-rose-600" />
      case 'STEAL_GIFT':
        return <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
      case 'FREEZE_GIFT':
        return <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
      case 'FINAL_SWAP':
        return <Crown className="w-3.5 h-3.5 text-amber-600" />
      case 'DRAW_ORDER':
        return <Shuffle className="w-3.5 h-3.5 text-purple-600" />
      case 'GAME_FINISH':
        return <PartyPopper className="w-3.5 h-3.5 text-emerald-600" />
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />
    }
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <Card className="border-stone-200/90 bg-white shadow-xs">
      <CardHeader className="py-3 px-4 border-b border-stone-100">
        <CardTitle className="text-sm font-bold flex items-center justify-between text-stone-900">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-600" />
            動態紀錄
          </span>
          <span className="text-xs font-mono text-stone-400 font-normal">
            共 {logs.length} 筆
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 max-h-[380px] overflow-y-auto space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-stone-50 border border-stone-200/60 text-xs hover:bg-stone-100/60 transition-all"
          >
            <div className="h-6 w-6 rounded-md bg-white border border-stone-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              {getLogIcon(log.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-stone-800 leading-snug">
                {log.message}
              </p>
              <span className="text-[10px] text-stone-400 font-mono">
                {formatTime(log.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
