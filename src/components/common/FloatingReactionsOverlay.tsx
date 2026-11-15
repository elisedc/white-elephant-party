import React, { useState, useCallback, useEffect } from 'react'

export interface FloatingReaction {
  id: string
  emoji: string
  senderName?: string
  avatarEmoji?: string
  x: number // percentage across screen (5 to 90)
  driftX: number // horizontal sway in px (-40 to 40)
  duration: number // animation duration in seconds
  scale: number
}

/**
 * Hook to manage Google Meet-style floating reactions
 */
export function useFloatingReactions() {
  const [reactions, setReactions] = useState<FloatingReaction[]>([])

  const triggerReaction = useCallback(
    (emoji: string, senderName?: string, avatarEmoji?: string, preferredX?: number) => {
      const id = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

      // Random jitter around preferredX or between 15% and 85%
      const basePercent = preferredX !== undefined ? preferredX : 20 + Math.random() * 60
      const jitter = (Math.random() - 0.5) * 16
      const x = Math.max(8, Math.min(92, basePercent + jitter))

      const driftX = (Math.random() - 0.5) * 80
      const duration = 2.6 + Math.random() * 0.8 // 2.6s - 3.4s
      const scale = 0.95 + Math.random() * 0.35 // 0.95 - 1.3

      const newReaction: FloatingReaction = {
        id,
        emoji,
        senderName,
        avatarEmoji,
        x,
        driftX,
        duration,
        scale,
      }

      setReactions((prev) => [...prev.slice(-30), newReaction])

      // Auto-cleanup after animation completes
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id))
      }, (duration + 0.2) * 1000)
    },
    []
  )

  return { reactions, triggerReaction }
}

interface FloatingReactionsOverlayProps {
  reactions: FloatingReaction[]
  showSenderName?: boolean
}

/**
 * Fullscreen Google Meet Style Floating Reactions Overlay
 */
export const FloatingReactionsOverlay: React.FC<FloatingReactionsOverlayProps> = ({
  reactions,
  showSenderName = true,
}) => {
  if (reactions.length === 0) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {reactions.map((r) => (
        <div
          key={r.id}
          className="floating-reaction-container flex flex-col items-center"
          style={
            {
              left: `${r.x}%`,
              bottom: '16px',
              '--float-duration': `${r.duration}s`,
            } as React.CSSProperties
          }
        >
          <div
            className="floating-reaction-inner flex flex-col items-center"
            style={
              {
                '--drift-x': `${r.driftX}px`,
                '--pop-scale': r.scale,
              } as React.CSSProperties
            }
          >
            {/* Reaction Emoji */}
            <span className="text-4xl sm:text-5xl select-none leading-none pointer-events-none">
              {r.emoji}
            </span>

            {/* Optional sender pill */}
            {showSenderName && r.senderName && (
              <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-stone-800 text-[11px] font-semibold border border-stone-200 shadow-xs whitespace-nowrap">
                {r.avatarEmoji && <span className="text-xs">{r.avatarEmoji}</span>}
                <span>{r.senderName}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
