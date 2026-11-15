import React from 'react'
import { Button } from '@/components/ui/button'
import { Gift, BookOpen, Volume2, VolumeX, Snowflake, RotateCcw, QrCode } from 'lucide-react'
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
  onOpenQrCode?: () => void
}

// Snowflake with diagonal slash line for OFF state
const SnowflakeOff: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <Snowflake className="w-full h-full text-stone-700" />
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
    >
      <line x1="3" y1="3" x2="21" y2="21" stroke="#ffffff" strokeWidth="4" />
      <line x1="3" y1="3" x2="21" y2="21" stroke="#44403c" strokeWidth="2.2" />
    </svg>
  </div>
)

export const ChristmasHeader: React.FC<ChristmasHeaderProps> = ({
  title,
  phase,
  snowEnabled,
  onToggleSnow,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onNewGame,
  onOpenQrCode,
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
          {/* QR Code button for host */}
          {onOpenQrCode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenQrCode}
              className="h-8 w-8 text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 hover:text-stone-900 shadow-2xs"
              title="手機掃描加入"
            >
              <QrCode className="w-4 h-4 text-rose-600" />
            </Button>
          )}

          {/* Rules button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenRules}
            className="h-8 w-8 text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 hover:text-stone-900 shadow-2xs"
            title="遊戲規則"
          >
            <BookOpen className="w-4 h-4" />
          </Button>

          {/* Snow toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSnow}
            className={`h-8 w-8 border transition-all shadow-2xs ${
              snowEnabled
                ? 'text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100'
                : 'text-stone-700 bg-white border-stone-200 hover:bg-stone-50 hover:text-stone-900'
            }`}
            title={snowEnabled ? '關閉飄雪動畫' : '開啟飄雪動畫'}
          >
            {snowEnabled ? (
              <Snowflake className="w-4 h-4 text-teal-600" />
            ) : (
              <SnowflakeOff className="w-4 h-4" />
            )}
          </Button>

          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSound}
            className={`h-8 w-8 border transition-all shadow-2xs ${
              soundEnabled
                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                : 'text-stone-700 bg-white border-stone-200 hover:bg-stone-50 hover:text-stone-900'
            }`}
            title={soundEnabled ? '靜音' : '開啟音效'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-700" />
            )}
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
