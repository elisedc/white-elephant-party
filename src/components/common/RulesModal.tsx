import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Gift, Shuffle, Flame, Snowflake, Sparkles, AlertCircle, Crown } from 'lucide-react'

interface RulesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const RulesModal: React.FC<RulesModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-stone-200 bg-white text-stone-900">
        <DialogHeader>
          <DialogTitle className="text-xl text-stone-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-600" />
            白象交換禮物遊戲規則 (White Elephant)
          </DialogTitle>
          <DialogDescription className="text-stone-500 text-xs">
            白象禮物交換（又稱 Yankee Swap 或 Dirty Santa），是一款充滿驚喜與歡笑的交換禮物遊戲。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-sm leading-relaxed mt-2">
          {/* Rule 1 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              1
            </div>
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                <Gift className="w-4 h-4 text-rose-600" /> 事前準備 (Prep)
              </h4>
              <p className="text-stone-600 text-xs mt-1">
                每位參加者帶一份已包裝妥當的匿名禮物，並遵守約定的金額預算上限。
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              2
            </div>
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                <Shuffle className="w-4 h-4 text-amber-600" /> 決定順序 (Turn Order)
              </h4>
              <p className="text-stone-600 text-xs mt-1">
                所有人隨機抽籤獲得號碼牌（第 1 棒至最後一棒），依序進行回合。
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              3
            </div>
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" /> 第 1 棒行動 (Player 1)
              </h4>
              <p className="text-stone-600 text-xs mt-1">
                第 1 位玩家從中央禮物堆挑選一份未拆封禮物，當場拆開並登記，回合結束。
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="h-7 w-7 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              4
            </div>
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4 text-orange-600" /> 後續玩家二選一：開箱或搶奪 (Subsequent Players)
              </h4>
              <p className="text-stone-600 text-xs mt-1">
                輪到的玩家有兩種選擇：
              </p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-600 text-xs pl-1">
                <li><span className="font-semibold text-stone-900">開新禮物：</span>從中央堆拿取一份未拆的禮物拆開。</li>
                <li><span className="font-semibold text-rose-700">搶奪他人：</span>奪取前面任何一位玩家已經拆開的禮物。</li>
              </ul>
            </div>
          </div>

          {/* Rule 5 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="h-7 w-7 rounded-lg bg-red-100 text-red-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              5
            </div>
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4 text-red-600" /> 被搶奪者的應對 (Reactions to Stealing)
              </h4>
              <p className="text-stone-600 text-xs mt-1">
                若你的禮物被搶走，你可以立刻：
              </p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-600 text-xs pl-1">
                <li>拆一份新的未拆禮物。</li>
                <li>搶奪其他人的已開禮物（不可立即搶回剛剛被奪走的那份禮物）。</li>
              </ul>
            </div>
          </div>

          {/* Rule 6 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="h-7 w-7 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              6
            </div>
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                <Snowflake className="w-4 h-4 text-cyan-600" /> 掠奪次數上限與冰凍 (Steal Limits & Frozen)
              </h4>
              <p className="text-stone-600 text-xs mt-1">
                為避免遊戲無限循環，每份禮物最多只能被搶奪 3 次（可自訂）。一旦達到上限，禮物就會立即進入「冰凍鎖定狀態」，永遠歸該持有人所有，無法再被掠奪。
              </p>
            </div>
          </div>

          {/* Rule 7 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80">
            <div className="h-7 w-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              7
            </div>
            <div>
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                <Crown className="w-4 h-4 text-amber-700" /> 最終逆轉回合 (The Final Turn)
              </h4>
              <p className="text-amber-800 text-xs mt-1">
                當最後一位玩家完成行動後，因為一開始第 1 棒沒有掠奪權，所以系統會賦予第 1 棒特別最終交換權！第 1 棒可以決定保留自己手中的禮物，或與場上任何一份非冰凍的已開禮物強制互換。
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
