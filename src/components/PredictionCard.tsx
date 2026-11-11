import { useState } from 'react'
import { t, type Lang } from '../i18n'
import type { Prediction } from '../levels/types'

interface Props {
  prediction: Prediction<unknown>
  lang: Lang
  /** The player's guess, or null before they pick. */
  choice: number | null
  /** What the last run matched: undefined before a run, null if it didn't answer. */
  outcome: number | null | undefined
  disabled: boolean
  onChoose: (choice: number) => void
  /** Tight space (Kata's dock): smaller, and folded to one line once a guess is picked. */
  compact?: boolean
}

/**
 * "Guess first": the player picks an answer before the run, then sees it
 * next to what happened. Nothing is scored.
 */
export default function PredictionCard({ prediction, lang, choice, outcome, disabled, onChoose, compact = false }: Props) {
  const answered = outcome !== undefined
  const right = answered && outcome === choice
  const [open, setOpen] = useState(false)
  const result = !answered
    ? choice === null && t(lang, 'predictNeed')
    : outcome === null
      ? t(lang, 'predictNoAnswer')
      : right
        ? `🎯 ${t(lang, 'predictRight')}`
        : `🤔 ${t(lang, 'predictWrong')} ${t(lang, 'predictResult')}: ${t(lang, prediction.choices[outcome])}.`
  if (compact && choice !== null && !open) {
    return (
      <div className={`flex flex-wrap items-center gap-2 border-b-2 border-ink px-3 py-1.5 text-ink ${answered ? 'bg-tosca-tint' : 'bg-amber-tint'}`}>
        <span className="type-label">
          🔮 {t(lang, 'predictMine')}: <b>{t(lang, prediction.choices[choice])}</b>
        </span>
        {answered ? (
          <span className="min-w-0 flex-1 type-label" aria-live="polite">{result}</span>
        ) : (
          !disabled && (
            <button onClick={() => setOpen(true)} className="ml-auto type-label underline hover:text-maroon">
              {t(lang, 'predictChange')}
            </button>
          )
        )}
      </div>
    )
  }
  return (
    <fieldset className={compact ? `border-b-2 border-ink px-3 py-2 text-ink ${answered ? 'bg-tosca-tint' : 'bg-amber-tint'}` : `rounded-lg border-2 border-ink p-3 ${answered ? 'bg-tosca-tint' : 'bg-amber-tint'}`}>
      <legend className="sr-only">{t(lang, 'predictTitle')}</legend>
      <p className="type-micro text-maroon" aria-hidden="true">
        🔮 {t(lang, 'predictTitle')}
      </p>
      <p className={compact ? 'mt-0.5 type-label font-bold' : 'mt-1 type-body font-bold'}>{t(lang, prediction.questionKey)}</p>
      <div className={compact ? 'mt-1.5 flex flex-wrap gap-1.5' : 'mt-2 flex flex-wrap gap-2'}>
        {prediction.choices.map((key, i) => {
          const picked = choice === i
          const happened = answered && outcome === i
          return (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-1.5 rounded border-2 ${compact ? 'px-2 py-1 type-label' : 'px-3 py-1.5 type-button'} has-disabled:cursor-not-allowed ${
                happened ? 'border-tosca-dark bg-white' : picked ? 'border-ink bg-white shadow-pixel-sm' : 'border-ink/30 bg-white/60 hover:border-ink'
              }`}
            >
              <input
                type="radio"
                name="prediction"
                className="accent-maroon"
                checked={picked}
                disabled={disabled || answered}
                onChange={() => {
                  onChoose(i)
                  setOpen(false)
                }}
              />
              {t(lang, key)}
              {happened && <span aria-label={t(lang, 'predictResult')}> ✓</span>}
            </label>
          )
        })}
      </div>
      <p className={compact ? 'mt-1 type-micro' : 'mt-2 type-label'} aria-live="polite">
        {result}
      </p>
    </fieldset>
  )
}
