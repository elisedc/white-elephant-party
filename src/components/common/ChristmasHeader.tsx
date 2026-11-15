import React from 'react'
import { Button } from '@/components/ui/button'
import { Gift, BookOpen, Volume2, VolumeX, Snowflake, RotateCcw } from 'lucide-react'
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
  return (
    <header className="sticky top-0 z-30 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
            <Gift className="w-4 h-4 text-rose-600" />
          </div>
          <h1 className="font-bold text-base sm:text-lg text-stone-900 tracking-tight">
            {title || '白象禮物交換'}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenRules}
            className="h-8 w-8 text-stone-600 hover:text-amber-600 hover:bg-amber-50"
            title="遊戲規則"
          >
            <BookOpen className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSnow}
            className={`h-8 w-8 ${snowEnabled ? 'text-teal-600 bg-teal-50' : 'text-stone-400'}`}
            title={snowEnabled ? '關閉飄雪' : '開啟飄雪'}
          >
            <Snowflake className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSound}
            className={`h-8 w-8 ${soundEnabled ? 'text-amber-600 bg-amber-50' : 'text-stone-400'}`}
            title={soundEnabled ? '靜音' : '開啟音效'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onNewGame}
            className="text-xs h-8 px-3 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:mr-1 text-rose-600" />
            <span>建立新局</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
