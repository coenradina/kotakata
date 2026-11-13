import { useEffect, useState, type FormEvent } from 'react'
import { homeOf, useAccount } from '../account/AccountProvider'
import { completeSignup, finishSignInLink, sendSignInLink, signInWithGoogle } from '../account/client'
import { INSTITUTIONS, LEVELS, NAME_MAX, CITY_MAX, SOURCES, cleanSignup, type Institution, type Level, type Role, type Source } from '../account/schema'
import { Card, Check, Chip, Chips, Field, Page, errorText, inputClass, primaryButton, secondaryButton } from '../account/ui'
import { t, type Key } from '../i18n'
import { useLang } from '../lang'
import { Link, href, useRoute } from '../router'

const INSTITUTION_KEYS: Record<Institution, Key> = {
  smp: 'suInstSmp',
  sd: 'suInstSd',
  sma: 'suInstSma',
  campus: 'suInstCampus',
  community: 'suInstCommunity',
  other: 'suOther',
}
const SOURCE_KEYS: Record<Source, Key> = {
  colleague: 'suSrcColleague',
  social: 'suSrcSocial',
  search: 'suSrcSearch',
  event: 'suSrcEvent',
  school: 'suSrcSchool',
  other: 'suOther',
}

export function levelLabel(lang: 'id' | 'en', l: Level): string {
  if (l === 'university') return t(lang, 'suLevelUniversity')
  if (l === 'professional') return t(lang, 'suLevelProfessional')
  if (l === 'other') return t(lang, 'suOther')
  return t(lang, 'suLevelGrade', { n: l })
}

/**
 * /masuk: sign in with Google or an email link, then finish sign-up
 * (docs/plan/07-accounts-and-classes.md, section 4). A signed-in person who
 * has signed up goes to their home page.
 */
export default function SignInPage() {
  const { account } = useAccount()
  const { lang } = useLang()
  const { navigate } = useRoute()
  const done = account.status === 'in' && account.profile !== null
  useEffect(() => {
    if (done) navigate(homeOf(account))
  }, [done, account, navigate])

  if (account.status === 'loading' || done) return <Page title={t(lang, 'acSignInTitle')}>{<p className="type-body">{t(lang, 'acLoading')}</p>}</Page>
  if (account.status === 'in') return <SignupForm />
  return <SignIn />
}

function SignIn() {
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<{ kind: 'idle' | 'busy' | 'sent' | 'need-email' } | { kind: 'error'; msg: string }>({ kind: 'busy' })

  // Coming back from an email link finishes the sign-in here.
  useEffect(() => {
    finishSignInLink(window.location.href)
      .then((r) => {
        if (r === 'done') window.history.replaceState(null, '', href('/masuk'))
        setState({ kind: r === 'need-email' ? 'need-email' : 'idle' })
      })
      .catch((e) => setState({ kind: 'error', msg: errorText(e) }))
  }, [])

  const google = async () => {
    try {
      await signInWithGoogle()
    } catch (e) {
      setState({ kind: 'error', msg: errorText(e) })
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const address = email.trim()
    if (!address) return
    setState({ kind: 'busy' })
    try {
      if (state.kind === 'need-email') {
        await finishSignInLink(window.location.href, address)
        window.history.replaceState(null, '', href('/masuk'))
      } else {
        await sendSignInLink(address, `${window.location.origin}${href('/masuk')}`, lang)
        setState({ kind: 'sent' })
      }
    } catch (err) {
      setState({ kind: 'error', msg: errorText(err) })
    }
  }

  const needEmail = state.kind === 'need-email'
  return (
    <Page title={t(lang, 'acSignInTitle')}>
      <p className="type-lead">{t(lang, 'acSignInLead')}</p>
      <Card>
        {!needEmail && (
          <>
            <button onClick={google} disabled={state.kind === 'busy'} className={`${primaryButton} w-full`}>
              {t(lang, 'acGoogle')}
            </button>
            <p className="text-center type-caption text-ink-muted">{t(lang, 'acOr')}</p>
          </>
        )}
        {needEmail && <p className="type-body">{t(lang, 'acEmailAgain')}</p>}
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="signin-email">
            {t(lang, 'acEmail')}
          </label>
          <input id="signin-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t(lang, 'acEmail')} className={`${inputClass} min-w-0 flex-1 basis-56`} />
          <button type="submit" disabled={state.kind === 'busy'} className={secondaryButton}>
            {t(lang, needEmail ? 'acEmailFinish' : 'acEmailSend')}
          </button>
        </form>
        {state.kind === 'sent' && (
          <p role="status" className="type-body text-tosca-dark">
            {t(lang, 'acEmailSent', { email: email.trim() })}
          </p>
        )}
        {state.kind === 'error' && (
          <p role="alert" className="type-body text-maroon">
            {t(lang, 'acError', { msg: state.msg })}
          </p>
        )}
      </Card>
    </Page>
  )
}

function SignupForm() {
  const { account, refresh } = useAccount()
  const { lang } = useLang()
  const user = account.status === 'in' ? account.user : null
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState(() => user?.displayName ?? '')
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [city, setCity] = useState('')
  const [level, setLevel] = useState<Level | ''>('')
  const [source, setSource] = useState<Source | null>(null)
  const [adult, setAdult] = useState(false)
  const [terms, setTerms] = useState(false)
  const [training, setTraining] = useState(false)
  const [mailing, setMailing] = useState(false)
  const [tried, setTried] = useState(false)
  const [state, setState] = useState<{ kind: 'idle' | 'busy' } | { kind: 'error'; msg: string }>({ kind: 'idle' })

  const input = {
    role,
    displayName: name,
    lang,
    survey: role === 'educator' ? { institution, city, level, source } : null,
    adult,
    terms,
    training: role === 'educator' ? (training ? 'yes' : 'no') : null,
    mailing,
  }
  const clean = cleanSignup(input)
  const [termsBefore, termsAfter] = t(lang, role === 'educator' ? 'suTermsEducator' : 'suTermsParent').split('{link}')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!clean.ok) return
    setState({ kind: 'busy' })
    try {
      await completeSignup(clean.value)
      await refresh()
    } catch (err) {
      setState({ kind: 'error', msg: errorText(err) })
    }
  }

  return (
    <Page title={t(lang, 'suTitle')}>
      {account.status === 'in' && account.admin && (
        <Link to="/admin" className="inline-block type-label underline hover:text-maroon">
          {t(lang, 'acToAdmin')}
        </Link>
      )}
      <form onSubmit={submit} className="space-y-6" noValidate>
        <Card>
          <Field label={t(lang, 'suWho')} required>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['educator', 'parent'] as const).map((r) => (
                <label key={r} className="flex cursor-pointer flex-col gap-1 rounded-lg border-2 border-ink bg-white p-4 hover:bg-parchment has-checked:bg-ink has-checked:text-cream has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon">
                  <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                  <span className="type-subheading">{t(lang, r === 'educator' ? 'suEducator' : 'suParent')}</span>
                  <span className="type-caption">{t(lang, r === 'educator' ? 'suEducatorDesc' : 'suParentDesc')}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label={t(lang, 'suName')} required>
            <input value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} aria-label={t(lang, 'suName')} />
          </Field>
        </Card>

        {role === 'educator' && (
          <Card>
            <Field label={t(lang, 'suInstitution')} required>
              <Chips>
                {INSTITUTIONS.map((i) => (
                  <Chip key={i} type="radio" name="institution" checked={institution === i} onChange={() => setInstitution(i)}>
                    {t(lang, INSTITUTION_KEYS[i])}
                  </Chip>
                ))}
              </Chips>
            </Field>
            <Field label={t(lang, 'suCity')} required>
              <input value={city} maxLength={CITY_MAX} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" className={inputClass} aria-label={t(lang, 'suCity')} />
            </Field>
            <Field label={t(lang, 'suLevel')} required>
              <select value={level} onChange={(e) => setLevel(e.target.value as Level | '')} className={inputClass} aria-label={t(lang, 'suLevel')}>
                <option value="" disabled>
                  {t(lang, 'suChoose')}
                </option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {levelLabel(lang, l)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t(lang, 'suSource')} required>
              <Chips>
                {SOURCES.map((s) => (
                  <Chip key={s} type="radio" name="source" checked={source === s} onChange={() => setSource(s)}>
                    {t(lang, SOURCE_KEYS[s])}
                  </Chip>
                ))}
              </Chips>
            </Field>
          </Card>
        )}

        {role && (
          <Card>
            <Check checked={adult} onChange={setAdult} required>
              {t(lang, 'suAdult')}
            </Check>
            <Check checked={terms} onChange={setTerms} required>
              {termsBefore}
              <Link to="/privasi" className="underline hover:text-maroon">
                {t(lang, 'pvTitle')}
              </Link>
              {termsAfter}
            </Check>
            {role === 'educator' && (
              <Check checked={training} onChange={setTraining}>
                {t(lang, 'suTraining')}
              </Check>
            )}
            <Check checked={mailing} onChange={setMailing}>
              {t(lang, 'suMailing')}
            </Check>
          </Card>
        )}

        {tried && !clean.ok && (
          <p role="alert" className="type-body text-maroon">
            {t(lang, 'suMissing')}
          </p>
        )}
        {state.kind === 'error' && (
          <p role="alert" className="type-body text-maroon">
            {t(lang, 'acError', { msg: state.msg })}
          </p>
        )}
        <button type="submit" disabled={state.kind === 'busy'} className={primaryButton}>
          {t(lang, 'suSubmit')}
        </button>
      </form>
    </Page>
  )
}
