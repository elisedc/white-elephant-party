import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Volume2, VolumeX, Snowflake, RotateCcw } from 'lucide-react'
import { GamePhase } from '@/types/game'

interface ChristmasHeaderProps {
  title: string
  phase: GamePhase
  snowEnabled: boolean
  onToggleSnow: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  onOpenRules: () => void
  onNewGame: () => void
}

export const ChristmasHeader: React.FC<ChristmasHeaderProps> = ({
  title,
  phase,
  snowEnabled,
  onToggleSnow,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onNewGame,
}) => {
  const getPhaseBadge = (p: GamePhase) => {
    switch (p) {
      case 'SETUP':
        return <Badge variant="secondary" className="text-xs">名單設定</Badge>
      case 'DRAWING':
        return <Badge variant="gold" className="text-xs">順序抽籤</Badge>
      case 'PLAYING':
        return <Badge variant="default" className="text-xs">遊戲進行中</Badge>
      case 'FINAL_SWAP':
        return <Badge variant="gold" className="text-xs">第 1 棒最終交換</Badge>
      case 'FINISHED':
        return <Badge variant="frozen" className="text-xs">遊戲結束</Badge>
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#0c1210]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎁</span>
          <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">
            {title || '白象禮物交換'}
          </h1>
          <div className="hidden sm:inline-flex ml-1">
            {getPhaseBadge(phase)}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRules}
            className="text-xs h-8 px-2.5 border-white/10 text-emerald-100 hover:bg-white/5"
          >
            <BookOpen className="w-3.5 h-3.5 sm:mr-1.5 text-amber-400" />
            <span className="hidden sm:inline">遊戲規則</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSnow}
            className={`h-8 w-8 ${snowEnabled ? 'text-cyan-300' : 'text-stone-500'}`}
            title={snowEnabled ? '關閉飄雪' : '開啟飄雪'}
          >
            <Snowflake className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSound}
            className={`h-8 w-8 ${soundEnabled ? 'text-amber-300' : 'text-stone-500'}`}
            title={soundEnabled ? '靜音' : '開啟音效'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onNewGame}
            className="text-xs h-8 px-3 border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:mr-1 text-rose-400" />
            <span>建立新局</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
