import BlockEditor from '../../components/BlockEditor'
import Stage from '../../components/Stage'
import HintBubble from '../../components/HintBubble'
import QuizModal from '../../components/QuizModal'
import TermMoment from '../../components/TermMoment'
import SpeedButton from '../../components/SpeedButton'
import LevelCompleteModal from '../../components/LevelCompleteModal'
import StageClearCard from '../../components/StageClearCard'
import { t } from '../../i18n'
import { numberOf } from '../../levels'
import { PLANNED } from '../../sessions/catalog'
import type { Prediction } from '../../levels/types'
import { EVERY_CARD } from '../../store'
import { Link } from '../../router'
import { MAX_STARS } from '../../quiz/questions'
import PredictionCard from '../../components/PredictionCard'
import MissionBar from '../../components/MissionBar'
import MissionCard from '../../components/MissionCard'
import { useEffect, useState } from 'react'
import SessionIntro from '../../components/SessionIntro'
import Tour, { type TourStep } from '../../components/Tour'
import { LangSwitch } from '../../components/SiteHeader'
import type { PlaySession } from './usePlaySession'

/** Tablets get tap to add too. */
const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/**
 * Laptops, desktops and tablets, in one window that never scrolls: the
 * mission across the top, then the blocks beside the stage column (or, on
 * an upright tablet, under the stage row). See the .play-* rules in index.css.
 */
export default function WidePlayLayout({ s, tall = false }: { s: PlaySession; tall?: boolean }) {
  const {
    TRACK,
    badges,
    closeEntry,
    closeIntro,
    confirmStartOver,
    cycleSpeed,
    firstIntro,
    speed,
    done,
    editor,
    entry,
    finishTour,
    found,
    freshStage,
    guess,
    handleQuizAnswer,
    handleReset,
    handleRun,
    hint,
    lang,
    level,
    levelDone,
    cleared,
    continueStage,
    levelId,
    locateHint,
    log,
    logBox,
    menuOpen,
    mustGuess,
    navigate,
    openQuiz,
    passed,
    puzzleKey,
    quiz,
    refreshPreview,
    runButton,
    running,
    setConfirmStartOver,
    setGuesses,
    setHint,
    setLevelDone,
    setMenuOpen,
    setQuiz,
    setTouring,
    showIntro,
    stage,
    stageView,
    stars,
    startOver,
    switchLang,
    switchLevel,
    toasts,
    tourSeen,
    touring,
    trackName,
  } = s
  // The mission bar shows two lines; the whole task opens on a card when a new stage starts.
  const [missionOpen, setMissionOpen] = useState(false)
  useEffect(() => {
    if (freshStage) setMissionOpen(true)
  }, [freshStage])

  const intro = showIntro ? (
    <SessionIntro
      lang={lang}
      label={t(lang, trackName === 'sessions' ? 'introSession' : 'introLevel', { n: numberOf(levelId) })}
      title={level.title[lang]}
      goal={PLANNED.find((p) => p.id === levelId)?.bigQuestion[lang] ?? level.topic[lang]}
      stages={level.puzzles.filter((p) => !p.bonus).length}
      firstTime={firstIntro}
      offerTour={!tourSeen}
      onTour={() => {
        closeIntro()
        setTouring(true)
      }}
      onPlay={closeIntro}
    />
  ) : null

  // Hints keep off the stage: it shows the result they're about.
  const stageBox = (
    <div data-hint-avoid data-tour="stage" className="play-stage pixel-shadow rounded-lg border-2 border-ink bg-cream">
      <Stage key={level.id} lang={lang} level={level} speed={speed} fill ref={stageView}>
        {entry && <TermMoment key={entry.card.id} entry={entry} lang={lang} onClose={closeEntry} />}
      </Stage>
    </div>
  )
  const runBar = (
    <div data-hint-avoid data-tour="run" className="flex h-12 shrink-0 items-stretch gap-2">
      <button
        ref={runButton}
        onClick={handleRun}
        disabled={running}
        aria-disabled={mustGuess || undefined}
        title={mustGuess ? t(lang, 'predictNeed') : undefined}
        className={`pixel-btn min-w-0 flex-1 whitespace-nowrap rounded border-2 border-ink bg-maroon px-3 type-button-lg text-white ${mustGuess ? 'opacity-50' : ''}`}
      >
        {running ? t(lang, 'running') : t(lang, 'run')}
      </button>
      {/* An upright tablet's side column is narrow: Clear and Stop keep only their icon. */}
      <button
        onClick={handleReset}
        title={running ? t(lang, 'stop') : t(lang, 'clearTitle')}
        aria-label={running ? t(lang, 'stop') : t(lang, 'clear')}
        className="pixel-btn whitespace-nowrap rounded border-2 border-ink bg-white px-3 type-button-lg"
      >
        {tall ? (running ? '■' : '↺') : running ? t(lang, 'stop') : t(lang, 'clear')}
      </button>
      <SpeedButton lang={lang} speed={speed} onCycle={cycleSpeed} className="pixel-btn border-2 border-ink bg-white type-button-lg" />
    </div>
  )
  // Kata's dock: the guess first while it's open (then one line), and the log in the rest. It scrolls inside.
  const dock = (
    <div data-tour="log" className="play-dock flex flex-col overflow-hidden rounded-lg border-2 border-ink bg-ink text-cream">
      {stage.prediction && (
        <PredictionCard
          key={puzzleKey}
          compact
          prediction={stage.prediction as Prediction<unknown>}
          lang={lang}
          choice={guess?.choice ?? null}
          outcome={guess?.outcome}
          disabled={running}
          onChoose={(choice) => setGuesses((g) => ({ ...g, [puzzleKey]: { choice } }))}
        />
      )}
      <div className="flex min-h-0 flex-1 flex-col px-3 py-2" aria-live="polite">
        <h2 className="type-eyebrow text-amber">🤖 {t(lang, 'kataSays')}</h2>
        <ul ref={logBox} className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto type-mono">
          {log.map((line, i) => (
            <li key={i} className={line.tone === 'good' ? 'text-tosca-light' : line.tone === 'bad' ? 'text-maroon-tint' : ''}>
              › {line.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <div className={`play-shell ${tall ? 'play-tall' : 'play-wide'}`}>
      {/* A slim header: where you are, and a few tools. Everything else lives on the map or in the menu. */}
      <header className="flex flex-wrap items-center gap-2 border-b-2 border-ink bg-cream px-4 py-1.5 sm:gap-3 sm:px-6">
        <Link to="/main" className="pixel-btn min-h-10 rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
          ← {t(lang, 'navMap')}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="type-micro text-maroon">{t(lang, trackName === 'sessions' ? 'introSession' : 'introLevel', { n: numberOf(levelId) })}</p>
          <h1 className="truncate type-subheading">{level.title[lang]}</h1>
        </div>
        <Link to="/buku" data-notebook-count className="pixel-btn min-h-10 rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment" title={t(lang, 'notebookTitle')}>
          {/* A new word counts once it has flown in from its card. */}
          📓 {found.size - (entry ? 1 : 0)}
        </Link>
        <button onClick={() => setTouring(true)} disabled={running} className="pixel-btn min-h-10 rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
          ? {t(lang, 'helpTour')}
        </button>
        <LangSwitch lang={lang} onChange={switchLang} disabled={running} />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={t(lang, 'moreMenu')}
            className="pixel-btn min-h-10 min-w-10 rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment"
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
              <Link to={`/survei?s=${levelId}`} className="block w-full rounded px-3 py-2 text-left type-button hover:bg-parchment">
                {t(lang, 'navSurvey')}
              </Link>
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

      {/* The task comes first, full width, where the eye lands: two lines, the rest on a card. */}
      <div className="px-4 pt-2 sm:px-6">
        <MissionBar lang={lang} level={level} done={done} current={stage.id} fresh={freshStage} compact onOpen={() => setMissionOpen(true)} />
      </div>

      {/* The play area: everything in it sizes from the space left, not from its content. */}
      <main className="play-area px-4 pb-3 pt-3 sm:px-6">
        <div className="play-grid">
          {tall ? (
            <div className="play-top">
              {stageBox}
              <div className="play-side">
                {runBar}
                {dock}
              </div>
            </div>
          ) : null}
          <section data-tour="editor" className="pixel-shadow relative min-h-0 min-w-0 overflow-hidden rounded-lg border-2 border-ink bg-white">
            <div className="absolute inset-0">
              <BlockEditor
                lang={lang}
                level={level}
                puzzleId={stage.id}
                ref={editor}
                tapToAdd={TOUCH}
                onEdit={() => {
                  setHint(null)
                  refreshPreview()
                }}
              />
            </div>
          </section>
          {!tall && (
            <div className="play-side">
              {stageBox}
              {runBar}
              {dock}
            </div>
          )}
        </div>
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

      {hint && !quiz && !running && !touring && !showIntro && !entry && !levelDone && !missionOpen && (
        <HintBubble key={hint.key} hint={hint} lang={lang} locate={locateHint} onClose={() => setHint(null)} />
      )}

      {missionOpen && !cleared && !levelDone && <MissionCard lang={lang} level={level} done={done} current={stage.id} onClose={() => setMissionOpen(false)} />}

      {cleared && !levelDone && !entry && (
        <StageClearCard lang={lang} level={level} stageId={cleared.stageId} nextId={cleared.nextId} done={done} onNext={continueStage} />
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

