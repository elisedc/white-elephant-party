import { useState, useEffect } from 'react'

export interface LanInfo {
  lanIp: string
  port: number
  lanOrigin: string
}

export function useLanInfo(): { lanOrigin: string; lanIp: string; isLoading: boolean } {
  const [lanInfo, setLanInfo] = useState<LanInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const currentOrigin = window.location.origin
    const hostname = window.location.hostname

    // If already accessing via real IP or non-localhost domain, origin is already accessible
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

    fetch('/api/lan-info')
      .then((res) => {
        if (!res.ok) throw new Error('Not local server')
        return res.json()
      })
      .then((data: LanInfo) => {
        if (isMounted && data && data.lanIp && data.lanIp !== 'localhost') {
          setLanInfo(data)
        }
      })
      .catch(() => {
        // Fallback silently if on pure static host without backend
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

  // If host opened via localhost, use discovered LAN IP if available
  const effectiveOrigin = isLocalhost && lanInfo?.lanOrigin ? lanInfo.lanOrigin : defaultOrigin
  const effectiveIp = lanInfo?.lanIp || (isLocalhost ? '127.0.0.1' : hostname)

  return {
    lanOrigin: effectiveOrigin,
    lanIp: effectiveIp,
    isLoading,
  }
}
