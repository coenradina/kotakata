import { useState, type ReactNode } from 'react'
import SiteHeader from '../components/SiteHeader'
import { t } from '../i18n'
import { useLang } from '../lang'
import { LEVELS, SESSIONS, isUnlocked } from '../levels'
import { Link } from '../router'
import { PLANNED } from '../sessions/catalog'
import { store } from '../store'

/**
 * The session list drawn as the front of SMP Kotakata
 * (docs/plan/04-ui-design.md, section 5.2). Each room is a session: the new
 * sessions upstairs, the classic levels on the ground floor. Rooms are
 * plain list items and links, so the map reads as a list too.
 */
export default function MapPage() {
  const { lang } = useLang()
  const progress = store.load()
  const passed = new Set(progress.passed)
  // Ask for feedback once the player has done at least one stage, until they answer.
  const played = Object.values(progress.puzzlesDone).some((p) => p.length > 0)
  const [invite, setInvite] = useState(played && !progress.surveyDone)

  return (
    <div className="min-h-full bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h1 className="type-title">🏫 {t(lang, 'mapTitle')}</h1>
          <p className="type-lead text-ink-soft">{t(lang, 'mapLead')}</p>
        </div>

        {invite && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-ink bg-amber-tint p-4 shadow-pixel-sm">
            <p className="w-full type-label sm:w-auto sm:flex-1">💬 {t(lang, 'svInvite')}</p>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setInvite(false)} className="min-h-11 rounded px-3 py-2 type-label underline hover:text-maroon">
                {t(lang, 'svInviteLater')}
              </button>
              <Link to="/survei" className="pixel-btn flex min-h-11 items-center rounded border-2 border-ink bg-maroon px-4 py-2 type-label text-white hover:bg-maroon-dark">
                {t(lang, 'svInviteGo')}
              </Link>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-5xl">
          {/* Stepped pixel roof with the school's sign */}
          <div aria-hidden="true" className="relative">
            <div className="mx-auto h-4 w-6/12 border-2 border-b-0 border-ink bg-maroon" />
            <div className="mx-auto h-4 w-9/12 border-2 border-b-0 border-ink bg-maroon" />
            <div className="h-4 w-full border-2 border-b-0 border-ink bg-maroon-dark" />
            <div className="absolute inset-x-0 -top-3 flex justify-center">
              <span className="rounded border-2 border-ink bg-white px-4 py-1 type-pixel shadow-pixel-sm">SMP KOTAKATA</span>
            </div>
          </div>

          <div className="space-y-6 border-2 border-ink bg-parchment p-4 sm:p-6">
            <Floor title={t(lang, 'floorNew')}>
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PLANNED.map((s) => {
                  if (!SESSIONS.some((x) => x.id === s.id)) {
                    return (
                      <li key={s.id}>
                        <Room number={`R.2${s.n}`} icon={s.icon} title={s.title[lang]} status={s.firstRelease ? t(lang, 'firstRelease') : t(lang, 'soon')} state="soon" />
                      </li>
                    )
                  }
                  const done = passed.has(s.id)
                  return (
                    <li key={s.id} className="space-y-2">
                      <Link to={`/main/${s.id}`} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                        <Room number={`R.2${s.n}`} icon={done ? '✓' : s.icon} title={s.title[lang]} status={done ? t(lang, 'roomDone') : t(lang, 'roomOpen')} state={done ? 'done' : 'open'} />
                      </Link>
                      {done && (
                        <Link to={`/sertifikat/${s.id}`} className="inline-block type-micro underline hover:text-maroon">
                          🎓 {t(lang, 'certificate')}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ol>
            </Floor>
            <div aria-hidden="true" className="border-t-2 border-dashed border-ink/30" />
            <Floor title={t(lang, 'floorClassic')}>
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {LEVELS.map((level, i) => {
                  const done = passed.has(level.id)
                  if (!isUnlocked(level.id, passed)) {
                    return (
                      <li key={level.id}>
                        <Room number={`R.1${i + 1}`} icon="🔒" title={level.title[lang]} status={t(lang, 'levelLocked')} state="soon" />
                      </li>
                    )
                  }
                  return (
                    <li key={level.id} className="space-y-2">
                      <Link to={`/main/${level.id}`} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                        <Room
                          number={`R.1${i + 1}`}
                          icon={done ? '✓' : '🚪'}
                          title={level.title[lang]}
                          status={done ? t(lang, 'roomDone') : t(lang, 'roomOpen')}
                          state={done ? 'done' : 'open'}
                        />
                      </Link>
                      {done && (
                        <Link to={`/sertifikat/${level.id}`} className="inline-block type-micro underline hover:text-maroon">
                          🎓 {t(lang, 'certificate')}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ol>
            </Floor>
          </div>

          {/* The yard: flag pole and grass */}
          <div aria-hidden="true" className="flex items-end gap-0 border-2 border-t-0 border-ink bg-tosca-tint px-6 pt-3">
            <div className="flex items-start">
              <div className="h-16 w-1 bg-ink" />
              <div className="mt-1 overflow-hidden rounded-r border-2 border-ink">
                <div className="h-3 w-10 bg-maroon" />
                <div className="h-3 w-10 bg-white" />
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="h-3 border-2 border-t-0 border-ink bg-tosca" />
        </div>
      </main>
    </div>
  )
}

function Floor({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="type-eyebrow text-ink-soft">{title}</h2>
      {children}
    </section>
  )
}

function Room({ number, icon, title, status, state }: { number: string; icon: string; title: string; status: string; state: 'soon' | 'open' | 'done' }) {
  const soon = state === 'soon'
  return (
    <div
      className={`h-full overflow-hidden rounded-lg border-2 ${soon ? 'border-dashed border-ink/40 bg-cream text-ink-muted' : 'border-ink bg-white shadow-pixel-sm transition-transform hover:-translate-y-0.5'}`}
    >
      {/* The window */}
      <div className={`grid h-16 grid-cols-2 border-b-2 ${soon ? 'border-ink/20 bg-parchment' : state === 'done' ? 'border-ink bg-tosca-tint' : 'border-ink bg-amber-tint'}`}>
        <div className={`flex items-center justify-center border-r-2 ${soon ? 'border-ink/20' : 'border-ink'}`}>
          <span className={`text-icon ${soon ? 'opacity-50 grayscale' : ''}`} aria-hidden="true">
            {icon}
          </span>
        </div>
        <div className="flex items-center justify-center">
          <span className="type-pixel-sm">{number}</span>
        </div>
      </div>
      <div className="space-y-1 p-3">
        <p className="type-subheading">{title}</p>
        <p className="type-micro">{status}</p>
      </div>
    </div>
  )
}
