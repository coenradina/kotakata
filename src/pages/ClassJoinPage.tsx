import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useAccount } from '../account/AccountProvider'
import { classInfo, joinClass, signOut } from '../account/client'
import { NICKNAME_MAX, PICTURES, PICTURE_LENGTH, cleanNickname, type ClassInfo } from '../account/classes'
import { dayLabel } from '../account/requestText'
import { Card, Page, errorText, inputClass, primaryButton, secondaryButton } from '../account/ui'
import { t } from '../i18n'
import { useLang } from '../lang'
import { useRoute } from '../router'

/**
 * /kelas/<code>: a student joins a class, or comes back to it on another
 * device (docs/plan/07-accounts-and-classes.md, section 6). No account and
 * no email: a nickname and two pictures, in order.
 */
export default function ClassJoinPage({ code }: { code: string }) {
  const { lang } = useLang()
  const { account } = useAccount()
  const [info, setInfo] = useState<ClassInfo | 'missing' | null>(null)
  useEffect(() => {
    classInfo(code)
      .then(setInfo)
      .catch(() => setInfo('missing'))
  }, [code])

  const body = () => {
    if (info === null || account.status === 'loading') return <p className="type-body">{t(lang, 'acLoading')}</p>
    if (info === 'missing') return <p className="type-body">{t(lang, 'kjNotFound')}</p>
    if (info.state === 'notYet') return <p className="type-body">{t(lang, 'kjNotYet', { date: dayLabel(lang, info.start) })}</p>
    if (info.state !== 'open') return <p className="type-body">{t(lang, 'kjEnded')}</p>
    const head = <p className="type-lead">{t(lang, 'kjClass', { name: info.institution, date: dayLabel(lang, info.end) })}</p>
    if (account.status === 'in' && account.student) {
      if (account.student.code === code) return <SignedIn name={account.student.nickname} head={head} />
      return <SignOutFirst text={t(lang, 'kjOtherClass', { name: account.student.nickname })} />
    }
    if (account.status === 'in') return <SignOutFirst text={t(lang, 'kjAdult')} />
    return (
      <>
        {head}
        <JoinForm code={code} />
      </>
    )
  }
  return <Page title={t(lang, 'kjTitle')}>{body()}</Page>
}

/** Set when this page just joined: once the student's progress is in, the map opens. */
const justJoined = { value: false }

function SignedIn({ name, head }: { name: string; head: ReactNode }) {
  const { lang } = useLang()
  const { navigate } = useRoute()
  const { ready, storeKey } = useAccount()
  useEffect(() => {
    if (justJoined.value && ready && storeKey.startsWith('m_')) {
      justJoined.value = false
      navigate('/main')
    }
  }, [ready, storeKey, navigate])
  return (
    <>
      {head}
      <Card title={t(lang, 'kjHello', { name })}>
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => navigate('/main')} className={primaryButton}>
            {t(lang, 'kjPlay')}
          </button>
          <button onClick={() => void signOut()} className="type-label underline hover:text-maroon">
            {t(lang, 'kjNotYou', { name })}
          </button>
        </div>
      </Card>
    </>
  )
}

function SignOutFirst({ text }: { text: string }) {
  const { lang } = useLang()
  return (
    <Card>
      <p className="type-body">{text}</p>
      <button onClick={() => void signOut()} className={secondaryButton}>
        {t(lang, 'kjSignOut')}
      </button>
    </Card>
  )
}

function JoinForm({ code }: { code: string }) {
  const { lang } = useLang()
  const [returning, setReturning] = useState<boolean | null>(null)
  const [nickname, setNickname] = useState('')
  const [picture, setPicture] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (returning === null)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => setReturning(false)} className="pixel-btn min-h-16 rounded-lg border-2 border-ink bg-ink px-4 py-3 type-button text-cream shadow-pixel-sm">
          {t(lang, 'kjFirst')}
        </button>
        <button onClick={() => setReturning(true)} className="pixel-btn min-h-16 rounded-lg border-2 border-ink bg-white px-4 py-3 type-button shadow-pixel-sm hover:bg-parchment">
          {t(lang, 'kjReturning')}
        </button>
      </div>
    )

  const clean = cleanNickname(nickname)
  const full = picture.length === PICTURE_LENGTH
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!clean) return setError(t(lang, 'kjBadNickname'))
    if (!full) return
    setBusy(true)
    setError(null)
    try {
      // AccountProvider sees the sign-in and loads the student's progress; SignedIn then opens the map.
      justJoined.value = true
      await joinClass({ code, nickname: clean, picture, returning })
    } catch (err) {
      justJoined.value = false
      const c = (err as { code?: string })?.code ?? ''
      const reason = (err as { details?: { reason?: string } })?.details?.reason
      setPicture([])
      setError(
        c.endsWith('already-exists')
          ? t(lang, 'kjTaken')
          : c.endsWith('permission-denied')
            ? t(lang, 'kjWrong')
            : c.endsWith('resource-exhausted')
              ? t(lang, reason === 'full' ? 'kjFull' : 'kjLocked')
              : c.endsWith('failed-precondition')
                ? t(lang, 'kjEnded')
                : t(lang, 'acError', { msg: errorText(err) }),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <button type="button" onClick={() => (setReturning(null), setError(null), setPicture([]))} className="type-label underline hover:text-maroon">
        {t(lang, 'kjBack')}
      </button>
      <Card title={t(lang, returning ? 'kjReturning' : 'kjFirst')}>
        <label className="block space-y-2">
          <span className="type-label">{t(lang, 'kjNickname')}</span>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={NICKNAME_MAX} autoComplete="off" className={inputClass} />
        </label>
        {!returning && <p className="type-caption text-ink-muted">{t(lang, 'kjNicknameNote')}</p>}
      </Card>
      <Card>
        <p className="type-label">{t(lang, returning ? 'kjPickReturn' : 'kjPickNew')}</p>
        <div className="flex items-center gap-3" aria-live="polite">
          {Array.from({ length: PICTURE_LENGTH }, (_, i) => (
            <span key={i} className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-ink bg-cream type-title">
              {picture[i] !== undefined ? PICTURES[picture[i]] : i + 1}
            </span>
          ))}
          {picture.length > 0 && (
            <button type="button" onClick={() => setPicture([])} className={secondaryButton}>
              {t(lang, 'kjClear')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {PICTURES.map((p, i) => (
            <button
              key={p}
              type="button"
              disabled={full}
              onClick={() => setPicture([...picture, i])}
              aria-label={t(lang, 'kjPicture', { n: i + 1 })}
              className="pixel-btn flex aspect-square items-center justify-center rounded-lg border-2 border-ink bg-white type-title hover:bg-parchment disabled:opacity-60"
            >
              {p}
            </button>
          ))}
        </div>
        {!returning && full && <p className="type-body">{t(lang, 'kjRemember', { pics: picture.map((i) => PICTURES[i]).join(' ') })}</p>}
      </Card>
      {error && (
        <p role="alert" className="rounded border-2 border-maroon bg-maroon-tint p-3 type-body">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || !full || !nickname.trim()} className={primaryButton}>
        {t(lang, 'kjJoin')}
      </button>
    </form>
  )
}
