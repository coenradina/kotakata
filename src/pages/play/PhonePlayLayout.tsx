import { useEffect, useRef, useState } from 'react'
import BlockEditor from '../../components/BlockEditor'
import Stage from '../../components/Stage'
import HintBubble from '../../components/HintBubble'
import QuizModal from '../../components/QuizModal'
import TermMoment from '../../components/TermMoment'
import SpeedButton from '../../components/SpeedButton'
import LevelCompleteModal from '../../components/LevelCompleteModal'
import StageClearCard from '../../components/StageClearCard'
import BottomSheet from '../../components/BottomSheet'
import PredictionCard from '../../components/PredictionCard'
import MissionBar from '../../components/MissionBar'
import SessionIntro from '../../components/SessionIntro'
import Tour, { type TourStep } from '../../components/Tour'
import { LangSwitch } from '../../components/SiteHeader'
import { MISSION_ANCHOR } from '../../hints'
import { t } from '../../i18n'
import { numberOf } from '../../levels'
import type { Prediction } from '../../levels/types'
import { PLANNED } from '../../sessions/catalog'
import { EVERY_CARD } from '../../store'
import { Link } from '../../router'
import { MAX_STARS } from '../../quiz/questions'
import type { PlaySession } from './usePlaySession'

type View = 'build' | 'watch'
type Pill = { id: number; icon: string; text: string; tone: 'good' | 'bad' | 'info'; ms: number; action?: { label: string; run: () => void } }

/** How long a view takes to slide in; matches .view-in-* in index.css. */
const SLIDE_MS = 260

/** Room the bottom bar takes, so pills and sheets sit just above it. */
const BAR = 'calc(68px + env(safe-area-inset-bottom))'

/**
 * Phones (docs/plan/05-mobile-play.md, part B). The screen never scrolls.
 * Upright, the player builds or watches, one at a time, with Run in the
 * bottom bar. On its side, blocks and stage sit next to each other.
 */
export default function PhonePlayLayout({ s, landscape }: { s: PlaySession; landscape: boolean }) {
  const {
    lang,
    level,
    levelId,
    stage,
    done,
    found,
    badges,
    running,
    log,
    logBox,
    hint,
    setHint,
    quiz,
    stars,
    entry,
    closeEntry,
    cycleSpeed,
    firstIntro,
    outcome,
    speed,
    navigate,
    toasts,
    guess,
    mustGuess,
    puzzleKey,
    setGuesses,
    editor,
    stageView,
    runButton,
    handleRun,
    handleReset,
    handleQuizAnswer,
    refreshPreview,
    locateHint,
    levelDone,
    cleared,
    continueStage,
    setLevelDone,
    passed,
    TRACK,
    trackName,
    switchLevel,
    switchLang,
    menuOpen,
    setMenuOpen,
    openQuiz,
    showIntro,
    closeIntro,
    closeQuiz,
    tourSeen,
    touring,
    setTouring,
    finishTour,
    freshStage,
  } = s

  const [view, setView] = useState<View>('build')
  // The view sliding out while the other slides in.
  const [leaving, setLeaving] = useState<View | null>(null)
  const slideTimer = useRef(0)
  const viewRef = useRef(view)
  viewRef.current = view
  const goTo = (next: View) => {
    const from = viewRef.current
    if (next === from) return
    viewRef.current = next
    window.clearTimeout(slideTimer.current)
    setLeaving(from)
    setView(next)
    slideTimer.current = window.setTimeout(() => setLeaving(null), SLIDE_MS)
  }
  // A result the player hasn't looked at yet: the Result tab shows how it went.
  const [unseen, setUnseen] = useState(false)
  useEffect(() => {
    if (view === 'watch') setUnseen(false)
  }, [view])
  const [missionOpen, setMissionOpen] = useState(false)
  const [guessOpen, setGuessOpen] = useState(false)
  const [runAfterGuess, setRunAfterGuess] = useState(false)
  const [pills, setPills] = useState<Pill[]>([])
  // Full screen: the stage alone, turned sideways on an upright phone so it's as big as it can be.
  const [stageFull, setStageFull] = useState(false)
  useEffect(() => {
    // Phaser fits its canvas when the window resizes; tell it the stage box changed.
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
    return () => cancelAnimationFrame(id)
  }, [stageFull, landscape])
  useEffect(() => {
    if (!stageFull) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setStageFull(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stageFull])
  const pillId = useRef(0)
  const split = landscape

  const pushPill = (p: Omit<Pill, 'id' | 'ms'>, ms = 4000) => {
    const id = ++pillId.current
    setPills((ps) => [...ps, { ...p, id, ms }])
  }
  const dismissPill = (id: number) => setPills((ps) => ps.filter((x) => x.id !== id))

  // A new stage opens its mission once, so the new task gets read. It waits
  // its turn: after the run, its new words, the result and any badges.
  const seenMission = useRef<string | null>(null)
  const [missionPending, setMissionPending] = useState(false)
  useEffect(() => {
    if (seenMission.current === puzzleKey) return
    const first = seenMission.current === null
    seenMission.current = puzzleKey
    if (!first) setMissionPending(true)
  }, [puzzleKey])

  // Badges arrive as pills, one at a time.
  const shownToasts = useRef(new Set<number>())
  useEffect(() => {
    for (const toast of toasts) {
      if (shownToasts.current.has(toast.id)) continue
      shownToasts.current.add(toast.id)
      pushPill({ icon: toast.icon, text: `${t(lang, 'newBadge')}: ${toast.title}`, tone: 'good' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts])

  // When a run ends, a pill says how it went.
  const wasRunning = useRef(false)
  useEffect(() => {
    if (wasRunning.current && !running) {
      const last = [...log].reverse().find((l) => l.tone !== 'info') ?? log[log.length - 1]
      if (last) pushPill({ icon: last.tone === 'good' ? '✓' : last.tone === 'bad' ? '✗' : '🤖', text: last.text.replace(/^✓ /, ''), tone: last.tone }, 4500)
      if (view !== 'watch') setUnseen(true)
    }
    wasRunning.current = running
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // A hint about the blocks waits as a pill while the player watches; "Show me" goes back to the blocks.
  const pointsAtBlocks = hint !== null && hint.target.where !== 'element'
  useEffect(() => {
    if (!hint || !pointsAtBlocks || split || view === 'build') return
    pushPill({ icon: '💡', text: t(lang, 'phoneHintReady'), tone: 'info', action: { label: t(lang, 'phoneShow'), run: () => goTo('build') } }, 7000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hint])

  // A stage whose data shows before any run (the chat, the photos) says so
  // once, after its mission has been read: the preview sits on the Result
  // tab, out of sight while the player is on the blocks.
  const previewOffered = useRef<string | null>(null)
  useEffect(() => {
    if (!level.previewIsData || split || previewOffered.current === puzzleKey) return
    if (showIntro || touring || missionOpen || missionPending || cleared || running || view !== 'build') return
    previewOffered.current = puzzleKey
    pushPill({ icon: '👀', text: t(lang, 'phonePreviewReady'), tone: 'info', action: { label: t(lang, 'phonePeek'), run: () => goTo('watch') } }, 7000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleKey, showIntro, touring, missionOpen, missionPending, cleared, running, view, split])

  // Run: guess first if the stage asks, then watch.
  const run = () => {
    if (running) {
      handleReset()
      return
    }
    if (mustGuess) {
      setGuessOpen(true)
      return
    }
    goTo('watch')
    setHint(null)
    void handleRun()
  }
  useEffect(() => {
    if (runAfterGuess && !mustGuess) {
      setRunAfterGuess(false)
      goTo('watch')
      void handleRun()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAfterGuess, mustGuess])

  // The tour shows the blocks, so it starts there.
  useEffect(() => {
    if (!touring) return
    setView('build')
    setStageFull(false)
  }, [touring])
  // On the tour's Blocks/Result step, slide to Result and back once, so the player sees the motion.
  const tourDemo = useRef<number[]>([])
  const onTourStep = (i: number) => {
    tourDemo.current.forEach((id) => window.clearTimeout(id))
    if (split || i !== PHONE_TOUR.length - 1) return
    tourDemo.current = [window.setTimeout(() => goTo('watch'), 700), window.setTimeout(() => goTo('build'), 2000)]
  }

  const main = level.puzzles.filter((p) => !p.bonus)
  const n = main.findIndex((p) => p.id === stage.id) + 1
  const stepLabel = stage.bonus ? '⭐' : `${n}/${main.length}`
  const showBuild = split || view === 'build'
  const showWatch = split || view === 'watch'
  /** Blocks sits left of Result: the view coming in slides from its side, the one leaving slides out the other way. */
  const paneClass = (pane: View) => {
    if (split) return ''
    const fromLeft = pane === 'build'
    if (view === pane) return leaving ? (fromLeft ? 'view-in-left' : 'view-in-right') : ''
    if (leaving === pane) return fromLeft ? 'view-out-left' : 'view-out-right'
    return 'invisible'
  }

  const runButtonEl = (
    <button
      ref={runButton}
      onClick={run}
      aria-haspopup={mustGuess ? 'dialog' : undefined}
      data-hint-avoid
      data-tour="run"
      className={`pixel-btn flex min-h-12 flex-1 items-center justify-center whitespace-nowrap rounded border-2 border-ink bg-maroon px-4 py-2 type-button-lg text-white ${mustGuess ? 'opacity-80' : ''}`}
    >
      {running ? t(lang, 'stop') : t(lang, 'run')}
    </button>
  )

  const tab = (id: View, icon: string, label: string) => (
    <button
      role="tab"
      aria-selected={view === id}
      onClick={() => goTo(id)}
      className={`relative z-raised flex min-h-11 w-20 flex-col items-center justify-center rounded px-1 type-label ${view === id ? 'text-ink' : 'text-ink-soft'}`}
    >
      <span className="text-icon" aria-hidden="true">
        {icon}
      </span>
      {label}
      {id === 'watch' && unseen && outcome && (
        <span
          className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink type-micro ${outcome === 'pass' ? 'bg-tosca-light' : 'bg-maroon-tint'}`}
          aria-label={t(lang, 'phoneResultNew')}
        >
          {outcome === 'pass' ? '✓' : '✗'}
        </span>
      )}
    </button>
  )

  const hintReady = Boolean(hint && !quiz && !running && !touring && !showIntro && !missionOpen && !entry && !levelDone && !missionPending)
  const inlineHint = hintReady && !split && !pointsAtBlocks && view === 'watch'

  // One thing at a time: a pill waits while a card, sheet or new word is open,
  // and its clock only starts once it is on screen.
  const busy = Boolean(entry || levelDone || cleared || quiz || missionOpen || guessOpen || touring || showIntro || stageFull)
  const pill = !busy && !(hint && !pointsAtBlocks) ? pills[0] : undefined
  useEffect(() => {
    if (!pill) return
    // A new stage's mission is waiting, so pills keep it short.
    const timer = window.setTimeout(() => dismissPill(pill.id), missionPending ? Math.min(pill.ms, 2500) : pill.ms)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pill?.id])
  useEffect(() => {
    if (!missionPending || running || pills.length || busy) return
    const timer = window.setTimeout(() => {
      setMissionPending(false)
      setMissionOpen(true)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [missionPending, running, pills.length, busy])

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-cream" style={{ height: '100dvh' }}>
      {/* Top bar: back, where you are, the notebook, and everything else in the menu. */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b-2 border-ink bg-cream px-2">
        <Link to="/main" aria-label={t(lang, 'navMap')} className="flex h-10 w-10 items-center justify-center rounded border-2 border-ink bg-white type-button">
          ←
        </Link>
        <div className="min-w-0 flex-1 leading-none">
          <p className="type-micro text-maroon">{t(lang, trackName === 'sessions' ? 'introSession' : 'introLevel', { n: numberOf(levelId) })}</p>
          <h1 className="truncate type-label">{level.title[lang]}</h1>
        </div>
        {split && (
          <button
            onClick={() => setMissionOpen(true)}
            data-hint-anchor={MISSION_ANCHOR}
            data-tour="mission"
            className="flex h-10 min-w-0 max-w-72 items-center gap-2 rounded border-2 border-ink bg-amber-tint px-2 type-label"
          >
            <span className="shrink-0 text-maroon">🎯 {stepLabel}</span>
            <span className="truncate">{t(lang, stage.titleKey)}</span>
          </button>
        )}
        <Link to="/buku" data-notebook-count aria-label={t(lang, 'notebookTitle')} className="flex h-10 items-center gap-1 rounded border-2 border-ink bg-white px-2 type-button">
          📓 {found.size - (entry ? 1 : 0)}
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={t(lang, 'moreMenu')}
            className="flex h-10 w-10 items-center justify-center rounded border-2 border-ink bg-white type-button"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="card-in absolute right-0 top-full z-modal mt-2 w-72 space-y-1 rounded-lg border-2 border-ink bg-white p-2 shadow-pixel">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="type-label">{t(lang, 'phoneLanguage')}</span>
                <LangSwitch lang={lang} onChange={switchLang} disabled={running} />
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setTouring(true)
                }}
                disabled={running}
                className="w-full rounded px-3 py-3 text-left type-button hover:bg-parchment"
              >
                ? {t(lang, 'helpTour')}
              </button>
              {found.size >= 2 && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    openQuiz()
                  }}
                  disabled={running}
                  className="w-full rounded px-3 py-3 text-left type-button hover:bg-parchment"
                >
                  {t(lang, 'menuQuiz')}
                </button>
              )}
              <Link to={`/survei?s=${levelId}`} className="block w-full rounded px-3 py-3 text-left type-button hover:bg-parchment">
                {t(lang, 'navSurvey')}
              </Link>
              {!running && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    handleReset()
                  }}
                  className="w-full rounded px-3 py-3 text-left type-button hover:bg-parchment"
                >
                  {t(lang, 'clear')}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* The mission in one line; tap for the whole thing. */}
      {!split && (
        <button
          onClick={() => setMissionOpen(true)}
          data-hint-anchor={MISSION_ANCHOR}
          data-tour="mission"
          className={`flex h-10 shrink-0 items-center gap-2 border-b-2 border-ink bg-amber-tint px-3 text-left type-label ${freshStage ? 'card-in' : ''}`}
        >
          <span className="shrink-0 text-maroon">🎯 {stepLabel}</span>
          <span className="min-w-0 flex-1 truncate">{t(lang, stage.titleKey)}</span>
          {freshStage && <span className="shrink-0 rounded border border-ink bg-white px-1.5 type-micro">✨</span>}
          <span className="shrink-0 text-ink-muted" aria-hidden="true">
            ▾
          </span>
        </button>
      )}

      <main className={`relative min-h-0 flex-1 ${split ? 'grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2 p-2' : 'overflow-hidden'}`}>
        <section
          data-tour="editor"
          aria-hidden={!showBuild || undefined}
          className={`${split ? 'relative overflow-hidden rounded-lg border-2 border-ink bg-white' : 'absolute inset-0 bg-white'} ${paneClass('build')}`}
        >
          <div className="absolute inset-0">
            <BlockEditor
              lang={lang}
              level={level}
              puzzleId={stage.id}
              ref={editor}
              phone
              onEdit={() => {
                setHint(null)
                refreshPreview()
              }}
            />
          </div>
        </section>

        <section
          aria-hidden={!showWatch || undefined}
          className={`${split ? 'flex min-h-0 flex-col gap-2 overflow-y-auto' : 'absolute inset-0 flex flex-col gap-2 overflow-y-auto p-2'} ${paneClass('watch')}`}
        >
          <div data-hint-avoid data-tour="stage" className="relative shrink-0 rounded-lg border-2 border-ink bg-cream">
            {/* The same stage element goes full screen, so the running scene carries on. */}
            <div
              className={stageFull ? 'fixed z-takeover flex items-center justify-center bg-cream' : ''}
              style={stageFull ? (split ? FULL_LANDSCAPE : FULL_PORTRAIT) : undefined}
              role={stageFull ? 'dialog' : undefined}
              aria-modal={stageFull || undefined}
              aria-label={stageFull ? t(lang, 'phoneFullscreen') : undefined}
            >
              <div style={stageFull ? { width: split ? 'min(100vw, 160dvh)' : 'min(100dvh, 160vw)' } : undefined} className={stageFull ? 'stage-full' : 'w-full'}>
                <Stage key={level.id} lang={lang} level={level} speed={speed} ref={stageView}>
                  {stageFull && <SpeedButton lang={lang} speed={speed} onCycle={cycleSpeed} className="absolute left-1 top-1 z-float min-h-10 border-2 border-ink/50 bg-white/80 type-label" />}
                  {entry && <TermMoment key={entry.card.id} entry={entry} lang={lang} onClose={closeEntry} besideSelector={split && !stageFull ? '[data-tour="editor"]' : undefined} />}
                </Stage>
              </div>
              {stageFull ? (
                <button
                  onClick={() => setStageFull(false)}
                  aria-label={t(lang, 'sheetClose')}
                  className="absolute right-1 top-1 z-raised flex h-10 w-10 items-center justify-center rounded border-2 border-ink/50 bg-white/60 type-button"
                >
                  ✕
                </button>
              ) : (
                // Scene text is drawn for a 640px stage, too small to read at phone width, so the whole stage opens full screen.
                <button onClick={() => setStageFull(true)} aria-label={t(lang, 'phoneFullscreen')} className="absolute inset-0 z-raised" />
              )}
            </div>
          </div>
          {/* Under the stage, never over the scene's own labels: speed on the left, full screen on the right. */}
          <div className="-mt-1 flex shrink-0 items-center justify-between gap-2">
            <SpeedButton lang={lang} speed={speed} onCycle={cycleSpeed} />
            <button onClick={() => setStageFull(true)} className="flex min-h-8 items-center gap-1 rounded border-2 border-ink/50 bg-white px-2 type-label">
              ⤢ {t(lang, 'phoneEnlarge')}
            </button>
          </div>
          {/* On its side, Run sits right under the stage so it never falls off the screen. */}
          {split && <div className="flex shrink-0 gap-2">{runButtonEl}</div>}
          {stage.prediction && (
            <div className="shrink-0">
              <PredictionCard
                key={puzzleKey}
                prediction={stage.prediction as Prediction<unknown>}
                lang={lang}
                choice={guess?.choice ?? null}
                outcome={guess?.outcome}
                disabled={running}
                onChoose={(choice) => setGuesses((g) => ({ ...g, [puzzleKey]: { choice } }))}
              />
            </div>
          )}
          {/* Upright, the log takes the room its lines need and the view scrolls; it never shrinks to nothing. */}
          <div data-tour="log" className={`flex flex-col rounded-lg border-2 border-ink bg-ink p-3 text-cream ${split ? 'min-h-24 flex-1' : 'min-h-32 shrink-0'}`} aria-live="polite">
            <h2 className="type-eyebrow text-amber">🤖 {t(lang, 'kataSays')}</h2>
            <ul ref={logBox} className={`mt-1 space-y-1 overflow-y-auto type-log ${split ? 'min-h-0 flex-1' : 'max-h-60'}`}>
              {log.map((line, i) => (
                <li key={i} className={line.tone === 'good' ? 'text-tosca-light' : line.tone === 'bad' ? 'text-maroon-tint' : ''}>
                  › {line.text}
                </li>
              ))}
            </ul>
          </div>
          {/* On Result, a hint that isn't about the blocks sits under Kata's log, in the flow, so it covers nothing. */}
          {inlineHint && hint && <HintBubble key={hint.key} hint={hint} lang={lang} locate={locateHint} onClose={() => setHint(null)} inline />}
          {/* After a run, the way back to the blocks, named for what the player will do there. */}
          {!split && !running && outcome && (
            <button onClick={() => goTo('build')} className="pixel-btn min-h-11 shrink-0 rounded border-2 border-ink bg-white px-4 py-2 type-button-lg hover:bg-parchment">
              {t(lang, outcome === 'fail' ? 'phoneFixBlocks' : levelDone ? 'phoneEditBlocks' : 'phoneNextBlocks')}
            </button>
          )}
        </section>
      </main>

      {/* Bottom bar: the view switch around Run, where a thumb reaches. */}
      {!split && (
        <nav
          className="safe-bottom flex shrink-0 items-center gap-2 border-t-2 border-ink bg-cream px-2 pt-2"
          data-term-floor
          aria-label={t(lang, 'phoneViews')}
        >
          {/* Blocks and Result as one switch; the highlight slides the same way the screen does. */}
          <div role="tablist" aria-label={t(lang, 'phoneViews')} data-tour="tabs" className="relative flex shrink-0 rounded-lg border-2 border-ink bg-white p-0.5">
            <span
              aria-hidden="true"
              className="switch-thumb absolute inset-y-0.5 left-0.5 w-20 rounded border-2 border-ink bg-amber-tint"
              style={{ transform: view === 'watch' ? 'translateX(100%)' : 'none' }}
            />
            {tab('build', '🧩', t(lang, 'phoneBlocks'))}
            {tab('watch', '👁', t(lang, 'phoneResult'))}
          </div>
          {runButtonEl}
        </nav>
      )}

      {/* One pill at a time, just above the bottom bar. */}
      <div className="pointer-events-none fixed inset-x-3 z-toast flex justify-center" style={{ bottom: split ? '12px' : BAR }} aria-live="polite">
        {pill && (
          <div
            key={pill.id}
            className={`pill-in pointer-events-auto flex max-w-full items-center gap-2 rounded-full border-2 border-ink px-4 py-2 shadow-pixel-sm ${pill.tone === 'good' ? 'bg-tosca-tint' : pill.tone === 'bad' ? 'bg-maroon-tint' : 'bg-white'}`}
          >
            <span aria-hidden="true">{pill.icon}</span>
            <span className="min-w-0 flex-1 truncate type-label">{pill.text}</span>
            {pill.action && (
              <button
                onClick={() => {
                  pill.action!.run()
                  dismissPill(pill.id)
                }}
                className="shrink-0 rounded-full border-2 border-ink bg-amber px-3 py-1 type-label"
              >
                {pill.action.label}
              </button>
            )}
            <button onClick={() => dismissPill(pill.id)} aria-label={t(lang, 'sheetClose')} className="shrink-0 px-1 type-label">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Hints about the blocks point at them; the rest sit above the bar, so the stage stays clear. */}
      {hint && hintReady && !inlineHint && (pointsAtBlocks ? showBuild : true) && (
        <HintBubble key={hint.key} hint={hint} lang={lang} locate={locateHint} onClose={() => setHint(null)} dockBottom={pointsAtBlocks ? undefined : split ? '12px' : BAR} dockClass={split ? 'right-3 w-[40vw]' : 'inset-x-3'} />
      )}

      {missionOpen && (
        <BottomSheet lang={lang} title={t(lang, 'phoneMission')} onClose={() => setMissionOpen(false)}>
          <MissionBar lang={lang} level={level} done={done} current={stage.id} fresh={false} />
        </BottomSheet>
      )}

      {guessOpen && stage.prediction && (
        <BottomSheet lang={lang} title={t(lang, stage.titleKey)} onClose={() => setGuessOpen(false)}>
          <PredictionCard
            key={puzzleKey}
            prediction={stage.prediction as Prediction<unknown>}
            lang={lang}
            choice={guess?.choice ?? null}
            outcome={guess?.outcome}
            disabled={running}
            onChoose={(choice) => {
              setGuesses((g) => ({ ...g, [puzzleKey]: { choice } }))
              setGuessOpen(false)
              setRunAfterGuess(true)
            }}
          />
        </BottomSheet>
      )}

      {cleared && !levelDone && !entry && (
        <StageClearCard sheet lang={lang} level={level} stageId={cleared.stageId} nextId={cleared.nextId} done={done} onNext={continueStage} />
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
          sheet
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
          onClose={closeQuiz}
          sheet
        />
      )}

      {showIntro && (
        <SessionIntro
          lang={lang}
          label={t(lang, trackName === 'sessions' ? 'introSession' : 'introLevel', { n: numberOf(levelId) })}
          title={level.title[lang]}
          goal={PLANNED.find((p) => p.id === levelId)?.bigQuestion[lang] ?? level.topic[lang]}
          stages={main.length}
          firstTime={firstIntro}
          offerTour={!tourSeen}
          onTour={() => {
            closeIntro()
            setTouring(true)
          }}
          onPlay={closeIntro}
          sheet
        />
      )}
      {touring && <Tour steps={split ? LANDSCAPE_TOUR : PHONE_TOUR} lang={lang} onDone={finishTour} onStep={onTourStep} />}
    </div>
  )
}

/** Upright phone: turn the full-screen stage a quarter turn so it fills the long side. */
const FULL_PORTRAIT = { top: 0, left: '100vw', width: '100dvh', height: '100vw', transform: 'rotate(90deg)', transformOrigin: 'top left' }
const FULL_LANDSCAPE = { inset: 0 }

/** The phone tour: four steps, in the order a thumb uses them. */
const PHONE_TOUR: TourStep[] = [
  { anchors: ['[data-tour="mission"]'], titleKey: 'tourP1Title', bodyKey: 'tourP1Body' },
  { anchors: ['[data-tour="editor"] .blocklyFlyout'], titleKey: 'tourP2Title', bodyKey: 'tourP2Body' },
  { anchors: ['[data-tour="run"]'], titleKey: 'tourP3Title', bodyKey: 'tourP3Body' },
  { anchors: ['[data-tour="tabs"]'], titleKey: 'tourP4Title', bodyKey: 'tourP4Body' },
]

/** On its side there is no view switch, so the last step shows the stage. */
const LANDSCAPE_TOUR: TourStep[] = [...PHONE_TOUR.slice(0, 3), { anchors: ['[data-tour="stage"]'], titleKey: 'tour5Title', bodyKey: 'tour5Body' }]
