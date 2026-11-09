import { useState, type ReactNode } from 'react'
import PixelSprite from '../components/PixelSprite'
import SiteHeader from '../components/SiteHeader'
import { t, type Key } from '../i18n'
import { useLang } from '../lang'
import { SESSIONS, numberOf } from '../levels'
import { Link } from '../router'
import { store } from '../store'
import { AGAIN, ESSAY_MAX, ROLES, STUCK, toAnswer, type Draft, type Stuck } from '../survey/questions'
import { sendSurvey } from '../survey/send'

const ROLE_KEYS: Record<(typeof ROLES)[number], Key> = { student: 'svRoleStudent', teacher: 'svRoleTeacher', parent: 'svRoleParent', other: 'svRoleOther' }
const STUCK_KEYS: Record<Stuck, Key> = {
  mission: 'svStuckMission',
  blocks: 'svStuckBlocks',
  run: 'svStuckRun',
  result: 'svStuckResult',
  words: 'svStuckWords',
  none: 'svStuckNone',
}
const AGAIN_KEYS: Record<(typeof AGAIN)[number], Key> = { yes: 'svYes', maybe: 'svMaybe', no: 'svNo' }

/** The session the answer is probably about: `?s=` from the link, else the last one played. */
function startingSession(): string | null {
  const fromLink = new URLSearchParams(window.location.search).get('s')
  const last = store.load().lastSession
  return [fromLink, last].find((id) => SESSIONS.some((s) => s.id === id)) ?? null
}

/** Chips for one question, each a real radio or checkbox under its label. */
function Choices({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}

function Chip({ type, name, checked, onChange, narrow, children }: { type: 'radio' | 'checkbox'; name: string; checked: boolean; onChange: () => void; narrow?: boolean; children: ReactNode }) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-center rounded border-2 border-ink bg-white py-2 ${narrow ? 'min-w-11 justify-center px-2' : 'px-3'} type-label hover:bg-parchment has-checked:bg-ink has-checked:text-cream has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon`}>
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}

function Question({ id, title, required, missing, children }: { id: string; title: string; required?: boolean; missing?: boolean; children: ReactNode }) {
  return (
    <fieldset aria-labelledby={id} className={`space-y-3 rounded-lg border-2 bg-white p-4 shadow-pixel-sm ${missing ? 'border-maroon' : 'border-ink'}`}>
      <legend id={id} className="float-left mb-3 w-full type-subheading">
        {title}
        {required && <span className="text-maroon"> *</span>}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  )
}

/**
 * A two-minute survey for players, teachers and parents. Answers go to
 * Firestore without a name or id (firestore.rules lists every field).
 */
export default function SurveyPage() {
  const { lang } = useLang()
  const [draft, setDraft] = useState<Draft>(() => ({ role: null, session: startingSession(), fun: null, clear: null, stuck: [], again: null, essay: '' }))
  const [state, setState] = useState<'filling' | 'sending' | 'error' | 'sent'>('filling')
  const [tried, setTried] = useState(false)
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const toggleStuck = (s: Stuck) =>
    setDraft((d) => {
      if (d.stuck.includes(s)) return { ...d, stuck: d.stuck.filter((x) => x !== s) }
      // "Nothing" clears the parts, and a part clears "nothing".
      return { ...d, stuck: s === 'none' ? ['none'] : [...d.stuck.filter((x) => x !== 'none'), s] }
    })

  const device = window.matchMedia('(min-width: 768px)').matches ? 'wide' : 'phone'
  const answer = toAnswer(draft, lang, device)

  const submit = async () => {
    setTried(true)
    if (!answer || state === 'sending') return
    setState('sending')
    try {
      await sendSurvey(answer)
      store.save({ surveyDone: true })
      setState('sent')
      window.scrollTo({ top: 0 })
    } catch {
      setState('error')
    }
  }

  const scale = (field: 'fun' | 'clear', low: Key, high: Key) => (
    <div className="space-y-2">
      <Choices>
        {[1, 2, 3, 4, 5].map((n) => (
          <Chip key={n} type="radio" name={field} narrow checked={draft[field] === n} onChange={() => set({ [field]: n })}>
            {n}
          </Chip>
        ))}
      </Choices>
      <p className="flex max-w-xs justify-between type-caption text-ink-muted" aria-hidden="true">
        <span>1 = {t(lang, low)}</span>
        <span>5 = {t(lang, high)}</span>
      </p>
    </div>
  )

  const back = draft.session ? `/main/${draft.session}` : '/main'

  return (
    <div className="min-h-full bg-parchment">
      <SiteHeader />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="kata-bob shrink-0 rounded-lg border-2 border-ink bg-white p-2 shadow-pixel-sm">
            <PixelSprite sprite="robot0" scale={4} label="Kata" />
          </div>
          <div className="space-y-1">
            <h1 className="type-title">{state === 'sent' ? t(lang, 'svThanks') : t(lang, 'svTitle')}</h1>
            <p className="type-lead text-ink-soft">{state === 'sent' ? t(lang, 'svThanksBody') : t(lang, 'svLead')}</p>
          </div>
        </div>

        {state === 'sent' ? (
          <Link to={back} className="pixel-btn inline-block rounded border-2 border-ink bg-maroon px-6 py-3 type-button-lg text-white hover:bg-maroon-dark">
            {t(lang, 'svBack')}
          </Link>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <p className="type-caption text-ink-muted">{t(lang, 'svRequiredNote')}</p>

            <Question id="q-role" title={t(lang, 'svRole')} required missing={tried && !draft.role}>
              <Choices>
                {ROLES.map((r) => (
                  <Chip key={r} type="radio" name="role" checked={draft.role === r} onChange={() => set({ role: r })}>
                    {t(lang, ROLE_KEYS[r])}
                  </Chip>
                ))}
              </Choices>
            </Question>

            <Question id="q-session" title={t(lang, 'svSession')}>
              <select
                aria-labelledby="q-session"
                value={draft.session ?? ''}
                onChange={(e) => set({ session: e.target.value || null })}
                className="min-h-11 w-full rounded border-2 border-ink bg-white px-3 py-2 type-body"
              >
                <option value="">{t(lang, 'svSessionNone')}</option>
                {SESSIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(lang, 'introSession', { n: numberOf(s.id) })} · {s.title[lang]}
                  </option>
                ))}
              </select>
            </Question>

            <Question id="q-fun" title={t(lang, 'svFun')} required missing={tried && draft.fun === null}>
              {scale('fun', 'svFunLow', 'svFunHigh')}
            </Question>

            <Question id="q-clear" title={t(lang, 'svClear')} required missing={tried && draft.clear === null}>
              {scale('clear', 'svClearLow', 'svClearHigh')}
            </Question>

            <Question id="q-stuck" title={t(lang, 'svStuck')}>
              <Choices>
                {STUCK.map((s) => (
                  <Chip key={s} type="checkbox" name="stuck" checked={draft.stuck.includes(s)} onChange={() => toggleStuck(s)}>
                    {t(lang, STUCK_KEYS[s])}
                  </Chip>
                ))}
              </Choices>
            </Question>

            <Question id="q-again" title={t(lang, 'svAgain')} required missing={tried && !draft.again}>
              <Choices>
                {AGAIN.map((a) => (
                  <Chip key={a} type="radio" name="again" checked={draft.again === a} onChange={() => set({ again: a })}>
                    {t(lang, AGAIN_KEYS[a])}
                  </Chip>
                ))}
              </Choices>
            </Question>

            <Question id="q-essay" title={t(lang, 'svEssay')}>
              <p id="q-essay-hint" className="mb-2 type-caption text-ink-muted">
                {t(lang, 'svEssayHint')}
              </p>
              <textarea
                aria-labelledby="q-essay"
                aria-describedby="q-essay-hint"
                value={draft.essay}
                maxLength={ESSAY_MAX}
                rows={4}
                onChange={(e) => set({ essay: e.target.value })}
                className="w-full rounded border-2 border-ink bg-cream p-3 type-body"
              />
              <p className="text-right type-caption text-ink-muted">
                {draft.essay.length}/{ESSAY_MAX}
              </p>
            </Question>

            <div className="space-y-2" aria-live="polite">
              {tried && !answer && <p className="type-label text-maroon">{t(lang, 'svMissing')}</p>}
              {state === 'error' && <p className="type-label text-maroon">{t(lang, 'svError')}</p>}
            </div>
            <button
              type="submit"
              disabled={state === 'sending'}
              className="pixel-btn min-h-11 w-full rounded border-2 border-ink bg-maroon px-6 py-3 type-button-lg text-white hover:bg-maroon-dark disabled:opacity-60 sm:w-auto"
            >
              {state === 'sending' ? t(lang, 'svSending') : t(lang, 'svSend')}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
