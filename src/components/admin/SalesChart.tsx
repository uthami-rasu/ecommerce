import { BarChart3, Table2 } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { formatMoney } from '../../utils/format'
import { fromDateInput, shortDate, weekdayDate } from './dates'
import { btn } from './styles'

type Point = { date: string; orders: number; revenue: number }

const HEIGHT = 230
const MARGIN = { top: 26, right: 8, bottom: 26, left: 52 }
const compact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 })

/** 0 → max in 4 clean steps (1 / 2 / 2.5 / 5 × 10^n). */
function niceTicks(max: number) {
  if (max <= 0) return [0, 250, 500, 750, 1000]
  const rough = max / 4
  const power = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((f) => f * power).find((candidate) => candidate >= rough) ?? 10 * power
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, index) => index * step)
}

const parseDay = (date: string) => fromDateInput(date.slice(0, 10)) ?? new Date(date)

/** Column path with a 4px rounded data-end and a square base. */
function columnPath(x: number, y: number, width: number, height: number) {
  const r = Math.min(4, width / 2, height)
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`
}

export function SalesChart({ data }: { data: Point[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const [view, setView] = useState<'chart' | 'table'>('chart')

  useLayoutEffect(() => {
    const element = wrapRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [view])

  const totals = useMemo(() => data.reduce((sum, point) => ({ revenue: sum.revenue + point.revenue, orders: sum.orders + point.orders }), { revenue: 0, orders: 0 }), [data])
  const max = Math.max(0, ...data.map((point) => point.revenue))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const band = data.length ? plotWidth / data.length : 0
  const barWidth = Math.max(2, Math.min(24, band - 2))
  const y = (value: number) => MARGIN.top + plotHeight - (value / top) * plotHeight
  const peakIndex = max > 0 ? data.findIndex((point) => point.revenue === max) : -1
  const labelEvery = band < 14 ? 7 : band < 26 ? 5 : 3

  const onKeyDown = (event: KeyboardEvent) => {
    if (!data.length) return
    const current = active ?? data.length - 1
    const next = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: data.length - 1 }[event.key]
    if (next === undefined) return
    event.preventDefault()
    setActive(Math.max(0, Math.min(data.length - 1, next)))
  }

  const activePoint = active !== null ? data[active] : null
  const activeX = active !== null ? MARGIN.left + band * active + band / 2 : 0
  const tooltipLeft = Math.max(70, Math.min(width - 70, activeX))

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4">
        <div>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Revenue · last 30 days</p>
          <p className="mt-0.5 text-2xl font-semibold text-stone-900 dark:text-stone-50">{formatMoney(totals.revenue)}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{totals.orders} paid {totals.orders === 1 ? 'order' : 'orders'}</p>
        </div>
        <div className="flex rounded-full bg-stone-100 p-0.5 dark:bg-stone-800" role="group" aria-label="Chart view">
          {(['chart', 'table'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`${btn.ghost} !px-2.5 !py-1 !text-xs ${view === option ? '!bg-white !text-stone-900 shadow-sm dark:!bg-stone-700 dark:!text-white' : ''}`}
            >
              {option === 'chart' ? <BarChart3 size={14} aria-hidden /> : <Table2 size={14} aria-hidden />}
              {option === 'chart' ? 'Chart' : 'Table'}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <div data-lenis-prevent className="mt-3 max-h-[260px] overflow-y-auto px-5 pb-4">
          <table className="w-full text-sm">
            <caption className="sr-only">Daily revenue and paid orders, last 30 days</caption>
            <thead className="sticky top-0 bg-white text-left text-xs text-stone-500 dark:bg-stone-900 dark:text-stone-400">
              <tr><th className="py-1.5 font-medium">Day</th><th className="py-1.5 text-right font-medium">Orders</th><th className="py-1.5 text-right font-medium">Revenue</th></tr>
            </thead>
            <tbody className="tabular-nums">
              {[...data].reverse().map((point) => (
                <tr key={point.date} className="border-t border-stone-100 dark:border-stone-800">
                  <td className="py-1.5 text-stone-700 dark:text-stone-300">{weekdayDate(parseDay(point.date))}</td>
                  <td className="py-1.5 text-right text-stone-700 dark:text-stone-300">{point.orders}</td>
                  <td className="py-1.5 text-right font-medium text-stone-900 dark:text-stone-100">{formatMoney(point.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={wrapRef}
          className="admin-chart relative mt-1 px-2 pb-3 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-inset sm:px-3"
          data-hovering={active !== null}
          tabIndex={0}
          role="group"
          aria-label={`Daily revenue chart, ${data.length} days. Use the left and right arrow keys to read each day.`}
          onKeyDown={onKeyDown}
          onFocus={() => active === null && setActive(data.length - 1)}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
        >
          {width > 0 && (
            <svg width={width} height={HEIGHT} className="block overflow-visible" aria-hidden>
              {ticks.map((tick) => (
                <g key={tick}>
                  <line className="admin-chart-grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} />
                  <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-stone-400 text-[10px] tabular-nums dark:fill-stone-500">
                    {compact.format(tick)}
                  </text>
                </g>
              ))}
              {data.map((point, index) => {
                const x = MARGIN.left + band * index + (band - barWidth) / 2
                const barTop = y(point.revenue)
                const height = MARGIN.top + plotHeight - barTop
                return (
                  <g key={point.date}>
                    {point.revenue > 0 && (
                      <path className="admin-chart-bar" data-active={active === index} d={columnPath(x, barTop, barWidth, height)} />
                    )}
                    {(index % labelEvery === 0 || index === data.length - 1) && (index === data.length - 1 || data.length - 1 - index >= labelEvery / 2) && (
                      <text x={MARGIN.left + band * index + band / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-stone-400 text-[10px] dark:fill-stone-500">
                        {shortDate(parseDay(point.date))}
                      </text>
                    )}
                    <rect
                      x={MARGIN.left + band * index}
                      y={MARGIN.top}
                      width={band}
                      height={plotHeight}
                      fill="transparent"
                      onPointerEnter={() => setActive(index)}
                      onPointerDown={() => setActive(index)}
                    />
                  </g>
                )
              })}
              {peakIndex >= 0 && active === null && (
                <text
                  x={MARGIN.left + band * peakIndex + band / 2}
                  y={y(max) - 7}
                  textAnchor={peakIndex > data.length - 3 ? 'end' : peakIndex < 2 ? 'start' : 'middle'}
                  className="fill-stone-600 text-[10px] font-semibold tabular-nums dark:fill-stone-300"
                >
                  {formatMoney(max)}
                </text>
              )}
              {active !== null && (
                <line x1={activeX} x2={activeX} y1={MARGIN.top} y2={MARGIN.top + plotHeight} className="stroke-stone-300 dark:stroke-stone-600" strokeWidth={1} />
              )}
            </svg>
          )}
          {width === 0 && <div style={{ height: HEIGHT }} />}
          {max === 0 && width > 0 && (
            <p className="pointer-events-none absolute inset-x-0 top-[42%] text-center text-sm text-stone-500 dark:text-stone-400">No paid orders in the last 30 days yet</p>
          )}
          {activePoint && (
            <div
              role="status"
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700"
              style={{ left: tooltipLeft }}
            >
              <p className="text-stone-500 dark:text-stone-400">{weekdayDate(parseDay(activePoint.date))}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-stone-900 dark:text-stone-50">
                <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: 'var(--admin-chart)' }} />
                {formatMoney(activePoint.revenue)}
              </p>
              <p className="text-stone-500 dark:text-stone-400">{activePoint.orders} {activePoint.orders === 1 ? 'order' : 'orders'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
