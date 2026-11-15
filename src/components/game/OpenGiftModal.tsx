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
      <DialogContent className="max-w-md border-stone-200 bg-white text-stone-900 p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-600" />
            拆箱新禮物
          </DialogTitle>
          <DialogDescription className="text-stone-500 text-xs">
            由 <strong className="text-stone-900">{participantName}</strong> 拆開的禮物：
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
              禮物名稱 <span className="text-rose-600">*必填</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：Marshall 藍牙喇叭、星巴克保溫杯..."
              className="bg-stone-50 border-stone-200 text-stone-900"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
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
                        ? 'bg-rose-600 text-white border-rose-600 font-semibold shadow-xs'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200/80'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter className="pt-3 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-medium text-stone-600 border-stone-200 hover:bg-stone-100"
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={!title.trim()}
              className="h-9 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-white" />
              確認開箱
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
