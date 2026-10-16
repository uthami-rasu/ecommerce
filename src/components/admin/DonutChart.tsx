import { useMemo } from 'react'

interface Segment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: Segment[]
  size?: number
  thickness?: number
}

export function DonutChart({ segments, size = 160, thickness = 32 }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const cx = size / 2
  const cy = size / 2
  const r = (size - thickness) / 2

  const paths = useMemo(() => {
    if (total === 0) return []
    let startAngle = -Math.PI / 2
    return segments.map((seg) => {
      const fraction = seg.value / total
      const angle = fraction * 2 * Math.PI
      const endAngle = startAngle + angle
      const x1 = cx + r * Math.cos(startAngle)
      const y1 = cy + r * Math.sin(startAngle)
      const x2 = cx + r * Math.cos(endAngle)
      const y2 = cy + r * Math.sin(endAngle)
      const largeArc = angle > Math.PI ? 1 : 0
      const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
      startAngle = endAngle
      return { ...seg, d, fraction }
    })
  }, [segments, total, cx, cy, r])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e7e3dc" strokeWidth={thickness} />
      ) : (
        paths.map((seg) => (
          <path
            key={seg.label}
            d={seg.d}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeLinecap="butt"
          />
        ))
      )}
      <circle cx={cx} cy={cy} r={r - thickness / 2 - 4} fill="white" className="dark:fill-stone-900" />
    </svg>
  )
}
