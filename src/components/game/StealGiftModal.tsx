import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Flame, Snowflake, ShieldAlert, User, Tag } from 'lucide-react'
import { Gift, Participant, GameSettings } from '@/types/game'

interface StealGiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gifts: Gift[]
  participants: Participant[]
  activeParticipantId: string
  lastStolenGiftId?: string
  settings: GameSettings
  onSteal: (targetGiftId: string) => void
}

export const StealGiftModal: React.FC<StealGiftModalProps> = ({
  open,
  onOpenChange,
  gifts,
  participants,
  activeParticipantId,
  lastStolenGiftId,
  settings,
  onSteal,
}) => {
  const getParticipant = (id: string) => participants.find((p) => p.id === id)

  const eligibleGifts = gifts.filter(
    (g) => g.currentOwnerId !== activeParticipantId
  )

  const handleSelectGift = (gift: Gift) => {
    if (gift.isFrozen) return
    if (!settings.allowImmediateStealBack && gift.id === lastStolenGiftId) {
      alert('規則限制：你不能立刻搶回上一秒才剛被搶走的那份禮物！請挑選其他人的禮物。')
      return
    }
    onSteal(gift.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-stone-200 bg-white text-stone-900">
        <DialogHeader>
          <DialogTitle className="text-xl text-stone-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            挑選搶奪場上的已開禮物
          </DialogTitle>
          <DialogDescription className="text-stone-500 text-xs">
            點選你想搶奪的禮物。請注意：已達到 {settings.maxSteals} 次上限的冰凍禮物無法掠奪。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 mt-2">
          {eligibleGifts.length === 0 ? (
            <div className="py-8 text-center text-stone-400 rounded-xl border border-dashed border-stone-200 bg-stone-50">
              目前場上沒有其他可以搶奪的已開禮物。
            </div>
          ) : (
            eligibleGifts.map((gift) => {
              const owner = getParticipant(gift.currentOwnerId)
              const isForbiddenStealBack =
                !settings.allowImmediateStealBack && gift.id === lastStolenGiftId
              const isDisabled = gift.isFrozen || isForbiddenStealBack
              const remainingSteals = settings.maxSteals - gift.stealCount

              return (
                <div
                  key={gift.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                    gift.isFrozen
                      ? 'border-cyan-200 bg-cyan-50/50 opacity-75'
                      : isForbiddenStealBack
                      ? 'border-red-200 bg-red-50/50 opacity-60'
                      : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-900">
                        {gift.title}
                      </h4>

                      {gift.isFrozen ? (
                        <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-100 border border-cyan-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Snowflake className="w-2.5 h-2.5" />
                          已冰凍鎖定 (無法搶奪)
                        </span>
                      ) : isForbiddenStealBack ? (
                        <span className="text-[10px] font-semibold text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          剛被搶走 (禁止立即搶回)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                          已掠奪 {gift.stealCount}/{settings.maxSteals} 次
                          {remainingSteals === 1 && ' (再搶 1 次即冰凍)'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-stone-800">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        持有人：{owner?.name} {owner?.avatarEmoji}
                      </span>

                      {gift.tags && gift.tags.length > 0 && (
                        <span className="flex items-center gap-1 text-stone-400">
                          <Tag className="w-3 h-3" />
                          {gift.tags.join('、')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 sm:self-center">
                    <Button
                      variant={isDisabled ? 'outline' : 'default'}
                      size="sm"
                      disabled={isDisabled}
                      onClick={() => handleSelectGift(gift)}
                      className={`w-full sm:w-auto font-bold text-xs h-8 px-3 ${
                        isDisabled
                          ? 'border-stone-200 text-stone-400'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {gift.isFrozen ? (
                        <>
                          <Snowflake className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                          已冰凍
                        </>
                      ) : (
                        <>
                          <Flame className="w-3.5 h-3.5 mr-1" />
                          搶奪這份禮物
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
