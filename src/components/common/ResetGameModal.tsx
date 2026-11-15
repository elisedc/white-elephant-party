import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Users, Trash2 } from 'lucide-react'

interface ResetGameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participantCount: number
  onResetKeepParticipants: () => void
  onResetFresh: () => void
}

export const ResetGameModal: React.FC<ResetGameModalProps> = ({
  open,
  onOpenChange,
  participantCount,
  onResetKeepParticipants,
  onResetFresh,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-stone-200 bg-white text-stone-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            建立新局 / 重設遊戲
          </DialogTitle>
          <DialogDescription className="text-stone-500 text-xs">
            目前有 {participantCount} 位玩家參與。請選擇您希望如何重設：
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 py-2">
          {participantCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onResetKeepParticipants()
                onOpenChange(false)
              }}
              className="w-full text-left p-3.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-all flex items-center gap-3"
            >
              <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-stone-900">
                  重新開始（保留目前的 {participantCount} 位玩家）
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  清空禮物與順序紀錄，保留名單直接進入設定或重新抽籤
                </p>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onResetFresh()
              onOpenChange(false)
            }}
            className="w-full text-left p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-50 transition-all flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-rose-950">
                完全清空並建立全新局
              </p>
              <p className="text-xs text-rose-700/80 mt-0.5">
                清空所有玩家、禮物與紀錄，回到全新的初始設定
              </p>
            </div>
          </button>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-stone-500 hover:text-stone-800 text-xs"
          >
            取消
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
