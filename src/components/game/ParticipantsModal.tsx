import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users } from 'lucide-react'
import { ParticipantsGrid } from './ParticipantsGrid'
import { Participant, Gift, GameSettings } from '@/types/game'

interface ParticipantsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participants: Participant[]
  gifts: Gift[]
  activeParticipantId: string
  settings: GameSettings
}

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  open,
  onOpenChange,
  participants,
  gifts,
  activeParticipantId,
  settings,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-stone-200 bg-white text-stone-900 p-6">
        <DialogHeader className="pb-3 border-b border-stone-100">
          <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-600" />
            玩家名單 ({participants.length} 人)
          </DialogTitle>
        </DialogHeader>

        <div className="pt-2">
          <ParticipantsGrid
            participants={participants}
            gifts={gifts}
            activeParticipantId={activeParticipantId}
            settings={settings}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
