import { ActionLog } from '@/types/game'

export interface GroupedLog extends ActionLog {
  emojis?: string[]
}

/**
 * Groups consecutive EMOJI_REACTION logs sent by the same player.
 * - If the player repeatedly sends the same emoji: displays that emoji once.
 * - If the player repeatedly sends different emojis: displays all emojis sent by that player, one of each.
 * Returns the grouped logs in chronological order (oldest to newest).
 */
export function groupConsecutiveLogs(logs: ActionLog[]): GroupedLog[] {
  if (!logs || logs.length === 0) return []

  // Logs in gameState.logs are stored newest-first (descending timestamp).
  // We sort by timestamp ascending to group in true chronological order.
  const chronological = [...logs].sort((a, b) => a.timestamp - b.timestamp)

  const grouped: GroupedLog[] = []

  for (const log of chronological) {
    if (log.type === 'EMOJI_REACTION') {
      const prev = grouped[grouped.length - 1]
      const isSameActor =
        prev &&
        prev.type === 'EMOJI_REACTION' &&
        ((log.actorId && prev.actorId && log.actorId === prev.actorId) ||
          (log.actorName && prev.actorName && log.actorName === prev.actorName))

      if (isSameActor) {
        const currentEmojis = prev.emojis || (prev.emoji ? [prev.emoji] : [])
        if (log.emoji && !currentEmojis.includes(log.emoji)) {
          currentEmojis.push(log.emoji)
        }
        prev.emojis = currentEmojis
        prev.timestamp = Math.max(prev.timestamp, log.timestamp)
        prev.message = `傳送了 ${currentEmojis.join(' ')}`
        continue
      }

      // First emoji in this streak
      grouped.push({
        ...log,
        emojis: log.emoji ? [log.emoji] : [],
      })
    } else {
      grouped.push({ ...log })
    }
  }

  return grouped
}
