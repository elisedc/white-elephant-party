import React, { useMemo } from 'react'

interface SnowfallProps {
  enabled?: boolean
}

export const Snowfall: React.FC<SnowfallProps> = ({ enabled = true }) => {
  const flakes = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.2 + (i % 3) * 2) % 100}%`,
      animationDuration: `${7 + (i % 6) * 2}s`,
      animationDelay: `${(i % 5) * 1.5}s`,
      fontSize: `${0.75 + (i % 4) * 0.25}rem`,
      opacity: 0.25 + (i % 5) * 0.12,
    }))
  }, [])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowflake"
          style={{
            left: f.left,
            animationDuration: `${f.animationDuration}, ${parseFloat(f.animationDuration) / 2}s`,
            animationDelay: f.animationDelay,
            fontSize: f.fontSize,
            opacity: f.opacity,
          }}
        >
          ❄
        </span>
      ))}
    </div>
  )
}
