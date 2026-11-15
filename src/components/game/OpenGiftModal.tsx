import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Gift, Tag, Sparkles, Image as ImageIcon } from 'lucide-react'

interface OpenGiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participantName: string
  onSubmit: (data: {
    title: string
    description?: string
    tags?: string[]
    imageUrl?: string
  }) => void
}

const PRESET_TAGS = ['實用好物', '地雷搞笑', '療癒放鬆', '居家生活', '美食零嘴', '質感家電', '科技周邊']

export const OpenGiftModal: React.FC<OpenGiftModalProps> = ({
  open,
  onOpenChange,
  participantName,
  onSubmit,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')

  const toggleTag = (t: string) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== t))
    } else {
      setSelectedTags([...selectedTags, t])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
      imageUrl: imageUrl.trim() || undefined,
    })
    setTitle('')
    setDescription('')
    setSelectedTags([])
    setImageUrl('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-emerald-700/50">
        <DialogHeader>
          <DialogTitle className="text-xl text-rose-300">
            <Gift className="w-5 h-5 text-rose-400" />
            拆箱全新禮物！
          </DialogTitle>
          <DialogDescription className="text-emerald-200/80">
            恭喜 <strong className="text-white">{participantName}</strong> 挑選了一份新禮物，請輸入拆開後的禮物名稱與描述：
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-emerald-200 mb-1.5 flex items-center gap-1">
              禮物名稱 <span className="text-rose-400">*必填</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：Marshall 藍牙喇叭、星巴克保溫杯、超廢尖叫雞..."
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-200 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              禮物風格標籤（可多選）
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const active = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      active
                        ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                        : 'bg-emerald-950/60 text-emerald-200/80 border-emerald-800/40 hover:bg-emerald-900/40'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-200 mb-1.5 block">
              禮物特色或補充說明（選填）
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：全新未拆、附贈三包咖啡豆、很實用但有點重..."
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-200 mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              禮物照片網址（選填）
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://...（若有實體拍攝圖可貼上）"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-emerald-300"
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={!title.trim()}
              className="shadow-lg shadow-rose-900/40"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
              確認開箱並登記
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
