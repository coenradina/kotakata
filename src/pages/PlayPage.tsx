import { useCallback, useEffect, useRef, useState } from 'react'
import BlockEditor, { type BlockEditorHandle } from '../components/BlockEditor'
import Stage, { type StageHandle } from '../components/Stage'
import HintBubble from '../components/HintBubble'
import QuizModal from '../components/QuizModal'
import NotebookToast, { type NotebookEntry } from '../components/NotebookToast'
import LevelCompleteModal from '../components/LevelCompleteModal'
import type { Milestones } from '../game/types'
import { t, type CardId, type Lang } from '../i18n'
import { MAX_REPEATS, ladderHint, rungFor, type Hint } from '../hints'
import { levelById, numberOf, trackOf, type SessionId } from '../levels'
import { PLANNED } from '../sessions/catalog'
import type { Prediction, Puzzle, Session } from '../levels/types'
import { EVERY_CARD, store } from '../store'
import { useLang } from '../lang'
import { Link, useRoute } from '../router'
import { MAX_STARS, pickQuestion, type Question, type RunContext } from '../quiz/questions'
import PredictionCard from '../components/PredictionCard'
import MissionBar from '../components/MissionBar'
import SessionIntro from '../components/SessionIntro'
import Tour, { type TourStep } from '../components/Tour'
import { LangSwitch } from '../components/SiteHeader'
import { track } from '../impact/track'

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

export default function PlayPage({ sessionId }: { sessionId: string }) {
  const { lang, setLang } = useLang()
  // Before the first run, Kata says what to do, so the log is never an empty box.
  const [log, setLog] = useState<LogLine[]>(() => [{ text: t(lang, 'kataReady'), tone: 'info' }])
  const [running, setRunning] = useState(false)
  const [found, setFound] = useState(() => new Set<CardId>(initial.cards))
  const [passed, setPassed] = useState(() => new Set<string>(initial.passed))
  // The route says which session; the router only sends ids that exist.
  const levelId = sessionId as SessionId
  const level = levelById(levelId)
  // The list this session belongs to: the new sessions, or the classic levels.
  const { list: TRACK, track: trackName } = trackOf(levelId)
  useEffect(() => store.save({ lastSession: levelId }), [levelId])
  const [stagesDone, setStagesDone] = useState<StagesDone>(() => initial.puzzlesDone)
  const done = stagesDone[levelId] ?? []
  const stage = currentStage(level, done)
  const [badges, setBadges] = useState<Set<string>>(() => new Set(initial.badges))
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const runButton = useRef<HTMLButtonElement>(null)
  // Set just before the app runs a stage's demo itself, so it skips the guess.
  const demoRun = useRef(false)
  /** Guesses per puzzle (`session:puzzle`), and what each puzzle's first guessed run showed. */
  const [guesses, setGuesses] = useState<Record<string, { choice: number | null; outcome?: number | null }>>({})
  /** Runs per puzzle, for impact data. */
  const runsOn = useRef<Record<string, number>>({})
  /** Failed runs per puzzle since it was last passed: they set the hint rung. */
  const failsOn = useRef<Record<string, number>>({})
  /** The strongest hint rung each puzzle has shown, for impact data. */
  const rungOn = useRef<Record<string, 0 | 1 | 2 | 3>>({})
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
    // A stronger rung counts as a new hint, so it always gets shown.
    const key = `${next.key}:${next.rung ?? 0}`
    const n = streak.key === key ? streak.n + 1 : 1
    hintStreak.current = { key, n }
    if (n > MAX_REPEATS) return false
    setHint(next)
    return true
  }

  const locateHint = useCallback(
    (reveal: boolean) => {
      if (!hint) return null
      if (hint.target.where === 'element') return document.querySelector(`[data-hint-anchor="${hint.target.id}"]`)?.getBoundingClientRect() ?? null
      return editor.current?.locate(hint.target, reveal) ?? null
    },
    [hint],
  )

  const switchLang = (next: Lang) => setLang(next)

  const puzzleKey = `${level.id}:${stage.id}`
  const guess = guesses[puzzleKey]
  const mustGuess = Boolean(stage.prediction) && (guess?.choice ?? null) === null

  const handleRun = async () => {
    const demo = demoRun.current
    demoRun.current = false
    if (mustGuess && !demo) {
      setLog([{ text: t(lang, 'predictNeed'), tone: 'info' }])
      return
    }
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
    cardsThisRun.current = 0
    // A new seed each run, so every run looks a little different.
    const result = level.run(program, seed.current++, stage.id, lang)
    await stageView.current?.play(result.events, (text, tone = 'info') => setLog((l) => [...l, { text, tone }]), milestones)
    if (token !== runToken.current) return
    if (result.context) lastRun.current = result.context
    if (loose.length) setLog((l) => [...l, { text: t(lang, 'logLoose'), tone: 'bad' }])

    const acc = Math.round((result.accuracy ?? 0) * 100)
    const stagePassed = stage.check(program, result)

    // The first real run after a guess answers it.
    const answering = !demo && stage.prediction && guess && guess.choice !== null && guess.outcome === undefined
    const outcome = answering ? stage.prediction!.outcome(program, result) : null
    if (answering) setGuesses((g) => ({ ...g, [puzzleKey]: { choice: guess.choice, outcome } }))
    if (!demo) {
      const n = (runsOn.current[puzzleKey] ?? 0) + 1
      runsOn.current[puzzleKey] = n
      const hint = rungOn.current[puzzleKey] ?? 0
      track({ t: 'run', session: level.id, puzzle: stage.id, n, passed: stagePassed, prediction: answering ? guess.choice : null, outcome, hint })
      if (stagePassed) track({ t: 'puzzle_pass', session: level.id, puzzle: stage.id, runs: n, hint })
    }
    let levelDoneNow = false
    let demoNext: NonNullable<Puzzle<unknown>["demo"]> | undefined

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
          const nextIndex = TRACK.findIndex((l) => l.id === level.id) + 1
          if (trackName === 'classic' && nextIndex < TRACK.length) setLog((l) => [...l, { text: t(lang, 'levelUnlocked', { n: nextIndex + 1 }), tone: 'good' }])
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
      if (fail) setLog((l) => [...l, { text: t(lang, fail, { acc, ...stage.failVars?.(program, result) }), tone: 'bad' }])
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
        editor.current?.loadBlocks({ blocks: typeof demo.blocks === 'function' ? demo.blocks(lang) : demo.blocks })
        setLog([{ text: t(lang, demo.messageKey), tone: 'info' }])
        if (demo.autoRun === false) return
        window.setTimeout(() => {
          demoRun.current = true
          runButton.current?.click()
        }, 900)
      }, earned.length ? 1800 : 900)
      return
    }

    // A failed run gets one hint, stronger the longer the player is stuck.
    // The quiz no longer pops up by itself: guesses before runs do that job.
    if (demo) return
    if (stagePassed) {
      failsOn.current[puzzleKey] = 0
      offerHint(null)
      return
    }
    if (loose.length) {
      offerHint({ key: 'loose', target: { where: 'block', blockId: loose[0] } })
      return
    }
    const fails = (failsOn.current[puzzleKey] ?? 0) + 1
    failsOn.current[puzzleKey] = fails
    const next = ladderHint(rungFor(fails), stage, level.hint(program, result, stage.id))
    if (offerHint(next) && next.rung) rungOn.current[puzzleKey] = Math.max(rungOn.current[puzzleKey] ?? 0, next.rung) as 1 | 2 | 3
  }


  const switchLevel = (id: SessionId) => {
    if (id === levelId) return
    handleReset()
    setHint(null)
    navigate(`/main/${id}`)
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
  const [menuOpen, setMenuOpen] = useState(false)

  // First visit to a session: say what it's about before any blocks, then offer the tour once.
  const [showIntro, setShowIntro] = useState(() => !initial.introSeen.includes(levelId))
  const [tourSeen, setTourSeen] = useState(() => initial.tourDone)
  const [touring, setTouring] = useState(false)
  useEffect(() => {
    if (!store.load().introSeen.includes(levelId)) setShowIntro(true)
  }, [levelId])
  const closeIntro = useCallback(() => {
    setShowIntro(false)
    const seen = store.load().introSeen
    if (!seen.includes(levelId)) store.save({ introSeen: [...seen, levelId] })
  }, [levelId])
  const finishTour = useCallback(() => {
    setTouring(false)
    setTourSeen(true)
    store.save({ tourDone: true })
  }, [])

  // When the stage changes, the mission bar says so for a moment, so the new task gets read.
  const [freshStage, setFreshStage] = useState(false)
  const shownStage = useRef(`${levelId}:${stage.id}`)
  useEffect(() => {
    const key = `${levelId}:${stage.id}`
    if (shownStage.current === key) return
    const sameSession = shownStage.current.startsWith(`${levelId}:`)
    shownStage.current = key
    if (!sameSession) return
    setFreshStage(true)
    const timer = window.setTimeout(() => setFreshStage(false), 3500)
    return () => window.clearTimeout(timer)
  }, [levelId, stage.id])

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
    hintStreak.current = { key: '', n: 0 }
    setGuesses({})
    runsOn.current = {}
    failsOn.current = {}
    rungOn.current = {}
    setPassed(new Set())
    setStagesDone({})
    setBadges(new Set())
    // Back to Level 1. Loading the starter blocks also saves them over the old program.
    if (levelId === 'train') editor.current?.resetToStarter()
    else navigate('/main/train')
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

  const intro = showIntro ? (
    <SessionIntro
      lang={lang}
      label={t(lang, trackName === 'sessions' ? 'introSession' : 'introLevel', { n: numberOf(levelId) })}
      title={level.title[lang]}
      goal={PLANNED.find((p) => p.id === levelId)?.bigQuestion[lang] ?? level.topic[lang]}
      stages={level.puzzles.filter((p) => !p.bonus).length}
      offerTour={!tourSeen}
      onTour={() => {
        closeIntro()
        setTouring(true)
      }}
      onPlay={closeIntro}
    />
  ) : null

  return (
    <div className="flex min-h-full flex-col">
      {/* A slim header: where you are, and a few tools. Everything else lives on the map or in the menu. */}
      <header className="flex flex-wrap items-center gap-2 border-b-2 border-ink bg-cream px-4 py-2 sm:gap-3 sm:px-6">
        <Link to="/main" className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
          ← {t(lang, 'navMap')}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="type-micro text-maroon">{t(lang, trackName === 'sessions' ? 'introSession' : 'introLevel', { n: numberOf(levelId) })}</p>
          <h1 className="truncate type-subheading">{level.title[lang]}</h1>
        </div>
        <Link to="/buku" className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment" title={t(lang, 'notebookTitle')}>
          📓 {found.size}
        </Link>
        <button onClick={() => setTouring(true)} disabled={running} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
          ? {t(lang, 'helpTour')}
        </button>
        <LangSwitch lang={lang} onChange={switchLang} disabled={running} />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={t(lang, 'moreMenu')}
            className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="card-in absolute right-0 top-full z-modal mt-2 w-72 rounded-lg border-2 border-ink bg-white p-2 shadow-pixel">
              {found.size >= 2 && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    openQuiz()
                  }}
                  disabled={running}
                  className="w-full rounded px-3 py-2 text-left type-button hover:bg-parchment"
                >
                  {t(lang, 'menuQuiz')}
                </button>
              )}
              {!confirmStartOver ? (
                <button onClick={() => setConfirmStartOver(true)} className="w-full rounded px-3 py-2 text-left type-button hover:bg-parchment">
                  {t(lang, 'startOver')}
                </button>
              ) : (
                <div role="alertdialog" aria-labelledby="start-over-text" className="space-y-3 p-2">
                  <p id="start-over-text" className="type-caption">{t(lang, 'startOverConfirm')}</p>
                  <div className="flex justify-end gap-2">
                    <button autoFocus onClick={() => setConfirmStartOver(false)} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-label">
                      {t(lang, 'cancel')}
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        startOver()
                      }}
                      className="pixel-btn rounded border-2 border-ink bg-maroon px-3 py-1.5 type-label text-white"
                    >
                      {t(lang, 'startOverYes')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <p className="border-b-2 border-ink bg-amber/40 px-4 py-2 text-center type-label md:hidden">{t(lang, 'smallScreen')}</p>

      {/* The task comes first, full width, where the eye lands. */}
      <div className="px-4 pt-4 sm:px-6">
        <MissionBar lang={lang} level={level} done={done} current={stage.id} fresh={freshStage} />
      </div>

      {/* Two things below it: the blocks, and Kata with the run button. */}
      <main className="grid flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section data-tour="editor" className="pixel-shadow flex min-h-[460px] flex-col overflow-hidden rounded-lg border-2 border-ink bg-white lg:min-h-0">
          <div className="relative min-h-[440px] flex-1">
            <div className="absolute inset-0">
              <BlockEditor
                lang={lang}
                level={level}
                puzzleId={stage.id}
                ref={editor}
                onEdit={() => {
                  setHint(null)
                  refreshPreview()
                }}
              />
            </div>
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          {/* Hints keep off the stage: it shows the result they're about. */}
          <div data-hint-avoid data-tour="stage" className="pixel-shadow overflow-hidden rounded-lg border-2 border-ink bg-cream">
            <Stage key={level.id} lang={lang} level={level} ref={stageView} />
          </div>

          {stage.prediction && (
            <PredictionCard
              key={puzzleKey}
              prediction={stage.prediction as Prediction<unknown>}
              lang={lang}
              choice={guess?.choice ?? null}
              outcome={guess?.outcome}
              disabled={running}
              onChoose={(choice) => setGuesses((g) => ({ ...g, [puzzleKey]: { choice } }))}
            />
          )}

          <div data-hint-avoid data-tour="run" className="sticky bottom-0 z-float -mx-1 flex items-center gap-2 bg-cream/90 px-1 py-2 sm:gap-3 lg:static lg:bg-transparent lg:py-0">
            <button
              ref={runButton}
              onClick={handleRun}
              disabled={running}
              aria-disabled={mustGuess || undefined}
              title={mustGuess ? t(lang, 'predictNeed') : undefined}
              className={`pixel-btn flex-1 whitespace-nowrap rounded border-2 border-ink bg-maroon px-4 py-3 type-button-lg text-white ${mustGuess ? 'opacity-50' : ''}`}
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
          </div>

          <div data-tour="log" className="relative min-h-28 rounded-lg border-2 border-ink bg-ink p-3 text-cream" aria-live="polite">
            <h2 className="type-eyebrow text-amber">🤖 {t(lang, 'kataSays')}</h2>
            <ul ref={logBox} className="mt-1.5 max-h-32 space-y-1 overflow-y-auto type-mono">
              {log.map((line, i) => (
                <li key={i} className={line.tone === 'good' ? 'text-tosca-light' : line.tone === 'bad' ? 'text-maroon-tint' : ''}>
                  › {line.text}
                </li>
              ))}
            </ul>
            {/* New terms land over Kata's log, under the stage, never over it */}
            {entry && <NotebookToast key={entry.card.id} entry={entry} lang={lang} onOpenNotebook={() => navigate('/buku')} onClose={closeEntry} />}
          </div>
        </section>
      </main>

      {/* Bottom left, over the block palette: away from the stage and the run controls */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-toast flex w-72 flex-col gap-2" aria-live="polite">
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

      {hint && !quiz && !running && !touring && !showIntro && (
        <HintBubble key={hint.key} hint={hint} lang={lang} locate={locateHint} onClose={() => setHint(null)} />
      )}

      {levelDone && (
        <LevelCompleteModal
          lang={lang}
          levelId={levelDone}
          found={found}
          badges={badges}
          allDone={trackName === 'classic' && TRACK.every((l) => passed.has(l.id) || l.id === levelDone)}
          onNext={(id) => {
            setLevelDone(null)
            switchLevel(id)
          }}
          onClose={() => setLevelDone(null)}
          onCertificate={(id) => navigate(`/sertifikat/${id}`)}
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

      {intro}
      {touring && <Tour steps={TOUR} lang={lang} onDone={finishTour} />}
    </div>
  )
}

/** The tour of the game screen: one part at a time, in the order a player uses them. */
const TOUR: TourStep[] = [
  { anchors: ['[data-tour="mission"]'], titleKey: 'tour1Title', bodyKey: 'tour1Body' },
  { anchors: ['[data-tour="editor"] .blocklyFlyout'], titleKey: 'tour2Title', bodyKey: 'tour2Body' },
  { anchors: ['[data-tour="editor"]'], titleKey: 'tour3Title', bodyKey: 'tour3Body' },
  { anchors: ['[data-tour="run"]'], titleKey: 'tour4Title', bodyKey: 'tour4Body' },
  { anchors: ['[data-tour="stage"]'], titleKey: 'tour5Title', bodyKey: 'tour5Body' },
  { anchors: ['[data-tour="log"]'], titleKey: 'tour6Title', bodyKey: 'tour6Body' },
]

