import { RealtimeMessage } from './types'

export type MessageHandler = (message: RealtimeMessage) => void

export class RoomRealtimeBridge {
  private roomId: string
  private ws: WebSocket | null = null
  private localBroadcast: BroadcastChannel | null = null
  private handlers: Set<MessageHandler> = new Set()
  private isDestroyed = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private queuedMessages: string[] = []
  private recentMessageKeys: Set<string> = new Set()

  constructor(roomId: string) {
    this.roomId = (roomId || '').trim().toUpperCase()
    this.init()
  }

  private init() {
    const channelName = `white_elephant_room_${this.roomId}`

    // 1. Connect to Local LAN WebSocket Server (Zero-cloud, runs on the same host & port)
    this.connectWebSocket()

    // 2. Local BroadcastChannel for instant same-browser tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcast = new BroadcastChannel(channelName)
        this.localBroadcast.onmessage = (event) => {
          this.handleIncoming(event.data as RealtimeMessage)
        }
      } catch (e) {
        console.warn('[BroadcastChannel] Initialization failed:', e)
      }
    }
  }

  private connectWebSocket() {
    if (typeof window === 'undefined' || this.isDestroyed) return

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws?room=${encodeURIComponent(this.roomId)}`

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        // Flush any queued messages
        while (this.queuedMessages.length > 0) {
          const item = this.queuedMessages.shift()
          if (item && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(item)
          }
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as RealtimeMessage
          this.handleIncoming(message)
        } catch {
          // Ignore invalid JSON
        }
      }

      this.ws.onclose = () => {
        if (!this.isDestroyed) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = () => {
        // Error will also trigger onclose, handled there
      }
    } catch (err) {
      console.warn('[Local WebSocket] Connection failed, retrying...', err)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.isDestroyed) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connectWebSocket()
    }, 2000)
  }

  private handleIncoming(message: RealtimeMessage) {
    if (!message || !message.roomId) return
    if (message.roomId.trim().toUpperCase() !== this.roomId) {
      console.warn(`[RealtimeBridge] Dropped message for different room. Expected: '${this.roomId}', Got: '${message.roomId}'`)
      return
    }

    // Deduplicate messages across WebSocket and BroadcastChannel
    const key = `${message.type}_${message.timestamp}_${typeof message.payload === 'object' ? JSON.stringify(message.payload).slice(0, 60) : message.payload}`
    if (this.recentMessageKeys.has(key)) return
    this.recentMessageKeys.add(key)

    // Keep cache bounded
    if (this.recentMessageKeys.size > 200) {
      const firstKey = this.recentMessageKeys.values().next().value
      if (firstKey) this.recentMessageKeys.delete(firstKey)
    }

    console.log(`[RealtimeBridge:${this.roomId}] Received '${message.type}' from remote. Notifying ${this.handlers.size} handlers.`)
    this.notifyHandlers(message)
  }

  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }

  private notifyHandlers(message: RealtimeMessage) {
    this.handlers.forEach((h) => {
      try {
        h(message)
      } catch (e) {
        console.error('Error in realtime handler:', e)
      }
    })
  }

  public send(type: RealtimeMessage['type'], payload: any) {
    const message: RealtimeMessage = {
      type,
      roomId: this.roomId,
      payload,
      timestamp: Date.now(),
    }

    // Mark as seen locally to prevent duplicate feedback
    const key = `${message.type}_${message.timestamp}_${typeof message.payload === 'object' ? JSON.stringify(message.payload).slice(0, 60) : message.payload}`
    this.recentMessageKeys.add(key)

    const serialized = JSON.stringify(message)
    console.log(`[RealtimeBridge:${this.roomId}] Sent '${type}'`)

    // 1. Send via Local LAN WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(serialized)
    } else {
      this.queuedMessages.push(serialized)
      // Send via HTTP fallback so messages (joins, emoji, chat) reach host even if mobile WS is connecting
      if (typeof window !== 'undefined' && typeof fetch === 'function') {
        fetch('/api/room-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: serialized,
        }).catch(() => {})
      }
    }

    // 2. Broadcast via local browser channel for multi-tabs
    if (this.localBroadcast) {
      try {
        this.localBroadcast.postMessage(message)
      } catch {
        // BroadcastChannel send error ignored
      }
    }
  }

  public destroy() {
    this.isDestroyed = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.localBroadcast) {
      this.localBroadcast.close()
      this.localBroadcast = null
    }
    this.handlers.clear()
    this.recentMessageKeys.clear()
    this.queuedMessages = []
  }
}
