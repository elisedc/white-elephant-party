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
import { Gift, Tag, Sparkles } from 'lucide-react'

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

const PRESET_TAGS = ['實用好物', '地雷搞笑', '療癒小物', '居家生活', '美食甜點', '質感家電', '科技周邊']

export const OpenGiftModal: React.FC<OpenGiftModalProps> = ({
  open,
  onOpenChange,
  participantName,
  onSubmit,
}) => {
  const [title, setTitle] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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
      tags: selectedTags,
    })
    setTitle('')
    setSelectedTags([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#121a16] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-400" />
            拆箱新禮物
          </DialogTitle>
          <DialogDescription className="text-stone-300 text-xs">
            由 <strong className="text-white">{participantName}</strong> 拆開的禮物：
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-stone-200 mb-1.5 block">
              禮物名稱 <span className="text-rose-400">*必填</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：Marshall 藍牙喇叭、星巴克保溫杯..."
              className="bg-[#0c1210] border-white/10"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              禮物標籤（可多選）
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const active = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      active
                        ? 'bg-rose-600 text-white border-rose-400 font-semibold'
                        : 'bg-[#0c1210] text-stone-300 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-stone-400 hover:text-white"
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={!title.trim()}
              className="font-bold"
            >
              <Sparkles className="w-4 h-4 mr-1 text-amber-300" />
              確認開箱
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
