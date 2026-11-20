/**
 * Robust clipboard copy utility that works in all contexts:
 * 1. HTTPS / localhost via navigator.clipboard
 * 2. HTTP LAN IP (192.168.x.x) via document.execCommand fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  // 1. Try modern async clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to fallback
    }
  }

  // 2. Reliable fallback for HTTP on local LAN IP (e.g. http://192.168.x.x)
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.setAttribute('readonly', '')
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch (err) {
    console.warn('[Clipboard] Fallback copy failed:', err)
    return false
  }
}
