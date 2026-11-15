import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Play } from 'lucide-react'
import { Participant } from '@/types/game'
import { sounds } from '@/lib/sound'

interface NextPlayerAnnounceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player?: Participant
  totalParticipants: number
  canSteal: boolean
  soundEnabled?: boolean
}

export const NextPlayerAnnounceModal: React.FC<NextPlayerAnnounceModalProps> = ({
  open,
  onOpenChange,
  player,
  totalParticipants,
  canSteal,
  soundEnabled = true,
}) => {
  useEffect(() => {
    if (open && soundEnabled) {
      sounds.playJingle()
    }
  }, [open, soundEnabled])

  if (!player) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md border-stone-200 bg-white text-stone-900 p-6 sm:p-7 text-center">
        <DialogHeader className="items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            下一位登場！
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight text-center">
            第 {player.order} 棒 / 共 {totalParticipants} 位
          </DialogTitle>

          <DialogDescription className="text-stone-500 text-xs text-center">
            輪到下一位玩家行動囉，請大家給他掌聲！
          </DialogDescription>
        </DialogHeader>

        {/* Player Showcase */}
        <div className="py-4 space-y-3">
          <div className="w-24 h-24 rounded-3xl bg-stone-50 border border-stone-200 flex items-center justify-center text-5xl mx-auto shadow-xs">
            {player.avatarEmoji || '🎅'}
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              {player.name}
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto">
              請 {player.name} 就位準備！
            </p>
          </div>
        </div>

        <DialogFooter className="pt-1">
          <Button
            type="button"
            variant="default"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-none active:scale-[0.99] transition-all"
            autoFocus
          >
            <Play className="w-4 h-4 mr-2 fill-white" />
            我準備好了，開始行動！
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
