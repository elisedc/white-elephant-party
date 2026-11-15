import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { QRCodeSVG } from 'qrcode.react'
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
  QrCode,
  Smartphone,
  Laptop,
  Copy,
  Check,
} from 'lucide-react'
import { GameSettings, Participant } from '@/types/game'

interface GameSetupFormProps {
  roomId?: string
  settings: GameSettings
  participants: Participant[]
  onUpdateSettings: (settings: Partial<GameSettings>) => void
  onAddParticipant: (name: string, customAvatarEmoji?: string, joinedVia?: 'online' | 'local') => void
  onAddBatch: (rawText: string, joinedVia?: 'online' | 'local') => void
  onRemoveParticipant: (id: string) => void
  onClearParticipants?: (mode: 'online' | 'local') => void
  onStartDrawing: (mode?: 'online' | 'local') => void
}

const SAMPLE_20_PLAYERS = `小明, 小美, 阿杰, 雅婷, 志明, 春嬌, 冠宇, 欣怡, 俊宏, 佩君, 柏翰, 淑芬, 宗翰, 宜婷, 家豪, 佳玲, 承恩, 雅涵, 威廷, 詠晴`

export const GameSetupForm: React.FC<GameSetupFormProps> = ({
  roomId,
  settings,
  participants,
  onUpdateSettings,
  onAddParticipant,
  onAddBatch,
  onRemoveParticipant,
  onClearParticipants,
  onStartDrawing,
}) => {
  // Mode selection: Online QR Code party (default) vs Local manual entry
  const [mode, setMode] = useState<'online' | 'local'>(settings.mode || 'online')

  // Separate participants based on joined source
  const onlineParticipants = participants.filter((p) => p.joinedVia === 'online')
  const localParticipants = participants.filter((p) => p.joinedVia === 'local' || !p.joinedVia)

  // Local mode input states
  const [nameInput, setNameInput] = useState('')
  const [batchText, setBatchText] = useState('')
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)

  // Copy join link state
  const [copied, setCopied] = useState(false)

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?role=player&room=${roomId || ''}`
    : ''

  const handleCopyJoinUrl = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (nameInput.trim()) {
      onAddParticipant(nameInput.trim(), undefined, 'local')
      setNameInput('')
    }
  }

  const handleBatchSubmit = () => {
    if (batchText.trim()) {
      onAddBatch(batchText, 'local')
      setBatchText('')
      setShowBatchModal(false)
    }
  }

  const handleLoadSample20 = () => {
    onAddBatch(SAMPLE_20_PLAYERS, 'local')
  }

  // Count preview of names in batch textarea
  const previewCount = batchText
    .split(/[\n,，、\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length

  return (
    <div className="h-full flex flex-col justify-between space-y-2 sm:space-y-3 min-h-0 max-w-5xl w-full mx-auto">
      {/* Clean Header Bar - Compact Height */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-stone-200/90 bg-white shadow-xs shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-tight">
            {settings.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2.5 pt-0.5 text-[11px] text-stone-600">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-600" />
              預算：{settings.priceLimit}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-cyan-600" />
              搶奪上限：{settings.maxSteals} 次 (滿次冰凍)
            </span>
            <span>•</span>
            <span>第 1 棒最終交換：{settings.allowPlayer1Swap ? '開啟' : '關閉'}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSettingsModal(!showSettingsModal)}
          className="self-start sm:self-center shrink-0 h-9 px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
        >
          <Settings2 className="w-4 h-4 text-amber-600" />
          規則設定
        </Button>
      </div>

      {/* Mode Switcher Tabs - Compact */}
      <div className="flex items-center justify-center shrink-0">
        <div className="inline-flex p-1 bg-stone-200/70 rounded-xl shadow-inner gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('online')
              onUpdateSettings({ mode: 'online' })
            }}
            className={`py-1.5 px-3.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              mode === 'online'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            線上派對模式（QR Code 掃碼加入）
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('local')
              onUpdateSettings({ mode: 'local' })
            }}
            className={`py-1.5 px-3.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              mode === 'local'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-stone-600" />
            本地單機模式（手動打名單）
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: ONLINE PARTY (Lobby with QR Code & Realtime Roster)   */}
      {/* ------------------------------------------------------------- */}
      {mode === 'online' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch overflow-hidden">
          {/* Left: QR Code Card (Fitted to viewport) */}
          <Card className="md:col-span-5 border-stone-200/90 bg-white shadow-xs p-4 flex flex-col items-center justify-between text-center min-h-0 overflow-hidden">
            <div className="space-y-1 shrink-0">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <QrCode className="w-3 h-3" />
                現場手機掃碼
              </span>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight">
                掃描 QR Code 入座
              </h3>
              <p className="text-[11px] text-stone-500 max-w-xs">
                拿起手機相機掃描，輸入姓名並挑選頭像直接加入大廳！
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-2.5 bg-white rounded-xl border-2 border-stone-200 shadow-2xs my-auto shrink-0">
              <QRCodeSVG value={joinUrl} size={150} level="M" />
            </div>

            {/* Room info & copy link */}
            <div className="w-full space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600">
                <span className="text-stone-500 font-medium">房間代碼</span>
                <span className="font-mono font-bold text-stone-900">{roomId}</span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleCopyJoinUrl}
                className="w-full h-9 px-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-bold">已複製加入連結！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>複製連結分享至 LINE 群組</span>
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Right: Live Player Lobby Wall */}
          <Card className="md:col-span-7 border-stone-200/90 bg-white shadow-xs flex flex-col justify-between min-h-0 overflow-hidden">
            <CardHeader className="py-2.5 px-4 border-b border-stone-100 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-600" />
                <CardTitle className="text-base text-stone-900">大廳已入座玩家</CardTitle>
                <Badge
                  variant="secondary"
                  className="font-mono text-xs px-2 py-0.5 bg-rose-50 text-rose-700 border-rose-200 font-bold"
                >
                  {onlineParticipants.length} 人
                </Badge>
              </div>

              {onlineParticipants.length >= 20 && (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  已達 20 人規模
                </span>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between p-3.5 min-h-0 overflow-hidden">
              {onlineParticipants.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-200 bg-stone-50/50 rounded-xl space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center animate-pulse">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-stone-700 text-xs">等待玩家掃碼入座中...</p>
                  <p className="text-[11px] text-stone-500 max-w-xs">
                    現場朋友掃描左側 QR Code 並按加入後，姓名會即時出現在這裡！
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 min-h-0 overflow-y-auto pr-1 content-start auto-rows-max">
                  {onlineParticipants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="group h-9 shrink-0 flex items-center justify-between px-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:border-rose-300 text-xs shadow-2xs animate-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-stone-400 text-[10px] w-3 shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="text-sm shrink-0">{p.avatarEmoji || '🎅'}</span>
                        <span className="font-bold text-stone-800 truncate">{p.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveParticipant(p.id)}
                        className="opacity-40 group-hover:opacity-100 text-stone-400 hover:text-red-600 p-0.5 transition-opacity shrink-0"
                        title={`移除 ${p.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                <span className="text-[11px] text-stone-500 truncate">
                  {onlineParticipants.length < 2
                    ? '至少需要 2 位玩家加入才能開始抽籤'
                    : `全員到齊後，系統將隨機打亂分配 1 ~ ${onlineParticipants.length} 號順序`}
                </span>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onStartDrawing('online')}
                  disabled={onlineParticipants.length < 2}
                  className="w-full sm:w-auto font-bold text-xs h-9 px-5 shadow-xs bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 shrink-0"
                >
                  <Dice5 className="w-3.5 h-3.5 mr-1.5" />
                  全員到齊，開始順序抽籤 ({onlineParticipants.length} 人)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: LOCAL OFFLINE MODE (Manual typing & Batch paste)      */}
      {/* ------------------------------------------------------------- */}
      {mode === 'local' && (
        <Card className="flex-1 min-h-0 border-stone-200/90 bg-white shadow-xs flex flex-col justify-between overflow-hidden">
          <CardHeader className="py-2.5 px-4 border-b border-stone-100 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-stone-700" />
                <CardTitle className="text-base text-stone-900">本地手動管理名單</CardTitle>
                <Badge
                  variant="secondary"
                  className="font-mono text-xs px-2 py-0.5 bg-stone-100 text-stone-700 border-stone-200"
                >
                  {localParticipants.length} 人
                </Badge>
                {localParticipants.length >= 20 && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    已達 20 人規模
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {localParticipants.length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadSample20}
                    className="text-xs h-8 px-3 rounded-lg border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100 font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                    快速帶入 20 位玩家
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBatchModal(true)}
                  className="text-xs h-8 px-3 rounded-lg border-stone-200 text-stone-700 hover:bg-stone-50 bg-white font-medium"
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  批次貼上
                </Button>

                {localParticipants.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowClearConfirmModal(true)}
                    className="text-xs h-8 px-2.5 rounded-lg border-stone-200 text-stone-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    清除所有玩家
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3.5 flex-1 flex flex-col justify-between min-h-0 overflow-hidden space-y-3">
            {/* Quick single input */}
            <form onSubmit={handleSingleAdd} className="flex gap-2 shrink-0">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="輸入玩家姓名（按 Enter 直接新增）"
                className="flex-1 h-8 bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 text-xs"
              />
              <Button
                type="submit"
                variant="default"
                className="shrink-0 h-8 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                新增玩家
              </Button>
            </form>

            {/* Compact 20-Player Grid */}
            {localParticipants.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-stone-400 rounded-xl border border-dashed border-stone-200 bg-stone-50/50">
                <Gift className="w-6 h-6 mx-auto text-stone-400 mb-1.5" />
                <p className="font-semibold text-stone-700 text-xs">目前尚無玩家</p>
                <p className="text-[11px] mt-0.5 text-stone-500">
                  請在上方輸入玩家名字，或點選「批次貼上 / 快速帶入 20 位玩家」
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 flex-1 min-h-0 overflow-y-auto p-1 content-start auto-rows-max">
                {localParticipants.map((p, idx) => (
                  <div
                    key={p.id}
                    className="group h-9 shrink-0 flex items-center justify-between px-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:border-rose-300 transition-all text-xs"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="font-mono text-stone-400 text-[10px] w-3.5 shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-xs shrink-0">{p.avatarEmoji}</span>
                      <span className="font-medium text-stone-800 truncate">{p.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveParticipant(p.id)}
                      className="opacity-40 group-hover:opacity-100 text-stone-400 hover:text-red-600 p-0.5 transition-opacity shrink-0"
                      title={`移除 ${p.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Start Button */}
            <div className="pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-stone-500">
                點擊抽籤後，系統將隨機打亂並分配 1 ~ {localParticipants.length} 號順序
              </span>
              <Button
                size="sm"
                variant="default"
                onClick={() => onStartDrawing('local')}
                disabled={localParticipants.length < 2}
                className="w-full sm:w-auto font-bold text-xs h-9 px-5 shadow-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Dice5 className="w-3.5 h-3.5 mr-1.5" />
                開始抽籤決定順序 ({localParticipants.length} 位玩家)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                禮物被搶上限 (滿次冰凍)
              </label>
              <select
                value={settings.maxSteals}
                onChange={(e) => onUpdateSettings({ maxSteals: Number(e.target.value) })}
                className="flex h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
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

      {/* Batch Paste Dialog / Modal (For Local Mode) */}
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

      {/* Clear Participants Confirmation Modal */}
      <Dialog open={showClearConfirmModal} onOpenChange={setShowClearConfirmModal}>
        <DialogContent className="max-w-sm border-stone-200 bg-white text-stone-900 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              清除所有玩家名單
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-xs">
              確定要清空目前「本地手動模式」的所有玩家（共 {localParticipants.length} 位）嗎？此動作將移除所有已輸入的玩家名單。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowClearConfirmModal(false)}
              className="text-stone-600 text-xs h-9 px-4"
            >
              取消
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                onClearParticipants?.('local')
                setShowClearConfirmModal(false)
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-9 px-4"
            >
              確認清除 ({localParticipants.length} 位)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GameSetupForm
