import { useCallback, useEffect, useRef, useState } from 'react'
import BlockEditor, { type BlockEditorHandle } from './components/BlockEditor'
import Stage, { type StageHandle } from './components/Stage'
import HintBubble from './components/HintBubble'
import QuizModal from './components/QuizModal'
import TermPopup from './components/TermPopup'
import type { Milestones, PopupSide } from './game/types'
import { LEVEL1_CARDS, LEVEL2_CARDS, LEVEL3_CARDS, LEVEL4_CARDS, initialLang, saveLang, t, type CardId, type Lang, type TermCard } from './i18n'
import { MAX_REPEATS, type Hint } from './hints'
import { LEVELS, UPCOMING, levelById, type LevelId } from './levels'
import type { Level } from './levels/types'
import { MAX_STARS, pickQuestion, shouldQuiz, type Question, type RunContext } from './quiz/questions'

type LogLine = { text: string; tone: 'info' | 'good' | 'bad' }

const PROGRESS_KEY = 'kotakata.cards'
const LEVEL_KEY = 'kotakata.level'
const PASSED_KEY = 'kotakata.passed'
const STAGES_KEY = 'kotakata.stages'
const BADGES_KEY = 'kotakata.badges'
type StagesDone = Partial<Record<LevelId, string[]>>

/** The stage to play: the first main stage not done, then the bonus. */
function currentStage(level: Level, done: string[]) {
  return (
    level.stages.find((s) => !s.bonus && !done.includes(s.id)) ??
    level.stages.find((s) => s.bonus && !done.includes(s.id)) ??
    level.stages[level.stages.length - 1]
  )
}

interface Toast {
  id: number
  icon: string
  title: string
  body: string
}
const EVERY_CARD = [...LEVEL1_CARDS, ...LEVEL2_CARDS, ...LEVEL3_CARDS, ...LEVEL4_CARDS]
const ALL_CARDS = EVERY_CARD.map((c) => c.id)

/** Cards found so far. The old format stored 'level1' for "all of them". */
function loadFound(): Set<CardId> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw === 'level1') return new Set(LEVEL1_CARDS.map((c) => c.id))
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

const STARS_KEY = 'kotakata.stars'
const RECENT_KEY = 'kotakata.quizRecent'
type Stars = Partial<Record<CardId, number>>

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* not critical */
  }
}

/** Levels passed so far. Players from before levels existed passed Level 1 if they found its last card. */
function loadPassed(found: Set<CardId>): Set<LevelId> {
  const passed = new Set(loadJson<LevelId[]>(PASSED_KEY, []))
  if (found.has('classification')) passed.add('train')
  return passed
}

interface OpenCard {
  card: TermCard
  side: PopupSide
  vars: Record<string, string | number>
  close: () => void
}

const foundRef0 = () => loadFound()

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [log, setLog] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)
  const [found, setFound] = useState(loadFound)
  const [passed, setPassed] = useState(() => loadPassed(foundRef0()))
  const [levelId, setLevelId] = useState<LevelId>(() => {
    const saved = loadJson<LevelId | null>(LEVEL_KEY, null)
    return saved && LEVELS.some((l) => l.id === saved) ? saved : 'train'
  })
  const level = levelById(levelId)
  const [stagesDone, setStagesDone] = useState<StagesDone>(() => {
    const saved = loadJson<StagesDone>(STAGES_KEY, {})
    // Players who passed a level before stages existed have done its main stages.
    for (const id of loadPassed(loadFound())) {
      const lv = levelById(id)
      if (!saved[id]?.length) saved[id] = lv.stages.filter((st) => !st.bonus).map((st) => st.id)
    }
    return saved
  })
  const done = stagesDone[levelId] ?? []
  const stage = currentStage(level, done)
  const [badges, setBadges] = useState<Set<string>>(() => new Set(loadJson<string[]>(BADGES_KEY, [])))
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const [fresh, setFresh] = useState<CardId | null>(null)
  const [openCard, setOpenCard] = useState<OpenCard | null>(null)
  // The scene asks "is this card new?" mid-run, so it reads a ref, not state.
  const foundRef = useRef(found)
  const [stars, setStars] = useState<Stars>(() => loadJson<Stars>(STARS_KEY, {}))
  const [quiz, setQuiz] = useState<Question | null>(null)
  const lastRun = useRef<RunContext | null>(null)
  const quizzedLastRun = useRef(false)
  const showedNewCard = useRef(false)
  const [hint, setHint] = useState<Hint | null>(null)
  // The same hint shown run after run means the player is ignoring it.
  const hintStreak = useRef<{ key: string; n: number }>({ key: '', n: 0 })
  const editor = useRef<BlockEditorHandle>(null)
  const stageView = useRef<StageHandle>(null)
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

  const stageCelebrate = () => stageView.current?.celebrate()

  const pushToast = (icon: string, title: string, body: string) => {
    const id = ++toastId.current
    setToasts((ts) => [...ts, { id, icon, title, body }])
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3800)
  }

  /** Shows a card over the stage and resolves once the player closes it. */
  const showCard = (id: CardId, side: PopupSide, vars: Record<string, string | number> = {}) =>
    new Promise<void>((resolve) => {
      const card = EVERY_CARD.find((c) => c.id === id)!
      showedNewCard.current = true
      discover(id)
      setOpenCard({
        card,
        side,
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

  const openQuiz = () => {
    const recent = loadJson<string[]>(RECENT_KEY, [])
    const q = pickQuestion(foundRef.current, stars, recent, lastRun.current, Math.random)
    if (!q) return
    saveJson(RECENT_KEY, [q.id, ...recent.filter((id) => id !== q.id)].slice(0, 6))
    setQuiz(q)
  }

  const handleQuizAnswer = (correct: boolean) => {
    if (!correct || !quiz) return
    setStars((prev) => {
      const next = { ...prev }
      for (const id of quiz.terms) next[id] = Math.min(MAX_STARS, (next[id] ?? 0) + 1)
      saveJson(STARS_KEY, next)
      return next
    })
  }

  /** Shows one hint for this program and result, unless it's been ignored. */
  const offerHint = (next: Hint | null) => {
    if (!next) {
      hintStreak.current = { key: '', n: 0 }
      return false
    }
    const streak = hintStreak.current
    const n = streak.key === next.key ? streak.n + 1 : 1
    hintStreak.current = { key: next.key, n }
    if (n > MAX_REPEATS) return false
    setHint(next)
    return true
  }

  const locateHint = useCallback(
    (reveal: boolean) => (hint ? (editor.current?.locate(hint.target, reveal) ?? null) : null),
    [hint],
  )

  const switchLang = (next: Lang) => {
    setLang(next)
    saveLang(next)
    document.documentElement.lang = next
  }

  const handleRun = async () => {
    const program = editor.current?.program() ?? null
    setHint(null)
    if (program === null || level.isEmpty(program)) {
      setLog([{ text: t(lang, level.id === 'tree' ? 'logTreeEmpty' : 'logEmpty'), tone: 'bad' }])
      offerHint(level.hint(program, null, stage.id))
      return
    }
    setRunning(true)
    setLog([])
    const token = ++runToken.current
    showedNewCard.current = false
    // A new seed each run, so every run looks a little different.
    const result = level.run(program, seed.current++, stage.id)
    await stageView.current?.play(result.events, (text, tone = 'info') => setLog((l) => [...l, { text, tone }]), milestones)
    if (token !== runToken.current) return
    if (result.context) lastRun.current = result.context

    const acc = Math.round((result.accuracy ?? 0) * 100)
    const stagePassed = stage.check(program, result)

    // Badges for anything nice this run did
    const earned = level.achievements.filter((a) => !badges.has(`${level.id}:${a.id}`) && a.check(program, result, stage, stagePassed))

    if (stagePassed) {
      // Mark this stage done, and any later stage this same run also clears.
      const nowDone = new Set(done).add(stage.id)
      const group = level.runGroup(stage.id)
      for (const st of level.stages) {
        if (!nowDone.has(st.id) && level.runGroup(st.id) === group && st.check(program, result)) nowDone.add(st.id)
      }
      // Badges for stages this run also cleared (like the bonus)
      for (const st of level.stages) {
        if (st === stage || !nowDone.has(st.id) || done.includes(st.id)) continue
        for (const a of level.achievements) {
          if (!earned.includes(a) && !badges.has(`${level.id}:${a.id}`) && a.check(program, result, st, true)) earned.push(a)
        }
      }
      const doneList = [...nowDone]
      setStagesDone((prev) => {
        const next = { ...prev, [level.id]: doneList }
        saveJson(STAGES_KEY, next)
        return next
      })
      for (const st of level.stages) {
        if (nowDone.has(st.id) && !done.includes(st.id)) setLog((l) => [...l, { text: `✓ ${t(lang, 'stageDone', { title: t(lang, st.titleKey) })}`, tone: 'good' }])
      }
      const mainDone = level.stages.every((st) => st.bonus || nowDone.has(st.id))
      const wasMainDone = level.stages.every((st) => st.bonus || done.includes(st.id))
      if (mainDone && !wasMainDone) {
        // The whole mission is complete
        setLog((l) => [...l, { text: `${t(lang, 'winTitle')} ${t(lang, level.winKey, { acc })}`, tone: 'good' }])
        stageCelebrate()
        if (milestones.isNew(level.winCard)) await showCard(level.winCard, 'right')
        if (!passed.has(level.id)) {
          const next = new Set(passed).add(level.id)
          setPassed(next)
          saveJson(PASSED_KEY, [...next])
          const nextIndex = LEVELS.findIndex((l) => l.id === level.id) + 1
          if (nextIndex < LEVELS.length) setLog((l) => [...l, { text: t(lang, 'levelUnlocked', { n: nextIndex + 1 }), tone: 'good' }])
        }
        if (level.stages.some((st) => st.bonus && !nowDone.has(st.id))) setLog((l) => [...l, { text: t(lang, 'bonusOpen'), tone: 'info' }])
        else setLog((l) => [...l, { text: t(lang, 'allDone'), tone: 'good' }])
      } else {
        stageCelebrate()
        const upcoming = currentStage(level, doneList)
        if (!nowDone.has(upcoming.id)) setLog((l) => [...l, { text: t(lang, 'stageNext', { title: t(lang, upcoming.titleKey) }), tone: 'info' }])
        else if (stage.bonus) setLog((l) => [...l, { text: t(lang, 'allDone'), tone: 'good' }])
      }
    } else {
      const fail = stage.failKey(program, result)
      if (fail) setLog((l) => [...l, { text: t(lang, fail, { acc }), tone: 'bad' }])
    }
    // Badge toasts come last, after any win card, so they aren't missed.
    if (earned.length) {
      const next = new Set(badges)
      for (const a of earned) {
        next.add(`${level.id}:${a.id}`)
        pushToast(a.icon, t(lang, a.titleKey), t(lang, a.descKey))
      }
      setBadges(next)
      saveJson(BADGES_KEY, [...next])
    }
    setRunning(false)

    // A failed run gets one pointer at what to change. A run with a hint
    // skips the quiz, so the player isn't handed two things at once.
    const hinted = offerHint(stagePassed ? null : level.hint(program, result, stage.id))
    // Now and then, a quick question about terms the player already knows.
    const quizNow = !hinted && shouldQuiz({
      foundCount: foundRef.current.size,
      showedNewCard: showedNewCard.current,
      quizzedLastRun: quizzedLastRun.current,
      roll: Math.random(),
    })
    quizzedLastRun.current = quizNow
    if (quizNow) window.setTimeout(openQuiz, 900)
  }

  /** A level is open once the one before it is passed. */
  const isUnlocked = (index: number) => index === 0 || passed.has(LEVELS[index - 1].id)

  const switchLevel = (id: LevelId) => {
    if (id === levelId) return
    handleReset()
    setHint(null)
    setLevelId(id)
    saveJson(LEVEL_KEY, id)
  }

  /** Redraws the live preview (if the level has one) from the current blocks. */
  const refreshPreview = () => {
    if (!level.previewData) return
    stageView.current?.preview(level.previewData(editor.current?.program() ?? null, stage.id))
  }
  useEffect(() => {
    refreshPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, lang, stage.id])

  const [confirmStartOver, setConfirmStartOver] = useState(false)

  /** Clears blocks, cards, stars and quiz history, so the level plays like the first time. */
  const startOver = () => {
    handleReset()
    setQuiz(null)
    setConfirmStartOver(false)
    for (const key of [PROGRESS_KEY, STARS_KEY, RECENT_KEY, PASSED_KEY, LEVEL_KEY, STAGES_KEY, BADGES_KEY, ...LEVELS.map((l) => l.storageKey)]) {
      try {
        localStorage.removeItem(key)
      } catch {
        /* not critical */
      }
    }
    const none = new Set<CardId>()
    foundRef.current = none
    setFound(none)
    setFresh(null)
    setStars({})
    lastRun.current = null
    quizzedLastRun.current = false
    hintStreak.current = { key: '', n: 0 }
    setPassed(new Set())
    setStagesDone({})
    setBadges(new Set())
    // Back to Level 1. Loading the starter blocks also saves them over the old program.
    if (levelId === 'train') editor.current?.resetToStarter()
    else setLevelId('train')
  }

  const handleReset = () => {
    // Closing an open card lets the paused run finish; reset then stops it.
    runToken.current++
    setHint(null)
    openCard?.close()
    stageView.current?.reset()
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
          <div className="relative">
            <button
              onClick={() => setConfirmStartOver((v) => !v)}
              aria-expanded={confirmStartOver}
              className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold hover:bg-amber/30"
            >
              {t(lang, 'startOver')}
            </button>
            {confirmStartOver && (
              <div role="alertdialog" aria-labelledby="start-over-text" className="card-in absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border-2 border-ink bg-white p-3 shadow-[4px_4px_0_#0F172A]">
                <p id="start-over-text" className="font-sans text-xs leading-snug">{t(lang, 'startOverConfirm')}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button autoFocus onClick={() => setConfirmStartOver(false)} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold">
                    {t(lang, 'cancel')}
                  </button>
                  <button onClick={startOver} className="pixel-btn rounded border-2 border-ink bg-maroon px-3 py-1.5 text-xs font-bold text-white">
                    {t(lang, 'startOverYes')}
                  </button>
                </div>
              </div>
            )}
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
            {LEVELS.map((lv, i) => {
              const open = isUnlocked(i)
              const current = lv.id === levelId
              return (
                <li key={lv.id}>
                  <button
                    onClick={() => open && switchLevel(lv.id)}
                    disabled={!open || running}
                    aria-current={current ? 'page' : undefined}
                    title={open ? undefined : t(lang, 'levelLocked')}
                    className={`w-full rounded border-2 border-ink px-3 py-2 text-left ${
                      current ? 'pixel-shadow bg-tosca text-white' : open ? 'bg-white hover:bg-amber/30' : 'cursor-not-allowed bg-parchment text-ink/60'
                    }`}
                  >
                    <div className="font-pixel text-lg leading-none">
                      {i + 1}. {lv.title[lang]} {passed.has(lv.id) && '✓'}
                    </div>
                    <div className="mt-1 text-[10px] font-bold uppercase">{open ? lv.topic : `🔒 ${t(lang, 'levelLocked')}`}</div>
                  </button>
                </li>
              )
            })}
            {UPCOMING.map((lv, i) => (
              <li key={lv.topic}>
                <div className="rounded border-2 border-ink bg-parchment px-3 py-2 text-ink/60">
                  <div className="font-pixel text-lg leading-none">
                    {LEVELS.length + i + 1}. {lv.title[lang]}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase">🔒 {t(lang, 'comingSoon')}</div>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Block editor */}
        <section className="pixel-shadow flex min-h-[420px] flex-col overflow-hidden rounded-lg border-2 border-ink bg-white lg:min-h-0">
          <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-3 py-2 text-xs font-bold text-cream">
            <span>▸ {t(lang, level.fileKey)}.blocks</span>
            <span className="text-amber">{level.topic}</span>
          </div>
          <div className="relative min-h-[380px] flex-1">
            <div className="absolute inset-0">
              <BlockEditor
                lang={lang}
                level={level}
                ref={editor}
                onEdit={() => {
                  setHint(null)
                  refreshPreview()
                }}
              />
            </div>
          </div>
        </section>

        {/* Stage, mission and log */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="pixel-shadow overflow-hidden rounded-lg border-2 border-ink bg-cream">
            <Stage key={level.id} lang={lang} level={level} ref={stageView}>
              {openCard && (
                <TermPopup card={openCard.card} side={openCard.side} vars={openCard.vars} lang={lang} onClose={openCard.close} />
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
            <button
              onClick={handleReset}
              title={running ? undefined : t(lang, 'clearTitle')}
              className="pixel-btn rounded border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold"
            >
              {running ? t(lang, 'stop') : t(lang, 'clear')}
            </button>
            {found.size >= 2 && (
              <button
                onClick={openQuiz}
                disabled={running}
                className="pixel-btn ml-auto rounded border-2 border-ink bg-amber px-4 py-2.5 text-sm font-bold"
              >
                {t(lang, 'quizMe')}
              </button>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <StagePanel lang={lang} level={level} done={done} current={stage.id} badges={badges} />
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

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="card-in flex items-start gap-3 rounded-lg border-2 border-ink bg-amber p-3 shadow-[4px_4px_0_#0F172A]">
            <span className="badge-pop text-3xl leading-none" aria-hidden="true">
              {toast.icon}
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider">🏅 {t(lang, 'newBadge')}</div>
              <div className="font-pixel text-xl leading-none">{toast.title}</div>
              <p className="mt-0.5 font-sans text-xs leading-snug">{toast.body}</p>
            </div>
          </div>
        ))}
      </div>

      {hint && !quiz && !running && (
        <HintBubble key={hint.key} hint={hint} lang={lang} locate={locateHint} onClose={() => setHint(null)} />
      )}

      {quiz && (
        <QuizModal
          key={quiz.id}
          question={quiz}
          lang={lang}
          maxed={(id) => (stars[id] ?? 0) >= MAX_STARS}
          onAnswer={handleQuizAnswer}
          onClose={() => setQuiz(null)}
        />
      )}

      {/* Term cards */}
      <section className="border-t-2 border-ink bg-parchment px-4 py-6 sm:px-6" aria-labelledby="cards-title">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="cards-title" className="font-display text-lg font-bold">
            {t(lang, 'cards')} · {level.title[lang]}{' '}
            <span className="font-pixel text-xl text-maroon">
              {level.cards.filter((c) => found.has(c.id)).length}/{level.cards.length}
            </span>
          </h2>
          {level.cards.some((c) => !found.has(c.id)) && <p className="text-xs font-semibold text-ink/70">{t(lang, 'unlockHint')}</p>}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {level.cards.map((card) =>
            found.has(card.id) ? (
              <li
                key={card.term}
                className={`pixel-shadow rounded-lg border-2 border-ink bg-white p-3 ${fresh === card.id ? 'card-in ring-4 ring-amber' : ''}`}
              >
                <div className="text-2xl" aria-hidden="true">{card.icon}</div>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="font-pixel text-xl leading-none text-tosca">{card.term}</span>
                  <span
                    className="whitespace-nowrap text-base leading-none"
                    role="img"
                    aria-label={t(lang, 'starsLabel', { n: stars[card.id] ?? 0 })}
                  >
                    {Array.from({ length: MAX_STARS }, (_, i) => (
                      <span key={i} className={i < (stars[card.id] ?? 0) ? 'text-gold' : 'text-ink/15'}>
                        ★
                      </span>
                    ))}
                  </span>
                </div>
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

/** Mission steps for the current level, a progress bar, and the level's badges. */
function StagePanel({ lang, level, done, current, badges }: { lang: Lang; level: Level; done: string[]; current: string; badges: Set<string> }) {
  const main = level.stages.filter((st) => !st.bonus)
  const mainDone = main.filter((st) => done.includes(st.id)).length
  const stage = level.stages.find((st) => st.id === current)!
  let n = 0
  return (
    <div className="rounded-lg border-2 border-ink bg-amber/30 p-4">
      <ol className="flex flex-wrap gap-1.5" aria-label={t(lang, 'goal')}>
        {level.stages.map((st) => {
          const label = st.bonus ? `⭐ ${t(lang, 'bonusLabel')}` : t(lang, 'stageLabel', { n: ++n })
          const isDone = done.includes(st.id)
          const isCurrent = st.id === current && !isDone
          return (
            <li
              key={st.id}
              aria-current={isCurrent ? 'step' : undefined}
              className={`rounded border-2 px-2 py-0.5 text-[10px] font-bold uppercase ${
                isDone ? 'border-ink bg-tosca text-white' : isCurrent ? 'border-ink bg-white' : 'border-ink/30 text-ink/50'
              }`}
            >
              {isDone ? '✓ ' : isCurrent ? '▸ ' : ''}
              {label}
            </li>
          )
        })}
      </ol>
      <div className="mt-2 h-2 overflow-hidden rounded-full border-2 border-ink bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={main.length} aria-valuenow={mainDone}>
        <div className="h-full bg-tosca transition-all duration-700" style={{ width: `${(mainDone / main.length) * 100}%` }} />
      </div>
      <h2 className="mt-3 font-pixel text-xl leading-none">
        {stage.bonus ? '⭐ ' : ''}
        {t(lang, stage.titleKey)}
      </h2>
      <p className="mt-1 font-sans text-sm leading-relaxed">{t(lang, stage.missionKey)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-bold uppercase tracking-wider">{t(lang, 'badges')}</span>
        {level.achievements.map((a) => {
          const got = badges.has(`${level.id}:${a.id}`)
          return (
            <span
              key={a.id}
              title={`${t(lang, a.titleKey)}: ${got ? t(lang, a.descKey) : t(lang, 'badgeLocked')}`}
              aria-label={`${t(lang, a.titleKey)}${got ? '' : ` (${t(lang, 'badgeLocked')})`}`}
              className={`flex h-7 w-7 items-center justify-center rounded border-2 text-base ${got ? 'border-ink bg-white' : 'border-ink/20 bg-white/40 grayscale opacity-40'}`}
            >
              {a.icon}
            </span>
          )
        })}
      </div>
    </div>
  )
}
