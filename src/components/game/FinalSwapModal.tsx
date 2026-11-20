import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, Sparkles, Flame, Check, Gift as GiftIcon, AlertCircle } from 'lucide-react'
import { Gift, Participant } from '@/types/game'

interface FinalSwapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeParticipant: Participant
  activeGift?: Gift
  displacedGift?: Gift
  gifts: Gift[]
  participants: Participant[]
  lastStolenGiftId?: string
  allowImmediateStealBack?: boolean
  onExecuteAction: (targetGiftId: string | null) => void
}

export const FinalSwapModal: React.FC<FinalSwapModalProps> = ({
  open,
  onOpenChange,
  activeParticipant,
  activeGift,
  displacedGift,
  gifts,
  participants,
  lastStolenGiftId,
  allowImmediateStealBack = false,
  onExecuteAction,
}) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null)

  // Reset selection whenever active participant changes or modal opens
  useEffect(() => {
    setSelectedGiftId(null)
  }, [activeParticipant?.id, open])

  const isPlayer1 = activeParticipant.order === 1 && !displacedGift

  // Eligible gifts that can be stolen:
  // - Not owned by active participant
  // - Not the displaced gift (which is taken via "不搶禮物")
  // - Not frozen
  // - Not the gift that was just stolen from them (if allowImmediateStealBack is false)
  const eligibleGifts = gifts.filter((g) => {
    if (g.currentOwnerId === activeParticipant.id) return false
    if (displacedGift && g.id === displacedGift.id) return false
    if (g.isFrozen) return false
    if (!allowImmediateStealBack && lastStolenGiftId && g.id === lastStolenGiftId) return false
    return true
  })

  const handleDontSteal = () => {
    onExecuteAction(null)
    onOpenChange(false)
  }

  const handleSteal = () => {
    if (!selectedGiftId) return
    onExecuteAction(selectedGiftId)
    onOpenChange(false)
  }

  const getOwner = (ownerId: string) => {
    return participants.find((part) => part.id === ownerId)
  }

  const selectedGiftObj = gifts.find((g) => g.id === selectedGiftId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-stone-200 bg-white text-stone-900">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isPlayer1 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isPlayer1 ? (
                <Crown className="w-5 h-5 text-amber-700" />
              ) : (
                <Flame className="w-5 h-5 text-rose-600 fill-rose-600" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-stone-900">
                {isPlayer1 ? '第 1 棒最終搶禮特權' : `【${activeParticipant.name}】被搶禮反擊！`}
              </DialogTitle>
              <DialogDescription className="text-stone-500 text-xs">
                {isPlayer1
                  ? `所有人都已拆開禮物！第 1 棒【${activeParticipant.name}】可以選擇搶其他尚未冷凍的禮物，或選擇不搶保留目前禮物！`
                  : `你的禮物被搶走了！你可以選擇搶其他尚未冷凍的禮物，或是選擇不搶禮物並收下待認領禮物！`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current / Displaced Gift status bar */}
        {isPlayer1 ? (
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
            <span className="text-xs font-semibold text-stone-600">
              你目前持有的禮物：
            </span>
            <h4 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
              <GiftIcon className="w-4 h-4 text-rose-600" />
              {activeGift?.title || '未持有禮物'}
            </h4>
          </div>
        ) : displacedGift ? (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>目前場上待認領的禮物（若你選擇不搶，將直接收下此禮物）：</span>
            </div>
            <h4 className="text-base font-bold text-stone-900 flex items-center gap-1.5 pl-5">
              <GiftIcon className="w-4 h-4 text-amber-600" />
              {displacedGift.title}
            </h4>
          </div>
        ) : null}

        {/* Options */}
        <div className="space-y-3 pt-1">
          <p className="text-xs font-bold text-stone-700">
            請選擇你的決定：
          </p>

          {/* Option 1: 不搶禮物 */}
          <div
            onClick={() => setSelectedGiftId(null)}
            className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              selectedGiftId === null
                ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400'
                : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
            }`}
          >
            <div>
              <h5 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                不搶禮物
              </h5>
              <p className="text-xs text-stone-600 mt-0.5">
                {isPlayer1
                  ? `保留自己目前手中的【${activeGift?.title || '禮物'}】，結束交換禮物`
                  : `收下待認領的【${displacedGift?.title || '禮物'}】，不再搶奪其他人並結束遊戲`}
              </p>
            </div>
            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
              selectedGiftId === null ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'
            }`}>
              {selectedGiftId === null && <Check className="w-3 h-3 text-white font-bold" />}
            </div>
          </div>

          {/* Option 2: 搶其他尚未冷凍的禮物 */}
          <div>
            <p className="text-xs text-stone-600 font-semibold mb-2">
              或者，搶奪以下任一份其他人的尚未冷凍禮物：
            </p>

            {eligibleGifts.length === 0 ? (
              <p className="text-xs text-stone-400 p-3 rounded-xl border border-dashed border-stone-200 bg-stone-50 text-center">
                場上已無其他尚未冷凍或可搶奪的禮物。請選擇「不搶禮物」結束回合。
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {eligibleGifts.map((gift) => {
                  const isSelected = selectedGiftId === gift.id
                  const owner = getOwner(gift.currentOwnerId)

                  return (
                    <div
                      key={gift.id}
                      onClick={() => setSelectedGiftId(gift.id)}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/90 ring-2 ring-rose-400'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-stone-900 truncate">
                          {gift.title}
                        </span>
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-semibold shrink-0">
                          搶過 {gift.stealCount} 次
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-600">
                        持有人：<strong className="text-stone-900">{owner?.name} {owner?.avatarEmoji}</strong>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3">
          {selectedGiftId ? (
            <Button
              variant="default"
              onClick={handleSteal}
              className="w-full sm:w-auto font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              <Flame className="w-4 h-4 mr-2 fill-white" />
              確認搶奪【{selectedGiftObj?.title}】
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleDontSteal}
              className="w-full sm:w-auto font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isPlayer1
                ? '不搶禮物（保留目前禮物並結束遊戲）'
                : `不搶禮物（收下【${displacedGift?.title || '禮物'}】結束遊戲）`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
