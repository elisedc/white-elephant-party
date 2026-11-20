import type { Plugin } from 'vite'
import { WebSocketServer, WebSocket } from 'ws'
import os from 'node:os'

export function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces()
  const candidateIps: string[] = []

  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name]
    if (!netList) continue

    for (const net of netList) {
      const isIpv4 = net.family === 'IPv4' || (net.family as unknown as number) === 4
      if (!net.internal && isIpv4) {
        // Prioritize standard local Wi-Fi private ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        if (net.address.startsWith('192.168.') || net.address.startsWith('10.')) {
          return net.address
        }
        candidateIps.push(net.address)
      }
    }
  }

  return candidateIps[0] || 'localhost'
}

// In-memory cache of active room states on this local LAN server
const globalRef = globalThis as any
if (!globalRef.__lan_room_states) {
  globalRef.__lan_room_states = new Map<string, any>()
}
const roomStates: Map<string, any> = globalRef.__lan_room_states

export function localRealtimePlugin(): Plugin {
  return {
    name: 'local-realtime-lan-plugin',
    configureServer(server) {
      if (!server.httpServer) return
      const wss = setupLocalServer(server.httpServer)
      registerHttpEndpoints(server.middlewares, wss, () => {
        const address = server.httpServer?.address()
        return address && typeof address === 'object' ? address.port : 5174
      })
    },
    configurePreviewServer(server) {
      if (!server.httpServer) return
      const wss = setupLocalServer(server.httpServer)
      registerHttpEndpoints(server.middlewares, wss, () => {
        const address = server.httpServer?.address()
        return address && typeof address === 'object' ? address.port : 4173
      })
    },
  }
}

function registerHttpEndpoints(middlewares: any, wss: WebSocketServer, getPort: () => number) {
  // 1. LAN Info Endpoint
  middlewares.use('/api/lan-info', (_req: any, res: any) => {
    const lanIp = getLocalIpAddress()
    const port = getPort()

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.end(
      JSON.stringify({
        lanIp,
        port,
        lanOrigin: `http://${lanIp}:${port}`,
      })
    )
  })

  // 2. HTTP State Query Fallback (Allows mobile to immediately retrieve room state without waiting for WS)
  middlewares.use('/api/room-state', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    try {
      const url = new URL(req.url || '', 'http://localhost')
      const roomId = (url.searchParams.get('room') || '').trim().toUpperCase()
      const state = roomId ? roomStates.get(roomId) || null : null

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ success: true, roomId, gameState: state }))
    } catch {
      res.statusCode = 500
      res.end(JSON.stringify({ error: 'Failed to query room state' }))
    }
  })

  // 3. HTTP Message Post Fallback (Allows mobile to post joins/reactions even if mobile WS handshake is delayed)
  middlewares.use('/api/room-message', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end()
      return
    }

    let rawBody = ''
    req.on('data', (chunk: Buffer) => {
      rawBody += chunk.toString()
    })

    req.on('end', () => {
      try {
        const parsed = JSON.parse(rawBody)
        if (parsed.roomId) {
          const room = parsed.roomId.trim().toUpperCase()
          if (parsed.type === 'SYNC_STATE' && parsed.payload?.gameState) {
            roomStates.set(room, parsed.payload.gameState)
          }

          // Broadcast to all connected WebSocket clients
          for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(rawBody)
            }
          }
        }

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true }))
      } catch {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Invalid JSON message' }))
      }
    })
  })
}

function setupLocalServer(httpServer: any): WebSocketServer {
  if (!globalRef.__lan_wss) {
    globalRef.__lan_wss = new WebSocketServer({ noServer: true })
  }
  const wss: WebSocketServer = globalRef.__lan_wss

  if (!globalRef.__lan_upgrade_hooked) {
    globalRef.__lan_upgrade_hooked = true

    httpServer.on('upgrade', (req: any, socket: any, head: any) => {
      const url = req.url || ''
      if (url.startsWith('/ws')) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req)
        })
      }
    })
  }

  wss.removeAllListeners('connection')
  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress || 'unknown'
    console.log(`[LAN Realtime] Client connected from ${clientIp} (Total clients: ${wss.clients.size})`)

    ws.on('message', (data, isBinary) => {
      try {
        const parsed = JSON.parse(data.toString())
        if (parsed.roomId) {
          const room = parsed.roomId.trim().toUpperCase()
          // Save game state in local cache whenever host broadcasts SYNC_STATE
          if (parsed.type === 'SYNC_STATE' && parsed.payload?.gameState) {
            roomStates.set(room, parsed.payload.gameState)
          }
        }
      } catch {
        // ignore non-json
      }

      // Broadcast incoming event to all other clients on the same local network
      for (const client of wss.clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data, { binary: isBinary })
        }
      }
    })

    ws.on('error', (err) => {
      console.warn('[LAN Realtime Client Error]:', err.message)
    })

    ws.on('close', () => {
      console.log(`[LAN Realtime] Client disconnected (Remaining clients: ${wss.clients.size})`)
    })
  })

  return wss
}
