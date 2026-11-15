import React, { useMemo } from 'react'

interface SnowfallProps {
  enabled?: boolean
}

export const Snowfall: React.FC<SnowfallProps> = ({ enabled = true }) => {
  const flakes = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${(i * 5 + (i % 3) * 2) % 100}%`,
      animationDuration: `${8 + (i % 5) * 2}s`,
      animationDelay: `${(i % 4) * 1.5}s`,
      size: 10 + (i % 3) * 3,
      opacity: 0.2 + (i % 4) * 0.1,
    }))
  }, [])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowflake flex items-center justify-center"
          style={{
            left: f.left,
            animationDuration: `${f.animationDuration}, ${parseFloat(f.animationDuration) / 2}s`,
            animationDelay: f.animationDelay,
            opacity: f.opacity,
          }}
        >
          <svg
            width={f.size}
            height={f.size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m10 20-1.25-2.5L6 18" />
            <path d="M10 4 8.75 6.5 6 6" />
            <path d="m14 20 1.25-2.5L18 18" />
            <path d="m14 4 1.25 2.5L18 6" />
            <path d="m17 21-3-6h-4l-3 6" />
            <path d="m17 3-3 6h-4L7 3" />
            <path d="M2 12h20" />
            <path d="m20 10-2.5 1.25L18 14" />
            <path d="m4 10 2.5 1.25L6 14" />
            <path d="m4 14 2.5-1.25L6 10" />
            <path d="m20 14-2.5-1.25L18 10" />
          </svg>
        </span>
      ))}
    </div>
  )
}
