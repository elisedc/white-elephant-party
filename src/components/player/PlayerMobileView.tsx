import React, { useState, useEffect, useRef, useMemo } from 'react'
import { GameState, Participant, Gift, ActionLog } from '@/types/game'
import { RoomRealtimeBridge } from '@/services/realtime/channel'
import { RealtimeMessage } from '@/services/realtime/types'
import { groupConsecutiveLogs } from '@/lib/logUtils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Gift as GiftIcon,
  Flame,
  Snowflake,
  Sparkles,
  AlertTriangle,
  Users,
  Check,
  ChevronRight,
  Smile,
  Crown,
  ArrowLeft,
  ArrowRightLeft,
  Radio,
  Shuffle,
  PartyPopper,
  MessageSquare,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import confetti from 'canvas-confetti'
import { sounds } from '@/lib/sound'
import { FloatingReactionsOverlay, useFloatingReactions } from '@/components/common/FloatingReactionsOverlay'

interface PlayerMobileViewProps {
  roomId: string
  bridge: RoomRealtimeBridge
  gameState: GameState | null
  onBackToLanding?: () => void
  onJoinSuccess?: (player: Participant) => void
}

const AVATAR_OPTIONS = ['🎅', '🎄', '⛄', '🎁', '🦌', '🔔', '⭐', '🍪', '🧦', '🐧', '🐻', '🦊']
const QUICK_EMOJIS = ['🎉', '🔥', '😱', '👏', '🎁', '❄️']

export const PlayerMobileView: React.FC<PlayerMobileViewProps> = ({
  roomId,
  bridge,
  gameState,
  onBackToLanding,
}) => {
  // Check if player has already joined this room
  const sessionKey = `we_player_${roomId}`
  const [myPlayer, setMyPlayer] = useState<Participant | null>(() => {
    try {
      const saved = localStorage.getItem(sessionKey)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Leave room confirmation dialog
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)

  const handleConfirmLeave = () => {
    setShowLeaveDialog(false)
    onBackToLanding?.()
  }

  const handleExitAndClearIdentity = () => {
    try {
      localStorage.removeItem(sessionKey)
    } catch {
      // ignore
    }
    setMyPlayer(null)
    setShowLeaveDialog(false)
    onBackToLanding?.()
  }

  // Join form state
  const [nameInput, setNameInput] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(
    () => AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]
  )
  const [isJoining, setIsJoining] = useState(false)

  const { reactions, triggerReaction } = useFloatingReactions()

  // Modal / Dialog state
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [logsDialogTab, setLogsDialogTab] = useState<'logs' | 'players'>('logs')
  const logsScrollRef = useRef<HTMLDivElement>(null)
  const [acknowledgedTurn, setAcknowledgedTurn] = useState(false)

  // Collapse consecutive emoji logs
  const displayLogs = useMemo(
    () => groupConsecutiveLogs(gameState?.logs || []),
    [gameState?.logs]
  )

  useEffect(() => {
    if (showLogsDialog && logsDialogTab === 'logs' && logsScrollRef.current) {
      logsScrollRef.current.scrollTop = logsScrollRef.current.scrollHeight
    }
  }, [showLogsDialog, logsDialogTab, displayLogs.length])

  const getLogIcon = (type: ActionLog['type']) => {
    switch (type) {
      case 'OPEN_GIFT':
        return <GiftIcon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
      case 'STEAL_GIFT':
        return <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
      case 'FREEZE_GIFT':
        return <Snowflake className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
      case 'FINAL_SWAP':
        return <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      case 'DRAW_ORDER':
        return <Shuffle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
      case 'PLAYER_JOINED':
        return <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      case 'GAME_FINISH':
        return <PartyPopper className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      case 'CHAT_MESSAGE':
        return <MessageSquare className="w-3.5 h-3.5 text-sky-600 shrink-0" />
      case 'EMOJI_REACTION':
        return <Smile className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
    }
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  }

  // Send request for latest game state and announce presence on mount/reconnect
  useEffect(() => {
    if (myPlayer) {
      bridge.send('PLAYER_JOIN', myPlayer)
    }
    bridge.send('REQUEST_SYNC', {})
  }, [bridge, myPlayer?.id])

  // Listen to incoming messages
  useEffect(() => {
    const unsubscribe = bridge.subscribe((msg: RealtimeMessage) => {
      if (msg.type === 'EMOJI_REACTION') {
        triggerReaction(
          msg.payload.emoji,
          msg.payload.senderName,
          msg.payload.avatarEmoji
        )
      }
    })
    return unsubscribe
  }, [bridge, triggerReaction])

  // Find updated participant info from gameState
  const currentParticipant = gameState?.participants.find((p) => p.id === myPlayer?.id)
  const isMyTurn = Boolean(
    gameState?.phase === 'PLAYING' &&
    gameState?.turnState.activeParticipantId === myPlayer?.id
  )
  const isMyStealReaction = isMyTurn && gameState?.turnState.isStealReaction

  // Reset acknowledged turn when turn changes
  const activeId = gameState?.turnState.activeParticipantId
  useEffect(() => {
    setAcknowledgedTurn(false)
  }, [activeId])

  // Vibrate phone and play sound when it becomes my turn!
  useEffect(() => {
    if (isMyTurn && !acknowledgedTurn) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([250, 100, 250, 100, 400])
        } catch { }
      }
      sounds.playJingle()
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.4 },
      })
    }
  }, [isMyTurn, acknowledgedTurn])

  // Handle player joining room
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim()) return

    setIsJoining(true)
    const newPlayer: Participant = {
      id: `p_mob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: nameInput.trim(),
      order: 0,
      avatarEmoji: selectedAvatar,
    }

    // Save to local session
    localStorage.setItem(sessionKey, JSON.stringify(newPlayer))
    setMyPlayer(newPlayer)

    // Broadcast join to host
    bridge.send('PLAYER_JOIN', newPlayer)
    setIsJoining(false)
    sounds.playJingle()
  }

  // Send quick emoji reaction with Google Meet floating animation
  const handleSendEmoji = (emoji: string, btnIndex?: number) => {
    if (!myPlayer) return

    bridge.send('EMOJI_REACTION', {
      senderId: myPlayer.id,
      senderName: myPlayer.name,
      avatarEmoji: myPlayer.avatarEmoji || '🎅',
      emoji,
      timestamp: Date.now(),
    })

    // Local Google Meet style floating emoji right above the tapped button
    const preferredX = btnIndex !== undefined ? 14 + btnIndex * 14.5 : 50
    triggerReaction(emoji, myPlayer.name, myPlayer.avatarEmoji, preferredX)
  }

  // -------------------------------------------------------------
  // VIEW 1: JOIN SCREEN (If player has not joined yet)
  // -------------------------------------------------------------
  if (!myPlayer) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between p-4 max-w-md mx-auto">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between pt-1 pb-1">
          {onBackToLanding ? (
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 px-2.5 py-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </button>
          ) : (
            <div />
          )}
          <span className="text-[11px] font-mono text-stone-400">房間：{roomId}</span>
        </div>

        <div className="pt-2 pb-4 text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-3xl mx-auto shadow-2xs">
            🎁
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            {gameState?.settings.title || '聖誕白象交換禮物'}
          </h1>
          <p className="text-xs text-stone-500">
            請輸入你的姓名與挑選頭像，加入交換禮物聚會！
          </p>
        </div>

        <form onSubmit={handleJoin} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          {/* Avatar Picker */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-2">
              挑選你的代表頭像：
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${selectedAvatar === emoji
                    ? 'bg-rose-100 border-2 border-rose-500 scale-105 shadow-2xs'
                    : 'bg-stone-50 border border-stone-200 hover:bg-stone-100'
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              你的姓名 / 暱稱 <span className="text-rose-600">*必填</span>
            </label>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="例如：小美、Ken、David..."
              className="bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 h-11 text-base"
              required
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!nameInput.trim() || isJoining}
            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base shadow-none rounded-xl"
          >
            加入交換禮物
          </Button>
        </form>

        <div className="py-4 text-center space-y-1.5">
          <div className="text-xs text-stone-400">
            房間代碼：<span className="font-mono font-bold text-stone-600">{roomId}</span>
          </div>
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-xs text-stone-500 hover:text-rose-600 hover:underline block mx-auto transition-colors"
            >
              或是返回首頁輸入其他代碼
            </button>
          )}
        </div>
      </div>
    )
  }

  // Find active participant currently taking action on stage
  const activeParticipant = gameState?.participants.find(
    (p) => p.id === gameState.turnState.activeParticipantId
  )
  const myGift = gameState?.gifts.find((g) => g.currentOwnerId === myPlayer.id)

  // -------------------------------------------------------------
  // VIEW 2: ACTIVE GAME COMPANION (After joining)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between relative overflow-hidden">
      {/* Google Meet Floating Reactions Overlay */}
      <FloatingReactionsOverlay reactions={reactions} showSenderName={false} />

      {/* FULL SCREEN TURN TAKEOVER ALERT WHEN IT'S MY TURN */}
      {isMyTurn && !acknowledgedTurn && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border-2 border-rose-400">
            {isMyStealReaction ? (
              <>
                <div className="w-20 h-20 rounded-3xl bg-red-100 border border-red-300 text-red-600 flex items-center justify-center text-4xl mx-auto animate-pulse">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-600 text-white">
                    禮物被搶！反擊時間
                  </span>
                  <h2 className="text-2xl font-extrabold text-stone-900 pt-2">
                    你的禮物剛剛被搶走了！
                  </h2>
                  <p className="text-xs text-stone-600">
                    現在輪到你反擊！請抬頭看主持人螢幕，決定拆開全新禮物或搶回其他人的禮物！
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-300 flex items-center justify-center text-4xl mx-auto animate-bounce">
                  {myPlayer.avatarEmoji || '🎉'}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-600 text-white">
                    輪到你登場！
                  </span>
                  <h2 className="text-2xl font-extrabold text-stone-900 pt-2">
                    {myPlayer.name}，換你了！
                  </h2>
                  <p className="text-xs text-stone-600">
                    請到台前挑選禮物（拆新禮物或搶場上禮物）！
                  </p>
                </div>
              </>
            )}

            <Button
              size="lg"
              onClick={() => setAcknowledgedTurn(true)}
              className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base rounded-2xl shadow-none"
            >
              我知道了！
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 px-3.5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBackToLanding && (
            <button
              type="button"
              onClick={() => setShowLeaveDialog(true)}
              className="p-1.5 -ml-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="返回首頁"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <span className="text-xl">{myPlayer.avatarEmoji || '🎅'}</span>
          <div>
            <h2 className="font-extrabold text-sm text-stone-900 tracking-tight leading-none">
              {myPlayer.name}
            </h2>
            <span className="text-[10px] text-stone-500 font-mono">
              {currentParticipant?.order ? `第 ${currentParticipant.order} 棒` : '等待抽籤'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLogsDialogTab('logs')
              setShowLogsDialog(true)
            }}
            className="text-xs h-7 px-2.5 border-stone-200 text-stone-700 bg-white hover:bg-stone-50 rounded-lg shadow-2xs font-semibold flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>即時動態紀錄</span>
          </Button>

          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="即時連線中" />
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 p-4 space-y-3 max-w-md w-full mx-auto pb-20">
        {/* WAITING FOR SYNC */}
        {!gameState && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-bold text-stone-900">
              連線至交換禮物大螢幕中...
            </h3>
            <p className="text-xs text-stone-500">
              正在同步遊戲即時進度（房間代碼：<span className="font-mono font-bold text-stone-700">{roomId}</span>）
            </p>
            {onBackToLanding && (
              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveDialog(true)}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium"
                >
                  房間代碼不符？返回首頁重新輸入或掃碼
                </button>
              </div>
            )}
          </div>
        )}

        {/* PHASE: SETUP */}
        {gameState?.phase === 'SETUP' && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center space-y-3 shadow-xs">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              已成功加入房間
            </span>
            <h3 className="text-xl font-bold text-stone-900">
              等待主持人開始抽籤...
            </h3>
            <p className="text-xs text-stone-500">
              現場共有 {gameState.participants.length} 位玩家入座。主持人即將開始抽籤決定遊戲順序！
            </p>
          </div>
        )}

        {/* PHASE: DRAWING */}
        {gameState?.phase === 'DRAWING' && (
          <div className="bg-white p-6 rounded-3xl border border-amber-300 bg-amber-50/60 text-center space-y-3 shadow-xs">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              順序抽籤揭曉
            </span>
            <div className="text-4xl">{myPlayer.avatarEmoji}</div>
            <h3 className="text-2xl font-extrabold text-stone-900">
              你是第 {currentParticipant?.order} 棒！
            </h3>
            <p className="text-xs text-stone-600">
              請注意聆聽主持人說明，遊戲馬上就要正式開始囉！
            </p>
          </div>
        )}

        {/* PHASE: PLAYING */}
        {gameState?.phase === 'PLAYING' && (
          <>
            {/* Current Stage Card */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-2">
                <span>
                  第 {gameState.turnState.currentOrderNumber} 棒 / 共 {gameState.participants.length} 位
                </span>
                {gameState.turnState.isStealReaction ? (
                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    反擊時間
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    行動中
                  </span>
                )}
              </div>

              {/* Who is up */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-3xl shrink-0">
                  {activeParticipant?.avatarEmoji || '🎅'}
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 font-medium">
                    目前輪到行動：
                  </span>
                  <h3 className="text-xl font-extrabold text-stone-900">
                    {activeParticipant?.name}
                    {activeParticipant?.id === myPlayer.id && (
                      <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                        就是你！
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="pt-1 text-xs text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                剩餘未拆禮物：<strong className="text-stone-800">{gameState.unopenedGiftsCount}</strong> 份 •
                場上已開出：<strong className="text-stone-800">{gameState.gifts.length}</strong> 份
              </div>
            </div>

            {/* My Personal Status Card */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  你的狀態 ({myPlayer.name})
                </span>
                <span className="text-xs font-mono font-bold text-rose-600">
                  第 {currentParticipant?.order || '-'} 棒
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                {myGift ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GiftIcon className="w-4 h-4 text-rose-600" />
                      <div>
                        <span className="font-bold text-stone-900">{myGift.title}</span>
                        <p className="text-[10px] text-stone-500">
                          {myGift.isFrozen
                            ? '❄️ 已達到上限被冰凍保護'
                            : `被搶過 ${myGift.stealCount} 次`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-stone-500 text-xs">
                    {currentParticipant?.hasPlayed
                      ? '你的禮物剛剛被搶走了，等待反擊！'
                      : '你還沒有打開禮物！'}
                  </p>
                )}
              </div>
            </div>

            {/* Opened Gifts List - Displayed directly below Your Status without collapsing */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <GiftIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-xs font-bold text-stone-900">
                    已開禮物清單
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  已開 {gameState.gifts.length} 份
                </span>
              </div>

              {gameState.gifts.length === 0 ? (
                <div className="text-center py-4 text-xs text-stone-400">
                  目前場上尚未有拆開的禮物
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {gameState.gifts.map((gift) => {
                    const owner = gameState.participants.find((p) => p.id === gift.currentOwnerId)
                    const isMyGift = gift.currentOwnerId === myPlayer.id

                    return (
                      <div
                        key={gift.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${isMyGift
                          ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-200'
                          : 'bg-stone-50 border-stone-200/80'
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg shrink-0">
                            {gift.isFrozen ? '❄️' : '🎁'}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-stone-900 truncate">
                                {gift.title}
                              </span>
                              {isMyGift && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white shrink-0">
                                  你的
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 truncate">
                              目前持有者：{owner?.avatarEmoji || '👤'} {owner?.name || '無'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${gift.isFrozen
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                            : gift.stealCount > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-200/70 text-stone-600'
                            }`}
                        >
                          {gift.isFrozen ? '❄️ 冰凍' : `搶過 ${gift.stealCount} 次`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* PHASE: FINAL_SWAP */}
        {gameState?.phase === 'FINAL_SWAP' && (() => {
          const activeSwapPlayer =
            gameState.participants.find((p) => p.id === gameState.turnState.activeParticipantId) ||
            gameState.participants.find((p) => p.order === 1)
          const isMe = activeSwapPlayer?.id === myPlayer?.id
          const displacedGift = gameState.turnState.displacedGiftId
            ? gameState.gifts.find((g) => g.id === gameState.turnState.displacedGiftId)
            : undefined

          return (
            <div
              className={`p-5 rounded-3xl border text-center space-y-2 ${
                isMe
                  ? 'border-amber-400 bg-amber-50/90 ring-2 ring-amber-300'
                  : 'border-amber-300 bg-amber-50/70'
              }`}
            >
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                {!displacedGift ? (
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                )}
                {!displacedGift ? '最終搶禮特權' : '被搶反擊特權'}
              </span>
              <h3 className="text-xl font-bold text-stone-900">
                {isMe
                  ? !displacedGift
                    ? '輪到你行使搶禮特權了！'
                    : '你的禮物被搶走了！輪到你做決定！'
                  : !displacedGift
                  ? `輪到第 1 棒【${activeSwapPlayer?.name}】行使特權！`
                  : `【${activeSwapPlayer?.name}】的禮物被搶走了！`}
              </h3>
              <p className="text-xs text-stone-600">
                {isMe
                  ? !displacedGift
                    ? '請看大螢幕，選擇搶其他尚未冷凍的禮物，或選擇不搶保留目前禮物！'
                    : `請看大螢幕，選擇搶其他尚未冷凍的禮物，或選擇不搶收下待認領禮物【${displacedGift?.title || '禮物'}】！`
                  : !displacedGift
                  ? '全體禮物已拆封完畢，第 1 棒正在大螢幕決定是否搶奪場上禮物！'
                  : '正在大螢幕決定是否搶奪其他尚未冷凍的禮物！'}
              </p>
            </div>
          )
        })()}

        {/* PHASE: FINISHED */}
        {gameState?.phase === 'FINISHED' && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center space-y-3">
            <div className="text-4xl">🎉</div>
            <h3 className="text-2xl font-extrabold text-stone-900">
              交換禮物圓滿結束！
            </h3>
            <p className="text-xs text-stone-600">
              祝大家聖誕快樂！你拿到的禮物是：
            </p>
            {myGift && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 font-bold text-stone-900 text-base">
                🎁 {myGift.title}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Interaction Bar (Emoji Reactions) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-3 py-2.5 max-w-md mx-auto">
        {/* Quick Emoji Reaction Buttons */}
        <div className="flex items-center justify-around gap-2">
          {QUICK_EMOJIS.map((emoji, idx) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSendEmoji(emoji, idx)}
              className="h-11 flex-1 rounded-2xl bg-stone-100/90 hover:bg-stone-200/90 active:scale-90 text-2xl flex items-center justify-center transition-transform shadow-2xs"
              title={`發送 ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </footer>

      {/* Leave Room Confirmation Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="max-w-xs p-5 bg-white border-stone-200 rounded-3xl text-center">
          <DialogHeader className="items-center text-center">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mb-1 text-lg">
              🏠
            </div>
            <DialogTitle className="text-base font-extrabold text-stone-900">
              返回遊戲首頁？
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 pt-1 leading-relaxed">
              你目前已加入房間【<span className="font-mono font-bold text-stone-800">{roomId}</span>】。你可以隨時再輸入代碼回到房間。
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleConfirmLeave}
              className="w-full text-xs h-9 font-semibold text-stone-700 border-stone-200 hover:bg-stone-50 rounded-xl"
            >
              返回首頁（保留此房間身份）
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleExitAndClearIdentity}
              className="w-full text-xs h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl font-medium"
            >
              退出並清除登入記錄
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => setShowLeaveDialog(false)}
              className="w-full text-xs h-9 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl"
            >
              留在房間
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logs & Participants Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-xs sm:max-w-sm p-4 sm:p-5 bg-white border-stone-200 rounded-3xl text-stone-900 max-h-[85vh] flex flex-col">
          <DialogHeader className="text-left pb-2 border-b border-stone-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                <DialogTitle className="text-base font-extrabold text-stone-900">
                  即時動態紀錄
                </DialogTitle>
              </div>
              <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {displayLogs.length} 則
              </span>
            </div>
            <DialogDescription className="text-xs text-stone-500 pt-0.5">
              現場即時進度與玩家互動快訊
            </DialogDescription>

            {/* Segment switch */}
            <div className="flex rounded-xl bg-stone-100 p-1 mt-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLogsDialogTab('logs')}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${logsDialogTab === 'logs'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                  }`}
              >
                即時動態
              </button>
              <button
                type="button"
                onClick={() => setLogsDialogTab('players')}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${logsDialogTab === 'players'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                  }`}
              >
                玩家名單 ({gameState?.participants.length || 0})
              </button>
            </div>
          </DialogHeader>

          {logsDialogTab === 'logs' ? (
            <div
              ref={logsScrollRef}
              className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 scroll-smooth"
            >
              {displayLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400">
                  目前尚無動態紀錄，等待大家開始互動！
                </div>
              ) : (
                displayLogs.map((log) => {
                  const isSteal = log.type === 'STEAL_GIFT'
                  const isFreeze = log.type === 'FREEZE_GIFT'
                  const isOpen = log.type === 'OPEN_GIFT'
                  const isChat = log.type === 'CHAT_MESSAGE'
                  const isEmoji = log.type === 'EMOJI_REACTION'
                  const displayEmojis = log.emojis || (log.emoji ? [log.emoji] : [])

                  return (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-2xl border text-xs transition-all ${isChat
                          ? 'border-sky-200 bg-sky-50/70 text-sky-950'
                          : isEmoji
                            ? 'border-amber-200 bg-amber-50/60 text-amber-950'
                            : isFreeze
                              ? 'border-cyan-200 bg-cyan-50/70 text-cyan-950'
                              : isSteal
                                ? 'border-amber-200 bg-amber-50/70 text-amber-950'
                                : isOpen
                                  ? 'border-rose-200 bg-rose-50/50 text-rose-950'
                                  : 'border-stone-200/80 bg-stone-50/60 text-stone-800'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] truncate">
                          {getLogIcon(log.type)}
                          <span className="truncate">
                            {log.actorAvatarEmoji ? `${log.actorAvatarEmoji} ` : ''}
                            {log.actorName}
                          </span>
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {formatTime(log.timestamp)}
                        </span>
                      </div>
                      {isEmoji ? (
                        <div className="pl-4 py-0.5 flex items-center gap-1.5 flex-wrap">
                          {displayEmojis.map((e, idx) => (
                            <span
                              key={idx}
                              className="text-2xl inline-block animate-bounce"
                              style={{ animationDelay: `${idx * 100}ms` }}
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="leading-snug text-stone-700 pl-4 font-normal">
                          {log.message}
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
              {(() => {
                const participants = gameState?.participants || []
                const sorted = [...participants].sort((a, b) => {
                  if (a.order && b.order) return a.order - b.order
                  if (a.order) return -1
                  if (b.order) return 1
                  return 0
                })

                if (sorted.length === 0) {
                  return (
                    <div className="text-center py-6 text-xs text-stone-400">
                      目前尚未有玩家入座
                    </div>
                  )
                }

                return sorted.map((p) => {
                  const isMe =
                    p.id === myPlayer.id ||
                    p.name.trim().toLowerCase() === myPlayer.name.trim().toLowerCase()
                  const isActive =
                    gameState?.phase === 'PLAYING' &&
                    gameState?.turnState.activeParticipantId === p.id

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs transition-all ${isMe
                          ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-500/25 shadow-xs'
                          : isActive
                            ? 'bg-amber-50/80 border-amber-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{p.avatarEmoji || '🎅'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold truncate ${isMe ? 'text-rose-900 font-extrabold' : 'text-stone-900'
                                }`}
                            >
                              {p.name}
                            </span>
                            {isMe && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-600 text-white shrink-0">
                                你
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-white shrink-0">
                                行動中
                              </span>
                            )}
                          </div>
                          {p.joinedVia === 'online' ? (
                            <span className="text-[10px] text-stone-400">手機連線</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        {p.order > 0 ? (
                          <span
                            className={`inline-block font-extrabold px-2.5 py-1 rounded-xl text-xs ${isMe
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-white border border-stone-200 text-stone-800'
                              }`}
                          >
                            第 {p.order} 棒
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 px-2 py-1">
                            待抽籤
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
