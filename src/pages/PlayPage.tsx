import { useCallback, useEffect, useRef, useState } from 'react'
import BlockEditor, { type BlockEditorHandle } from '../components/BlockEditor'
import Stage, { type StageHandle } from '../components/Stage'
import HintBubble from '../components/HintBubble'
import QuizModal from '../components/QuizModal'
import NotebookToast, { type NotebookEntry } from '../components/NotebookToast'
import LevelCompleteModal from '../components/LevelCompleteModal'
import type { Milestones } from '../game/types'
import { t, type CardId, type Key, type Lang } from '../i18n'
import { MAX_REPEATS, type Hint } from '../hints'
import { LEVELS, UPCOMING, levelById, type SessionId } from '../levels'
import type { Session } from '../levels/types'
import { EVERY_CARD, store } from '../store'
import { useLang } from '../lang'
import { useRoute } from '../router'
import { MAX_STARS, pickQuestion, shouldQuiz, type Question, type RunContext } from '../quiz/questions'

type LogLine = { text: string; tone: 'info' | 'good' | 'bad' }

const MAX_CARDS_PER_RUN = 2
/** How long a scene pauses on a term it just put in the notebook. */
const TERM_PAUSE_MS = 2200
type StagesDone = Record<string, string[]>

/** The stage to play: the first main stage not done, then the bonus. */
function currentStage(level: Session, done: string[]) {
  return (
    level.puzzles.find((s) => !s.bonus && !done.includes(s.id)) ??
    level.puzzles.find((s) => s.bonus && !done.includes(s.id)) ??
    level.puzzles[level.puzzles.length - 1]
  )
}

interface Toast {
  id: number
  icon: string
  title: string
  body: string
}
type Stars = Partial<Record<CardId, number>>


const initial = store.load()

export default function PlayPage() {
  const { lang, setLang } = useLang()
  const [log, setLog] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)
  const [found, setFound] = useState(() => new Set<CardId>(initial.cards))
  const [passed, setPassed] = useState(() => new Set<string>(initial.passed))
  const [levelId, setLevelId] = useState<SessionId>(() => {
    const saved = initial.lastSession
    return saved && LEVELS.some((l) => l.id === saved) ? (saved as SessionId) : 'train'
  })
  const level = levelById(levelId)
  const [stagesDone, setStagesDone] = useState<StagesDone>(() => initial.puzzlesDone)
  const done = stagesDone[levelId] ?? []
  const stage = currentStage(level, done)
  const [badges, setBadges] = useState<Set<string>>(() => new Set(initial.badges))
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const runButton = useRef<HTMLButtonElement>(null)
  /** Which level just finished, for the level-complete card. */
  const [levelDone, setLevelDone] = useState<SessionId | null>(null)
  const [entry, setEntry] = useState<NotebookEntry | null>(null)
  // Resolves the scene's brief pause on a new term, if one is waiting.
  const releasePause = useRef<(() => void) | null>(null)
  const { navigate } = useRoute()
  // The scene asks "is this card new?" mid-run, so it reads a ref, not state.
  const foundRef = useRef(found)
  const [stars, setStars] = useState<Stars>(() => initial.stars)
  const [quiz, setQuiz] = useState<Question | null>(null)
  const lastRun = useRef<RunContext | null>(null)
  const quizzedLastRun = useRef(false)
  const showedNewCard = useRef(false)
  const [hint, setHint] = useState<Hint | null>(null)
  // The same hint shown run after run means the player is ignoring it.
  const hintStreak = useRef<{ key: string; n: number }>({ key: '', n: 0 })
  const editor = useRef<BlockEditorHandle>(null)
  const stageView = useRef<StageHandle>(null)
  // Start from a random seed, so a fresh page doesn't replay the same "random" run.
  const seed = useRef(Math.floor(Math.random() * 1_000_000) + 1)
  // Bumped by Reset, so a run that was stopped doesn't report a result.
  const runToken = useRef(0)
  const logBox = useRef<HTMLUListElement>(null)

  // Keep the newest log line in view. Scroll only the log box, not the page.
  useEffect(() => {
    const box = logBox.current
    if (box) box.scrollTop = box.scrollHeight
  }, [log])

  const discover = (id: CardId, vars?: Record<string, string | number>) => {
    if (foundRef.current.has(id)) return
    const next = new Set(foundRef.current).add(id)
    foundRef.current = next
    setFound(next)
    const progress = store.load()
    store.save({ cards: [...next], moments: vars ? { ...progress.moments, [id]: vars } : progress.moments })
  }

  const stageCelebrate = () => stageView.current?.celebrate()

  const pushToast = (icon: string, title: string, body: string) => {
    const id = ++toastId.current
    setToasts((ts) => [...ts, { id, icon, title, body }])
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200)
  }

  /**
   * Puts a new term in the notebook and shows it over the log. The run
   * doesn't wait for the player: the scene pauses on the highlighted part
   * for a moment, or until the entry is closed.
   */
  const showCard = (id: CardId, vars: Record<string, string | number> = {}) =>
    new Promise<void>((resolve) => {
      const card = EVERY_CARD.find((c) => c.id === id)!
      showedNewCard.current = true
      discover(id, vars)
      setEntry({ card, vars })
      const done = () => {
        window.clearTimeout(timer)
        if (releasePause.current === done) releasePause.current = null
        resolve()
      }
      const timer = window.setTimeout(done, TERM_PAUSE_MS)
      releasePause.current = done
    })

  const closeEntry = () => {
    setEntry(null)
    releasePause.current?.()
  }

  // At most two new term cards per run; the rest wait for a later run.
  const cardsThisRun = useRef(0)
  const milestones: Milestones = {
    isNew: (id) => !foundRef.current.has(id) && cardsThisRun.current < MAX_CARDS_PER_RUN,
    show: (id, _side, vars) => {
      cardsThisRun.current++
      return showCard(id, vars)
    },
  }

  const openQuiz = () => {
    const recent = store.load().quizRecent
    // Prefer questions about this level's terms, once the player has some.
    const here = new Set([...foundRef.current].filter((id) => level.cards.some((c) => c.id === id)))
    const q =
      (here.size >= 2 ? pickQuestion(here, stars, recent, lastRun.current, Math.random) : null) ??
      pickQuestion(foundRef.current, stars, recent, lastRun.current, Math.random)
    if (!q) return
    store.save({ quizRecent: [q.id, ...recent.filter((id) => id !== q.id)].slice(0, 6) })
    setQuiz(q)
  }

  const handleQuizAnswer = (correct: boolean) => {
    if (!correct || !quiz) return
    setStars((prev) => {
      const next = { ...prev }
      for (const id of quiz.terms) next[id] = Math.min(MAX_STARS, (next[id] ?? 0) + 1)
      store.save({ stars: next })
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

  const switchLang = (next: Lang) => setLang(next)

  const handleRun = async () => {
    const program = editor.current?.program() ?? null
    const loose = editor.current?.looseBlocks() ?? []
    setHint(null)
    if (program === null) {
      setLog([{ text: t(lang, 'logNoStart'), tone: 'bad' }])
      offerHint(level.hint(null, null, stage.id))
      return
    }
    if (level.isEmpty(program)) {
      setLog([{ text: t(lang, level.id === 'tree' ? 'logTreeEmpty' : 'logEmpty'), tone: 'bad' }])
      offerHint(loose.length ? { key: 'loose', target: { where: 'block', blockId: loose[0] } } : level.hint(program, null, stage.id))
      return
    }
    setRunning(true)
    setLog([])
    const token = ++runToken.current
    showedNewCard.current = false
    cardsThisRun.current = 0
    // A new seed each run, so every run looks a little different.
    const result = level.run(program, seed.current++, stage.id)
    await stageView.current?.play(result.events, (text, tone = 'info') => setLog((l) => [...l, { text, tone }]), milestones)
    if (token !== runToken.current) return
    if (result.context) lastRun.current = result.context
    if (loose.length) setLog((l) => [...l, { text: t(lang, 'logLoose'), tone: 'bad' }])

    const acc = Math.round((result.accuracy ?? 0) * 100)
    const stagePassed = stage.check(program, result)
    let levelDoneNow = false
    let demoNext: { blocks: object; messageKey: Key } | undefined

    // Badges for anything nice this run did
    const earned = level.badgeDefs.filter((a) => !badges.has(`${level.id}:${a.id}`) && a.check(program, result, stage, stagePassed))

    if (stagePassed) {
      // Mark this stage done, and any later stage this same run also clears.
      const nowDone = new Set(done).add(stage.id)
      const group = level.runGroup(stage.id)
      // A stage with a demo is never cleared in passing: the player should see
      // its problem first, so it waits until it's the current stage.
      for (const st of level.puzzles) {
        if (nowDone.has(st.id) || st.demo || level.runGroup(st.id) !== group) continue
        // Stop at the first stage this run can't clear, or that has a demo still to show
        if (!st.check(program, result)) {
          if (!st.bonus) break
          continue
        }
        nowDone.add(st.id)
      }
      // Badges for stages this run also cleared (like the bonus)
      for (const st of level.puzzles) {
        if (st === stage || !nowDone.has(st.id) || done.includes(st.id)) continue
        for (const a of level.badgeDefs) {
          if (!earned.includes(a) && !badges.has(`${level.id}:${a.id}`) && a.check(program, result, st, true)) earned.push(a)
        }
      }
      const doneList = [...nowDone]
      setStagesDone((prev) => {
        const next = { ...prev, [level.id]: doneList }
        store.save({ puzzlesDone: next })
        return next
      })
      for (const st of level.puzzles) {
        if (nowDone.has(st.id) && !done.includes(st.id)) setLog((l) => [...l, { text: `✓ ${t(lang, 'stageDone', { title: t(lang, st.titleKey) })}`, tone: 'good' }])
      }
      const mainDone = level.puzzles.every((st) => st.bonus || nowDone.has(st.id))
      const wasMainDone = level.puzzles.every((st) => st.bonus || done.includes(st.id))
      if (mainDone && !wasMainDone) {
        // The whole mission is complete
        setLog((l) => [...l, { text: `${t(lang, 'winTitle')} ${t(lang, level.winKey, { acc })}`, tone: 'good' }])
        stageCelebrate()
        if (!foundRef.current.has(level.winCard)) await showCard(level.winCard)
        if (!passed.has(level.id)) {
          const next = new Set(passed).add(level.id)
          setPassed(next)
          store.save({ passed: [...next] })
          const nextIndex = LEVELS.findIndex((l) => l.id === level.id) + 1
          if (nextIndex < LEVELS.length) setLog((l) => [...l, { text: t(lang, 'levelUnlocked', { n: nextIndex + 1 }), tone: 'good' }])
        }
        if (level.puzzles.some((st) => st.bonus && !nowDone.has(st.id))) setLog((l) => [...l, { text: t(lang, 'bonusOpen'), tone: 'info' }])
        else setLog((l) => [...l, { text: `${t(lang, 'bonusToo')} ${t(lang, 'allDone')}`, tone: 'good' }])
        levelDoneNow = true
      } else {
        stageCelebrate()
        const upcoming = currentStage(level, doneList)
        const gotBonus = level.puzzles.some((st) => st.bonus && nowDone.has(st.id) && !done.includes(st.id) && st !== stage)
        if (gotBonus) setLog((l) => [...l, { text: t(lang, 'bonusToo'), tone: 'good' }])
        if (!nowDone.has(upcoming.id)) {
          setLog((l) => [...l, { text: t(lang, 'stageNext', { title: t(lang, upcoming.titleKey) }), tone: 'info' }])
          if (upcoming.demo) demoNext = upcoming.demo
        } else if (stage.bonus) setLog((l) => [...l, { text: t(lang, 'allDone'), tone: 'good' }])
      }
    } else {
      const fail = stage.failKey(program, result)
      if (fail) setLog((l) => [...l, { text: t(lang, fail, { acc }), tone: 'bad' }])
    }
    // Badge toasts come last, after any win card, so they aren't missed.
    // Several at once become one toast.
    if (earned.length) {
      const next = new Set(badges)
      for (const a of earned) next.add(`${level.id}:${a.id}`)
      if (earned.length === 1) pushToast(earned[0].icon, t(lang, earned[0].titleKey), t(lang, earned[0].descKey))
      else pushToast(earned.map((a) => a.icon).join(''), t(lang, 'newBadges', { n: earned.length }), earned.map((a) => t(lang, a.titleKey)).join(' · '))
      setBadges(next)
      store.save({ badges: [...next] })
    }
    setRunning(false)

    if (levelDoneNow) {
      for (const c of level.cards) if (!foundRef.current.has(c.id)) discover(c.id)
      setLevelDone(level.id)
      return
    }
    // A new stage whose lesson is easy to miss starts by playing the problem once.
    if (demoNext) {
      const demo = demoNext
      window.setTimeout(() => {
        // Blockly's loader wants the blocks wrapped in { blocks: … }
        editor.current?.loadBlocks({ blocks: demo.blocks })
        setLog([{ text: t(lang, demo.messageKey), tone: 'info' }])
        window.setTimeout(() => runButton.current?.click(), 900)
      }, earned.length ? 1800 : 900)
      return
    }

    // A failed run gets one pointer at what to change. A run with a hint
    // skips the quiz, so the player isn't handed two things at once.
    const hinted = offerHint(
      stagePassed ? null : loose.length ? { key: 'loose', target: { where: 'block', blockId: loose[0] } } : level.hint(program, result, stage.id),
    )
    // Now and then, a quick question about terms the player already knows.
    const quizNow = !hinted && shouldQuiz({
      foundCount: foundRef.current.size,
      showedNewCard: showedNewCard.current,
      quizzedLastRun: quizzedLastRun.current,
      roll: Math.random(),
    })
    quizzedLastRun.current = quizNow
    // After any badge toast has had its moment
    if (quizNow) window.setTimeout(openQuiz, earned.length ? 4400 : 900)
  }

  /** A level is open once the one before it is passed. */
  const isUnlocked = (index: number) => index === 0 || passed.has(LEVELS[index - 1].id)

  const switchLevel = (id: SessionId) => {
    if (id === levelId) return
    handleReset()
    setHint(null)
    setLevelId(id)
    store.save({ lastSession: id })
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
    store.clear()
    const none = new Set<CardId>()
    foundRef.current = none
    setFound(none)
    setEntry(null)
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
    closeEntry()
    stageView.current?.reset()
    setLog(running ? [{ text: t(lang, 'logStopped'), tone: 'info' }] : [])
    setRunning(false)
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-cream/90 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="pixel-shadow flex h-10 w-10 items-center justify-center rounded border-2 border-ink bg-tosca type-pixel text-white">
            KK
          </div>
          <div>
            <h1 className="type-heading">Kotakata</h1>
            <p className="mt-1 type-micro text-maroon">{t(lang, 'tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded border-2 border-ink type-label" role="group" aria-label="Language">
            {(['id', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                disabled={running}
                aria-pressed={lang === l}
                className={`px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${lang === l ? 'bg-ink text-cream' : 'bg-white hover:bg-amber/30'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              onClick={() => setConfirmStartOver((v) => !v)}
              aria-expanded={confirmStartOver}
              className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-label hover:bg-amber/30"
            >
              {t(lang, 'startOver')}
            </button>
            {confirmStartOver && (
              <div role="alertdialog" aria-labelledby="start-over-text" className="card-in absolute right-0 top-full z-modal mt-2 w-72 rounded-lg border-2 border-ink bg-white p-3 shadow-pixel">
                <p id="start-over-text" className="type-caption">{t(lang, 'startOverConfirm')}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button autoFocus onClick={() => setConfirmStartOver(false)} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-label">
                    {t(lang, 'cancel')}
                  </button>
                  <button onClick={startOver} className="pixel-btn rounded border-2 border-ink bg-maroon px-3 py-1.5 type-label text-white">
                    {t(lang, 'startOverYes')}
                  </button>
                </div>
              </div>
            )}
          </div>
          <a href="https://aastr.id" className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-label hover:bg-amber/30">
            {t(lang, 'back')}
          </a>
        </div>
      </header>

      <p className="border-b-2 border-ink bg-amber/40 px-4 py-2 text-center type-label md:hidden">{t(lang, 'smallScreen')}</p>

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:grid-cols-[176px_minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Level list: a row across the top until there's room for a column */}
        <nav aria-label={t(lang, 'levels')} className="space-y-2 lg:col-span-2 xl:col-span-1">
          <h2 className="type-eyebrow text-ink/70">{t(lang, 'levels')}</h2>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-1">
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
                    className={`w-full rounded border-2 border-ink px-3 py-2 text-left disabled:cursor-not-allowed ${
                      current
                        ? 'pixel-shadow bg-tosca text-white'
                        : open
                          ? 'bg-white hover:bg-amber/30 disabled:opacity-50 disabled:hover:bg-white'
                          : 'bg-parchment text-ink/60'
                    }`}
                  >
                    <div className="type-pixel-sm">
                      {i + 1}. {lv.title[lang]} {passed.has(lv.id) && '✓'}
                    </div>
                    <div className="mt-1 type-eyebrow">{open ? lv.topic[lang] : `🔒 ${t(lang, 'levelLocked')}`}</div>
                  </button>
                </li>
              )
            })}
            {UPCOMING.map((lv, i) => (
              <li key={lv.title.en}>
                <div className="rounded border-2 border-ink bg-parchment px-3 py-2 text-ink/60">
                  <div className="type-pixel-sm">
                    {LEVELS.length + i + 1}. {lv.title[lang]}
                  </div>
                  <div className="mt-1 type-eyebrow">🔒 {t(lang, 'comingSoon')}</div>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Block editor */}
        <section className="pixel-shadow flex min-h-[420px] flex-col overflow-hidden rounded-lg border-2 border-ink bg-white lg:min-h-0">
          <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-3 py-2 type-label text-cream">
            <span className="truncate">▸ {t(lang, level.fileKey)}.blocks</span>
            <span className="ml-2 truncate text-amber" title={level.topic[lang]}>
              {level.topic[lang]}
            </span>
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
            <Stage key={level.id} lang={lang} level={level} ref={stageView} />
          </div>

          <div data-hint-avoid className="sticky bottom-0 z-float -mx-1 flex items-center gap-2 bg-cream/90 px-1 py-2 sm:gap-3 lg:static lg:bg-transparent lg:py-0">
            <button
              ref={runButton}
              onClick={handleRun}
              disabled={running}
              className="pixel-btn whitespace-nowrap rounded border-2 border-ink bg-maroon px-4 py-3 type-button-lg text-white"
            >
              {running ? t(lang, 'running') : t(lang, 'run')}
            </button>
            <button
              onClick={handleReset}
              title={running ? undefined : t(lang, 'clearTitle')}
              className="pixel-btn whitespace-nowrap rounded border-2 border-ink bg-white px-3 py-3 type-button-lg"
            >
              {running ? t(lang, 'stop') : t(lang, 'clear')}
            </button>
            {found.size >= 2 && (
              <button
                onClick={openQuiz}
                disabled={running}
                className="pixel-btn ml-auto whitespace-nowrap rounded border-2 border-ink bg-amber px-3 py-3 type-button-lg"
              >
                {t(lang, 'quizMe')}
              </button>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <StagePanel
              lang={lang}
              level={level}
              done={done}
              current={stage.id}
              badges={badges}
              cardCount={found.size}
              onCards={() => navigate('/buku')}
            />
            <div className="relative rounded-lg border-2 border-ink bg-ink p-4 text-cream" aria-live="polite">
              <h2 className="type-eyebrow text-amber">{t(lang, 'log')}</h2>
              <ul ref={logBox} className="mt-1.5 max-h-40 space-y-1 overflow-y-auto type-mono">
                {log.map((line, i) => (
                  <li key={i} className={line.tone === 'good' ? 'text-tosca-light' : line.tone === 'bad' ? 'text-maroon-tint' : ''}>
                    › {line.text}
                  </li>
                ))}
              </ul>
              {/* New terms land over the log, never over the stage */}
              {entry && <NotebookToast key={entry.card.id} entry={entry} lang={lang} onOpenNotebook={() => navigate('/buku')} onClose={closeEntry} />}
            </div>
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed right-4 top-20 z-toast flex w-72 flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="card-in flex items-start gap-3 rounded-lg border-2 border-ink bg-amber p-3 shadow-pixel">
            <span className="badge-pop text-icon-lg" aria-hidden="true">
              {toast.icon}
            </span>
            <div>
              <div className="type-eyebrow">🏅 {t(lang, 'newBadge')}</div>
              <div className="type-pixel-sm">{toast.title}</div>
              <p className="mt-0.5 type-caption">{toast.body}</p>
            </div>
          </div>
        ))}
      </div>

      {hint && !quiz && !running && (
        <HintBubble key={hint.key} hint={hint} lang={lang} locate={locateHint} onClose={() => setHint(null)} />
      )}

      {levelDone && (
        <LevelCompleteModal
          lang={lang}
          levelId={levelDone}
          found={found}
          badges={badges}
          allDone={LEVELS.every((l) => passed.has(l.id) || l.id === levelDone)}
          onNext={(id) => {
            setLevelDone(null)
            switchLevel(id)
          }}
          onClose={() => setLevelDone(null)}
        />
      )}

      {quiz && (
        <QuizModal
          key={quiz.id}
          question={quiz}
          lang={lang}
          maxed={(id) => (stars[id] ?? 0) >= MAX_STARS}
          onAnswer={handleQuizAnswer}
          explain={EVERY_CARD.find((c) => c.id === quiz.terms[0])?.body[lang] ?? ''}
          onClose={() => setQuiz(null)}
        />
      )}

    </div>
  )
}

/** Mission steps for the current level, a progress bar, and the level's badges. */
function StagePanel({
  lang,
  level,
  done,
  current,
  badges,
  cardCount,
  onCards,
}: {
  lang: Lang
  level: Session
  done: string[]
  current: string
  badges: Set<string>
  cardCount: number
  onCards: () => void
}) {
  const main = level.puzzles.filter((st) => !st.bonus)
  const mainDone = main.filter((st) => done.includes(st.id)).length
  const stage = level.puzzles.find((st) => st.id === current)!
  let n = 0
  return (
    <div className="rounded-lg border-2 border-ink bg-amber/30 p-4">
      <ol className="flex flex-wrap gap-1.5" aria-label={t(lang, 'goal')}>
        {level.puzzles.map((st) => {
          const label = st.bonus ? `⭐ ${t(lang, 'bonusLabel')}` : t(lang, 'stageLabel', { n: ++n })
          const isDone = done.includes(st.id)
          const isCurrent = st.id === current && !isDone
          return (
            <li
              key={st.id}
              aria-current={isCurrent ? 'step' : undefined}
              className={`rounded border-2 px-2 py-0.5 type-eyebrow ${
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
      <h2 className="mt-3 type-pixel-sm">
        {stage.bonus ? '⭐ ' : ''}
        {t(lang, stage.titleKey)}
      </h2>
      <p className="mt-1 type-body">{t(lang, stage.missionKey)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 type-eyebrow">{t(lang, 'badges')}</span>
        {level.badgeDefs.map((a) => {
          const got = badges.has(`${level.id}:${a.id}`)
          return (
            <span
              key={a.id}
              title={`${t(lang, a.titleKey)}: ${got ? t(lang, a.descKey) : t(lang, 'badgeLocked')}`}
              aria-label={`${t(lang, a.titleKey)}${got ? '' : ` (${t(lang, 'badgeLocked')})`}`}
              className={`flex h-7 w-7 items-center justify-center rounded border-2 text-icon-sm ${got ? 'border-ink bg-white' : 'border-ink/20 bg-white/40 grayscale opacity-40'}`}
            >
              {a.icon}
            </span>
          )
        })}
        <button onClick={onCards} className="ml-auto whitespace-nowrap type-micro underline hover:text-maroon">
          {t(lang, 'cardsButton', { n: cardCount })} →
        </button>
      </div>
    </div>
  )
}
