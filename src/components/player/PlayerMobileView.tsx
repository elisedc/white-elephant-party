import React, { useState, useEffect, useRef } from 'react'
import { GameState, Participant, Gift } from '@/types/game'
import { RoomRealtimeBridge } from '@/services/realtime/channel'
import { RealtimeMessage } from '@/services/realtime/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Gift as GiftIcon,
  Flame,
  Snowflake,
  Sparkles,
  Send,
  AlertTriangle,
  Users,
  Check,
  ChevronRight,
  Smile,
  Crown,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { sounds } from '@/lib/sound'
import { FloatingReactionsOverlay, useFloatingReactions } from '@/components/common/FloatingReactionsOverlay'

interface PlayerMobileViewProps {
  roomId: string
  bridge: RoomRealtimeBridge
  gameState: GameState | null
  onJoinSuccess?: (player: Participant) => void
}

const AVATAR_OPTIONS = ['🎅', '🎄', '⛄', '🎁', '🦌', '🔔', '⭐', '🍪', '🧦', '🐧', '🐻', '🦊']
const QUICK_EMOJIS = ['🎉', '🔥', '😱', '👏', '🎁', '❄️']

export const PlayerMobileView: React.FC<PlayerMobileViewProps> = ({
  roomId,
  bridge,
  gameState,
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

  // Join form state
  const [nameInput, setNameInput] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(
    () => AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]
  )
  const [isJoining, setIsJoining] = useState(false)

  // Chat message state
  const [chatText, setChatText] = useState('')
  const { reactions, triggerReaction } = useFloatingReactions()

  // Modal / Tab state
  const [viewOpenedGifts, setViewOpenedGifts] = useState(false)
  const [acknowledgedTurn, setAcknowledgedTurn] = useState(false)

  // Send request for latest game state on mount
  useEffect(() => {
    bridge.send('REQUEST_SYNC', {})
  }, [bridge])

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
        } catch {}
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

  // Send a live chat comment
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatText.trim() || !myPlayer) return

    bridge.send('CHAT_MESSAGE', {
      id: `chat_${Date.now()}`,
      playerId: myPlayer.id,
      playerName: myPlayer.name,
      playerEmoji: myPlayer.avatarEmoji || '🎅',
      text: chatText.trim(),
      timestamp: Date.now(),
    })

    setChatText('')
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
        <div className="pt-6 pb-4 text-center space-y-2">
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
                  className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === emoji
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

        <div className="py-4 text-center text-xs text-stone-400">
          房間代碼：<span className="font-mono font-bold text-stone-600">{roomId}</span>
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
                    請抬頭看大螢幕，並到台前挑選禮物（拆新禮物或搶場上禮物）！
                  </p>
                </div>
              </>
            )}

            <Button
              size="lg"
              onClick={() => setAcknowledgedTurn(true)}
              className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base rounded-2xl shadow-none"
            >
              我知道了，我看大螢幕！
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
            onClick={() => setViewOpenedGifts(!viewOpenedGifts)}
            className="text-xs h-7 px-2.5 border-stone-200 text-stone-700 bg-white"
          >
            <GiftIcon className="w-3 h-3 mr-1 text-rose-500" />
            已開 ({gameState?.gifts.length || 0})
          </Button>

          <span className="h-2 w-2 rounded-full bg-emerald-500" title="即時連線中" />
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 p-4 space-y-3 max-w-md w-full mx-auto pb-32">
        {/* WAITING FOR SYNC */}
        {!gameState && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-bold text-stone-900">
              連線至交換禮物大螢幕中...
            </h3>
            <p className="text-xs text-stone-500">
              正在同步遊戲即時進度（房間代碼：{roomId}）
            </p>
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
                      : '尚未輪到你拆開禮物'}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* PHASE: FINAL_SWAP */}
        {gameState?.phase === 'FINAL_SWAP' && (
          <div className="bg-white p-5 rounded-3xl border border-amber-300 bg-amber-50/70 text-center space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              最終交換權
            </span>
            <h3 className="text-xl font-bold text-stone-900">
              輪到第 1 棒行使特權！
            </h3>
            <p className="text-xs text-stone-600">
              全體禮物已拆封完畢，第 1 棒正在決定是否與場上禮物互換！請看大螢幕！
            </p>
          </div>
        )}

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

        {/* Opened Gifts Collapsible List */}
        {viewOpenedGifts && (
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900">已開禮物清單</span>
              <button
                type="button"
                onClick={() => setViewOpenedGifts(false)}
                className="text-xs text-stone-400 hover:text-stone-700"
              >
                收起
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(gameState?.gifts || []).map((gift) => (
                <div
                  key={gift.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <GiftIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-bold text-stone-900 truncate">{gift.title}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 shrink-0">
                    {gift.isFrozen ? '❄️ 冰凍' : `搶過 ${gift.stealCount} 次`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Interaction Bar (Emoji & Live Chat) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-3 py-2.5 space-y-2 max-w-md mx-auto">
        {/* Quick Emoji Reaction Buttons */}
        <div className="flex items-center justify-around gap-1.5">
          {QUICK_EMOJIS.map((emoji, idx) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSendEmoji(emoji, idx)}
              className="h-10 flex-1 rounded-xl bg-stone-100/80 hover:bg-stone-200/80 active:scale-90 text-xl flex items-center justify-center transition-transform"
              title={`發送 ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Live Chat Comment Input */}
        <form onSubmit={handleSendChat} className="flex items-center gap-2">
          <Input
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder="發送即時留言給大螢幕..."
            className="flex-1 h-9 bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400 text-xs rounded-xl"
          />
          <Button
            type="submit"
            disabled={!chatText.trim()}
            className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-none text-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </footer>
    </div>
  )
}
