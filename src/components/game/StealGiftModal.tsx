import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Flame, Snowflake, ShieldAlert, Sparkles, User, Tag } from 'lucide-react'
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

  // Gifts eligible to steal:
  // - Not held by the active participant
  // - Not the exact gift just stolen from them (prevent immediate steal back)
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-orange-700/50">
        <DialogHeader>
          <DialogTitle className="text-xl text-amber-300 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            挑選掠奪場上的已開禮物！
          </DialogTitle>
          <DialogDescription className="text-emerald-200/80">
            點選你想搶奪的禮物。請注意：已達到 {settings.maxSteals} 次上限的冰凍禮物無法掠奪。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {eligibleGifts.length === 0 ? (
            <div className="py-8 text-center text-emerald-400/60 rounded-xl border border-dashed border-emerald-800/40">
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
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    gift.isFrozen
                      ? 'border-cyan-500/40 bg-cyan-950/20 opacity-75'
                      : isForbiddenStealBack
                      ? 'border-red-900/40 bg-red-950/20 opacity-60'
                      : 'border-emerald-800/40 bg-emerald-950/40 hover:border-amber-500/50 hover:bg-emerald-900/30'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-base text-white">
                        {gift.title}
                      </h4>

                      {gift.isFrozen ? (
                        <Badge variant="frozen">
                          <Snowflake className="w-3 h-3 mr-1" />
                          已冰凍鎖定 (無法搶奪)
                        </Badge>
                      ) : isForbiddenStealBack ? (
                        <Badge variant="destructive">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          剛被搶走 (禁止立即搶回)
                        </Badge>
                      ) : (
                        <Badge variant="gold">
                          <Flame className="w-3 h-3 mr-1 text-orange-600" />
                          已掠奪 {gift.stealCount}/{settings.maxSteals} 次
                          {remainingSteals === 1 && ' (再搶 1 次即冰凍!)'}
                        </Badge>
                      )}
                    </div>

                    {gift.description && (
                      <p className="text-xs text-emerald-200/80">
                        {gift.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-300/80 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-amber-200">
                        <User className="w-3.5 h-3.5" />
                        目前持有者：{owner?.name || '未知'} ({owner?.avatarEmoji || '🎁'})
                      </span>

                      {gift.tags && gift.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {gift.tags.join('、')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 sm:self-center">
                    <Button
                      variant={isDisabled ? 'outline' : 'gold'}
                      size="sm"
                      disabled={isDisabled}
                      onClick={() => handleSelectGift(gift)}
                      className="w-full sm:w-auto font-bold"
                    >
                      {gift.isFrozen ? (
                        <>
                          <Snowflake className="w-4 h-4 mr-1 text-cyan-400" />
                          已冰凍
                        </>
                      ) : (
                        <>
                          <Flame className="w-4 h-4 mr-1 text-red-600" />
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
