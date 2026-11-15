import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Gift, Shuffle, Flame, Snowflake, Sparkles, AlertCircle } from 'lucide-react'

interface RulesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const RulesModal: React.FC<RulesModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-emerald-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-amber-300 flex items-center gap-2">
            🎄 白象交換禮物遊戲規則 (White Elephant)
          </DialogTitle>
          <DialogDescription className="text-emerald-200/80">
            白象禮物交換（又稱 Yankee Swap 或 Dirty Santa），是一款充滿驚喜、博弈與笑聲的聖誕派對遊戲！
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-relaxed mt-2">
          {/* Rule 1 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              1
            </div>
            <div>
              <h4 className="font-bold text-white flex items-center gap-1.5 text-base">
                <Gift className="w-4 h-4 text-rose-400" /> 事前準備 (Prep)
              </h4>
              <p className="text-emerald-200/80 mt-1">
                每位參加者帶一份已包裝妥當的匿名禮物，並遵守約定的金額預算上限（例如 $300 ~ $800 元）。
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              2
            </div>
            <div>
              <h4 className="font-bold text-white flex items-center gap-1.5 text-base">
                <Shuffle className="w-4 h-4 text-amber-400" /> 決定順序 (Turn Order)
              </h4>
              <p className="text-emerald-200/80 mt-1">
                所有人隨機抽籤獲得號碼牌（第 1 棒至最後一棒），依序進行回合。
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              3
            </div>
            <div>
              <h4 className="font-bold text-white flex items-center gap-1.5 text-base">
                <Sparkles className="w-4 h-4 text-emerald-400" /> 第 1 棒行動 (Player 1)
              </h4>
              <p className="text-emerald-200/80 mt-1">
                第 1 位玩家從中央禮物堆挑選一份未拆封禮物，當場拆開並登記，回合結束。
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              4
            </div>
            <div>
              <h4 className="font-bold text-white flex items-center gap-1.5 text-base">
                <Flame className="w-4 h-4 text-orange-400" /> 後續玩家二選一：開箱或掠奪 (Subsequent Players)
              </h4>
              <p className="text-emerald-200/80 mt-1">
                輪到的玩家有兩種選擇：
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-emerald-300/90 pl-1">
                <li><span className="font-semibold text-white">開新禮物：</span>從中央堆拿取一份未拆的禮物拆開。</li>
                <li><span className="font-semibold text-rose-300">掠奪搶奪：</span>奪取前面任何一位玩家已經拆開的禮物！</li>
              </ul>
            </div>
          </div>

          {/* Rule 5 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <div className="h-8 w-8 rounded-lg bg-red-500/20 text-red-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              5
            </div>
            <div>
              <h4 className="font-bold text-white flex items-center gap-1.5 text-base">
                <AlertCircle className="w-4 h-4 text-red-400" /> 被搶奪者的應對 (Reactions to Stealing)
              </h4>
              <p className="text-emerald-200/80 mt-1">
                若你的禮物被搶走，你可以立刻：
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-emerald-300/90 pl-1">
                <li>拆一份新的未拆禮物。</li>
                <li>搶奪其他人的已開禮物（不可立即搶回剛剛被奪走的那份禮物）。</li>
              </ul>
            </div>
          </div>

          {/* Rule 6 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              6
            </div>
            <div>
              <h4 className="font-bold text-white flex items-center gap-1.5 text-base">
                <Snowflake className="w-4 h-4 text-cyan-400" /> 掠奪次數上限與冰凍 (Steal Limits & Frozen)
              </h4>
              <p className="text-emerald-200/80 mt-1">
                為避免遊戲無限循環，每份禮物最多只能被搶奪 <span className="font-bold text-cyan-300">3 次</span>（可自訂）。一旦達到上限，禮物就會立即進入 <span className="font-bold text-cyan-300">❄️ 冰凍鎖定狀態</span>，永遠歸該持有人所有，無法再被掠奪！
              </p>
            </div>
          </div>

          {/* Rule 7 */}
          <div className="flex gap-3.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              7
            </div>
            <div>
              <h4 className="font-bold text-amber-200 flex items-center gap-1.5 text-base">
                👑 最終逆轉回合 (The Final Turn)
              </h4>
              <p className="text-amber-100/80 mt-1">
                當最後一位玩家完成行動後，因為一開始第 1 棒沒有掠奪權，所以系統會賦予 <span className="font-bold text-amber-300">第 1 棒特別最終交換權</span>！第 1 棒可以決定保留自己手中的禮物，或與場上任何一份非冰凍的已開禮物強制互換！
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
