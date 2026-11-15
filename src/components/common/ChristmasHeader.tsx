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
            variant="outline"
            size="sm"
            onClick={onOpenRules}
            className="text-xs h-8 px-2.5 border-stone-200 bg-white hover:bg-stone-50 text-stone-700 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 sm:mr-1.5 text-amber-600" />
            <span className="hidden sm:inline">遊戲規則</span>
          </Button>

          {/* Snow Animation Toggle - Icon only, consistent button style */}
          <button
            type="button"
            onClick={onToggleSnow}
            className="h-8 w-8 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title={snowEnabled ? '關閉飄雪動畫' : '開啟飄雪動畫'}
            aria-label={snowEnabled ? '關閉飄雪動畫' : '開啟飄雪動畫'}
          >
            <div className="relative flex items-center justify-center">
              <Snowflake className="w-4 h-4 text-stone-700" />
              {!snowEnabled && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-5 h-[1.5px] bg-stone-700 rotate-45 rounded-full ring-1 ring-white" />
                </span>
              )}
            </div>
          </button>

          {/* Sound Toggle - Icon only, consistent button style */}
          <button
            type="button"
            onClick={onToggleSound}
            className="h-8 w-8 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title={soundEnabled ? '靜音' : '開啟音效'}
            aria-label={soundEnabled ? '靜音' : '開啟音效'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-stone-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-700" />
            )}
          </button>

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
