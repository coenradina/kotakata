// Session 6: "Rapat OSIS" (Student council meeting).
//
// A decision simulation. Each proposal is a set of choices; a school week
// runs and fills a few meters. Five characters care about different
// meters, and a plan passes when no meter drops below half, so nobody
// objects. No plan fills every meter, and for the attendance camera the
// plan everyone accepts doesn't use AI at all.

export type PlanId = 'attend' | 'essay1' | 'essay2' | 'chat' | 'gate'
export type MeterId = 'time' | 'privacy' | 'fairness' | 'caught' | 'trust' | 'safety'
export type PersonId = 'raka' | 'rina' | 'joko' | 'sari' | 'udin'

export const PEOPLE: PersonId[] = ['raka', 'rina', 'joko', 'sari', 'udin']
/** Which meters each character watches. */
export const CARES: Record<PersonId, MeterId[]> = {
  raka: ['time'],
  rina: ['fairness', 'caught'],
  joko: ['privacy', 'trust'],
  sari: ['fairness', 'privacy'],
  udin: ['safety'],
}

export interface Settings {
  attend: 'camera' | 'qr' | 'call'
  strict: number
  flag: 'zero' | 'talk'
  unsure: 'answer' | 'handoff'
  review: 'direct' | 'all'
  keep: 'forever' | 'week'
  access: 'anyone' | 'incident'
  recog: 'on' | 'off'
}

/** Each proposal as first put to the meeting: as much AI as possible. */
export const DEFAULTS: Settings = { attend: 'camera', strict: 5, flag: 'zero', unsure: 'answer', review: 'direct', keep: 'forever', access: 'anyone', recog: 'on' }
export const STRICT_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** What the player set; anything missing keeps the proposal's default. */
export type Program = Partial<Settings> & { ids: Partial<Record<keyof Settings, string>> }
export const EMPTY: Program = { ids: {} }

/** One thing that happened during the week, drawn as a token. */
export interface Token {
  icon: string
  tone: 'good' | 'bad' | 'warn' | 'plain'
}

export interface PlanResult {
  plan: PlanId
  meters: { id: MeterId; value: number }[]
  tokens: Token[]
  /** Numbers for the log and notebook lines. */
  facts: Record<string, number>
  ok: boolean
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))
const meters = (m: Partial<Record<MeterId, number>>) => (Object.entries(m) as [MeterId, number][]).map(([id, value]) => ({ id, value: clamp(value) }))

/** Essay detector scores out of 9 for one week: copied essays, then honest ones. */
export const ESSAYS: Record<'essay1' | 'essay2', { copied: number[]; honest: number[] }> = {
  essay1: { copied: [9, 8, 7, 6], honest: [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 7, 8] },
  // Another class: three honest students write in a very formal style, and the detector scores them high.
  essay2: { copied: [9, 8, 7, 6], honest: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 8, 8, 9] },
}

function attend(s: Settings): PlanResult {
  const table = {
    // The camera needs every student's face on file, and misses some faces in bad light or with a mask.
    camera: { time: 90, privacy: 20, fairness: 40, missed: 3 },
    qr: { time: 75, privacy: 85, fairness: 80, missed: 1 },
    call: { time: 20, privacy: 100, fairness: 95, missed: 0 },
  }[s.attend]
  const tokens: Token[] = Array.from({ length: 32 }, (_, i) => (i < table.missed ? { icon: '✗', tone: 'bad' } : { icon: '✓', tone: 'good' }))
  return { plan: 'attend', meters: meters({ time: table.time, privacy: table.privacy, fairness: table.fairness }), tokens, facts: { missed: table.missed, faces: s.attend === 'camera' ? 640 : 0 }, ok: false }
}

function essay(plan: 'essay1' | 'essay2', s: Settings): PlanResult {
  const { copied, honest } = ESSAYS[plan]
  const caught = copied.filter((v) => v >= s.strict).length
  const accused = honest.filter((v) => v >= s.strict).length
  const flagged = caught + accused
  const talk = s.flag === 'talk'
  const tokens: Token[] = [
    ...copied.map((v): Token => (v >= s.strict ? { icon: '🤖', tone: 'good' } : { icon: '🤖', tone: 'warn' })),
    ...honest.map((v): Token => (v >= s.strict ? { icon: '✍️', tone: talk ? 'warn' : 'bad' } : { icon: '✍️', tone: 'plain' })),
  ]
  return {
    plan,
    meters: meters({ caught: (100 * caught) / copied.length, fairness: talk ? 100 - 5 * accused : 100 - 50 * accused, time: talk ? 100 - 8 * flagged : 95 }),
    tokens,
    facts: { caught, missed: copied.length - caught, accused, flagged, strict: s.strict },
    ok: false,
  }
}

function chat(s: Settings): PlanResult {
  // 40 questions from parents in a week; 10 aren't answered by any notice, and Kata makes up 8 of those.
  const made = s.unsure === 'answer' ? 8 : 0
  const wrong = s.review === 'direct' ? made : 0
  const handed = s.unsure === 'handoff' ? 10 : 2
  const load = s.review === 'all' ? 40 : handed
  const tokens: Token[] = Array.from({ length: 40 }, (_, i): Token => {
    if (i < 30) return { icon: '💬', tone: s.review === 'all' ? 'warn' : 'good' }
    if (i < 30 + handed) return { icon: '🙋', tone: 'warn' }
    return { icon: '💬', tone: wrong ? 'bad' : 'warn' }
  })
  return { plan: 'chat', meters: meters({ time: 100 - 2 * load, trust: 100 - 10 * wrong }), tokens, facts: { wrong, handed, load }, ok: false }
}

function gate(s: Settings): PlanResult {
  const privacy = (s.keep === 'forever' ? 20 : 60) + (s.access === 'incident' ? 20 : -30) - (s.recog === 'on' ? 40 : 0)
  const trust = s.access === 'incident' ? 80 : 40
  const safety = s.recog === 'on' ? 90 : 80
  const days = s.keep === 'forever' ? 30 : 7
  const tokens: Token[] = Array.from({ length: 30 }, (_, i): Token => (i < days ? { icon: '📼', tone: s.keep === 'forever' ? 'bad' : 'plain' } : { icon: '·', tone: 'plain' }))
  return { plan: 'gate', meters: meters({ safety, privacy, trust }), tokens, facts: { days }, ok: false }
}

export function runPlan(plan: PlanId, s: Settings): PlanResult {
  const r = plan === 'attend' ? attend(s) : plan === 'essay1' || plan === 'essay2' ? essay(plan, s) : plan === 'chat' ? chat(s) : gate(s)
  return { ...r, ok: r.meters.every((m) => m.value >= 50) }
}

export type Mood = 'happy' | 'okay' | 'upset' | 'none'

/** How a character feels about a plan: by the lowest meter they watch, or no view if they watch none of them. */
export function moodOf(person: PersonId, r: PlanResult): Mood {
  const watched = r.meters.filter((m) => CARES[person].includes(m.id))
  if (!watched.length) return 'none'
  const low = Math.min(...watched.map((m) => m.value))
  return low >= 70 ? 'happy' : low >= 50 ? 'okay' : 'upset'
}

export const PUZZLE_PLANS: Record<string, PlanId[]> = {
  p1: ['attend'],
  p2: ['essay1'],
  p3: ['essay2'],
  p4: ['chat'],
  p5: ['gate'],
  sandbox: ['attend', 'essay2', 'chat', 'gate'],
}

export interface OsisResult {
  plans: PlanResult[]
  settings: Settings
  ok: boolean
}

export function runOsis(program: Program, puzzle: string): OsisResult {
  const { ids: _ids, ...chosen } = program
  void _ids
  const settings: Settings = { ...DEFAULTS, ...chosen }
  const plans = (PUZZLE_PLANS[puzzle] ?? PUZZLE_PLANS.sandbox).map((p) => runPlan(p, settings))
  return { plans, settings, ok: plans.every((p) => p.ok) }
}
