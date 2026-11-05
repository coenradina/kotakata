import { useEffect, useRef, useState, type DragEvent } from 'react'
import { t, type CardId, type Lang } from '../i18n'
import { TERM_NAME, type BlankQuestion, type ChoiceQuestion, type Question } from '../quiz/questions'

interface Props {
  question: Question
  lang: Lang
  /** Whether each of the question's terms is already at full stars. */
  maxed: (id: CardId) => boolean
  /** Called once with whether the answer was right; the modal then shows feedback. */
  onAnswer: (correct: boolean) => void
  onClose: () => void
}

// Chips use the same colours as the Blockly categories the terms come from.
const CHIP_COLOUR: Record<string, string> = {
  Dataset: 'bg-tosca',
  Label: 'bg-tosca',
  Training: 'bg-maroon',
  Testing: 'bg-maroon',
  Accuracy: 'bg-maroon',
  Classification: 'bg-gold',
  Feature: 'bg-tosca',
  Split: 'bg-tosca',
  Leaf: 'bg-maroon',
  Prediction: 'bg-maroon',
  'Decision Tree': 'bg-gold',
}

export default function QuizModal({ question, lang, maxed, onAnswer, onClose }: Props) {
  const [result, setResult] = useState<boolean | null>(null)
  // Read before answering, so earning the third star doesn't say "already full".
  const [allMaxed] = useState(() => question.terms.every(maxed))
  const dialog = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // Focus the first control once, and let Escape skip.
  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>('button[data-autofocus]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const answer = (correct: boolean) => {
    if (result !== null) return
    setResult(correct)
    onAnswer(correct)
  }

  const termNames = question.terms.map((id) => TERM_NAME[id]).join(', ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-title"
        className="card-in w-full max-w-lg overflow-hidden rounded-lg border-2 border-ink bg-cream shadow-[6px_6px_0_#0F172A]"
      >
        <div className="flex items-center justify-between bg-ink px-4 py-2">
          <span id="quiz-title" className="font-pixel text-2xl leading-none text-amber">
            ? {t(lang, 'quizTitle')}
          </span>
          {result === null && (
            <button onClick={onClose} className="text-xs font-bold text-cream/80 underline hover:text-cream">
              {t(lang, 'quizSkip')}
            </button>
          )}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {question.kind === 'choice' ? (
            <Choice question={question} lang={lang} result={result} onAnswer={answer} />
          ) : (
            <Blank question={question} lang={lang} result={result} onAnswer={answer} />
          )}

          {result !== null && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/10 pt-3" aria-live="polite">
              <p className={`font-sans text-sm font-semibold ${result ? 'text-tosca' : 'text-maroon'}`}>
                {result
                  ? t(lang, allMaxed ? 'quizMaxed' : 'quizCorrect', { terms: termNames })
                  : t(lang, 'quizWrong', { answer: correctAnswer(question, lang) })}
              </p>
              <button data-autofocus autoFocus onClick={onClose} className="pixel-btn rounded border-2 border-ink bg-tosca px-4 py-2 text-xs font-bold text-white">
                {t(lang, 'quizNext')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function correctAnswer(q: Question, lang: Lang) {
  if (q.kind === 'choice') return q.options.find((o) => o.correct)!.text[lang]
  return q.answers.join(', ')
}

function Choice({ question, lang, result, onAnswer }: { question: ChoiceQuestion; lang: Lang; result: boolean | null; onAnswer: (c: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <>
      <p className="font-sans text-base font-semibold leading-snug">{question.prompt[lang]}</p>
      <ul className="space-y-2">
        {question.options.map((o, i) => {
          const reveal = result !== null
          const tone = !reveal
            ? 'bg-white hover:bg-amber/30'
            : o.correct
              ? 'bg-tosca text-white'
              : picked === i
                ? 'bg-maroon text-white'
                : 'bg-white opacity-60'
          return (
            <li key={i}>
              <button
                data-autofocus={i === 0 ? '' : undefined}
                disabled={reveal}
                data-revealed={reveal ? '' : undefined}
                onClick={() => {
                  setPicked(i)
                  onAnswer(o.correct)
                }}
                className={`pixel-btn flex w-full items-start gap-3 rounded border-2 border-ink px-3 py-2.5 text-left font-sans text-sm ${tone}`}
              >
                <span className="font-pixel text-xl leading-none">{String.fromCharCode(65 + i)}</span>
                <span className="leading-snug">{o.text[lang]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function Blank({ question, lang, result, onAnswer }: { question: BlankQuestion; lang: Lang; result: boolean | null; onAnswer: (c: boolean) => void }) {
  const [slots, setSlots] = useState<(string | null)[]>(() => question.answers.map(() => null))
  const [selected, setSelected] = useState<string | null>(null)
  const done = result !== null
  const tray = question.chips.filter((c) => !slots.includes(c))

  const place = (slot: number, chip: string) => {
    if (done) return
    setSlots((s) => s.map((v, i) => (i === slot ? chip : v === chip ? null : v)))
    setSelected(null)
  }
  const clear = (slot: number) => !done && setSlots((s) => s.map((v, i) => (i === slot ? null : v)))
  const tapChip = (chip: string) => {
    if (done) return
    // Tapping a chip fills the first empty gap, or selects it if none is empty.
    const empty = slots.indexOf(null)
    if (empty >= 0 && selected === null) place(empty, chip)
    else setSelected(selected === chip ? null : chip)
  }
  const onDrop = (slot: number) => (e: DragEvent) => {
    e.preventDefault()
    const chip = e.dataTransfer.getData('text/plain')
    if (question.chips.includes(chip)) place(slot, chip)
  }

  const parts = question.sentence[lang].split(/(\{\d\})/)

  return (
    <>
      <p className="font-sans text-xs text-ink/70">{t(lang, 'quizBlankHint')}</p>
      <p className="font-sans text-base font-semibold leading-[2.6]">
        {parts.map((part, i) => {
          const m = part.match(/^\{(\d)\}$/)
          if (!m) return <span key={i}>{part}</span>
          const slot = Number(m[1]) - 1
          const chip = slots[slot]
          const right = done && chip === question.answers[slot]
          const wrong = done && !right
          return (
            <button
              key={i}
              aria-label={`${t(lang, 'quizBlankLabel', { n: slot + 1 })}: ${chip ?? t(lang, 'quizEmpty')}`}
              onClick={() => (selected ? place(slot, selected) : clear(slot))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop(slot)}
              className={`mx-1 inline-flex min-w-[96px] items-center justify-center rounded-full border-2 px-3 align-middle font-mono text-xs font-bold leading-7 ${
                chip ? `${CHIP_COLOUR[chip]} border-ink text-white` : 'border-dashed border-ink/50 bg-white text-ink/40'
              } ${right ? 'ring-4 ring-emerald-400' : ''} ${wrong ? 'ring-4 ring-rose-400' : ''}`}
            >
              {chip ?? '___'}
            </button>
          )
        })}
      </p>

      {done && result === false && (
        <p className="font-sans text-xs text-ink/70">→ {question.answers.join(' · ')}</p>
      )}

      {!done && (
        <div className="flex flex-wrap gap-2 rounded border-2 border-ink/20 bg-parchment p-3">
          {tray.map((chip, i) => (
            <button
              key={chip}
              data-autofocus={i === 0 ? '' : undefined}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', chip)}
              onClick={() => tapChip(chip)}
              aria-pressed={selected === chip}
              className={`pixel-btn cursor-grab rounded-full border-2 border-ink px-4 py-1.5 font-mono text-xs font-bold text-white ${CHIP_COLOUR[chip]} ${selected === chip ? 'ring-4 ring-amber' : ''}`}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {!done && (
        <div className="flex justify-end">
          <button
            disabled={slots.includes(null)}
            onClick={() => onAnswer(slots.every((c, i) => c === question.answers[i]))}
            className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 text-xs font-bold text-white"
          >
            {t(lang, 'quizCheck')}
          </button>
        </div>
      )}
    </>
  )
}

