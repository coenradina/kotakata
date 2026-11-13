import { useState, type FormEvent } from 'react'
import { requestClass } from '../account/client'
import {
  CITY_MAX,
  CLASS_GRADES,
  CLASS_SESSIONS,
  INSTITUTION_MAX,
  MAX_COUNT,
  MAX_DAYS,
  MAX_LEAD_DAYS,
  MIN_COUNT,
  MIN_DAYS,
  MODES,
  PARTICIPANTS,
  PURPOSE_MAX,
  addDays,
  cleanClassRequest,
  jakartaToday,
  type ClassGrade,
  type ClassSession,
  type Mode,
  type Participant,
} from '../account/classRequest'
import type { Profile } from '../account/schema'
import { Card, Check, Chip, Chips, Field, Page, RequireRole, errorText, inputClass, primaryButton } from '../account/ui'
import { t, type Key } from '../i18n'
import { useLang } from '../lang'
import { justSent, sessionLabel } from '../account/requestText'
import { Link, useRoute } from '../router'

/** /guru/ajukan: the class request form (docs/plan/07-accounts-and-classes.md, section 5). */
export default function ClassRequestPage() {
  return <RequireRole role="educator">{({ profile }) => <RequestForm profile={profile} />}</RequireRole>
}

const MODE_KEY: Record<Mode, Key> = { offline: 'crModeOffline', online: 'crModeOnline' }
const WHO_KEY: Record<Participant, Key> = { students: 'crWhoStudents', teachers: 'crWhoTeachers', parents: 'crWhoParents' }
const FIELD_KEY: Record<string, Key> = {
  institution: 'crInstitution',
  city: 'suCity',
  mode: 'crMode',
  participants: 'crParticipants',
  count: 'crCount',
  grades: 'crGrades',
  sessions: 'crSessions',
  dates: 'crStart',
  start: 'crStart',
  end: 'crEnd',
  purpose: 'crPurpose',
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

function RequestForm({ profile }: { profile: Profile }) {
  const { lang } = useLang()
  const { navigate } = useRoute()
  const today = jakartaToday(Date.now())
  const [institution, setInstitution] = useState('')
  const [city, setCity] = useState(profile.survey?.city ?? '')
  const [mode, setMode] = useState<Mode | null>(null)
  const [participants, setParticipants] = useState<Participant[]>(['students'])
  const [count, setCount] = useState('')
  const [grades, setGrades] = useState<ClassGrade[]>(() => CLASS_GRADES.filter((g) => profile.survey?.grades.includes(g)))
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [purpose, setPurpose] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickStart = (v: string) => {
    setStart(v)
    // Suggest the shortest class; the educator can move it.
    if (v && (!end || end < addDays(v, MIN_DAYS) || end > addDays(v, MAX_DAYS))) setEnd(addDays(v, MIN_DAYS))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const input = { institution, city, mode, participants, count: Number(count), grades, sessions, start, end, purpose }
    const clean = cleanClassRequest(input, today)
    if (!clean.ok) return setError(t(lang, 'crBad', { field: t(lang, FIELD_KEY[clean.reason] ?? 'crTitle') }))
    setBusy(true)
    setError(null)
    try {
      await requestClass(clean.value)
      justSent.value = true
      navigate('/guru')
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ''
      setError(code.endsWith('resource-exhausted') ? t(lang, 'crFull') : t(lang, 'acError', { msg: errorText(err) }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={t(lang, 'crTitle')}>
      <Link to="/guru" className="type-label underline hover:text-maroon">
        {t(lang, 'crBack')}
      </Link>
      <p className="type-lead">{t(lang, 'crLead')}</p>
      <form onSubmit={submit} className="space-y-6">
        <Card>
          <label className="block space-y-2">
            <span className="type-label">
              {t(lang, 'crInstitution')}
              <span className="text-maroon"> *</span>
            </span>
            <input value={institution} onChange={(e) => setInstitution(e.target.value)} maxLength={INSTITUTION_MAX} className={inputClass} />
          </label>
          <label className="block space-y-2">
            <span className="type-label">
              {t(lang, 'suCity')}
              <span className="text-maroon"> *</span>
            </span>
            <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={CITY_MAX} className={inputClass} />
          </label>
          <Field label={t(lang, 'crMode')} required>
            <Chips>
              {MODES.map((m) => (
                <Chip key={m} type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)}>
                  {t(lang, MODE_KEY[m])}
                </Chip>
              ))}
            </Chips>
          </Field>
        </Card>

        <Card>
          <Field label={t(lang, 'crParticipants')} required>
            <Chips>
              {PARTICIPANTS.map((p) => (
                <Chip key={p} type="checkbox" name="participants" checked={participants.includes(p)} onChange={() => setParticipants(toggle(participants, p))}>
                  {t(lang, WHO_KEY[p])}
                </Chip>
              ))}
            </Chips>
          </Field>
          <label className="block space-y-2">
            <span className="type-label">
              {t(lang, 'crCount')}
              <span className="text-maroon"> *</span>
            </span>
            <input type="number" inputMode="numeric" min={MIN_COUNT} max={MAX_COUNT} value={count} onChange={(e) => setCount(e.target.value)} className={`${inputClass} max-w-40`} />
          </label>
          {participants.includes('students') && (
            <Field label={t(lang, 'crGrades')} required>
              <Chips>
                {CLASS_GRADES.map((g) => (
                  <Chip key={g} type="checkbox" name="grades" checked={grades.includes(g)} onChange={() => setGrades(toggle(grades, g))}>
                    {t(lang, 'suGrade', { n: g })}
                  </Chip>
                ))}
              </Chips>
            </Field>
          )}
        </Card>

        <Card>
          <Field label={t(lang, 'crSessions')} required>
            <div className="space-y-2">
              {CLASS_SESSIONS.map((s) => (
                <Check key={s} checked={sessions.includes(s)} onChange={() => setSessions(CLASS_SESSIONS.filter((x) => (x === s ? !sessions.includes(s) : sessions.includes(x))))}>
                  {sessionLabel(lang, s)}
                </Check>
              ))}
            </div>
          </Field>
          <p className="type-caption text-ink-muted">{t(lang, 'crSessionsNote')}</p>
        </Card>

        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="type-label">
                {t(lang, 'crStart')}
                <span className="text-maroon"> *</span>
              </span>
              <input type="date" value={start} min={today} max={addDays(today, MAX_LEAD_DAYS)} onChange={(e) => pickStart(e.target.value)} className={inputClass} />
            </label>
            <label className="block space-y-2">
              <span className="type-label">
                {t(lang, 'crEnd')}
                <span className="text-maroon"> *</span>
              </span>
              <input
                type="date"
                value={end}
                min={start ? addDays(start, MIN_DAYS) : undefined}
                max={start ? addDays(start, MAX_DAYS) : undefined}
                disabled={!start}
                onChange={(e) => setEnd(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <p className="type-caption text-ink-muted">{t(lang, 'crDatesNote')}</p>
        </Card>

        <Card>
          <label className="block space-y-2">
            <span className="type-label">
              {t(lang, 'crPurpose')}
              <span className="text-maroon"> *</span>
            </span>
            <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={PURPOSE_MAX} rows={4} className={inputClass} />
          </label>
          <p className="type-caption text-ink-muted">
            {t(lang, 'crPurposeNote')} {purpose.length}/{PURPOSE_MAX}
          </p>
        </Card>

        {error && (
          <p role="alert" className="rounded border-2 border-maroon bg-maroon-tint p-3 type-body">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={primaryButton}>
          {t(lang, 'crSubmit')}
        </button>
      </form>
    </Page>
  )
}
