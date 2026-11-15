import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QrCode, Copy, Check, ExternalLink, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface RoomQrCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
  roomTitle: string
  participantCount: number
}

export const RoomQrCodeModal: React.FC<RoomQrCodeModalProps> = ({
  open,
  onOpenChange,
  roomId,
  roomTitle,
  participantCount,
}) => {
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const joinUrl = `${origin}/?room=${roomId}&role=player`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-stone-200 bg-white text-stone-900 p-6 sm:p-7 text-center">
        <DialogHeader className="items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
            <Smartphone className="w-3.5 h-3.5 text-rose-600" />
            手機掃描加入房間
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight text-center">
            {roomTitle || '聖誕白象交換禮物'}
          </DialogTitle>

          <DialogDescription className="text-stone-500 text-xs text-center max-w-xs mx-auto">
            現場玩家請用手機相機掃描 QR Code，即可自行輸入名字加入，輪到自己時手機會跳出通知！
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col items-center justify-center space-y-4">
          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 shadow-md">
            <QRCodeSVG
              value={joinUrl}
              size={210}
              level="M"
              includeMargin={false}
              fgColor="#1c1917"
            />
          </div>

          {/* Room info pill */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-mono font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              房間代碼：{roomId}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              目前 {participantCount} 位已加入
            </span>
          </div>

          {/* Copyable link bar */}
          <div className="w-full flex items-center gap-2 pt-1">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="flex-1 h-9 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-600 truncate focus:outline-none"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-9 px-3 text-xs font-semibold shrink-0 border-stone-200 bg-white hover:bg-stone-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  已複製
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1 text-stone-500" />
                  複製連結
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
