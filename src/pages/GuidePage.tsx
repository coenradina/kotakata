import type { ReactNode } from 'react'
import SiteHeader from '../components/SiteHeader'
import { guideFor, type Role, type SessionGuide } from '../guides'
import { PRIVACY, REFLECTION, RUBRIC, RUBRIC_LEVELS, TIMELINE } from '../guides/shared'
import type { CardSet, L } from '../guides/types'
import { t, type Key, type Lang } from '../i18n'
import { useLang } from '../lang'
import { Link } from '../router'
import GuidesPage from './GuidesPage'

/**
 * One guide, for one role (docs/plan/02-sessions.md, section 10). Teachers
 * and parents get the same session, told differently. Printing hides the
 * page chrome and starts the card appendix on a new page.
 */
export default function GuidePage({ role, id }: { role: string; id: string }) {
  const { lang } = useLang()
  const guide = guideFor(id)
  if (!guide || (role !== 'guru' && role !== 'ortu')) return <GuidesPage />
  const sections = role === 'guru' ? teacherSections(guide, lang) : parentSections(guide, lang)

  return (
    <div className="min-h-full bg-cream">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to="/panduan" className="type-label underline hover:text-maroon">
            {t(lang, 'gAllGuides')}
          </Link>
          <div className="flex flex-wrap gap-2">
            <RoleSwitch role={role as Role} id={id} lang={lang} />
            <Link to={`/main/${id}`} className="pixel-btn rounded border-2 border-ink bg-white px-3 py-1.5 type-button hover:bg-parchment">
              {t(lang, 'gPlay')}
            </Link>
            <button onClick={() => window.print()} className="pixel-btn rounded border-2 border-ink bg-maroon px-3 py-1.5 type-button text-white hover:bg-maroon-dark">
              {t(lang, 'gPrint')}
            </button>
          </div>
        </div>

        <header className="mt-8 space-y-2">
          <p className="type-eyebrow text-maroon">
            {t(lang, role === 'guru' ? 'gForGuru' : 'gForOrtu')} · {t(lang, 'sessionLabel', { n: guide.session.slice(1) })}
          </p>
          <h1 className="type-title">{guide.title[lang]}</h1>
          <p className="type-lead text-ink-soft">"{guide.bigQuestion[lang]}"</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] print:block">
          <nav aria-label={t(lang, 'gContents')} className="print:hidden">
            <div className="sticky top-4 space-y-2">
              <p className="type-eyebrow text-ink-soft">{t(lang, 'gContents')}</p>
              <ol className="space-y-1">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="type-label hover:text-maroon">
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
          <article className="min-w-0 space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className={`scroll-mt-4 space-y-3 ${s.newPage ? 'print:break-before-page' : ''}`}>
                <h2 id={`${s.id}-h`} className="type-heading">
                  {i + 1}. {s.title}
                </h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      </main>
    </div>
  )
}

function RoleSwitch({ role, id, lang }: { role: Role; id: string; lang: Lang }) {
  return (
    <div className="flex overflow-hidden rounded border-2 border-ink type-button" role="group" aria-label={t(lang, 'gIndexTitle')}>
      {(['guru', 'ortu'] as Role[]).map((r) => (
        <Link key={r} to={`/panduan/${r}/${id}`} aria-current={r === role ? 'page' : undefined} className={`px-3 py-1.5 ${r === role ? 'bg-ink text-cream' : 'bg-white hover:bg-parchment'}`}>
          {t(lang, r === 'guru' ? 'gGuru' : 'gOrtu')}
        </Link>
      ))}
    </div>
  )
}

type Section = { id: string; title: string; body: ReactNode; newPage?: boolean }

const P = ({ children }: { children: ReactNode }) => <p className="type-body">{children}</p>
const List = ({ items, ordered }: { items: string[]; ordered?: boolean }) => {
  const cls = `space-y-1.5 pl-6 type-body ${ordered ? 'list-decimal' : 'list-disc'}`
  return ordered ? (
    <ol className={cls}>
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ol>
  ) : (
    <ul className={cls}>
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  )
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border-2 border-ink bg-white print:overflow-visible">
      <table className="w-full border-collapse text-left type-body">
        <thead className="bg-parchment">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b-2 border-ink px-3 py-2 type-label">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ink/20 align-top last:border-b-0">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const tx = (lang: Lang, k: Key) => t(lang, k)
const each = (lang: Lang, xs: L[]) => xs.map((x) => x[lang])

function teacherSections(g: SessionGuide, lang: Lang): Section[] {
  return [
    {
      id: 'identitas',
      title: tx(lang, 'gSecIdentity'),
      body: (
        <Table
          head={[tx(lang, 'gCriterion'), '']}
          rows={[
            [tx(lang, 'gKelas'), g.kelas],
            [tx(lang, 'gElements'), each(lang, g.kka.elements).join('; ')],
            [tx(lang, 'gMateri'), <List key="m" items={each(lang, g.kka.materi)} />],
            [tx(lang, 'gTime'), tx(lang, 'gTimeValue')],
          ]}
        />
      ),
    },
    {
      id: 'tujuan',
      title: tx(lang, 'gSecGoals'),
      body: (
        <>
          <List items={each(lang, g.goals)} />
          <h3 className="pt-2 type-subheading">{tx(lang, 'gSecTerms')}</h3>
          <Table head={[tx(lang, 'gTallyWord'), '']} rows={g.terms.map((x) => [<span key="t" lang="en" className="font-bold">{x.term}</span>, x.def[lang]])} />
        </>
      ),
    },
    { id: 'persiapan', title: tx(lang, 'gSecPrep'), body: <List items={each(lang, g.prep.guru)} /> },
    {
      id: 'waktu',
      title: tx(lang, 'gSecTimeline'),
      body: <Table head={[tx(lang, 'gColBlock'), tx(lang, 'gColHoc'), tx(lang, 'gColJp')]} rows={TIMELINE.map((r) => [r.block[lang], r.hoc, r.jp])} />,
    },
    { id: 'pemanasan', title: tx(lang, 'gSecWarmup'), body: <List ordered items={each(lang, g.warmup.guru)} /> },
    {
      id: 'bermain',
      title: tx(lang, 'gSecPlay'),
      body: (
        <Table
          head={[tx(lang, 'gColStage'), tx(lang, 'gColHappens'), tx(lang, 'gColStuck'), tx(lang, 'gColSay')]}
          rows={g.puzzles.map((p) => [<span key="s" className="font-bold">{p.title[lang]}</span>, p.happens[lang], p.stuck[lang], p.say[lang]])}
        />
      ),
    },
    {
      id: 'diskusi',
      title: tx(lang, 'gSecDebrief'),
      body: <Table head={[tx(lang, 'gQuestion'), tx(lang, 'gLookFor')]} rows={g.debrief.guru.map((d) => [d.q[lang], d.a[lang]])} />,
    },
    {
      id: 'exit',
      title: tx(lang, 'gSecExit'),
      body: <Table head={[tx(lang, 'gQuestion'), tx(lang, 'gAnswer')]} rows={g.exitTicket.map((e, i) => [`${i + 1}. ${e.q[lang]}`, e.a[lang]])} />,
    },
    {
      id: 'miskonsepsi',
      title: tx(lang, 'gSecMisconceptions'),
      body: <Table head={[tx(lang, 'gParentSays'), tx(lang, 'gReply')]} rows={g.misconceptions.map((m) => [m.belief[lang], m.reply[lang]])} />,
    },
    { id: 'perluasan', title: tx(lang, 'gSecExtension'), body: <List items={each(lang, g.extension.guru)} /> },
    {
      id: 'rubrik',
      title: tx(lang, 'gSecRubric'),
      body: (
        <>
          <Table head={[tx(lang, 'gCriterion'), ...RUBRIC_LEVELS.map((l) => l[lang])]} rows={RUBRIC.map((r) => [<span key="c" className="font-bold">{r.criterion[lang]}</span>, ...r.levels.map((l) => l[lang])])} />
          <h3 className="pt-2 type-subheading">{tx(lang, 'gReflection')}</h3>
          <List ordered items={each(lang, REFLECTION)} />
        </>
      ),
    },
    {
      id: 'kurikulum',
      title: tx(lang, 'gSecMapping'),
      body: <Table head={[tx(lang, 'gFramework'), tx(lang, 'gCovers')]} rows={g.mapping.map((m) => [<span key="f" className="font-bold">{m.framework}</span>, m.covers[lang]])} />,
    },
    { id: 'privasi', title: tx(lang, 'gSecPrivacy'), body: <List items={each(lang, PRIVACY.guru)} /> },
    { id: 'unplugged', title: tx(lang, 'gSecUnplugged'), body: <List ordered items={each(lang, g.unplugged.guru)} />, newPage: true },
    { id: 'kartu', title: tx(lang, 'gSecCards'), body: <Appendix guide={g} lang={lang} />, newPage: true },
  ]
}

function parentSections(g: SessionGuide, lang: Lang): Section[] {
  return [
    {
      id: 'tentang',
      title: tx(lang, 'gParentAbout'),
      body: (
        <Table
          head={[tx(lang, 'gCriterion'), '']}
          rows={[
            [tx(lang, 'gAge'), tx(lang, 'gAgeValue')],
            [tx(lang, 'gTime'), tx(lang, 'gTimeParent')],
            [tx(lang, 'gSecPrep'), <List key="p" items={each(lang, g.prep.ortu)} />],
          ]}
        />
      ),
    },
    {
      id: 'belajar',
      title: tx(lang, 'gParentLearn'),
      body: (
        <>
          <P>{g.forParents[lang]}</P>
          <Table head={[tx(lang, 'gTallyWord'), '']} rows={g.terms.map((x) => [<span key="t" lang="en" className="font-bold">{x.term}</span>, x.def[lang]])} />
        </>
      ),
    },
    { id: 'obrolan', title: tx(lang, 'gParentTalk'), body: <P>{g.warmup.ortu[lang]}</P> },
    {
      id: 'main',
      title: tx(lang, 'gParentPlay'),
      body: (
        <>
          <List items={(['gTip1', 'gTip2', 'gTip3', 'gTip4'] as Key[]).map((k) => tx(lang, k))} />
          <Table head={[tx(lang, 'gColStage'), tx(lang, 'gAskChild')]} rows={g.puzzles.map((p) => [<span key="s" className="font-bold">{p.title[lang]}</span>, p.say[lang]])} />
        </>
      ),
    },
    { id: 'setelah', title: tx(lang, 'gParentAfter'), body: <List items={each(lang, g.debrief.ortu)} /> },
    {
      id: 'cek',
      title: tx(lang, 'gParentCheck'),
      body: <Table head={[tx(lang, 'gQuestion'), tx(lang, 'gAnswer')]} rows={g.exitTicket.map((e, i) => [`${i + 1}. ${e.q[lang]}`, e.a[lang]])} />,
    },
    {
      id: 'kalau',
      title: tx(lang, 'gParentSays'),
      body: <Table head={[tx(lang, 'gParentSays'), tx(lang, 'gReply')]} rows={g.misconceptions.map((m) => [m.belief[lang], m.reply[lang]])} />,
    },
    { id: 'rumah', title: tx(lang, 'gParentHabit'), body: <P>{g.extension.ortu[lang]}</P> },
    { id: 'meja', title: tx(lang, 'gParentTable'), body: <List ordered items={each(lang, g.unplugged.ortu)} /> },
    { id: 'privasi', title: tx(lang, 'gSecPrivacy'), body: <List items={each(lang, PRIVACY.ortu)} /> },
  ]
}

/** Printable cards and a tally sheet, built from the game's own data so paper and screen match. */
function Appendix({ guide, lang }: { guide: SessionGuide; lang: Lang }) {
  const pairs = guide.session === 's5'
  return (
    <div className="space-y-8">
      <p className="type-caption text-ink-muted">✂ {tx(lang, 'gCutHint')}</p>
      {guide.cardSets.map((set) => (
        <CardSheet key={set.title.en} set={set} lang={lang} />
      ))}
      <div className="space-y-2 print:break-before-page">
        <h3 className="type-subheading">{tx(lang, pairs ? 'gPairTitle' : 'gTallyTitle')}</h3>
        <Table
          head={pairs ? [tx(lang, 'gPairWord'), tx(lang, 'gPairNext'), tx(lang, 'gPairCount')] : [tx(lang, 'gTallyWord'), tx(lang, 'gTallyPenting'), tx(lang, 'gTallySantai')]}
          rows={Array.from({ length: 14 }, () => [' ', '', ''])}
        />
      </div>
    </div>
  )
}

function CardSheet({ set, lang }: { set: CardSet; lang: Lang }) {
  const cards = set.cards(lang)
  return (
    <div className="space-y-2">
      <h3 className="type-subheading">{set.title[lang]}</h3>
      <ul className="grid grid-cols-2 gap-0 sm:grid-cols-3 print:grid-cols-3">
        {cards.map((c, i) => (
          <li key={`${c.text}-${i}`} className="flex min-h-24 break-inside-avoid flex-col justify-between border border-dashed border-ink/60 bg-white p-3">
            <span className="type-micro text-ink-muted">#{i + 1}</span>
            <span className="type-lead">{c.text}</span>
            {set.showLabel && c.label && <span className="self-end rounded border border-ink bg-parchment px-1.5 py-0.5 type-micro">{c.label}</span>}
          </li>
        ))}
      </ul>
      {/* Test cards carry no label; the key is for the teacher, under the sheet. */}
      {!set.showLabel && cards.some((c) => c.label) && (
        <p className="type-caption text-ink-muted">
          {tx(lang, 'gKey')}: {cards.map((c, i) => `#${i + 1} ${c.label}`).join(' · ')}
        </p>
      )}
    </div>
  )
}
