import { useEffect, useRef, useState } from 'react'
import BlockEditor, { type BlockEditorHandle } from './components/BlockEditor'
import Stage, { type StageHandle } from './components/Stage'
import TermPopup from './components/TermPopup'
import type { Focus, Milestones } from './game/TrainScene'
import { LEVEL1_CARDS, initialLang, saveLang, t, type CardId, type Lang, type TermCard } from './i18n'
import { run } from './levels/train/model'

type LogLine = { text: string; tone: 'info' | 'good' | 'bad' }

const LEVELS: { id: string; title: Record<Lang, string>; topic: string; ready: boolean }[] = [
  { id: 'train', title: { id: 'Latih Robot', en: 'Train the Robot' }, topic: 'Classification', ready: true },
  { id: 'tree', title: { id: 'Taman Decision Tree', en: 'Decision Tree Garden' }, topic: 'Decision trees', ready: false },
  { id: 'hill', title: { id: 'Bukit Loss', en: 'Hill of Loss' }, topic: 'Gradient descent', ready: false },
  { id: 'tavern', title: { id: 'Kedai Token', en: 'Token Tavern' }, topic: 'LLMs', ready: false },
]

const PROGRESS_KEY = 'kotakata.cards'
const ALL_CARDS = LEVEL1_CARDS.map((c) => c.id)

/** Cards found so far. The old format stored 'level1' for "all of them". */
function loadFound(): Set<CardId> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw === 'level1') return new Set(ALL_CARDS)
    const ids = raw ? (JSON.parse(raw) as unknown) : []
    return new Set(Array.isArray(ids) ? ids.filter((id): id is CardId => ALL_CARDS.includes(id)) : [])
  } catch {
    return new Set()
  }
}

function saveFound(found: Set<CardId>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...found]))
  } catch {
    /* not critical */
  }
}

interface OpenCard {
  card: TermCard
  focus: Focus
  vars: Record<string, string | number>
  close: () => void
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [log, setLog] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)
  const [found, setFound] = useState(loadFound)
  const [fresh, setFresh] = useState<CardId | null>(null)
  const [openCard, setOpenCard] = useState<OpenCard | null>(null)
  // The scene asks "is this card new?" mid-run, so it reads a ref, not state.
  const foundRef = useRef(found)
  const editor = useRef<BlockEditorHandle>(null)
  const stage = useRef<StageHandle>(null)
  const seed = useRef(1)
  // Bumped by Reset, so a run that was stopped doesn't report a result.
  const runToken = useRef(0)
  const logBox = useRef<HTMLUListElement>(null)

  // Keep the newest log line in view. Scroll only the log box, not the page.
  useEffect(() => {
    const box = logBox.current
    if (box) box.scrollTop = box.scrollHeight
  }, [log])

  const discover = (id: CardId) => {
    const next = new Set(foundRef.current).add(id)
    foundRef.current = next
    setFound(next)
    setFresh(id)
    saveFound(next)
  }

  /** Shows a card over the stage and resolves once the player closes it. */
  const showCard = (id: CardId, focus: Focus, vars: Record<string, string | number> = {}) =>
    new Promise<void>((resolve) => {
      const card = LEVEL1_CARDS.find((c) => c.id === id)!
      discover(id)
      setOpenCard({
        card,
        focus,
        vars,
        close: () => {
          setOpenCard(null)
          resolve()
        },
      })
    })

  const milestones: Milestones = {
    isNew: (id) => !foundRef.current.has(id),
    show: showCard,
  }

  const switchLang = (next: Lang) => {
    setLang(next)
    saveLang(next)
    document.documentElement.lang = next
  }

  const handleRun = async () => {
    const program = editor.current?.program()
    if (!program || program.length === 0) {
      setLog([{ text: t(lang, 'logEmpty'), tone: 'bad' }])
      return
    }
    setRunning(true)
    setLog([])
    const token = ++runToken.current
    // A new seed each run, so the robot sees fresh fruit every time.
    const result = run(program, seed.current++)
    await stage.current?.play(result.events, (text, tone = 'info') => setLog((l) => [...l, { text, tone }]), milestones)
    if (token !== runToken.current) return

    const acc = Math.round((result.accuracy ?? 0) * 100)
    if (result.passed) {
      setLog((l) => [...l, { text: `${t(lang, 'winTitle')} ${t(lang, 'winBody', { acc })}`, tone: 'good' }])
      stage.current?.celebrate()
      if (milestones.isNew('classification')) await showCard('classification', 'status')
    } else if (result.accuracy !== null) {
      const smallTest = !result.events.some((e) => e.kind === 'test' && e.results.length >= 10)
      setLog((l) => [...l, { text: smallTest ? t(lang, 'tryAgainSmallTest') : t(lang, 'tryAgainLow', { acc }), tone: 'bad' }])
    }
    setRunning(false)
  }

  const handleReset = () => {
    // Closing an open card lets the paused run finish; reset then stops it.
    runToken.current++
    openCard?.close()
    stage.current?.reset()
    setLog([])
    setRunning(false)
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-cream/95 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="pixel-shadow flex h-10 w-10 items-center justify-center rounded border-2 border-ink bg-tosca font-pixel text-2xl text-white">
            KK
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-none">Kotakata</h1>
            <p className="mt-1 text-[11px] font-semibold text-maroon">{t(lang, 'tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded border-2 border-ink text-xs font-bold" role="group" aria-label="Language">
            {(['id', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                aria-pressed={lang === l}
                className={`px-3 py-1.5 ${lang === l ? 'bg-ink text-cream' : 'bg-white hover:bg-amber/30'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a href="https://aastr.id" className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold hover:bg-amber/30">
            {t(lang, 'back')}
          </a>
        </div>
      </header>

      <p className="border-b-2 border-ink bg-amber/40 px-4 py-2 text-center text-xs font-semibold md:hidden">{t(lang, 'smallScreen')}</p>

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[170px_minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Level list */}
        <nav aria-label={t(lang, 'levels')} className="space-y-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink/70">{t(lang, 'levels')}</h2>
          <ol className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {LEVELS.map((lv, i) => (
              <li key={lv.id}>
                <div
                  aria-current={lv.ready ? 'page' : undefined}
                  className={`rounded border-2 border-ink px-3 py-2 ${lv.ready ? 'pixel-shadow bg-tosca text-white' : 'bg-parchment text-ink/60'}`}
                >
                  <div className="font-pixel text-lg leading-none">
                    {i + 1}. {lv.title[lang]}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase">{lv.ready ? lv.topic : `🔒 ${t(lang, 'comingSoon')}`}</div>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Block editor */}
        <section className="pixel-shadow flex min-h-[420px] flex-col overflow-hidden rounded-lg border-2 border-ink bg-white lg:min-h-0">
          <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-3 py-2 text-xs font-bold text-cream">
            <span>▸ {t(lang, 'l1Title')}.blocks</span>
            <span className="text-amber">{t(lang, 'l1Short')}</span>
          </div>
          <div className="relative min-h-[380px] flex-1">
            <div className="absolute inset-0">
              <BlockEditor lang={lang} ref={editor} />
            </div>
          </div>
        </section>

        {/* Stage, mission and log */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="pixel-shadow overflow-hidden rounded-lg border-2 border-ink bg-cream">
            <Stage lang={lang} ref={stage}>
              {openCard && (
                <TermPopup card={openCard.card} focus={openCard.focus} vars={openCard.vars} lang={lang} onClose={openCard.close} />
              )}
            </Stage>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRun}
              disabled={running}
              className="pixel-btn rounded border-2 border-ink bg-maroon px-5 py-2.5 text-sm font-bold text-white"
            >
              {running ? t(lang, 'running') : t(lang, 'run')}
            </button>
            <button onClick={handleReset} className="pixel-btn rounded border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold">
              {t(lang, 'reset')}
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border-2 border-ink bg-amber/30 p-4">
              <h2 className="text-[11px] font-bold uppercase tracking-wider">{t(lang, 'goal')}</h2>
              <p className="mt-1.5 font-sans text-sm leading-relaxed">{t(lang, 'l1Mission')}</p>
            </div>
            <div className="rounded-lg border-2 border-ink bg-ink p-4 text-cream" aria-live="polite">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-amber">{t(lang, 'log')}</h2>
              <ul ref={logBox} className="mt-1.5 max-h-40 space-y-1 overflow-y-auto text-xs leading-relaxed">
                {log.map((line, i) => (
                  <li key={i} className={line.tone === 'good' ? 'text-emerald-300' : line.tone === 'bad' ? 'text-rose-300' : ''}>
                    › {line.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Term cards */}
      <section className="border-t-2 border-ink bg-parchment px-4 py-6 sm:px-6" aria-labelledby="cards-title">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="cards-title" className="font-display text-lg font-bold">
            {t(lang, 'cards')} <span className="font-pixel text-xl text-maroon">{found.size}/{LEVEL1_CARDS.length}</span>
          </h2>
          {found.size < LEVEL1_CARDS.length && <p className="text-xs font-semibold text-ink/70">{t(lang, 'unlockHint')}</p>}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LEVEL1_CARDS.map((card) =>
            found.has(card.id) ? (
              <li
                key={card.term}
                className={`pixel-shadow rounded-lg border-2 border-ink bg-white p-3 ${fresh === card.id ? 'card-in ring-4 ring-amber' : ''}`}
              >
                <div className="text-2xl" aria-hidden="true">{card.icon}</div>
                <div className="mt-1 font-pixel text-xl leading-none text-tosca">{card.term}</div>
                <p className="mt-1.5 font-sans text-xs leading-snug text-ink/80">{card.body[lang]}</p>
              </li>
            ) : (
              <li key={card.term} className="flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-ink/40 bg-cream">
                <span className="font-pixel text-lg text-ink/40">🔒 {t(lang, 'locked')}</span>
              </li>
            ),
          )}
        </ul>
      </section>
    </div>
  )
}
