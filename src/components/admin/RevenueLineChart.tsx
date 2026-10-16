import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { formatMoney } from '../../utils/format'

type Point = { date: string; orders: number; revenue: number }
type Range = 'month' | 'week' | 'today'

const HEIGHT = 220
const MARGIN = { top: 24, right: 16, bottom: 28, left: 56 }

const compact = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1,
})

function niceTicks(max: number, count = 5) {
  if (max <= 0) return [0, 250, 500, 750, 1000]
  const rough = max / (count - 1)
  const power = 10 ** Math.floor(Math.log10(rough || 1))
  const step = [1, 2, 2.5, 5, 10].map(f => f * power).find(c => c >= rough) ?? power * 10
  return Array.from({ length: count }, (_, i) => i * step)
}

function shortLabel(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export function RevenueLineChart({ data }: { data: Point[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const [range, setRange] = useState<Range>('month')

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const filtered = useMemo(() => {
    if (range === 'today') return data.slice(-1)
    if (range === 'week') return data.slice(-7)
    return data
  }, [data, range])

  const max = Math.max(0, ...filtered.map(p => p.revenue))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom

  const xOf = (i: number) => MARGIN.left + (filtered.length > 1 ? (i / (filtered.length - 1)) * plotW : plotW / 2)
  const yOf = (v: number) => MARGIN.top + plotH - (top > 0 ? (v / top) * plotH : 0)

  const polyline = filtered.map((p, i) => `${xOf(i)},${yOf(p.revenue)}`).join(' ')
  const areaPoints = [
    `${xOf(0)},${MARGIN.top + plotH}`,
    ...filtered.map((p, i) => `${xOf(i)},${yOf(p.revenue)}`),
    `${xOf(filtered.length - 1)},${MARGIN.top + plotH}`,
  ].join(' ')

  const labelEvery = filtered.length <= 7 ? 1 : filtered.length <= 14 ? 2 : 5

  const RANGES: { key: Range; label: string }[] = [
    { key: 'month', label: 'This Month' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-3">
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Revenue Growth</h2>
        <div className="flex gap-1 rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800">
          {RANGES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                range === key
                  ? 'bg-white text-[#173f32] shadow-sm dark:bg-stone-700 dark:text-white'
                  : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        ref={wrapRef}
        className="relative px-1 pb-4"
        onPointerLeave={() => setActive(null)}
      >
        {width > 0 && (
          <svg width={width} height={HEIGHT} className="block overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="rev-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1f7a55" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1f7a55" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {ticks.map(tick => (
              <g key={tick}>
                <line
                  x1={MARGIN.left} x2={width - MARGIN.right}
                  y1={yOf(tick)} y2={yOf(tick)}
                  stroke="#ece7dd" strokeWidth={1}
                  className="dark:stroke-stone-700/60"
                />
                <text
                  x={MARGIN.left - 8} y={yOf(tick)} dy="0.32em"
                  textAnchor="end"
                  className="fill-stone-400 text-[10px] tabular-nums dark:fill-stone-500"
                  fontSize={10}
                >
                  {compact.format(tick)}
                </text>
              </g>
            ))}

            {/* Area fill */}
            {filtered.length > 1 && max > 0 && (
              <polygon points={areaPoints} fill="url(#rev-area-grad)" />
            )}

            {/* Line */}
            {filtered.length > 1 && max > 0 && (
              <polyline
                points={polyline}
                fill="none"
                stroke="#1f7a55"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* X-axis labels */}
            {filtered.map((p, i) => {
              if (i % labelEvery !== 0 && i !== filtered.length - 1) return null
              return (
                <text
                  key={p.date}
                  x={xOf(i)} y={HEIGHT - 6}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-stone-400 dark:fill-stone-500"
                >
                  {shortLabel(p.date)}
                </text>
              )
            })}

            {/* Hover zones + dots */}
            {filtered.map((p, i) => (
              <g key={p.date}>
                <rect
                  x={xOf(i) - (plotW / filtered.length) / 2}
                  y={MARGIN.top}
                  width={plotW / filtered.length}
                  height={plotH}
                  fill="transparent"
                  onPointerEnter={() => setActive(i)}
                />
                {active === i && p.revenue > 0 && (
                  <>
                    <line
                      x1={xOf(i)} x2={xOf(i)}
                      y1={MARGIN.top} y2={MARGIN.top + plotH}
                      stroke="#1f7a55" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}
                    />
                    <circle
                      cx={xOf(i)} cy={yOf(p.revenue)}
                      r={5} fill="#1f7a55" stroke="white" strokeWidth={2}
                    />
                  </>
                )}
              </g>
            ))}
          </svg>
        )}
        {width === 0 && <div style={{ height: HEIGHT }} />}
        {max === 0 && width > 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center text-sm text-stone-400 dark:text-stone-500">
            No revenue data for this period
          </p>
        )}
        {/* Tooltip */}
        {active !== null && filtered[active] && (() => {
          const pt = filtered[active]
          const tipX = Math.max(70, Math.min(width - 70, xOf(active)))
          return (
            <div
              role="status"
              className="pointer-events-none absolute top-4 z-10 -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700"
              style={{ left: tipX }}
            >
              <p className="text-stone-500 dark:text-stone-400">{shortLabel(pt.date)}</p>
              <p className="mt-0.5 font-semibold text-stone-900 dark:text-stone-50">{formatMoney(pt.revenue)}</p>
              <p className="text-stone-500 dark:text-stone-400">{pt.orders} order{pt.orders !== 1 ? 's' : ''}</p>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
