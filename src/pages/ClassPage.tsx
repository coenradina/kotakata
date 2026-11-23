import { useEffect, useState } from 'react'
import { loadClass, renameMember, resetMemberPicture, watchMembers, type ClassDoc } from '../account/client'
import { classState, cleanNickname, isStuck, MAX_MEMBERS, type ClassState, type Member } from '../account/classes'
import { jakartaToday } from '../account/classRequest'
import { dayLabel, sessionLabel } from '../account/requestText'
import { Card, Page, RequireRole, errorText, secondaryButton } from '../account/ui'
import { t, type Key, type Lang } from '../i18n'
import { useLang } from '../lang'
import { ALL } from '../levels'
import { href, Link } from '../router'

/**
 * /guru/kelas/<id>: the class page for its educator
 * (docs/plan/07-accounts-and-classes.md, section 6). The link to share, and
 * every student live: where they are, for how long, runs and hints, and who
 * is stuck. Only the class's educator can read it (firestore.rules).
 */
export default function ClassPage({ id }: { id: string }) {
  return <RequireRole role="educator">{() => <ClassView id={id} />}</RequireRole>
}

const STATE_KEY: Record<ClassState, Key> = { open: 'clOpen', notYet: 'clNotYet', ended: 'clEnded', closed: 'clClosed' }

export const classLink = (code: string) => `${window.location.origin}${href(`/kelas/${code}`)}`

function puzzleLabel(lang: Lang, session: string, puzzle: string) {
  const p = ALL.find((l) => l.id === session)?.puzzles.find((x) => x.id === puzzle)
  return p ? t(lang, p.titleKey) : puzzle
}

function ClassView({ id }: { id: string }) {
  const { lang } = useLang()
  const [cls, setCls] = useState<ClassDoc | null | 'missing'>(null)
  const [members, setMembers] = useState<Member[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadClass(id)
      .then((c) => setCls(c ?? 'missing'))
      .catch(() => setCls('missing'))
    return watchMembers(id, setMembers, (e) => setError(errorText(e)))
  }, [id])
  // Minutes on a stage keep counting between updates.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(timer)
  }, [])

  if (cls === null) return <Page title="">{<p className="type-body">{t(lang, 'acLoading')}</p>}</Page>
  if (cls === 'missing')
    return (
      <Page title={t(lang, 'clNotFound')}>
        <Link to="/guru" className="type-label underline hover:text-maroon">
          {t(lang, 'crBack')}
        </Link>
      </Page>
    )

  const state = classState(cls, jakartaToday(now))
  const link = classLink(cls.code)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // The link is on screen to copy by hand.
    }
  }
  const rename = async (m: Member) => {
    const next = window.prompt(t(lang, 'clRenamePrompt', { name: m.nickname }), m.nickname)
    if (next === null) return
    const clean = cleanNickname(next)
    if (!clean) return setMsg(t(lang, 'kjBadNickname'))
    try {
      await renameMember(id, m.id, clean)
      setMsg(null)
    } catch (e) {
      setMsg((e as { code?: string }).code?.endsWith('already-exists') ? t(lang, 'kjTaken') : errorText(e))
    }
  }
  const reset = async (m: Member) => {
    if (!window.confirm(t(lang, 'clResetConfirm', { name: m.nickname }))) return
    try {
      await resetMemberPicture(id, m.id)
      setMsg(t(lang, 'clResetDone', { name: m.nickname }))
    } catch (e) {
      setMsg(errorText(e))
    }
  }

  // Students on each stage, with how many of them are stuck.
  const stages = new Map<string, { session: string; puzzle: string; on: number; stuck: number }>()
  for (const m of members ?? []) {
    const { session, puzzle } = m.live
    if (!session || !puzzle) continue
    const key = `${session}:${puzzle}`
    const row = stages.get(key) ?? { session, puzzle, on: 0, stuck: 0 }
    row.on++
    if (isStuck(m.live, now)) row.stuck++
    stages.set(key, row)
  }
  // Stuck students first, then by name.
  const sorted = [...(members ?? [])].sort((a, b) => Number(isStuck(b.live, now)) - Number(isStuck(a.live, now)) || a.nickname.localeCompare(b.nickname, 'id'))

  return (
    <Page title={cls.institution}>
      <Link to="/guru" className="type-label underline hover:text-maroon">
        {t(lang, 'crBack')}
      </Link>
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex-1 type-body">
            {dayLabel(lang, cls.start)} – {dayLabel(lang, cls.end)}
          </span>
          <span className={`rounded border border-ink px-2 py-0.5 type-micro ${state === 'open' ? 'bg-tosca-tint' : 'bg-parchment'}`}>{t(lang, STATE_KEY[state])}</span>
        </div>
        <p className="type-label">{t(lang, 'edClassLink')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded border-2 border-ink bg-cream px-3 py-2 type-body">{link}</code>
          <button onClick={copy} className={secondaryButton}>
            {t(lang, copied ? 'clCopied' : 'clCopy')}
          </button>
        </div>
        <p className="type-caption text-ink-muted">{t(lang, 'clLinkNote', { start: dayLabel(lang, cls.start), end: dayLabel(lang, cls.end) })}</p>
      </Card>

      {stages.size > 0 && (
        <Card title={t(lang, 'clStages')}>
          <ul className="space-y-1">
            {[...stages.values()]
              .sort((a, b) => b.stuck - a.stuck || b.on - a.on)
              .map((s) => (
                <li key={`${s.session}:${s.puzzle}`} className="flex flex-wrap items-center gap-2 type-body">
                  <span className="flex-1">
                    {sessionLabel(lang, s.session)} · {puzzleLabel(lang, s.session, s.puzzle)}
                  </span>
                  <span className={s.stuck > 0 ? 'font-bold text-maroon' : 'text-ink-muted'}>{t(lang, 'clStageRow', { on: s.on, stuck: s.stuck })}</span>
                </li>
              ))}
          </ul>
        </Card>
      )}

      <Card title={t(lang, 'clMembers', { n: members?.length ?? 0 })}>
        <p className="type-caption text-ink-muted">{t(lang, 'clStuckNote')}</p>
        {members === null && !error && <p className="type-body">{t(lang, 'acLoading')}</p>}
        {members?.length === 0 && <p className="type-body">{t(lang, 'clEmpty')}</p>}
        {msg && (
          <p role="status" className="type-body">
            {msg}
          </p>
        )}
        <ul className="space-y-2">
          {sorted.map((m) => {
            const stuck = isStuck(m.live, now)
            const minutes = m.live.since ? Math.max(0, Math.floor((now - m.live.since) / 60_000)) : null
            return (
              <li key={m.id} className={`space-y-2 rounded border-2 p-3 ${stuck ? 'border-maroon bg-maroon-tint' : 'border-ink bg-cream'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex-1 type-subheading">{m.nickname}</span>
                  {stuck && <span className="rounded border border-maroon bg-white px-2 py-0.5 type-micro text-maroon">{t(lang, 'clStuck')}</span>}
                  <span className="type-caption text-ink-muted">{t(lang, 'clPassed', { n: m.passed.length })}</span>
                </div>
                <p className="type-body">
                  {m.live.session && m.live.puzzle ? (
                    <>
                      {sessionLabel(lang, m.live.session)} · {puzzleLabel(lang, m.live.session, m.live.puzzle)}
                      <span className="text-ink-muted">
                        {' '}
                        · {t(lang, 'clMinutes', { n: minutes ?? 0 })} · {t(lang, 'clRuns', { n: m.live.runs })}
                        {m.live.hint > 0 && ` · ${t(lang, 'clHint', { n: m.live.hint })}`}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-muted">{t(lang, 'clIdle')}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => rename(m)} className={secondaryButton}>
                    {t(lang, 'clRename')}
                  </button>
                  <button onClick={() => reset(m)} className={secondaryButton}>
                    {t(lang, 'clReset')}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        {error && (
          <p role="alert" className="type-body text-maroon">
            {t(lang, 'acError', { msg: error })}
          </p>
        )}
        {(members?.length ?? 0) >= MAX_MEMBERS && <p className="type-body">{t(lang, 'kjFull')}</p>}
      </Card>
    </Page>
  )
}
