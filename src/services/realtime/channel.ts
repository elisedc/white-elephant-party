import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { RealtimeMessage } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined')

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type MessageHandler = (message: RealtimeMessage) => void

export class RoomRealtimeBridge {
  private roomId: string
  private supabaseChannel: RealtimeChannel | null = null
  private localBroadcast: BroadcastChannel | null = null
  private handlers: Set<MessageHandler> = new Set()

  constructor(roomId: string) {
    this.roomId = roomId
    this.init()
  }

  private init() {
    const channelName = `white_elephant_room_${this.roomId}`

    // 1. Supabase Realtime channel if credentials exist
    if (supabase) {
      try {
        this.supabaseChannel = supabase.channel(channelName, {
          config: {
            broadcast: { self: false },
          },
        })

        this.supabaseChannel
          .on('broadcast', { event: 'game_event' }, ({ payload }) => {
            this.notifyHandlers(payload as RealtimeMessage)
          })
          .subscribe((status) => {
            console.log(`[Supabase Realtime] Room ${this.roomId} status:`, status)
          })
      } catch (err) {
        console.warn('[Supabase Realtime] Initialization failed:', err)
      }
    }

    // 2. Local BroadcastChannel for multi-tab testing on same machine
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcast = new BroadcastChannel(channelName)
        this.localBroadcast.onmessage = (event) => {
          this.notifyHandlers(event.data as RealtimeMessage)
        }
      } catch (e) {
        console.warn('[BroadcastChannel] Initialization failed:', e)
      }
    }
  }

  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }

  private notifyHandlers(message: RealtimeMessage) {
    if (message.roomId !== this.roomId) return
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

    // Broadcast via Supabase
    if (this.supabaseChannel) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: message,
      })
    }

    // Broadcast via local BroadcastChannel
    if (this.localBroadcast) {
      this.localBroadcast.postMessage(message)
    }
  }

  public destroy() {
    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe()
      this.supabaseChannel = null
    }
    if (this.localBroadcast) {
      this.localBroadcast.close()
      this.localBroadcast = null
    }
    this.handlers.clear()
  }
}
