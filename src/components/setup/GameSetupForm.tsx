import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Users,
  Plus,
  Trash2,
  Dice5,
  Settings2,
  DollarSign,
  ShieldAlert,
  Sparkles,
  ClipboardList,
  Gift,
} from 'lucide-react'
import { GameSettings, Participant } from '@/types/game'

interface GameSetupFormProps {
  settings: GameSettings
  participants: Participant[]
  onUpdateSettings: (settings: Partial<GameSettings>) => void
  onAddParticipant: (name: string) => void
  onAddBatch: (rawText: string) => void
  onRemoveParticipant: (id: string) => void
  onStartDrawing: () => void
}

const SAMPLE_20_PLAYERS = `小明, 小美, 阿杰, 雅婷, 志明, 春嬌, 冠宇, 欣怡, 俊宏, 佩君, 柏翰, 淑芬, 宗翰, 宜婷, 家豪, 佳玲, 承恩, 雅涵, 威廷, 詠晴`

export const GameSetupForm: React.FC<GameSetupFormProps> = ({
  settings,
  participants,
  onUpdateSettings,
  onAddParticipant,
  onAddBatch,
  onRemoveParticipant,
  onStartDrawing,
}) => {
  const [nameInput, setNameInput] = useState('')
  const [batchText, setBatchText] = useState('')
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (nameInput.trim()) {
      onAddParticipant(nameInput.trim())
      setNameInput('')
    }
  }

  const handleBatchSubmit = () => {
    if (batchText.trim()) {
      onAddBatch(batchText)
      setBatchText('')
      setShowBatchModal(false)
    }
  }

  const handleLoadSample20 = () => {
    onAddBatch(SAMPLE_20_PLAYERS)
  }

  // Count preview of names in batch textarea
  const previewCount = batchText
    .split(/[\n,，、\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-stone-200/90 bg-white shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            {settings.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 pt-1.5 text-xs text-stone-600">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              預算：{settings.priceLimit}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
              搶奪上限：{settings.maxSteals} 次 (滿次冰凍)
            </span>
            <span>•</span>
            <span>第 1 棒最終交換：{settings.allowPlayer1Swap ? '開啟' : '關閉'}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettingsModal(!showSettingsModal)}
          className="self-start sm:self-center shrink-0 border-stone-200 hover:bg-stone-50 text-stone-700 bg-white shadow-xs"
        >
          <Settings2 className="w-4 h-4 mr-1.5 text-amber-600" />
          遊戲規則設定
        </Button>
      </div>

      {/* Settings Dialog Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-md border-stone-200 bg-white text-stone-900 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-amber-600" />
              遊戲規則設定
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-xs">
              自訂白象聚會名稱、禮物預算限制與防搶奪保護機制。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1.5 block">活動標題</label>
              <Input
                value={settings.title}
                onChange={(e) => onUpdateSettings({ title: e.target.value })}
                placeholder="例如：2024 聖誕白象交換禮物"
                className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1.5 block">禮物預算範圍</label>
              <Input
                value={settings.priceLimit}
                onChange={(e) => onUpdateSettings({ priceLimit: e.target.value })}
                placeholder="例如：約 $500 元"
                className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1.5 block">禮物被搶上限 (滿次冰凍)</label>
              <select
                value={settings.maxSteals}
                onChange={(e) => onUpdateSettings({ maxSteals: Number(e.target.value) })}
                className="flex h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value={1}>1 次（快速版）</option>
                <option value={2}>2 次（中速版）</option>
                <option value={3}>3 次（官方標準推薦）</option>
                <option value={4}>4 次（高刺激版）</option>
                <option value={5}>5 次（大亂鬥版）</option>
              </select>
            </div>

            <div className="space-y-2 pt-1 border-t border-stone-100">
              <label className="text-xs text-stone-700 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.allowPlayer1Swap}
                  onChange={(e) => onUpdateSettings({ allowPlayer1Swap: e.target.checked })}
                  className="rounded border-stone-300 text-rose-600 focus:ring-stone-400 w-4 h-4"
                />
                <span className="font-medium">允許第 1 棒在所有玩家結束後享有「最終交換權」</span>
              </label>

              <label className="text-xs text-stone-700 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!settings.allowImmediateStealBack}
                  onChange={(e) => onUpdateSettings({ allowImmediateStealBack: !e.target.checked })}
                  className="rounded border-stone-300 text-rose-600 focus:ring-stone-400 w-4 h-4"
                />
                <span className="font-medium">防連續回搶：不可立刻搶回上一秒被搶走的那份禮物</span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-9"
            >
              完成設定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Participants Manager - Designed for 20 Players */}
      <Card className="border-stone-200/90 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-600" />
              <CardTitle className="text-lg text-stone-900">參加玩家名單</CardTitle>
              <Badge variant="secondary" className="font-mono text-sm px-2.5 py-0.5 bg-stone-100 text-stone-700 border-stone-200">
                {participants.length} 人
              </Badge>
              {participants.length >= 20 && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  已達 20 人規模
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {participants.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSample20}
                  className="text-xs h-8 border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  快速帶入 20 位玩家
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBatchModal(true)}
                className="text-xs h-8 border-stone-200 text-stone-700 hover:bg-stone-50 bg-white"
              >
                <ClipboardList className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                批次貼上
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Quick single input */}
          <form onSubmit={handleSingleAdd} className="flex gap-2">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="輸入玩家姓名（按 Enter 直接新增）"
              className="flex-1 bg-white border-stone-300 text-stone-900 placeholder:text-stone-400"
            />
            <Button type="submit" variant="default" className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              <Plus className="w-4 h-4 mr-1" />
              新增玩家
            </Button>
          </form>

          {/* Compact 20-Player Grid */}
          {participants.length === 0 ? (
            <div className="py-12 text-center text-stone-400 rounded-xl border border-dashed border-stone-200 bg-stone-50/50">
              <Gift className="w-8 h-8 mx-auto text-stone-400 mb-2" />
              <p className="font-semibold text-stone-700">目前尚無玩家</p>
              <p className="text-xs mt-1 text-stone-500">請在上方輸入玩家名字，或點選「批次貼上 / 快速帶入 20 位玩家」</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1 max-h-[360px] overflow-y-auto p-1">
              {participants.map((p, idx) => (
                <div
                  key={p.id}
                  className="group flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 hover:border-rose-300 transition-all text-xs"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="font-mono text-stone-400 text-[11px] w-4 shrink-0">
                      {idx + 1}.
                    </span>
                    {/* Keep ONLY player avatar emoji */}
                    <span className="text-sm shrink-0">{p.avatarEmoji}</span>
                    <span className="font-medium text-stone-800 truncate">
                      {p.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(p.id)}
                    className="opacity-40 group-hover:opacity-100 text-stone-400 hover:text-red-600 p-1 transition-opacity shrink-0"
                    title={`移除 ${p.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Start Button */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-stone-500">
              點擊抽籤後，系統將隨機打亂並分配 1 ~ {participants.length} 號順序
            </span>
            <Button
              size="lg"
              variant="default"
              onClick={onStartDrawing}
              disabled={participants.length < 2}
              className="w-full sm:w-auto font-bold text-sm h-11 px-6 shadow-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Dice5 className="w-4 h-4 mr-2" />
              開始抽籤決定順序 ({participants.length} 位玩家)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Paste Dialog / Modal */}
      <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
        <DialogContent className="max-w-md border-stone-200 bg-white text-stone-900 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              批次貼上玩家名單
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-xs">
              每行輸入一位玩家姓名，或以逗號、頓號分開。可直接從 Excel、Google Sheets 或通訊軟體複製貼上。
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <Textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="小明&#10;小美&#10;阿杰&#10;志明, 春嬌, 大寶..."
              rows={6}
              className="bg-white border-stone-300 text-stone-900 text-sm placeholder:text-stone-400"
              autoFocus
            />

            {previewCount > 0 && (
              <p className="text-xs text-stone-600 font-medium">
                偵測到 <span className="font-bold text-emerald-600">{previewCount}</span> 位玩家
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowBatchModal(false)}
              className="text-stone-500 hover:text-stone-800"
            >
              取消
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleBatchSubmit}
              disabled={previewCount === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              確認匯入 ({previewCount} 位)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
