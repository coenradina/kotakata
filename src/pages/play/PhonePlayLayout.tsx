import { useEffect, useRef, useState } from 'react'
import BlockEditor from '../../components/BlockEditor'
import Stage from '../../components/Stage'
import HintBubble from '../../components/HintBubble'
import QuizModal from '../../components/QuizModal'
import NotebookToast from '../../components/NotebookToast'
import LevelCompleteModal from '../../components/LevelCompleteModal'
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
type Pill = { id: number; icon: string; text: string; tone: 'good' | 'bad' | 'info'; action?: { label: string; run: () => void } }

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
    setQuiz,
    stars,
    entry,
    closeEntry,
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
    setLevelDone,
    passed,
    TRACK,
    trackName,
    switchLevel,
    switchLang,
    menuOpen,
    setMenuOpen,
    confirmStartOver,
    setConfirmStartOver,
    startOver,
    openQuiz,
    showIntro,
    closeIntro,
    tourSeen,
    touring,
    setTouring,
    finishTour,
    freshStage,
    navigate,
  } = s

  const [view, setView] = useState<View>('build')
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

  const pushPill = (p: Omit<Pill, 'id'>, ms = 4000) => {
    const id = ++pillId.current
    setPills((ps) => [...ps, { ...p, id }])
    window.setTimeout(() => setPills((ps) => ps.filter((x) => x.id !== id)), ms)
  }
  const dismissPill = (id: number) => setPills((ps) => ps.filter((x) => x.id !== id))

  // A new stage opens its mission once, so the new task gets read.
  const seenMission = useRef<string | null>(null)
  useEffect(() => {
    if (showIntro || touring) return
    if (seenMission.current === puzzleKey) return
    const first = seenMission.current === null
    seenMission.current = puzzleKey
    if (!first) setMissionOpen(true)
  }, [puzzleKey, showIntro, touring])

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
    }
    wasRunning.current = running
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  // A hint about the blocks waits as a pill while the player watches; "Show me" goes back to the blocks.
  const pointsAtBlocks = hint !== null && hint.target.where !== 'element'
  useEffect(() => {
    if (!hint || !pointsAtBlocks || split || view === 'build') return
    pushPill({ icon: '💡', text: t(lang, 'phoneHintReady'), tone: 'info', action: { label: t(lang, 'phoneShow'), run: () => setView('build') } }, 7000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hint])

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
    setView('watch')
    setHint(null)
    void handleRun()
  }
  useEffect(() => {
    if (runAfterGuess && !mustGuess) {
      setRunAfterGuess(false)
      setView('watch')
      void handleRun()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAfterGuess, mustGuess])

  // The tour shows the blocks, so it starts there.
  useEffect(() => {
    if (touring) setView('build')
  }, [touring])

  const main = level.puzzles.filter((p) => !p.bonus)
  const n = main.findIndex((p) => p.id === stage.id) + 1
  const stepLabel = stage.bonus ? '⭐' : `${n}/${main.length}`
  const showBuild = split || view === 'build'
  const showWatch = split || view === 'watch'

  const runButtonEl = (
    <button
      ref={runButton}
      onClick={run}
      aria-haspopup={mustGuess ? 'dialog' : undefined}
      data-hint-avoid
      data-tour="run"
      className={`pixel-btn order-2 flex min-h-12 flex-1 items-center justify-center whitespace-nowrap rounded border-2 border-ink bg-maroon px-4 py-2 type-button-lg text-white ${mustGuess ? 'opacity-80' : ''}`}
    >
      {running ? t(lang, 'stop') : t(lang, 'run')}
    </button>
  )

  const tab = (id: View, icon: string, label: string) => (
    <button
      role="tab"
      aria-selected={view === id}
      onClick={() => setView(id)}
      data-tour={id === 'watch' ? 'tabs' : undefined}
      className={`flex min-h-12 w-20 flex-col items-center justify-center rounded px-1 py-1 type-micro ${id === 'build' ? 'order-1' : 'order-3'} ${view === id ? 'bg-amber-tint text-ink' : 'text-ink-soft'}`}
    >
      <span className="text-icon" aria-hidden="true">
        {icon}
      </span>
      {label}
    </button>
  )

  const pill = pills[0]

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
        <Link to="/buku" aria-label={t(lang, 'notebookTitle')} className="flex h-10 items-center gap-1 rounded border-2 border-ink bg-white px-2 type-button">
          📓 {found.size}
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
              {!confirmStartOver ? (
                <button onClick={() => setConfirmStartOver(true)} className="w-full rounded px-3 py-3 text-left type-button hover:bg-parchment">
                  {t(lang, 'startOver')}
                </button>
              ) : (
                <div role="alertdialog" aria-labelledby="start-over-text" className="space-y-3 p-2">
                  <p id="start-over-text" className="type-caption">
                    {t(lang, 'startOverConfirm')}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button autoFocus onClick={() => setConfirmStartOver(false)} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-2 type-label">
                      {t(lang, 'cancel')}
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        startOver()
                      }}
                      className="pixel-btn rounded border-2 border-ink bg-maroon px-3 py-2 type-label text-white"
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

      <main className={`relative min-h-0 flex-1 ${split ? 'grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2 p-2' : ''}`}>
        <section
          data-tour="editor"
          aria-hidden={!showBuild || undefined}
          className={`${split ? 'relative overflow-hidden rounded-lg border-2 border-ink bg-white' : 'absolute inset-0 bg-white'} ${showBuild ? '' : 'invisible'}`}
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
          className={`${split ? 'flex min-h-0 flex-col gap-2 overflow-y-auto' : 'absolute inset-0 flex flex-col gap-2 p-2'} ${showWatch ? '' : 'invisible'}`}
        >
          <div data-hint-avoid data-tour="stage" className="relative shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-cream">
            {/* The same stage element goes full screen, so the running scene carries on. */}
            <div
              className={stageFull ? 'fixed z-takeover flex items-center justify-center bg-cream' : ''}
              style={stageFull ? (split ? FULL_LANDSCAPE : FULL_PORTRAIT) : undefined}
              role={stageFull ? 'dialog' : undefined}
              aria-modal={stageFull || undefined}
              aria-label={stageFull ? t(lang, 'phoneFullscreen') : undefined}
            >
              <div style={stageFull ? { width: split ? 'min(100vw, 160dvh)' : 'min(100dvh, 160vw)' } : undefined} className={stageFull ? 'stage-full' : 'w-full'}>
                <Stage key={level.id} lang={lang} level={level} ref={stageView} />
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
                <button onClick={() => setStageFull(true)} aria-label={t(lang, 'phoneFullscreen')} className="absolute inset-0 z-raised flex items-start justify-end p-1">
                  <span className="flex min-h-8 items-center gap-1 rounded border-2 border-ink/50 bg-white/80 px-2 type-label" aria-hidden="true">
                    ⤢ {t(lang, 'phoneEnlarge')}
                  </span>
                </button>
              )}
            </div>
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
          <div data-tour="log" className={`flex flex-1 flex-col rounded-lg border-2 border-ink bg-ink p-2 text-cream ${split ? 'min-h-24' : 'min-h-0'}`} aria-live="polite">
            <h2 className="type-eyebrow text-amber">🤖 {t(lang, 'kataSays')}</h2>
            <ul ref={logBox} className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto type-mono">
              {log.map((line, i) => (
                <li key={i} className={line.tone === 'good' ? 'text-tosca-light' : line.tone === 'bad' ? 'text-maroon-tint' : ''}>
                  › {line.text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Bottom bar: the view switch around Run, where a thumb reaches. */}
      {!split && (
        <nav
          className="safe-bottom flex shrink-0 items-center gap-2 border-t-2 border-ink bg-cream px-2 pt-2"
          aria-label={t(lang, 'phoneViews')}
        >
          {/* One tab list; Run sits between its two tabs on screen. */}
          <div role="tablist" aria-label={t(lang, 'phoneViews')} className="contents">
            {tab('build', '🧩', t(lang, 'phoneBlocks'))}
            {tab('watch', '👁', t(lang, 'phoneResult'))}
          </div>
          {runButtonEl}
        </nav>
      )}

      {/* One pill at a time, just above the bottom bar. */}
      <div className="pointer-events-none fixed inset-x-3 z-toast flex justify-center" style={{ bottom: split ? '12px' : BAR }} aria-live="polite">
        {pill && !entry && !(hint && !pointsAtBlocks) && (
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

      {/* A new notebook term during a run, above the bar so the stage stays in view. */}
      {entry && (
        <div className={`fixed z-toast ${split ? 'bottom-3 right-3 w-[40vw]' : 'inset-x-3'}`} style={split ? undefined : { bottom: BAR }}>
          <NotebookToast key={entry.card.id} entry={entry} lang={lang} onOpenNotebook={() => navigate('/buku')} onClose={closeEntry} />
        </div>
      )}

      {/* Hints about the blocks point at them; the rest sit above the bar, so the stage stays clear. */}
      {hint && !quiz && !running && !touring && !showIntro && !missionOpen && !entry && (pointsAtBlocks ? showBuild : true) && (
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
          onClose={() => setQuiz(null)}
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
          offerTour={!tourSeen}
          onTour={() => {
            closeIntro()
            setTouring(true)
          }}
          onPlay={closeIntro}
          sheet
        />
      )}
      {touring && <Tour steps={split ? LANDSCAPE_TOUR : PHONE_TOUR} lang={lang} onDone={finishTour} />}
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
