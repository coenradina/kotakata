import { RequireRole, Card, Page } from '../account/ui'
import { t } from '../i18n'
import { impact } from '../impact'
import { useLang } from '../lang'
import { Link } from '../router'
import { GUIDE_IDS } from '../staticRoutes'

/**
 * /guru: an educator's home. Until classes are built it is the onboarding
 * checklist (docs/plan/07-accounts-and-classes.md, section 4).
 */
export default function EducatorPage() {
  const { lang } = useLang()
  return (
    <RequireRole role="educator">
      {({ profile }) => {
        const guideRead = GUIDE_IDS.some((id) => impact.guideSeen(id))
        const steps = [
          { done: guideRead, label: t(lang, 'edStepGuide'), to: '/panduan' },
          { done: false, label: t(lang, 'edStepRequest'), soon: true },
          { done: false, label: t(lang, 'edStepShare'), soon: true },
        ]
        return (
          <Page title={t(lang, 'edHello', { name: profile.displayName })}>
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
            <Link to="/akun" className="inline-block type-label underline hover:text-maroon">
              {t(lang, 'akTitle')}
            </Link>
          </Page>
        )
      }}
    </RequireRole>
  )
}
