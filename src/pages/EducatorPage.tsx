import { useEffect, useState } from 'react'
import { useAccount } from '../account/AccountProvider'
import { cancelClassRequest, loadMyRequests } from '../account/client'
import { MAX_ACTIVE, type ClassRequest, type RequestStatus } from '../account/classRequest'
import type { Profile } from '../account/schema'
import { RequireRole, Card, Page, errorText, primaryButton, secondaryButton } from '../account/ui'
import { t, type Key } from '../i18n'
import { impact } from '../impact'
import { useLang } from '../lang'
import { Link } from '../router'
import { GUIDE_IDS } from '../staticRoutes'
import { dayLabel, justSent, sessionLabel } from '../account/requestText'

/**
 * /guru: an educator's home: the onboarding checklist and their class
 * requests (docs/plan/07-accounts-and-classes.md, sections 4 and 5).
 */
export default function EducatorPage() {
  return <RequireRole role="educator">{({ user, profile }) => <Home uid={user.uid} profile={profile} />}</RequireRole>
}

const STATUS_KEY: Record<RequestStatus, Key> = { pending: 'stPending', approved: 'stApproved', rejected: 'stRejected', cancelled: 'stCancelled' }
const STATUS_STYLE: Record<RequestStatus, string> = {
  pending: 'bg-amber-tint',
  approved: 'bg-tosca-tint',
  rejected: 'bg-maroon-tint',
  cancelled: 'bg-parchment',
}

function Home({ uid, profile }: { uid: string; profile: Profile }) {
  const { lang } = useLang()
  const { refresh } = useAccount()
  const [requests, setRequests] = useState<ClassRequest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sent] = useState(() => {
    const was = justSent.value
    justSent.value = false
    return was
  })
  const reload = () =>
    loadMyRequests(uid)
      .then((list) => {
        setRequests(list)
        // An approval gives access on the server; pick it up without a reload.
        if (!profile.access.sessions && list.some((r) => r.status === 'approved')) void refresh()
      })
      .catch((e) => setError(errorText(e)))
  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  const cancel = async (r: ClassRequest) => {
    if (!window.confirm(t(lang, 'edCancelConfirm', { name: r.institution }))) return
    try {
      await cancelClassRequest(r.id)
      await reload()
    } catch (e) {
      setError(errorText(e))
    }
  }

  const active = requests?.filter((r) => r.active).length ?? 0
  const guideRead = GUIDE_IDS.some((id) => impact.guideSeen(id))
  const steps = [
    { done: guideRead, label: t(lang, 'edStepGuide'), to: '/panduan' },
    { done: (requests?.length ?? 0) > 0, label: t(lang, 'edStepRequest'), to: '/guru/ajukan' },
    { done: false, label: t(lang, 'edStepShare'), soon: true },
  ]

  return (
    <Page title={t(lang, 'edHello', { name: profile.displayName })}>
      {sent && (
        <p role="status" className="rounded-lg border-2 border-tosca-dark bg-tosca-tint p-4 type-body">
          {t(lang, 'crSent')}
        </p>
      )}
      <p className={`rounded-lg border-2 p-4 type-body ${profile.access.sessions ? 'border-tosca-dark bg-tosca-tint' : 'border-ink bg-amber-tint'}`}>
        {t(lang, profile.access.sessions ? 'edAccessYes' : 'edAccessNo')}
      </p>
      <Card title={t(lang, 'edSteps')}>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-3 type-body">
              <span aria-hidden className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-ink type-label ${s.done ? 'bg-tosca-dark text-white' : 'bg-white'}`}>
                {s.done ? '✓' : i + 1}
              </span>
              {s.to ? (
                <Link to={s.to} className="underline hover:text-maroon">
                  {s.label}
                </Link>
              ) : (
                <span>{s.label}</span>
              )}
              {s.soon && <span className="rounded border border-ink bg-parchment px-2 py-0.5 type-micro">{t(lang, 'edSoon')}</span>}
            </li>
          ))}
        </ol>
      </Card>

      <Card title={t(lang, 'edRequests')}>
        <p className="type-caption text-ink-muted">{t(lang, 'edLimit', { n: active })}</p>
        {requests === null && !error && <p className="type-body">{t(lang, 'acLoading')}</p>}
        {requests?.length === 0 && <p className="type-body">{t(lang, 'edRequestsEmpty')}</p>}
        <ul className="space-y-3">
          {requests?.map((r) => (
            <li key={r.id} className="space-y-2 rounded border-2 border-ink bg-cream p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex-1 type-subheading">{r.institution}</span>
                <span className={`rounded border border-ink px-2 py-0.5 type-micro ${STATUS_STYLE[r.status]}`}>{t(lang, STATUS_KEY[r.status])}</span>
              </div>
              <p className="type-body">
                {dayLabel(lang, r.start)} – {dayLabel(lang, r.end)} · {t(lang, 'edCount', { n: r.count })}
              </p>
              <p className="type-caption text-ink-muted">{r.sessions.map((s) => sessionLabel(lang, s)).join(', ')}</p>
              {r.note && <p className="type-body">{t(lang, 'edNote', { note: r.note })}</p>}
              {r.status === 'approved' && <p className="type-caption text-ink-muted">{t(lang, 'edApprovedNext')}</p>}
              {r.status === 'pending' && (
                <button onClick={() => cancel(r)} className={secondaryButton}>
                  {t(lang, 'edCancel')}
                </button>
              )}
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert" className="rounded border-2 border-maroon bg-maroon-tint p-3 type-body">
            {t(lang, 'acError', { msg: error })}
          </p>
        )}
        {active < MAX_ACTIVE ? (
          <Link to="/guru/ajukan" className={`inline-block ${primaryButton}`}>
            {t(lang, 'edNewRequest')}
          </Link>
        ) : (
          <p className="type-body">{t(lang, 'crFull')}</p>
        )}
      </Card>

      <Link to="/akun" className="inline-block type-label underline hover:text-maroon">
        {t(lang, 'akTitle')}
      </Link>
    </Page>
  )
}
