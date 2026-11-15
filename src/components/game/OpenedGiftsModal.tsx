import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Gift as GiftIcon } from 'lucide-react'
import { OpenedGiftsGrid } from './OpenedGiftsGrid'
import { Gift, Participant, GameSettings } from '@/types/game'

interface OpenedGiftsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gifts: Gift[]
  participants: Participant[]
  settings: GameSettings
}

export const OpenedGiftsModal: React.FC<OpenedGiftsModalProps> = ({
  open,
  onOpenChange,
  gifts,
  participants,
  settings,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-stone-200 bg-white text-stone-900 p-6">
        <DialogHeader className="pb-3 border-b border-stone-100">
          <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <GiftIcon className="w-5 h-5 text-rose-600" />
            場上已拆封禮物清單 ({gifts.length} 份)
          </DialogTitle>
        </DialogHeader>

        <div className="pt-2">
          <OpenedGiftsGrid
            gifts={gifts}
            participants={participants}
            settings={settings}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
