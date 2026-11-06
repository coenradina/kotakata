import PixelSprite from '../components/PixelSprite'
import SiteHeader from '../components/SiteHeader'
import { t } from '../i18n'
import { useLang } from '../lang'
import { ALL, LEVELS, SESSIONS, isUnlocked } from '../levels'
import { Link } from '../router'
import { PLANNED } from '../sessions/catalog'
import { store } from '../store'

/**
 * The front door (docs/plan/04-ui-design.md, section 5.1): what Kotakata
 * is, the sessions on the way, and the classic levels to play today.
 * Nothing here needs an account.
 */
export default function LandingPage() {
  const { lang } = useLang()
  const progress = store.load()
  const passed = new Set(progress.passed)
  // Pick up where the player left off; a first visit starts at Level 1.
  // A first visit starts at Session 1, the one that works as an Hour of Code.
  const resume = progress.lastSession && ALL.some((l) => l.id === progress.lastSession) ? progress.lastSession : SESSIONS[0].id

  return (
    <div className="min-h-full bg-cream">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="border-b-2 border-ink px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-3xl space-y-6">
              <p className="type-eyebrow text-tosca-dark">{t(lang, 'heroEyebrow')}</p>
              <h1 className="type-display">{t(lang, 'heroTitle')}</h1>
              <p className="type-lead text-ink-soft">{t(lang, 'heroLead')}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to={`/main/${resume}`} className="pixel-btn rounded border-2 border-ink bg-maroon px-6 py-3 type-button-lg text-white hover:bg-maroon-dark">
                  {t(lang, 'heroStart')}
                </Link>
                <Link to="/main" className="pixel-btn rounded border-2 border-ink bg-white px-6 py-3 type-button-lg hover:bg-parchment">
                  {t(lang, 'heroMap')}
                </Link>
              </div>
            </div>
            <div className="hidden justify-center lg:flex">
              <div className="kata-bob rounded-lg border-2 border-ink bg-white p-8 shadow-pixel-lg">
                <PixelSprite sprite="robot0" scale={12} label="Kata" />
              </div>
            </div>
          </div>
        </section>

        {/* Sessions on the way */}
        <section aria-labelledby="sessions-title" className="border-b-2 border-ink bg-parchment px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="max-w-3xl space-y-3">
              <h2 id="sessions-title" className="type-title">
                {t(lang, 'sessionsTitle')}
              </h2>
              <p className="type-lead text-ink-soft">{t(lang, 'sessionsLead')}</p>
            </div>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {PLANNED.map((s) => {
                const playable = SESSIONS.some((x) => x.id === s.id)
                const done = passed.has(s.id)
                return (
                  <li
                    key={s.id}
                    className={`flex flex-col rounded-lg border-2 p-6 ${playable ? 'border-ink bg-white shadow-pixel-lg' : s.firstRelease ? 'border-ink bg-white shadow-pixel' : 'border-dashed border-ink/40 bg-cream'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="type-eyebrow text-maroon">{t(lang, 'sessionLabel', { n: s.n })}</span>
                      <span className="text-icon" aria-hidden="true">
                        {s.icon}
                      </span>
                    </div>
                    <h3 className="mt-3 type-heading">{s.title[lang]}</h3>
                    <p className="mt-2 flex-1 type-body text-ink-soft">{s.bigQuestion[lang]}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <Chip>⏱ {t(lang, 'minutes', { n: s.minutes })}</Chip>
                      <Chip>{t(lang, 'kelasChip', { k: s.kelas.join(', ') })}</Chip>
                      {!playable && <Chip>{s.firstRelease ? t(lang, 'firstRelease') : t(lang, 'soon')}</Chip>}
                    </div>
                    {playable && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link to={`/main/${s.id}`} className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 type-button text-white hover:bg-maroon-dark">
                          {done ? t(lang, 'replay') : t(lang, 'play')}
                        </Link>
                        {done && (
                          <Link to={`/sertifikat/${s.id}`} className="pixel-btn rounded border-2 border-ink bg-amber px-4 py-2 type-button hover:bg-amber-tint">
                            🎓 {t(lang, 'certificate')}
                          </Link>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Classic levels */}
        <section aria-labelledby="classic-title" className="border-b-2 border-ink px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="max-w-3xl space-y-3">
              <h2 id="classic-title" className="type-title">
                {t(lang, 'classicTitle')}
              </h2>
              <p className="type-lead text-ink-soft">{t(lang, 'classicLead')}</p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {LEVELS.map((level, i) => {
                const done = passed.has(level.id)
                const open = isUnlocked(level.id, passed)
                return (
                  <li key={level.id} className={`flex flex-col rounded-lg border-2 p-6 ${open ? 'border-ink bg-white shadow-pixel' : 'border-dashed border-ink/40 bg-cream'}`}>
                    <span className="type-eyebrow text-maroon">{t(lang, 'levelN', { n: i + 1 })}</span>
                    <h3 className="mt-2 type-subheading">
                      {level.title[lang]} {done && <span aria-label={t(lang, 'roomDone')}>✓</span>}
                    </h3>
                    <p className="mt-1 flex-1 type-label text-ink-muted">{level.topic[lang]}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!open && <span className="type-micro text-ink-muted">🔒 {t(lang, 'levelLocked')}</span>}
                      {open && <Link to={`/main/${level.id}`} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
                        {done ? t(lang, 'replay') : t(lang, 'play')}
                      </Link>}
                      {done && (
                        <Link to={`/sertifikat/${level.id}`} className="pixel-btn rounded border-2 border-ink bg-amber px-3 py-1.5 type-button hover:bg-amber-tint">
                          🎓 {t(lang, 'certificate')}
                        </Link>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Who it's for */}
        <section aria-labelledby="who-title" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <h2 id="who-title" className="type-title">
              {t(lang, 'forWhoTitle')}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {(
                [
                  ['forStudents', 'forStudentsBody', 'bg-tosca'],
                  ['forTeachers', 'forTeachersBody', 'bg-maroon'],
                  ['forParents', 'forParentsBody', 'bg-amber'],
                ] as const
              ).map(([title, body, accent]) => (
                <div key={title} className="overflow-hidden rounded-lg border-2 border-ink bg-white shadow-pixel-sm">
                  {/* Role accent: a thin stripe, never a fill (docs/plan/04-ui-design.md, section 8) */}
                  <div aria-hidden="true" className={`h-1 border-b-2 border-ink ${accent}`} />
                  <div className="p-6">
                    <h3 className="type-heading">{t(lang, title)}</h3>
                    <p className="mt-2 type-body text-ink-soft">{t(lang, body)}</p>
                    {title !== 'forStudents' && (
                      <Link to="/panduan" className="mt-3 inline-block type-label underline hover:text-maroon">
                        {t(lang, title === 'forTeachers' ? 'gForGuru' : 'gForOrtu')} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-cream sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 type-label">
          <span>
            {t(lang, 'footerMade')}{' '}
            <a href="https://aastr.id" className="underline hover:text-amber">
              aastr.id
            </a>
          </span>
          <a href="https://github.com/coenradina/kotakata" className="underline hover:text-amber">
            {t(lang, 'footerSource')}
          </a>
        </div>
      </footer>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-ink bg-parchment px-2 py-0.5 type-micro">{children}</span>
}
