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
}

/**
 * "Guess first": the player picks an answer before the run, then sees it
 * next to what happened. Nothing is scored.
 */
export default function PredictionCard({ prediction, lang, choice, outcome, disabled, onChoose }: Props) {
  const answered = outcome !== undefined
  const right = answered && outcome === choice
  return (
    <fieldset className={`rounded-lg border-2 border-ink p-3 ${answered ? 'bg-tosca-tint' : 'bg-amber-tint'}`}>
      <legend className="sr-only">{t(lang, 'predictTitle')}</legend>
      <p className="type-micro text-maroon" aria-hidden="true">
        🔮 {t(lang, 'predictTitle')}
      </p>
      <p className="mt-1 type-body font-bold">{t(lang, prediction.questionKey)}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {prediction.choices.map((key, i) => {
          const picked = choice === i
          const happened = answered && outcome === i
          return (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-1.5 rounded border-2 px-3 py-1.5 type-button has-disabled:cursor-not-allowed ${
                happened ? 'border-tosca-dark bg-white' : picked ? 'border-ink bg-white shadow-pixel-sm' : 'border-ink/30 bg-white/60 hover:border-ink'
              }`}
            >
              <input
                type="radio"
                name="prediction"
                className="accent-maroon"
                checked={picked}
                disabled={disabled || answered}
                onChange={() => onChoose(i)}
              />
              {t(lang, key)}
              {happened && <span aria-label={t(lang, 'predictResult')}> ✓</span>}
            </label>
          )
        })}
      </div>
      <p className="mt-2 type-label" aria-live="polite">
        {!answered
          ? choice === null && t(lang, 'predictNeed')
          : outcome === null
            ? t(lang, 'predictNoAnswer')
            : right
              ? `🎯 ${t(lang, 'predictRight')}`
              : `🤔 ${t(lang, 'predictWrong')} ${t(lang, 'predictResult')}: ${t(lang, prediction.choices[outcome])}.`}
      </p>
    </fieldset>
  )
}
