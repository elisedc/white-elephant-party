# 聖誕白象交換禮物 (White Elephant Gift Exchange) 🎁🎄

> A modern, zero-cloud, real-time White Elephant (Yankee Swap) web application tailored for holiday parties and team gatherings. Supports a host screen for projectors/TVs and interactive mobile companion screens for participants connected via local Wi-Fi.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-7-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)
![Zero_Cloud](https://img.shields.io/badge/Architecture-100%25_Zero--Cloud_LAN-success)

---

## ✨ Features

- **Projector & Big Screen Mode (Host View)**:
  - Atmospheric Christmas theme with falling snow animation and seasonal sound effects.
  - Live turn announcements and auto-popup alerts for the active player.
  - Interactive Google Meet-style floating emoji reactions sent in real time by players.
  - Visual gift showcase displaying freeze status, steal counters, and current owners.
- **Mobile Companion View (Player Screen)**:
  - Instant join by scanning QR code or entering a 6-character room code on mobile browsers—no app install required.
  - Real-time status badge ("It's your turn", "Your gift was stolen!", "Waiting for Player X").
  - Inline opened gifts showcase with count badges.
  - Live Activity Stream with grouped/collapsed emoji reactions and participant roster modal with self-highlighting.
- **Comprehensive White Elephant Rules**:
  - **Random Turn Order Lottery**: Automated Fisher-Yates shuffle with confetti celebration.
  - **Unopened Gift Pile vs. Stealing**: Players choose between opening a mystery gift or stealing an eligible opened gift.
  - **Dynamic Steal Reaction Chains**: If a player's gift is stolen, they immediately get a reactive turn to open from the pile or counter-steal.
  - **Gift Freeze Limit**: Gifts reaching the max steal limit (customizable, default: 3) are permanently frozen and cannot be stolen further.
  - **True Final Round Steal Chain**: Player 1 privilege to steal any unfrozen gift; victims can chain-steal other unfrozen gifts or claim the displaced gift pool until resolved.
- **Game Summary & Sharing**:
  - Full winner pairing roster.
  - MVP Most Popular Gift recognition.
  - One-click copy formatted results for LINE, Slack, or social media sharing.
  - JSON state export and backup.

---

## 🏛️ System Architecture

```
                          ┌──────────────────────────────────────┐
                          │         Host Screen (Projector)       │
                          │        http://<LAN_IP>:5174/?role=host│
                          └───────────────────▲──────────────────┘
                                              │ WebSocket &
                                              │ HTTP Polling
                                              ▼
┌────────────────────────┐      ┌───────────────────────────────┐      ┌────────────────────────┐
│  Mobile Player (Phone) ├─────►│  Local LAN Vite Server        │◄─────┤  Mobile Player (Phone) │
│  http://<LAN_IP>:5174  │      │  • ws plugin (WebSocketServer)│      │  http://<LAN_IP>:5174  │
└────────────────────────┘      │  • Static asset server        │      └────────────────────────┘
                                │  • /api/lan-info endpoint     │
                                └──────────────┬────────────────┘
                                               │
                                               ▼
                                ┌───────────────────────────────┐
                                │ LocalStorage & BroadcastChannel│
                                │ • In-browser client persistence│
                                │ • Multi-tab synchronization    │
                                └───────────────────────────────┘
```

### 1. 100% Zero-Cloud LAN Architecture
- **Self-contained**: Operates entirely within the local Wi-Fi / LAN network. No external database, Firebase, or cloud subscription is required.
- **`lanRealtimePlugin`**: Custom Vite dev & preview server plugin (`src/server/lanRealtimePlugin.ts`) embedding a lightweight Node.js WebSocket (`ws`) server into Vite's HTTP server.
- **Auto LAN IP Discovery**: Detects the host's private Wi-Fi IPv4 address (e.g., `192.168.x.x` or `10.x.x.x`) and automatically creates QR codes for mobile devices on the same network.

### 2. Dual-Layer Real-Time Communication (`RoomRealtimeBridge`)
- **WebSocket Channel**: Provides bidirectional real-time synchronization between the host and multiple mobile devices on the local network.
- **BroadcastChannel Fallback**: Ensures instant state synchronization across different tabs on the same device for local testing and offline resilience.
- **Message Protocol**:
  - `SYNC_STATE`: Host broadcasts canonical game state to all players.
  - `PLAYER_JOIN`: Mobile player notifies host of registration.
  - `EMOJI_REACTION`: Remote players broadcast floating emojis and reaction logs.
  - `REQUEST_SYNC`: Newly connected clients request the current game snapshot.

### 3. State Management & Determinism
- **Centralized Hook (`useWhiteElephant`)**: Houses the single source of truth for the game state machine:
  `SETUP` ➔ `DRAWING` ➔ `PLAYING` ➔ `FINAL_SWAP` ➔ `FINISHED`.
- **Ref-Backed State (`stateRef.current`)**: Guarantees zero stale closures across asynchronous action chains (e.g., chained final steals and victim reactions).
- **History Snapshot Stack**: Stores up to 15 undo snapshots for accidental steals or host rollbacks.
- **Bidirectional Gift-Participant Consistency**: Synchronizes `participant.giftId` and `gift.currentOwnerId` with automatic validation upon round resolution.

---

## 📂 Project Directory Structure

```
white-elephant/
├── src/
│   ├── components/
│   │   ├── common/              # Shared headers, snow animations, audio controls
│   │   │   ├── ChristmasHeader.tsx
│   │   │   └── Snowfall.tsx
│   │   ├── game/                # In-game modal dialogs & active turn controls
│   │   │   ├── ActionLogsDialog.tsx
│   │   │   ├── FinalSwapModal.tsx
│   │   │   ├── LiveStreamFeed.tsx
│   │   │   ├── OpenGiftModal.tsx
│   │   │   ├── StealGiftModal.tsx
│   │   │   └── TurnControlCard.tsx
│   │   ├── home/                # Landing role-selection screen (Host vs. Player)
│   │   ├── player/              # Mobile companion responsive view
│   │   │   └── PlayerMobileView.tsx
│   │   ├── setup/               # Lobby setup, room code, and player roster configuration
│   │   ├── summary/             # Final results, MVP showcase, and export view
│   │   │   └── GameSummary.tsx
│   │   └── ui/                  # Accessible UI primitives (Radix UI + Tailwind)
│   ├── hooks/                   # Business logic and sound hooks
│   │   ├── useWhiteElephant.ts  # Master game state machine
│   │   ├── useFloatingReactions.ts
│   │   └── useSoundEffects.ts
│   ├── lib/                     # Utilities (sound generator, emoji aggregation, tailwind utils)
│   │   ├── logUtils.ts
│   │   ├── soundUtils.ts
│   │   └── utils.ts
│   ├── server/                  # Vite plugin for Local LAN WebSocket & IP discovery
│   │   └── lanRealtimePlugin.ts
│   ├── services/
│   │   ├── realtime/            # RoomRealtimeBridge & channel types
│   │   └── storage/             # LocalStorage & Remote API adapters
│   ├── types/                   # Game, participant, gift, and log TypeScript interfaces
│   │   └── game.ts
│   ├── App.tsx                  # Master application orchestrator
│   └── main.tsx
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/white-elephant.git
cd white-elephant
npm install
```

### 2. Running the Development Server
Start the local server with LAN access enabled:
```bash
npm run dev
```
The server will bind to port `5174` with `--host`:
- **Host View**: Open `http://localhost:5174/?role=host` (or click "我是主辦人" on the landing page).
- **Player View (Mobile)**: Connect your phone to the **same Wi-Fi network**, scan the QR code displayed on the host setup screen, or browse to `http://<YOUR_LOCAL_IP>:5174` and enter the 6-character room code.

### 3. Production Build & Preview
To validate the build or run in preview mode:
```bash
# Type check and bundle
npm run build

# Preview production build with LAN WebSocket support
npm run preview
```

---

## 🎮 Game Rules & Workflow

1. **Setup**:
   - Host configures party title, price limit, and game rules (e.g., maximum steals per gift, allow Player 1 final swap).
   - Participants join via mobile QR scan or host adds them in batch.
2. **Order Draw**:
   - Host initiates the random draw. Numbers #1 to #N are assigned randomly to participants.
3. **Turn Progression**:
   - **Player 1**: Opens the first gift from the central pile.
   - **Player 2 through N**: Can either open a new mystery gift or steal any previously opened, unfrozen gift.
   - **Steal Chains**: If your gift is stolen, you immediately take a reactive turn. You cannot immediately steal back the same gift unless allowed in rules.
   - **Freezing**: Once a gift is stolen up to the limit (default: 3 times), it freezes and stays with its current holder.
4. **Final Round (Player 1 Privilege)**:
   - Because Player 1 had no gifts to steal on turn 1, Player 1 gets a final chance to steal any unfrozen gift or keep their current gift.
   - If Player 1 steals, a final steal chain begins where each victim can counter-steal or take the displaced gift pool until all gifts are settled.
5. **Celebration**:
   - The summary dashboard displays the MVP gift and the complete winner list. Results can be copied in one click to share in group chats.

---

## 📄 License

MIT License. Designed with holiday joy! 🎄✨
