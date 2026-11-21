# 聖誕白象交換禮物 (White Elephant Gift Exchange) 🎁🎄

> 專為聖誕派對與聚會設計的現代化、零雲端（Zero-Cloud）、即時互動白象交換禮物（Yankee Swap）Web 應用程式。支援適合投影機或電視的大螢幕主持畫面，以及供現場玩家透過手機瀏覽器連線互動的手機伴侶畫面。

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-7-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)
![Zero_Cloud](https://img.shields.io/badge/架構-100%25_純區域網路_LAN-success)

---

## ✨ 核心特色

- **主持人大螢幕模式（電視 / 投影機投影）**：
  - 聖誕氛圍主題，內建雪花飄落動畫與節慶音效。
  - 當前輪到玩家自動跳出提示視窗與即時公告。
  - 支援 Google Meet 風格的浮動 Emoji 表情符號動畫（玩家透過手機發送，大螢幕即時飄出）。
  - 直觀的禮物展示：清楚顯示禮物持有人、被搶次數與冰凍鎖定狀態。
- **手機玩家伴侶模式（現場手機即時互動）**：
  - 掃描 QR Code 或輸入 7 位數派對代碼即可立即加入，免下載安裝任何 App。
  - 個人狀態提醒（「輪到你了！」、「你的禮物被搶奪了！」、「等待其他玩家操作」）。
  - 內建已開禮物清單與已開禮物總數標記。
  - 即時動態紀錄：智慧折疊連續發送的 Emoji，並提供即時玩家名單與自我標記高亮。
- **完整的白象遊戲機制與規則支援**：
  - **亂數抽籤決定順序**：內建 Fisher-Yates 隨機洗牌演算法與慶祝彩帶效果。
  - **拆全新禮物 vs. 搶奪禮物**：玩家可選擇從中央禮物堆拆新禮物，或搶奪其他人已開箱的禮物。
  - **被搶反應連鎖機制（Steal Reaction Chain）**：禮物被搶走的受害者可立即進行反擊（拆新禮物或搶其他人未冰凍的禮物）。
  - **禮物冰凍上限**：禮物達到搶奪次數上限（預設 3 次，可自訂）後自動冰凍鎖定，不能再被搶。
  - **第 1 棒最終搶奪特權（Final Round Chain）**：第 1 棒在遊戲最後享有搶禮特權，被搶者可繼續連鎖反擊或收下待認領禮物，直到場上禮物全數落定。
- **結算得獎名單與分享**：
  - 最終全體得主名單一覽。
  - 全場最受歡迎禮物 MVP 表揚（累計被搶最多次的禮物）。
  - 一鍵複製得獎結果文字，便於直接貼上至 LINE 或社群群組分享。
  - 支援備份與匯出遊戲 JSON 狀態。

---

## 🏛️ 系統架構設計

```
                          ┌──────────────────────────────────────┐
                          │         大螢幕主持端 (投影機 / 電視)    │
                          │        http://<LAN_IP>:<PORT>/?role=host│
                          └───────────────────▲──────────────────┘
                                              │ WebSocket &
                                              │ HTTP Polling
                                              ▼
┌────────────────────────┐      ┌───────────────────────────────┐      ┌────────────────────────┐
│   玩家手機 (瀏覽器)     ├─────►│     本機區域網路 Vite 伺服器     │◄─────┤   玩家手機 (瀏覽器)     │
│  http://<LAN_IP>:<PORT>│      │  • ws 插件 (WebSocketServer)  │      │  http://<LAN_IP>:<PORT>│
└────────────────────────┘      │  • 靜態資源伺服器               │      └────────────────────────┘
                                │  • /api/lan-info 端點         │
                                └──────────────┬────────────────┘
                                               │
                                               ▼
                                ┌───────────────────────────────┐
                                │ LocalStorage & BroadcastChannel│
                                │ • 瀏覽器端狀態儲存持久化        │
                                │ • 本機跨分頁即時同步            │
                                └───────────────────────────────┘
```

### 1. 100% 零雲端（Zero-Cloud）區域網路架構
- **完全自主獨立**：在同一個 Wi-Fi 區域網路即可運行，完全不需要外部資料庫、雲端伺服器（如 Firebase、Supabase）或網路連線費用。
- **`lanRealtimePlugin`**：客製化 Vite 伺服器插件（`src/server/lanRealtimePlugin.ts`），直接將 Node.js WebSocket（`ws`）伺服器整合進 Vite 本地開發與預覽服務中。
- **自動偵測區域網路 IP**：啟動時自動解析主機的區網 IPv4 位址（如 `192.168.x.x` 或 `10.x.x.x`），並在主持螢幕上自動生成 QR Code，讓現場玩家能無痛掃描加入。

### 2. 雙層即時通訊橋接（`RoomRealtimeBridge`）
- **WebSocket 通訊**：負責主辦大螢幕與多台手機之間跨裝置的即時狀態同步與動態傳遞。
- **BroadcastChannel 本機備援**：在同台裝置的不同分頁開啟時，自動透過瀏覽器原生 BroadcastChannel 進行即時廣播，確保本機測試與離線時的高可用性。
- **訊息協定**：
  - `SYNC_STATE`：主持端向所有手機廣播最新遊戲狀態。
  - `PLAYER_JOIN`：手機玩家加入派對通知。
  - `EMOJI_REACTION`：手機玩家發送即時浮動表情符號。
  - `REQUEST_SYNC`：新連線的手機請求同步最新遊戲快照。

### 3. 狀態機與資料一致性保證
- **核心 Hook（`useWhiteElephant`）**：單一事實來源（Single Source of Truth），驅動整體遊戲狀態機流轉：
  `SETUP`（設定） ➔ `DRAWING`（抽籤） ➔ `PLAYING`（回合制交換） ➔ `FINAL_SWAP`（最終搶奪特權） ➔ `FINISHED`（結算得獎）。
- **`stateRef.current` 機制**：防止非同步連續操作或連鎖搶奪時產生 React 閉包舊狀態（Stale Closure）。
- **復原歷史堆疊（History Stack）**：保留最多 15 步操作快照，提供「上一步（Undo）」功能以修正主持人誤觸。
- **雙向一致性校驗（`finalizeGameState`）**：遊戲結束時嚴格校驗並同步所有玩家的 `p.giftId` 與每份禮物的 `g.currentOwnerId`，確保得獎名單 100% 正確無誤。

---

## 📂 專案目錄結構

```
white-elephant/
├── src/
│   ├── components/
│   │   ├── common/              # 共用元件（頁首導覽列、飄雪動畫、音效控制）
│   │   │   ├── ChristmasHeader.tsx
│   │   │   └── Snowfall.tsx
│   │   ├── game/                # 遊戲進行中的互動視窗與控制器
│   │   │   ├── ActionLogsDialog.tsx    # 即時動態紀錄彈窗
│   │   │   ├── FinalSwapModal.tsx      # 第 1 棒與連鎖反擊彈窗
│   │   │   ├── LiveStreamFeed.tsx      # 折疊表情即時動態流
│   │   │   ├── OpenGiftModal.tsx       # 拆全新禮物視窗
│   │   │   ├── StealGiftModal.tsx      # 搶奪禮物視窗
│   │   │   └── TurnControlCard.tsx     # 主持人操作主卡片
│   │   ├── home/                # 首頁進入畫面（輸入派對代碼 / 開啟新遊戲）
│   │   │   └── LandingJoinScreen.tsx
│   │   ├── player/              # 手機玩家伴侶畫面
│   │   │   └── PlayerMobileView.tsx
│   │   ├── setup/               # 遊戲設定大廳（派對代碼、玩家名冊、規則設定）
│   │   ├── summary/             # 結算畫面、MVP 禮物展示與複製得獎結果
│   │   │   └── GameSummary.tsx
│   │   └── ui/                  # 基礎 UI 元件（Radix UI + Tailwind CSS）
│   ├── hooks/                   # 業務邏輯與音效 Hooks
│   │   ├── useWhiteElephant.ts  # 白象交換禮物核心狀態機
│   │   ├── useFloatingReactions.ts
│   │   └── useSoundEffects.ts
│   ├── lib/                     # 工具庫（音效生成器、Emoji 折疊聚合、樣式工具）
│   │   ├── logUtils.ts
│   │   ├── soundUtils.ts
│   │   └── utils.ts
│   ├── server/                  # Vite 插件：區域網路 WebSocket 伺服器與 IP 偵測
│   │   └── lanRealtimePlugin.ts
│   ├── services/
│   │   ├── realtime/            # 即時通訊橋接器（RoomRealtimeBridge）
│   │   └── storage/             # 本地儲存配接器（LocalStorageAdapter）
│   ├── types/                   # TypeScript 型別定義（GameState、Participant、Gift 等）
│   │   └── game.ts
│   ├── App.tsx                  # 應用程式主進入點與視圖切換
│   └── main.tsx
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🚀 快速開始

### 環境需求
- Node.js（建議 v18 或更高版本）
- npm 或 pnpm

### 1. 安裝依賴套件
```bash
git clone https://github.com/your-username/white-elephant.git
cd white-elephant
npm install
```

### 2. 啟動伺服器
執行以下指令啟動支援區域網路連線的本地伺服器：
```bash
npm start
```
伺服器啟動後，終端機將顯示目前分配的連接埠（預設為 `5174`，若被占用將自動尋找可用埠號）：
- **主持人大螢幕畫面**：於電腦瀏覽器開啟終端機顯示的 Local 網址並加上 `?role=host`（例如 `http://localhost:<埠號>/?role=host`，或直接在首頁點擊下方「**開啟新遊戲**」連結）。
- **玩家手機畫面**：將手機連上**同一個 Wi-Fi 網路**，直接掃描主持人螢幕上顯示的 QR Code，或透過手機瀏覽器連至終端機顯示的 Network 網址（`http://<您的區域網路IP>:<埠號>`）並輸入 7 位數派對代碼加入。

---

## 🎮 白象遊戲流程說明

1. **遊戲設定與建立**：
   - 主持人設定派對名稱、禮物金額限制與特殊規則（例如：禮物搶奪上限次數、是否啟用第 1 棒最終搶奪特權）。
   - 現場玩家透過手機掃描 QR Code 加入名冊，主持人亦可批次文字貼上名單。
2. **順序抽籤**：
   - 主持人點擊抽籤，系統自動隨機排序玩家並指派棒次（第 1 棒至第 N 棒）。
3. **回合推進與搶奪**：
   - **第 1 棒**：從中央禮物堆拆開第一份神秘禮物。
   - **第 2 棒至第 N 棒**：輪到的玩家可選擇「拆中央全新禮物」或「搶奪其他人手中未被冰凍的禮物」。
   - **連鎖反應**：若自己的禮物被搶走，受害者可立即進行反擊（拆新禮物或搶其他人尚未冰凍的禮物）。
   - **冰凍機制**：當同一份禮物累計被搶次數達到上限（預設 3 次）時，該禮物立即冰凍鎖定，不可再被搶奪。
4. **最終回合（第 1 棒特權）**：
   - 因第 1 棒開場時場上沒有任何已開禮物可搶，因此所有玩家完成回合後，第 1 棒獲得最終特權：可選擇保留手中禮物，或搶奪場上任一未被冰凍的禮物。
   - 若第 1 棒發動搶奪，被搶的受害者可繼續搶其他未冰凍禮物，或直接收下最初釋出的待認領禮物，連鎖直到所有人禮物確定。
5. **結算頒獎與分享**：
   - 結算儀式公布最受歡迎 MVP 禮物與全體得主名單，並提供一鍵複製得獎名單功能，方便貼到群組紀念！

---

## 📄 授權條款

MIT License. 祝大家聖誕快樂、交換禮物玩得盡興！🎄✨
