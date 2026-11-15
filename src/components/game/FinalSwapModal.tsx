import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Sparkles, ArrowRightLeft, Check, Snowflake } from 'lucide-react'
import { Gift, Participant } from '@/types/game'

interface FinalSwapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player1: Participant
  player1Gift?: Gift
  gifts: Gift[]
  participants: Participant[]
  onExecuteSwap: (targetGiftId: string | null) => void
}

export const FinalSwapModal: React.FC<FinalSwapModalProps> = ({
  open,
  onOpenChange,
  player1,
  player1Gift,
  gifts,
  participants,
  onExecuteSwap,
}) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null)

  const eligibleGifts = gifts.filter(
    (g) => g.id !== player1Gift?.id && !g.isFrozen
  )

  const handleKeep = () => {
    onExecuteSwap(null)
    onOpenChange(false)
  }

  const handleSwap = () => {
    if (!selectedGiftId) return
    onExecuteSwap(selectedGiftId)
    onOpenChange(false)
  }

  const getOwnerName = (ownerId: string) => {
    const p = participants.find((part) => part.id === ownerId)
    return p ? p.name : '未知'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-amber-500/50">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-amber-300">
                第 1 棒最終逆轉特權！
              </DialogTitle>
              <DialogDescription className="text-emerald-200/80">
                恭喜所有人都已拆開禮物！作為開場無法搶奪的補償，第 1 棒【{player1.name}】擁有最終交換權！
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Player 1's Current Gift */}
        <div className="p-4 rounded-xl border border-emerald-700/50 bg-emerald-950/40 mt-2 space-y-1">
          <span className="text-xs font-semibold text-emerald-300">
            {player1.name} 目前持有的禮物：
          </span>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            🎁 {player1Gift?.title || '未持有禮物'}
          </h4>
          {player1Gift?.description && (
            <p className="text-xs text-emerald-200/70">{player1Gift.description}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            請選擇你的最終決定：
          </p>

          <div
            onClick={() => setSelectedGiftId(null)}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
              selectedGiftId === null
                ? 'border-emerald-400 bg-emerald-900/40 ring-1 ring-emerald-400'
                : 'border-emerald-800/40 bg-emerald-950/30 hover:bg-emerald-900/20'
            }`}
          >
            <div>
              <h5 className="font-bold text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                滿意現狀：保留自己目前的禮物（不換）
              </h5>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                我覺得我現在拿到的禮物已經很棒了，直接結束遊戲！
              </p>
            </div>
            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
              selectedGiftId === null ? 'border-emerald-400 bg-emerald-500' : 'border-emerald-700'
            }`}>
              {selectedGiftId === null && <Check className="w-3 h-3 text-black font-bold" />}
            </div>
          </div>

          <p className="text-xs text-emerald-300/80 pt-1">
            或者，點選以下任一份其他人的已開禮物進行互換：
          </p>

          {eligibleGifts.length === 0 ? (
            <p className="text-xs text-emerald-400/60 p-3 rounded-lg border border-dashed border-emerald-800">
              場上其他禮物皆已被冰凍鎖定，無法進行交換。
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eligibleGifts.map((gift) => {
                const isSelected = selectedGiftId === gift.id
                return (
                  <div
                    key={gift.id}
                    onClick={() => setSelectedGiftId(gift.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400/60'
                        : 'border-emerald-800/40 bg-emerald-950/40 hover:border-emerald-700/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-white truncate">
                          {gift.title}
                        </span>
                        <Badge variant="gold" className="text-[10px] px-1.5 py-0">
                          搶奪 {gift.stealCount} 次
                        </Badge>
                      </div>
                      {gift.description && (
                        <p className="text-xs text-emerald-200/70 mt-1 line-clamp-2">
                          {gift.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-300/80">
                      持有人：<strong className="text-white">{getOwnerName(gift.currentOwnerId)}</strong>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          {selectedGiftId ? (
            <Button
              variant="gold"
              onClick={handleSwap}
              className="w-full sm:w-auto font-bold shadow-lg"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              確認發動最終互換！
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleKeep}
              className="w-full sm:w-auto font-bold shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              確認保留目前的禮物並結束遊戲
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
