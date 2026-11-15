import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-[#121a16] shadow-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {settings.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 pt-1.5 text-xs text-stone-300">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              預算：{settings.priceLimit}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
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
          className="self-start sm:self-center shrink-0 border-white/10 hover:bg-white/5 text-stone-200"
        >
          <Settings2 className="w-4 h-4 mr-1.5 text-amber-400" />
          遊戲規則設定
        </Button>
      </div>

      {/* Settings Modal / Drawer */}
      {showSettingsModal && (
        <Card className="border-white/10 bg-[#121a16] p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1 block">活動標題</label>
              <Input
                value={settings.title}
                onChange={(e) => onUpdateSettings({ title: e.target.value })}
                placeholder="例如：2024 聖誕白象交換禮物"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1 block">禮物預算範圍</label>
              <Input
                value={settings.priceLimit}
                onChange={(e) => onUpdateSettings({ priceLimit: e.target.value })}
                placeholder="例如：約 $500 元"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-300 mb-1 block">禮物被搶上限 (次數)</label>
              <select
                value={settings.maxSteals}
                onChange={(e) => onUpdateSettings({ maxSteals: Number(e.target.value) })}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-[#0c1210] px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value={1}>1 次（快速版）</option>
                <option value={2}>2 次（中速版）</option>
                <option value={3}>3 次（官方標準推薦）</option>
                <option value={4}>4 次（高刺激版）</option>
              </select>
            </div>
            <div className="sm:col-span-3 pt-1">
              <label className="text-xs text-stone-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowPlayer1Swap}
                  onChange={(e) => onUpdateSettings({ allowPlayer1Swap: e.target.checked })}
                  className="rounded border-stone-600 text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>允許第 1 棒在所有玩家結束後享有「最終交換權」</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Participants Manager - Designed for 20 Players */}
      <Card className="border-white/10 bg-[#121a16]">
        <CardHeader className="pb-3 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-400" />
              <CardTitle className="text-lg">參加玩家名單</CardTitle>
              <Badge variant="secondary" className="font-mono text-sm px-2.5 py-0.5">
                {participants.length} 人
              </Badge>
              {participants.length >= 20 && (
                <Badge variant="gold" className="text-xs">
                  已達 20 人派對規模！
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {participants.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSample20}
                  className="text-xs h-8 border-white/10 text-amber-300 hover:bg-amber-950/20"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  快速帶入 20 位玩家
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBatchModal(!showBatchModal)}
                className="text-xs h-8 border-white/10 text-stone-200"
              >
                <ClipboardList className="w-3.5 h-3.5 mr-1 text-emerald-400" />
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
              className="flex-1 bg-[#0c1210] border-white/10"
            />
            <Button type="submit" variant="default" className="shrink-0">
              <Plus className="w-4 h-4 mr-1" />
              新增玩家
            </Button>
          </form>

          {/* Batch Modal / Box */}
          {showBatchModal && (
            <div className="p-4 rounded-xl border border-white/15 bg-[#0e1612] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">
                  一次貼上多位玩家（每行一個名字，或以逗號分開）
                </span>
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="text-xs text-stone-400 hover:text-white"
                >
                  收起
                </button>
              </div>
              <Textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="小明&#10;小美&#10;阿杰&#10;志明, 春嬌, 大寶..."
                rows={4}
                className="bg-[#0c1210] border-white/10"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="gold"
                  onClick={handleBatchSubmit}
                  disabled={!batchText.trim()}
                >
                  匯入名單
                </Button>
              </div>
            </div>
          )}

          {/* Compact 20-Player Grid */}
          {participants.length === 0 ? (
            <div className="py-12 text-center text-stone-400 rounded-xl border border-dashed border-white/10">
              <p className="text-3xl mb-1.5">🎁</p>
              <p className="font-semibold text-stone-200">目前尚無玩家</p>
              <p className="text-xs mt-1 text-stone-400">請在上方輸入玩家名字，或點選「批次貼上 / 快速帶入 20 位玩家」</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1 max-h-[360px] overflow-y-auto p-1">
              {participants.map((p, idx) => (
                <div
                  key={p.id}
                  className="group flex items-center justify-between px-3 py-2 rounded-lg bg-[#0c1210] border border-white/10 hover:border-rose-500/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="font-mono text-stone-500 text-[11px] w-4 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-sm shrink-0">{p.avatarEmoji || '🎁'}</span>
                    <span className="font-medium text-stone-200 truncate">
                      {p.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(p.id)}
                    className="opacity-40 group-hover:opacity-100 text-stone-400 hover:text-red-400 p-1 transition-opacity shrink-0"
                    title={`移除 ${p.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Start Button */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-stone-400">
              點擊抽籤後，系統將隨機打亂並分配 1 ~ {participants.length} 號順序
            </span>
            <Button
              size="lg"
              variant="gold"
              onClick={onStartDrawing}
              disabled={participants.length < 2}
              className="w-full sm:w-auto font-bold text-sm h-11 px-6 shadow-md"
            >
              <Dice5 className="w-4 h-4 mr-2" />
              開始抽籤決定順序 ({participants.length} 位玩家)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
