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
import { Sparkles, Play, Gift, Flame } from 'lucide-react'
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
              {canSteal
                ? '你可以選擇拆開一份全新禮物，或是搶奪場上其他人已開的禮物！'
                : '請從中央禮物堆挑選一份全新禮物拆封揭曉！'}
            </p>
          </div>

          {/* Action options reminder */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-left">
            <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 text-xs flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-stone-800">拆全新禮物</p>
                <p className="text-[10px] text-stone-500">當場開箱揭曉</p>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              canSteal ? 'border-emerald-200 bg-emerald-50/60' : 'border-stone-200 bg-stone-50/40 opacity-60'
            }`}>
              <Flame className={`w-4 h-4 shrink-0 ${canSteal ? 'text-emerald-700' : 'text-stone-400'}`} />
              <div>
                <p className={`font-bold ${canSteal ? 'text-emerald-900' : 'text-stone-500'}`}>搶場上禮物</p>
                <p className="text-[10px] text-stone-500">{canSteal ? '奪取已開禮物' : '目前不可搶'}</p>
              </div>
            </div>
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
