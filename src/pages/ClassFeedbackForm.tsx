import { useState } from 'react'
import { useAccount } from '../account/AccountProvider'
import { sendClassFeedback, type ClassDoc } from '../account/client'
import { AGAIN, FEEDBACK_TEXT_MAX, HARD_PARTS, TRAINING, stageCounts, type Again, type HardPart, type Training } from '../account/classFeedback'
import type { Member } from '../account/classes'
import { sessionLabel } from '../account/requestText'
import { Card, Check, Chip, Chips, Field, errorText, primaryButton } from '../account/ui'
import { t, type Key } from '../i18n'
import { useLang } from '../lang'
import { ALL } from '../levels'

const HARD_KEY: Record<HardPart, Key> = {
  intro: 'fbHardIntro',
  mission: 'fbHardMission',
  blocks: 'fbHardBlocks',
  run: 'fbHardRun',
  result: 'fbHardResult',
  words: 'fbHardWords',
  time: 'fbHardTime',
  devices: 'fbHardDevices',
  other: 'fbHardOther',
}
const AGAIN_KEY: Record<Again, Key> = { yes: 'fbYes', maybe: 'fbMaybe', no: 'fbNo' }
const TRAINING_KEY: Record<Training, Key> = { yes: 'suTrainingYes', no: 'suTrainingNo' }

const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x])

/**
 * The post-class form on the class page (docs/plan/07-accounts-and-classes.md,
 * section 7). Next to the "where were students confused" question, each stage
 * shows how many students finished it. Sending closes the class.
 */
export default function ClassFeedbackForm({ cls, members, onClosed }: { cls: ClassDoc; members: Member[]; onClosed: () => void }) {
  const { lang } = useLang()
  const { account, refresh } = useAccount()
  const optedIn = account.status === 'in' && account.profile?.mailing.optIn === true
  const [rating, setRating] = useState<number | null>(null)
  const [hard, setHard] = useState<HardPart[]>([])
  const [confused, setConfused] = useState<string[]>([])
  const [confusedText, setConfusedText] = useState('')
  const [moment, setMoment] = useState('')
  const [again, setAgain] = useState<Again | null>(null)
  const [training, setTraining] = useState<Training | null>(account.status === 'in' ? (account.profile?.training ?? null) : null)
  const [mailing, setMailing] = useState(false)
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const counts = stageCounts(members, cls.sessions)
  const n = members.length
  const missing = rating === null || again === null || training === null

  const send = async () => {
    setTried(true)
    if (missing) return
    if (!window.confirm(t(lang, 'fbConfirm'))) return
    setBusy(true)
    setError(null)
    try {
      await sendClassFeedback(cls.id, { rating, hard, confused, confusedText, moment, again, training, mailing: !optedIn && mailing })
      // The training answer and the opt-in are saved on the account too.
      await refresh().catch(() => {})
      onClosed()
    } catch (e) {
      setError(errorText(e))
      setBusy(false)
    }
  }

  const textarea = (value: string, set: (v: string) => void, label: string) => (
    <textarea value={value} onChange={(e) => set(e.target.value)} maxLength={FEEDBACK_TEXT_MAX} rows={3} aria-label={label} className="w-full rounded border-2 border-ink bg-white px-3 py-2 type-body" />
  )

  return (
    <Card title={t(lang, 'fbTitle')}>
      <p className="type-body">{t(lang, 'fbLead')}</p>

      <Field label={t(lang, 'fbRating')} required>
        <Chips>
          {[1, 2, 3, 4, 5].map((v) => (
            <Chip key={v} type="radio" name="fb-rating" checked={rating === v} onChange={() => setRating(v)}>
              {v}
            </Chip>
          ))}
        </Chips>
        <p className="flex max-w-xs justify-between type-caption text-ink-muted" aria-hidden="true">
          <span>1 = {t(lang, 'fbRatingLow')}</span>
          <span>5 = {t(lang, 'fbRatingHigh')}</span>
        </p>
      </Field>

      <Field label={t(lang, 'fbHard')}>
        <Chips>
          {HARD_PARTS.map((h) => (
            <Chip key={h} type="checkbox" name="fb-hard" checked={hard.includes(h)} onChange={() => setHard((x) => toggle(x, h))}>
              {t(lang, HARD_KEY[h])}
            </Chip>
          ))}
        </Chips>
      </Field>

      <Field label={t(lang, 'fbConfused')}>
        <p className="type-caption text-ink-muted">{t(lang, 'fbConfusedNote', { n })}</p>
        {cls.sessions.map((s) => {
          const puzzles = ALL.find((l) => l.id === s)?.puzzles.filter((p) => !p.bonus) ?? []
          return (
            <div key={s} className="space-y-2">
              <p className="type-label">{sessionLabel(lang, s)}</p>
              <Chips>
                {puzzles.map((p) => {
                  const key = `${s}:${p.id}`
                  return (
                    <Chip key={key} type="checkbox" name="fb-confused" checked={confused.includes(key)} onChange={() => setConfused((x) => toggle(x, key))}>
                      {t(lang, p.titleKey)} · {t(lang, 'fbStageDone', { done: counts[key] ?? 0, n })}
                    </Chip>
                  )
                })}
              </Chips>
            </div>
          )
        })}
        <p className="type-caption text-ink-muted">{t(lang, 'fbTextHint')}</p>
        {textarea(confusedText, setConfusedText, t(lang, 'fbConfusedText'))}
      </Field>

      <Field label={t(lang, 'fbMoment')}>
        <p className="type-caption text-ink-muted">{t(lang, 'fbTextHint')}</p>
        {textarea(moment, setMoment, t(lang, 'fbMoment'))}
      </Field>

      <Field label={t(lang, 'fbAgain')} required>
        <Chips>
          {AGAIN.map((a) => (
            <Chip key={a} type="radio" name="fb-again" checked={again === a} onChange={() => setAgain(a)}>
              {t(lang, AGAIN_KEY[a])}
            </Chip>
          ))}
        </Chips>
      </Field>

      <Field label={t(lang, 'suTraining')} required>
        <Chips>
          {TRAINING.map((v) => (
            <Chip key={v} type="radio" name="fb-training" checked={training === v} onChange={() => setTraining(v)}>
              {t(lang, TRAINING_KEY[v])}
            </Chip>
          ))}
        </Chips>
        {!optedIn && (
          <Check checked={mailing} onChange={setMailing}>
            {t(lang, 'suMailing')}
          </Check>
        )}
      </Field>

      {tried && missing && (
        <p role="alert" className="type-body text-maroon">
          {t(lang, 'suMissing')}
        </p>
      )}
      <button onClick={send} disabled={busy} className={primaryButton}>
        {t(lang, 'fbSend')}
      </button>
      {error && (
        <p role="alert" className="type-body text-maroon">
          {t(lang, 'acError', { msg: error })}
        </p>
      )}
    </Card>
  )
}
