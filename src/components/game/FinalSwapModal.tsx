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
import { Crown, Sparkles, ArrowRightLeft, Check, Gift as GiftIcon } from 'lucide-react'
import { Gift, Participant } from '@/types/game'

interface FinalSwapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeParticipant: Participant
  activeGift?: Gift
  gifts: Gift[]
  participants: Participant[]
  lastStolenGiftId?: string
  allowImmediateStealBack?: boolean
  onExecuteSwap: (targetGiftId: string | null) => void
}

export const FinalSwapModal: React.FC<FinalSwapModalProps> = ({
  open,
  onOpenChange,
  activeParticipant,
  activeGift,
  gifts,
  participants,
  lastStolenGiftId,
  allowImmediateStealBack = false,
  onExecuteSwap,
}) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null)

  // Reset selection whenever active participant changes or modal opens
  useEffect(() => {
    setSelectedGiftId(null)
  }, [activeParticipant?.id, open])

  const isPlayer1 = activeParticipant.order === 1

  const eligibleGifts = gifts.filter((g) => {
    if (g.id === activeGift?.id) return false
    if (g.currentOwnerId === activeParticipant.id) return false
    if (g.isFrozen) return false
    if (!allowImmediateStealBack && lastStolenGiftId && g.id === lastStolenGiftId) return false
    return true
  })

  const handleKeep = () => {
    onExecuteSwap(null)
    onOpenChange(false)
  }

  const handleSwap = () => {
    if (!selectedGiftId) return
    onExecuteSwap(selectedGiftId)
    onOpenChange(false)
  }

  const getOwner = (ownerId: string) => {
    return participants.find((part) => part.id === ownerId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-stone-200 bg-white text-stone-900">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              {isPlayer1 ? (
                <Crown className="w-5 h-5 text-amber-700" />
              ) : (
                <ArrowRightLeft className="w-5 h-5 text-amber-700" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-stone-900">
                {isPlayer1 ? '第 1 棒最終逆轉特權' : `【${activeParticipant.name}】被換禮反擊特權`}
              </DialogTitle>
              <DialogDescription className="text-stone-500 text-xs">
                {isPlayer1
                  ? `恭喜所有人都已拆開禮物！第 1 棒【${activeParticipant.name}】擁有最終交換權！`
                  : `【${activeParticipant.name}】的禮物剛剛被換走了！你可以選擇保留新拿到的禮物，或換取其他禮物！`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current Gift */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
          <span className="text-xs font-semibold text-stone-600">
            {activeParticipant.name} 目前持有的禮物：
          </span>
          <h4 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
            <GiftIcon className="w-4 h-4 text-rose-600" />
            {activeGift?.title || '未持有禮物'}
          </h4>
        </div>

        {/* Options */}
        <div className="space-y-2.5 pt-1">
          <p className="text-xs font-bold text-stone-700">
            請選擇你的決定：
          </p>

          <div
            onClick={() => setSelectedGiftId(null)}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              selectedGiftId === null
                ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-400'
                : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
            }`}
          >
            <div>
              <h5 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                保留自己目前的禮物（不換）
              </h5>
              <p className="text-xs text-stone-500 mt-0.5">
                {isPlayer1
                  ? '我覺得現在拿到的禮物已經很棒了，直接結束遊戲'
                  : '滿意這份新禮物，不再繼續更換並結束回合'}
              </p>
            </div>
            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
              selectedGiftId === null ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'
            }`}>
              {selectedGiftId === null && <Check className="w-3 h-3 text-white font-bold" />}
            </div>
          </div>

          <p className="text-xs text-stone-500 pt-1">
            或者，點選以下任一份其他人的已開禮物進行互換：
          </p>

          {eligibleGifts.length === 0 ? (
            <p className="text-xs text-stone-400 p-3 rounded-lg border border-dashed border-stone-200 bg-stone-50">
              場上其他禮物皆已被冰凍鎖定或不可換回，無法進行交換。
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
                    className={`cursor-pointer p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400'
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

        <DialogFooter className="pt-3">
          {selectedGiftId ? (
            <Button
              variant="default"
              onClick={handleSwap}
              className="w-full sm:w-auto font-bold bg-amber-500 hover:bg-amber-600 text-white"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              確認互換禮物
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleKeep}
              className="w-full sm:w-auto font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isPlayer1 ? '保留目前的禮物並結束遊戲' : '保留目前的禮物'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
