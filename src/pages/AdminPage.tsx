import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import SiteHeader from '../components/SiteHeader'
import { FUNCTIONS_REGION, firebaseApp } from '../firebase'
import { t } from '../i18n'
import { ALL } from '../levels'
import { quizText } from '../quiz/questions'
import { Bars, Columns, type BarRow } from '../components/AdminCharts'
import { isHidden, jakartaDay, medianMs, type Hidden, type Hist, type PuzzleAgg, type Report, type SessionAgg } from '../impact/report'

// The admin dashboard (docs/plan/03-technical.md, section 6). Only the
// Kotakata admin reads it, so it is in Indonesian only. Every number comes
// from the `impactReport` function, which hides cells under 5 players.

type AuthState = { status: 'loading' } | { status: 'out' } | { status: 'in'; user: User; admin: boolean }

async function auth() {
  const [app, mod] = await Promise.all([firebaseApp(), import('firebase/auth')])
  return { auth: mod.getAuth(app), mod }
}

function useAdmin() {
  const [state, setState] = useState<AuthState>({ status: 'loading' })
  useEffect(() => {
    let off = () => {}
    void auth().then(({ auth, mod }) => {
      off = mod.onAuthStateChanged(auth, async (user) => {
        if (!user) return setState({ status: 'out' })
        // Force a fresh token, so a claim set a moment ago is seen.
        const token = await user.getIdTokenResult(true)
        setState({ status: 'in', user, admin: token.claims.admin === true })
      })
    })
    return () => off()
  }, [])
  const signIn = async () => {
    const { auth: a, mod } = await auth()
    await mod.signInWithPopup(a, new mod.GoogleAuthProvider())
  }
  const signOut = async () => {
    const { auth: a, mod } = await auth()
    await mod.signOut(a)
  }
  return { state, signIn, signOut }
}

async function fetchReport(from: string, to: string): Promise<Report> {
  const [app, { getFunctions, httpsCallable }] = await Promise.all([firebaseApp(), import('firebase/functions')])
  const call = httpsCallable<{ from: string; to: string }, Report>(getFunctions(app, FUNCTIONS_REGION), 'impactReport')
  return (await call({ from, to })).data
}

const DAY = 86_400_000
const daysAgo = (n: number) => jakartaDay(Date.now() - n * DAY)

export default function AdminPage() {
  const { state, signIn, signOut } = useAdmin()
  return (
    <div className="min-h-full bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="type-title">Dashboard</h1>
          {state.status === 'in' && (
            <span className="flex flex-wrap items-center gap-3 type-label">
              {state.user.email}
              <button onClick={signOut} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
                Keluar
              </button>
            </span>
          )}
        </div>
        {state.status === 'loading' && <p className="type-body">Memuat…</p>}
        {state.status === 'out' && (
          <Panel title="Khusus admin">
            <p className="type-body">Masuk dengan akun Google.</p>
            <button onClick={signIn} className="pixel-btn mt-3 min-h-11 rounded border-2 border-ink bg-ink px-4 py-2 type-button text-cream">
              Masuk dengan Google
            </button>
          </Panel>
        )}
        {state.status === 'in' && !state.admin && (
          <Panel title="Tidak ada akses">
            <p className="type-body">Akun ini tidak punya akses ke halaman ini.</p>
          </Panel>
        )}
        {state.status === 'in' && state.admin && <Dashboard />}
      </main>
    </div>
  )
}

/** The first day impact data was collected. "Semua" starts here. */
const LAUNCH = '2026-11-12'
/** Raw batches live 24 months (functions/src/index.ts), so "Semua" never reaches further back. */
const KEPT_DAYS = 730

type RangeId = 'today' | '7' | '30' | 'all'
const RANGES: { id: RangeId; label: string; from: () => string }[] = [
  { id: 'today', label: 'Hari ini', from: () => daysAgo(0) },
  { id: '7', label: '7 hari', from: () => daysAgo(6) },
  { id: '30', label: '30 hari', from: () => daysAgo(29) },
  { id: 'all', label: 'Semua', from: () => [LAUNCH, daysAgo(KEPT_DAYS - 1)].sort().at(-1)! },
]

export type View = 'chart' | 'table'
const VIEW_KEY = 'kotakata-admin-view'
function savedView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'table' ? 'table' : 'chart'
  } catch {
    return 'chart'
  }
}

function Toggle<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`pixel-btn min-h-11 rounded border-2 border-ink px-3 py-1.5 type-button ${value === o.id ? 'bg-ink text-cream' : 'bg-white hover:bg-parchment'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Dashboard() {
  const [range, setRange] = useState<RangeId>('30')
  const [view, setView] = useState<View>(savedView)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const load = async (id: RangeId) => {
    setRange(id)
    setLoading(true)
    setError(null)
    try {
      setReport(await fetchReport(RANGES.find((r) => r.id === id)!.from(), daysAgo(0)))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load('30')
  }, [])
  const pickView = (v: View) => {
    setView(v)
    try {
      localStorage.setItem(VIEW_KEY, v)
    } catch {
      // Private mode: the choice lasts until the page closes.
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-ink bg-white p-4 shadow-pixel-sm">
        <Toggle label="Rentang waktu" value={range} options={RANGES} onChange={(id) => void load(id)} />
        <Toggle
          label="Tampilan"
          value={view}
          options={[
            { id: 'chart', label: 'Grafik' },
            { id: 'table', label: 'Tabel' },
          ]}
          onChange={pickView}
        />
      </div>
      <p className="type-caption text-ink-muted">
        {loading ? 'Memuat… ' : report ? `${shortDay(report.from)} sampai ${shortDay(report.to)}. ` : ''}
        Hari dihitung dalam WIB. "Pemain" hanya yang memilih Ya di kartu izin, dihitung per hari: satu orang yang main dua hari terhitung dua.
      </p>
      {error && (
        <p role="alert" className="rounded border-2 border-maroon bg-maroon-tint p-3 type-body">
          Gagal memuat: {error}
        </p>
      )}
      {report && <ReportView report={report} view={view} />}
    </div>
  )
}

// ---------- the report ----------

const pct = (n: number, of: number) => (of > 0 ? `${Math.round((n / of) * 100)}%` : '–')
const num = (n: number) => n.toLocaleString('id-ID')
function dur(ms: number | null) {
  if (ms === null) return '–'
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s} dtk` : `${Math.floor(s / 60)} mnt ${String(s % 60).padStart(2, '0')} dtk`
}
const med = (h: Hist) => dur(medianMs(h))
/** Kept for old cached reports; the function no longer hides small counts. */
const HIDDEN_TEXT = '–'
const shortDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' })

const sessionTitle = (id: string) => {
  const s = ALL.find((l) => l.id === id)
  return s ? `${id.toUpperCase()} · ${s.title.id}` : id
}
const puzzleTitle = (session: string, puzzle: string) => {
  const p = ALL.find((l) => l.id === session)?.puzzles.find((x) => x.id === puzzle)
  return p ? `${puzzle} · ${t('id', p.titleKey)}` : puzzle
}
const badgeTitle = (session: string, badge: string) => {
  const b = ALL.find((l) => l.id === session)?.badgeDefs.find((x) => x.id === badge)
  return b ? `${b.icon} ${t('id', b.titleKey)}` : badge
}

type Shown<T> = [string, T]
const visible = <T,>(rec: Record<string, T | Hidden>): Shown<T>[] => Object.entries(rec).filter((e): e is Shown<T> => !isHidden(e[1]))

function ReportView({ report: r, view }: { report: Report; view: View }) {
  const order = useMemo(() => new Map<string, number>(ALL.map((l, i) => [l.id, i])), [])
  const sessionIds = useMemo(() => {
    const ids = new Set([...Object.keys(r.sessions), ...Object.keys(r.puzzles).map((k) => k.split(':')[0])])
    return [...ids].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99))
  }, [r, order])
  const puzzles = visible<PuzzleAgg>(r.puzzles)
  const top = <T,>(rows: T[], score: (x: T) => number) => [...rows].sort((a, b) => score(b) - score(a)).filter((x) => score(x) > 0)[0]

  // Quick answers to the eight questions the dashboard was built for.
  const sessions = visible<SessionAgg>(r.sessions)
  const mostStopped = top(puzzles, ([, p]) => p.stopped)
  const mostRuns = top(puzzles, ([, p]) => (p.passed ? p.runs / p.passed : 0))
  const mostHints = top(puzzles, ([, p]) => (p.passed ? p.hinted / p.passed : 0))
  const slowest = top(puzzles, ([, p]) => medianMs(p.time) ?? 0)
  const missedBadges = sessions.flatMap(([sid, s]) =>
    (ALL.find((l) => l.id === sid)?.badgeDefs ?? []).map((b) => ({ sid, b: b.id, missed: s.completed ? 1 - (s.badges[b.id] ?? 0) / s.completed : 0 })),
  )
  const mostMissed = top(missedBadges, (x) => x.missed)
  const quiz = visible<{ right: number; wrong: number; skip: number }>(r.quiz)
  const quizN = (q: { right: number; wrong: number; skip: number }) => q.right + q.wrong + q.skip
  const mostWrong = top(quiz, ([, q]) => (q.right + q.wrong ? q.wrong / (q.right + q.wrong) : 0))
  const mostSkipped = top(quiz, ([, q]) => q.skip / quizN(q))
  const started = sessions.reduce((n, [, s]) => n + s.started, 0)
  const guided = sessions.reduce((n, [, s]) => n + s.guide, 0)
  const guideViews = Object.entries(r.traffic.paths).filter(([p]) => p.startsWith('/panduan/guru/'))
  const name = (key: string) => {
    const [s, p] = key.split(':')
    return `${s.toUpperCase()} ${puzzleTitle(s, p)}`
  }

  return (
    <div className="space-y-6">
      <Panel title="Jawaban singkat">
        <ol className="list-decimal space-y-2 pl-6 type-body">
          <li>
            <b>Yang memulai sesi:</b> {num(started)} pemain (yang mengizinkan), dari {num(ALL.reduce((n, l) => n + (r.traffic.paths[`/main/${l.id}`]?.visitors ?? 0), 0))} pengunjung halaman sesi.
            Rincian per sesi di bawah.
          </li>
          <li>
            <b>Yang menyelesaikan:</b>{' '}
            {pct(
              sessions.reduce((n, [, s]) => n + s.completed, 0),
              started,
            )}{' '}
            dari yang memulai.
          </li>
          <li>
            <b>Paling banyak bikin berhenti:</b> {mostStopped ? `${name(mostStopped[0])} (${mostStopped[1].stopped} pemain)` : '–'}
          </li>
          <li>
            <b>Paling banyak RUN:</b> {mostRuns ? `${name(mostRuns[0])} (rata-rata ${(mostRuns[1].runs / mostRuns[1].passed).toFixed(1)} RUN)` : '–'}. <b>Paling sering pakai hint:</b>{' '}
            {mostHints ? `${name(mostHints[0])} (${pct(mostHints[1].hinted, mostHints[1].passed)} yang lolos)` : '–'}
          </li>
          <li>
            <b>Paling lama:</b> {slowest ? `${name(slowest[0])} (median ${med(slowest[1].time)})` : '–'}. Lama tiap tahap di tabel per sesi.
          </li>
          <li>
            <b>Badge paling sering terlewat:</b>{' '}
            {mostMissed ? `${mostMissed.sid.toUpperCase()} ${badgeTitle(mostMissed.sid, mostMissed.b)} (${Math.round(mostMissed.missed * 100)}% yang tamat tidak punya)` : '–'}
          </li>
          <li>
            <b>Kuis paling sering salah:</b> {mostWrong ? `${mostWrong[0]} (${pct(mostWrong[1].wrong, mostWrong[1].right + mostWrong[1].wrong)})` : '–'}. <b>Paling sering dilewati:</b>{' '}
            {mostSkipped ? `${mostSkipped[0]} (${pct(mostSkipped[1].skip, quizN(mostSkipped[1]))})` : '–'}. Kuis hanya ada di level klasik; untuk Sesi 1–6 lihat kolom "tebakan salah".
          </li>
          <li>
            <b>Membuka panduan guru sebelum main:</b> {num(guided)} dari {num(started)} pemain ({pct(guided, started)}), di browser yang sama. Panduan guru dibuka{' '}
            {num(guideViews.reduce((n, [, v]) => n + v.visitors, 0))} kali (pengunjung per hari).
          </li>
        </ol>
      </Panel>

      <Traffic r={r} view={view} />

      {sessionIds.map((id) => (
        <SessionPanel key={id} id={id} r={r} view={view} />
      ))}

      <QuizPanel r={r} view={view} />
      <SurveyPanel r={r} view={view} />
    </div>
  )
}

function Traffic({ r, view }: { r: Report; view: View }) {
  const max = Math.max(1, ...r.daily.map((d) => d.visitors))
  const pages = Object.entries(r.traffic.paths).sort((a, b) => b[1].views - a[1].views)
  const refs = Object.entries(r.traffic.refs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
  const { device, lang } = r.traffic
  return (
    <Panel title="A. Trafik">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Pengunjung (per hari, dijumlah)" value={num(r.traffic.visitors)} />
        <Stat label="Halaman dibuka" value={num(r.traffic.views)} />
        <Stat label="Izin: Ya / Tidak" value={`${num(r.consent.yes)} / ${num(r.consent.no)}`} note={pct(r.consent.yes, r.consent.yes + r.consent.no) + ' bilang Ya'} />
        <Stat
          label="HP / layar lebar"
          value={`${pct(device.phone, device.phone + device.wide)} / ${pct(device.wide, device.phone + device.wide)}`}
          note={`ID ${pct(lang.id, lang.id + lang.en)} · EN ${pct(lang.en, lang.id + lang.en)}`}
        />
      </div>
      {view === 'chart' ? (
        <TrafficCharts r={r} />
      ) : (
        <>
          <h3 className="mt-6 type-subheading">Per hari</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full type-label">
              <thead>
                <Row head cells={['Tanggal', 'Pengunjung', '', 'Dibuka', 'Pemain', 'Mulai sesi', 'Tamat sesi']} />
              </thead>
              <tbody>
                {r.daily.map((d) => (
                  <Row
                    key={d.day}
                    cells={[
                      d.day,
                      num(d.visitors),
                      <span className="block h-3 rounded bg-tosca" style={{ width: `${(d.visitors / max) * 100}%` }} />,
                      num(d.views),
                      num(d.players),
                      num(d.started),
                      num(d.completed),
                    ]}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="type-subheading">Halaman</h3>
              <Scroll className="mt-2">
                <table className="w-full type-label">
                  <thead>
                    <Row head cells={['Halaman', 'Dibuka', 'Pengunjung']} />
                  </thead>
                  <tbody>
                    {pages.map(([p, v]) => (
                      <Row key={p} cells={[<code className="type-mono">{p}</code>, num(v.views), num(v.visitors)]} />
                    ))}
                  </tbody>
                </table>
              </Scroll>
            </div>
            <div>
              <h3 className="type-subheading">Datang dari</h3>
              <Scroll className="mt-2">
                <table className="w-full type-label">
                  <thead>
                    <Row head cells={['Situs', 'Kunjungan']} />
                  </thead>
                  <tbody>
                    {refs.length === 0 && <Row cells={['Belum ada (langsung atau tanpa referrer)', '']} />}
                    {refs.map(([d, n]) => (
                      <Row key={d} cells={[d, num(n)]} />
                    ))}
                  </tbody>
                </table>
              </Scroll>
            </div>
          </div>
        </>
      )}
    </Panel>
  )
}

function TrafficCharts({ r }: { r: Report }) {
  const days = r.daily.map((d) => ({ ...d, label: shortDay(d.day) }))
  const pages: BarRow[] = Object.entries(r.traffic.paths)
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 10)
    .map(([p, v]) => ({ key: p, label: <code className="type-mono">{p}</code>, parts: [{ value: v.views, tone: 'tosca', label: 'Dibuka' }], value: num(v.views) }))
  const refs: BarRow[] = Object.entries(r.traffic.refs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([d, n]) => ({ key: d, label: d, parts: [{ value: n, tone: 'tosca', label: 'Kunjungan' }], value: num(n) }))
  return (
    <>
      <h3 className="mt-6 type-subheading">Per hari</h3>
      <div className="mt-3 grid gap-6 sm:grid-cols-3">
        <Columns title="Pengunjung" data={days.map((d) => ({ label: d.label, value: d.visitors }))} />
        <Columns title="Pemain mulai sesi" data={days.map((d) => ({ label: d.label, value: d.started }))} />
        <Columns title="Pemain tamat sesi" data={days.map((d) => ({ label: d.label, value: d.completed }))} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 type-subheading">Halaman paling sering dibuka</h3>
          <Bars rows={pages} />
        </div>
        <div>
          <h3 className="mb-2 type-subheading">Datang dari</h3>
          {refs.length === 0 ? <p className="type-body text-ink-muted">Belum ada (langsung atau tanpa referrer).</p> : <Bars rows={refs} />}
        </div>
      </div>
    </>
  )
}

function SessionPanel({ id, r, view }: { id: string; r: Report; view: View }) {
  const s = r.sessions[id]
  const level = ALL.find((l) => l.id === id)
  const known = level?.puzzles.map((p) => p.id) ?? []
  const keys = Object.keys(r.puzzles)
    .filter((k) => k.startsWith(`${id}:`))
    .map((k) => k.slice(id.length + 1))
    .sort((a, b) => known.indexOf(a) - known.indexOf(b))
  const visitors = r.traffic.paths[`/main/${id}`]?.visitors ?? 0
  const guideVisitors = r.traffic.paths[`/panduan/guru/${id}`]?.visitors ?? 0
  return (
    <Panel title={sessionTitle(id)}>
      {!s || isHidden(s) ? (
        <p className="type-body">Kurang dari 5 pemain memulai sesi ini. Pengunjung halamannya: {num(visitors)}.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <Stat label="Pengunjung halaman" value={num(visitors)} />
            <Stat label="Pemain mulai" value={num(s.started)} />
            <Stat label="Tamat" value={num(s.completed)} note={pct(s.completed, s.started)} />
            <Stat label="Keluar di intro" value={num(s.leftAtIntro)} note={`median intro ${med(s.intro)}`} />
            <Stat label="Lama sampai tamat" value={med(s.time)} note="median, waktu aktif" />
            <Stat label="Baca panduan guru dulu" value={num(s.guide)} note={`${pct(s.guide, s.started)} · panduan dibuka ${num(guideVisitors)}×`} />
          </div>
          <h3 className="mt-6 type-subheading">Per tahap</h3>
          {view === 'chart' ? (
            <div className="mt-3">
              <Bars
                legend={[
                  { tone: 'tosca', label: 'Lolos' },
                  { tone: 'gold', label: 'Berhenti di tahap ini' },
                  { tone: 'rest', label: 'Belum lolos, lanjut main' },
                ]}
                rows={keys.flatMap((p): BarRow[] => {
                  const z = r.puzzles[`${id}:${p}`]
                  if (!z || isHidden(z)) return []
                  return [
                    {
                      key: p,
                      label: puzzleTitle(id, p),
                      parts: [
                        { value: z.passed, tone: 'tosca', label: 'Lolos' },
                        { value: z.stopped, tone: 'gold', label: 'Berhenti di sini' },
                        { value: Math.max(0, z.reached - z.passed - z.stopped), tone: 'rest', label: 'Belum lolos' },
                      ],
                      value: `${num(z.passed)} / ${num(z.reached)}`,
                    },
                  ]
                })}
              />
              <p className="mt-2 type-caption text-ink-muted">Panjang bar = pemain yang sampai di tahap itu. Angka di kanan: lolos / sampai. Rincian RUN, hint dan lama ada di tampilan Tabel.</p>
            </div>
          ) : (
            <>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full type-label">
                  <thead>
                    <Row
                      head
                      cells={['Tahap', 'Sampai', 'Lolos', 'Berhenti di sini', 'Keluar sesudah lolos', 'Lolos 1× RUN', 'Rata RUN', 'Pakai hint', 'Lama (median)', 'Sebelum RUN 1', 'Tebakan salah']}
                    />
                  </thead>
                  <tbody>
                    {keys.map((p) => {
                      const z = r.puzzles[`${id}:${p}`]
                      const target = level?.puzzles.find((x) => x.id === p)?.firstRunTarget
                      if (isHidden(z)) return <Row key={p} cells={[puzzleTitle(id, p), HIDDEN_TEXT, '', '', '', '', '', '', '', '', '']} />
                      return (
                        <Row
                          key={p}
                          cells={[
                            puzzleTitle(id, p),
                            num(z.reached),
                            `${num(z.passed)} (${pct(z.passed, z.reached)})`,
                            <Hot n={z.stopped} of={z.reached} />,
                            num(z.leftAfterPass),
                            `${pct(z.firstTry, z.passed)}${target === undefined ? '' : ` / target ${Math.round(target * 100)}%`}`,
                            z.passed ? (z.runs / z.passed).toFixed(1) : '–',
                            `${pct(z.hinted, z.passed)} (${z.rungs.slice(1).join('/')})`,
                            med(z.time),
                            med(z.build),
                            z.predicted ? `${pct(z.predictedWrong, z.predicted)} dari ${num(z.predicted)}` : '–',
                          ]}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 type-caption text-ink-muted">
                Pakai hint: bagian yang lolos setelah melihat petunjuk; dalam kurung jumlah per tingkat (pertanyaan/penunjuk/contoh). Lama: dari tahap terbuka sampai lolos, hanya saat tab terlihat,
                dibulatkan 15 detik.
              </p>
            </>
          )}
          {level && level.badgeDefs.length > 0 && (
            <>
              <h3 className="mt-6 type-subheading">Badge (di antara {num(s.completed)} yang tamat)</h3>
              {view === 'chart' ? (
                <div className="mt-3">
                  <Bars
                    share
                    legend={[
                      { tone: 'tosca', label: 'Punya' },
                      { tone: 'rest', label: 'Terlewat' },
                    ]}
                    rows={level.badgeDefs.map((b) => {
                      const have = s.badges[b.id] ?? 0
                      return {
                        key: b.id,
                        label: badgeTitle(id, b.id),
                        parts: [
                          { value: have, tone: 'tosca' as const, label: 'Punya' },
                          { value: Math.max(0, s.completed - have), tone: 'rest' as const, label: 'Terlewat' },
                        ],
                        value: pct(have, s.completed),
                      }
                    })}
                  />
                </div>
              ) : (
                <Scroll className="mt-2">
                  <table className="w-full type-label">
                    <thead>
                      <Row head cells={['Badge', 'Punya', 'Terlewat', 'Didapat (semua pemain)']} />
                    </thead>
                    <tbody>
                      {level.badgeDefs.map((b) => {
                        const have = s.badges[b.id] ?? 0
                        const earned = r.badges[`${id}:${b.id}`]
                        return (
                          <Row
                            key={b.id}
                            cells={[badgeTitle(id, b.id), num(have), <Hot n={s.completed - have} of={s.completed} />, earned === undefined ? '0' : isHidden(earned) ? HIDDEN_TEXT : num(earned)]}
                          />
                        )
                      })}
                    </tbody>
                  </table>
                </Scroll>
              )}
            </>
          )}
        </>
      )}
    </Panel>
  )
}

function QuizPanel({ r, view }: { r: Report; view: View }) {
  const rows = Object.entries(r.quiz).sort((a, b) => a[0].localeCompare(b[0]))
  if (rows.length === 0) return null
  if (view === 'chart')
    return (
      <Panel title="Kuis (level klasik)">
        <Bars
          share
          legend={[
            { tone: 'tosca', label: 'Benar' },
            { tone: 'gold', label: 'Salah' },
            { tone: 'rest', label: 'Dilewati' },
          ]}
          rows={rows.flatMap(([key, q]): BarRow[] => {
            if (isHidden(q)) return []
            const [session, id] = key.split(':')
            return [
              {
                key,
                label: `${session}:${id} ${quizText(id, 'id')}`,
                parts: [
                  { value: q.right, tone: 'tosca', label: 'Benar' },
                  { value: q.wrong, tone: 'gold', label: 'Salah' },
                  { value: q.skip, tone: 'rest', label: 'Dilewati' },
                ],
                value: `${pct(q.wrong, q.right + q.wrong)} salah`,
              },
            ]
          })}
        />
      </Panel>
    )
  return (
    <Panel title="Kuis (level klasik)">
      <div className="overflow-x-auto">
        <table className="w-full type-label">
          <thead>
            <Row head cells={['Soal', 'Benar', 'Salah', 'Dilewati', '% salah', '% dilewati']} />
          </thead>
          <tbody>
            {rows.map(([key, q]) => {
              const [session, id] = key.split(':')
              const label = (
                <span>
                  <code className="type-mono">
                    {session}:{id}
                  </code>{' '}
                  {quizText(id, 'id')}
                </span>
              )
              if (isHidden(q)) return <Row key={key} cells={[label, HIDDEN_TEXT, '', '', '', '']} />
              const answered = q.right + q.wrong
              return <Row key={key} cells={[label, num(q.right), num(q.wrong), num(q.skip), <Hot n={q.wrong} of={answered} />, <Hot n={q.skip} of={answered + q.skip} />]} />
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

const STUCK_LABEL: Record<string, string> = { mission: 'Misi', blocks: 'Blok', run: 'Tombol RUN', result: 'Hasil', words: 'Istilah', none: 'Tidak ada' }

function SurveyPanel({ r, view }: { r: Report; view: View }) {
  const sv = r.survey
  const rows = Object.entries(sv.sessions).sort((a, b) => b[1].n - a[1].n)
  const [all, setAll] = useState(false)
  const essays = all ? sv.essays : sv.essays.slice(0, 20)
  return (
    <Panel title="C. Survei">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Jawaban" value={num(sv.n)} />
        {Object.entries(sv.roles).map(([role, n]) => (
          <Stat key={role} label={role} value={num(n)} note={pct(n, sv.n)} />
        ))}
      </div>
      {view === 'chart' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 type-subheading">Main lagi?</h3>
            <Bars
              share
              legend={[
                { tone: 'tosca', label: 'Ya' },
                { tone: 'gold', label: 'Mungkin' },
                { tone: 'rest', label: 'Tidak' },
              ]}
              rows={rows.map(([id, s]) => ({
                key: id,
                label: `${id === 'none' ? 'Belum main' : id.toUpperCase()} · seru ${(s.fun / s.n).toFixed(1)}, jelas ${(s.clear / s.n).toFixed(1)}`,
                parts: [
                  { value: s.again.yes, tone: 'tosca' as const, label: 'Ya' },
                  { value: s.again.maybe, tone: 'gold' as const, label: 'Mungkin' },
                  { value: s.again.no, tone: 'rest' as const, label: 'Tidak' },
                ],
                value: `${num(s.n)} jawaban`,
              }))}
            />
          </div>
          <div>
            <h3 className="mb-2 type-subheading">Bagian yang membingungkan</h3>
            <Bars
              rows={Object.entries(
                rows.reduce<Record<string, number>>((acc, [, s]) => {
                  for (const [k, n] of Object.entries(s.stuck)) acc[k] = (acc[k] ?? 0) + n
                  return acc
                }, {}),
              )
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => ({ key: k, label: STUCK_LABEL[k] ?? k, parts: [{ value: n, tone: 'tosca' as const, label: 'Jawaban' }], value: num(n) }))}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full type-label">
            <thead>
              <Row head cells={['Sesi', 'Jawaban', 'Seru (1–5)', 'Jelas (1–5)', 'Main lagi: ya/mungkin/tidak', 'Bagian membingungkan']} />
            </thead>
            <tbody>
              {rows.map(([id, s]) => (
                <Row
                  key={id}
                  cells={[
                    id === 'none' ? 'Belum main' : id.toUpperCase(),
                    num(s.n),
                    (s.fun / s.n).toFixed(1),
                    (s.clear / s.n).toFixed(1),
                    `${s.again.yes}/${s.again.maybe}/${s.again.no}`,
                    Object.entries(s.stuck)
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, n]) => `${STUCK_LABEL[k] ?? k} ${n}`)
                      .join(', ') || '–',
                  ]}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sv.essays.length > 0 && (
        <>
          <h3 className="mt-6 type-subheading">Isian bebas ({num(sv.essays.length)})</h3>
          <ul className="mt-2 space-y-2">
            {essays.map((e, i) => (
              <li key={i} className="rounded border-2 border-ink bg-parchment p-3 type-body">
                <p className="type-micro text-ink-muted">
                  {e.day} · {e.role} · {e.session?.toUpperCase() ?? 'belum main'}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{e.text}</p>
              </li>
            ))}
          </ul>
          {!all && sv.essays.length > essays.length && (
            <button onClick={() => setAll(true)} className="pixel-btn mt-3 rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
              Tampilkan semua
            </button>
          )}
        </>
      )}
    </Panel>
  )
}

// ---------- small parts ----------

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border-2 border-ink bg-white p-4 shadow-pixel-sm sm:p-6">
      <h2 className="mb-4 type-heading">{title}</h2>
      {children}
    </section>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded border-2 border-ink bg-cream p-3">
      <p className="type-micro text-ink-muted">{label}</p>
      <p className="mt-1 type-heading">{value}</p>
      {note && <p className="type-caption text-ink-muted">{note}</p>}
    </div>
  )
}

function Scroll({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`overflow-x-auto ${className}`}>{children}</div>
}

function Row({ cells, head = false }: { cells: ReactNode[]; head?: boolean }) {
  const Cell = head ? 'th' : 'td'
  return (
    <tr className={head ? 'border-b-2 border-ink text-left' : 'border-b border-parchment'}>
      {cells.map((c, i) => (
        <Cell key={i} className={`px-2 py-1.5 align-top ${i > 0 ? 'whitespace-nowrap' : 'min-w-40'}`}>
          {c}
        </Cell>
      ))}
    </tr>
  )
}

/** A share that gets a warning colour when it's high. */
function Hot({ n, of }: { n: number; of: number }) {
  const share = of > 0 ? n / of : 0
  return <span className={share >= 0.3 ? 'font-bold text-maroon' : ''}>{`${num(n)} (${pct(n, of)})`}</span>
}
