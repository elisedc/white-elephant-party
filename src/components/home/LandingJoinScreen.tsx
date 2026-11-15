import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Snowfall } from '@/components/common/Snowfall'
import { Sparkles, ArrowRight, Gift, KeyRound } from 'lucide-react'

interface LandingJoinScreenProps {
  onJoinParty: (roomCode: string) => void
  onStartNewGame: () => void
}

export const LandingJoinScreen: React.FC<LandingJoinScreenProps> = ({
  onJoinParty,
  onStartNewGame,
}) => {
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize input to uppercase alphanumeric, max 7 chars
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
    setCode(cleaned)
    if (errorMsg) setErrorMsg('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed.length !== 7) {
      setErrorMsg('請輸入完整的 7 位數派對代號')
      return
    }
    onJoinParty(trimmed)
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between relative overflow-hidden text-stone-900 select-none">
      {/* Gentle holiday snowfall */}
      <Snowfall enabled={true} />

      {/* Top minimal header */}
      <header className="p-4 sm:p-6 flex items-center justify-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-stone-200/90 shadow-2xs backdrop-blur-xs text-xs font-semibold text-stone-700">
          <Gift className="w-4 h-4 text-rose-600" />
          <span>聖誕白象交換禮物 • White Elephant</span>
        </div>
      </header>

      {/* Main Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md border-stone-200/90 bg-white/95 shadow-md rounded-2xl overflow-hidden backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                輸入派對代碼
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
                輸入主持人螢幕上顯示的 7 位代碼，立即透過手機加入現場交換禮物！
              </p>
            </div>

            {/* Code Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="relative">
                  <Input
                    type="text"
                    value={code}
                    onChange={handleInputChange}
                    maxLength={7}
                    autoFocus
                    className="h-14 text-center font-mono text-2xl font-bold tracking-[0.25em] uppercase border-stone-300 rounded-xl bg-stone-50/70 focus:bg-white focus:border-rose-500 focus:ring-rose-500 shadow-inner"
                  />
                  {code.length > 0 && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-stone-400">
                      {code.length}/7
                    </span>
                  )}
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 text-center font-medium animate-in fade-in">
                    {errorMsg}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={code.length !== 7}
                className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                <span>加入派對</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Or Start New Game Link */}
            <div className="pt-2 border-t border-stone-100 text-center text-xs sm:text-sm text-stone-500">
              <span>或是</span>{' '}
              <button
                type="button"
                onClick={onStartNewGame}
                className="text-stone-700 hover:text-stone-900 underline underline-offset-4 font-semibold transition-colors"
              >
                開啟新遊戲
              </button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Clean minimal footer */}
      <footer className="p-4 text-center text-[11px] text-stone-500 relative z-10">
        <span>白象禮物交換 • 祝大家聖誕快樂！</span>
      </footer>
    </div>
  )
}

export default LandingJoinScreen
