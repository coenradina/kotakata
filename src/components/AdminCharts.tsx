import { useState, type ReactNode } from 'react'

// Small charts for the admin dashboard (src/pages/AdminPage.tsx). Plain HTML
// bars on the design tokens, no chart library. Colours: tosca for the main
// count, gold for a second one, parchment for "the rest". Tosca and gold pass
// the colour-blind separation check on white.

export type Tone = 'tosca' | 'gold' | 'rest'
const TONE: Record<Tone, string> = { tosca: 'bg-tosca', gold: 'bg-gold', rest: 'bg-parchment' }

const num = (n: number) => n.toLocaleString('id-ID')

export function Legend({ items }: { items: { tone: Tone; label: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-3 type-caption text-ink-soft">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span className={`inline-block size-3 rounded border border-ink/20 ${TONE[it.tone]}`} />
          {it.label}
        </li>
      ))}
    </ul>
  )
}

/** One count per day, as columns. Hover or focus a column for its value. */
export function Columns({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const [tip, setTip] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.value))
  const total = data.reduce((n, d) => n + d.value, 0)
  const dense = data.length > 45
  const shown = tip === null ? null : data[tip]
  return (
    <figure className="min-w-0">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="type-label text-ink-soft">{title}</span>
        <span className="type-subheading">{num(total)}</span>
      </figcaption>
      <div className="relative mt-2">
        {shown && (
          <div
            className="pointer-events-none absolute bottom-full z-float mb-1 -translate-x-1/2 whitespace-nowrap rounded border-2 border-ink bg-white px-2 py-1 type-caption shadow-pixel-sm"
            style={{ left: `${((tip! + 0.5) / data.length) * 100}%` }}
          >
            {shown.label} · <b>{num(shown.value)}</b>
          </div>
        )}
        <div className={`flex h-32 items-end border-b-2 border-ink/30 ${dense ? 'gap-px' : 'gap-0.5'}`} onMouseLeave={() => setTip(null)}>
          {data.map((d, i) => (
            <div
              key={d.label}
              tabIndex={0}
              aria-label={`${d.label}: ${num(d.value)}`}
              onMouseEnter={() => setTip(i)}
              onFocus={() => setTip(i)}
              onBlur={() => setTip(null)}
              className="flex h-full min-w-0 flex-1 items-end outline-none focus-visible:bg-amber-tint"
            >
              <div className={`w-full rounded-t ${d.value > 0 ? 'bg-tosca' : ''} ${tip === i ? 'bg-tosca-dark' : ''}`} style={{ height: d.value > 0 ? `max(2px, ${(d.value / max) * 100}%)` : 0 }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between type-micro text-ink-muted">
          <span>{data[0]?.label}</span>
          <span>tertinggi {num(max)}</span>
          <span>{data.length > 1 ? data.at(-1)?.label : ''}</span>
        </div>
      </div>
    </figure>
  )
}

export interface BarRow {
  key: string
  label: ReactNode
  parts: { value: number; tone: Tone; label: string }[]
  /** Shown at the end of the bar. */
  value: string
}

/**
 * Horizontal bars, one per row, each made of parts that stack. Bars share
 * one scale unless `share` is set, in which case each bar fills its row and
 * the parts are shares of it. Hover or focus a row for every part's count.
 */
export function Bars({ rows, legend, share = false }: { rows: BarRow[]; legend?: { tone: Tone; label: string }[]; share?: boolean }) {
  const [tip, setTip] = useState<string | null>(null)
  if (rows.length === 0) return <p className="type-body text-ink-muted">Belum ada data.</p>
  const max = Math.max(1, ...rows.map((r) => r.parts.reduce((n, p) => n + p.value, 0)))
  return (
    <div className="space-y-3">
      {legend && legend.length > 1 && <Legend items={legend} />}
      <ul className="space-y-2">
        {rows.map((r) => {
          const sum = r.parts.reduce((n, p) => n + p.value, 0)
          const scale = share ? Math.max(1, sum) : max
          const open = tip === r.key
          return (
            <li
              key={r.key}
              tabIndex={0}
              onMouseEnter={() => setTip(r.key)}
              onMouseLeave={() => setTip(null)}
              onFocus={() => setTip(r.key)}
              onBlur={() => setTip(null)}
              className="grid gap-1 rounded px-1 py-0.5 outline-none hover:bg-cream focus-visible:bg-amber-tint sm:grid-cols-[minmax(0,14rem)_1fr]"
            >
              <span className="min-w-0 truncate type-label">{r.label}</span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-4 min-w-0 flex-1 gap-0.5">
                  {r.parts
                    .filter((p) => p.value > 0)
                    .map((p, i, arr) => (
                      <span
                        key={p.label}
                        className={`h-full ${TONE[p.tone]} ${i === 0 ? 'rounded-l' : ''} ${i === arr.length - 1 ? 'rounded-r' : ''}`}
                        style={{ width: `${(p.value / scale) * 100}%`, minWidth: 2 }}
                      />
                    ))}
                </span>
                <span className="w-24 shrink-0 text-right type-label">{r.value}</span>
              </span>
              {open && r.parts.length > 1 && <span className="type-caption text-ink-soft sm:col-start-2">{r.parts.map((p) => `${p.label} ${num(p.value)}`).join(' · ')}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
