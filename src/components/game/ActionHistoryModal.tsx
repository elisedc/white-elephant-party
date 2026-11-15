import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { History } from 'lucide-react'
import { ActionHistoryLog } from './ActionHistoryLog'
import { ActionLog } from '@/types/game'

interface ActionHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: ActionLog[]
}

export const ActionHistoryModal: React.FC<ActionHistoryModalProps> = ({
  open,
  onOpenChange,
  logs,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto border-stone-200 bg-white text-stone-900 p-6">
        <DialogHeader className="pb-3 border-b border-stone-100">
          <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            遊戲動態歷程紀錄 ({logs.length} 筆)
          </DialogTitle>
        </DialogHeader>

        <div className="pt-2">
          <ActionHistoryLog logs={logs} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
