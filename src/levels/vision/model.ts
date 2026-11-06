// Session 2: "Camera filter". Kata runs a filter app that puts sunglasses
// on a face. A photo is a 12×12 grid of brightness numbers (0 dark to 9
// bright), plus, if the phone has one, a depth reading per pixel (near or
// far). The player builds the face finder out of detectors, one at a time:
//
//   dark spots  → the eyes are the darkest pixels
//   edges       → where brightness jumps is the outline of the face
//   pairs       → eyes come two at a time, level with each other
//   exposure    → stretch a dark photo's numbers back to the full range
//   depth       → a real face is near; a poster of one is flat and far
//
// Every face is fictional and drawn by the code below. Skin tones vary on
// purpose: a threshold that only works for light skin is a bug to find.

export const SIZE = 12
export type Grid = number[][]

export interface Photo {
  id: string
  brightness: Grid
  /** 1 where something is near the camera, 0 where it's far. */
  depth: Grid
  /** Where the eyes really are, or null when there is no real face (a poster). */
  eyes: [number, number][] | null
  /** The face's top row, for the sandbox's hat. Null with no real face. */
  top: number | null
  kind: 'bright' | 'dark' | 'poster'
}

const EYES: [number, number][] = [
  [5, 4],
  [5, 7],
]

// The face's shape: a rounded box, 8 rows tall.
function inFace(r: number, c: number) {
  if (r < 3 || r > 10) return false
  if (r === 3 || r === 10) return c >= 4 && c <= 7
  return c >= 3 && c <= 8
}
const inHair = (r: number, c: number) => (r === 1 || r === 2) && c >= 3 && c <= 8

interface FaceOptions {
  id: string
  skin: number
  hair?: number
  /** Two dark dots on the wall behind, level with each other, like a pair of eyes. */
  poster?: boolean
  /** A dark mark on the cheek, two pixels tall. */
  mole?: boolean
  /** Taken in a dark room: every number shrinks. */
  dark?: boolean
  /** It's a picture of a face, not a face: flat, so the depth sensor sees nothing near. */
  picture?: boolean
}

export function makeFace(o: FaceOptions): Photo {
  const hair = o.hair ?? 2
  const b: Grid = []
  const d: Grid = []
  for (let r = 0; r < SIZE; r++) {
    b.push([])
    d.push([])
    for (let c = 0; c < SIZE; c++) {
      // A light wall with a faint texture, so "any change at all" is not an edge.
      let v = (r + c) % 2 ? 9 : 8
      let near = 0
      if (inHair(r, c)) {
        v = hair
        near = 1
      }
      if (inFace(r, c)) {
        v = o.skin
        near = 1
      }
      b[r].push(v)
      d[r].push(o.picture ? 0 : near)
    }
  }
  for (const [r, c] of EYES) b[r][c] = 0
  b[8][5] = b[8][6] = Math.max(1, o.skin - 2) // mouth
  if (o.mole) b[6][3] = b[7][3] = 0
  // Close enough to look like a pair of eyes, and above the face so they're found first.
  if (o.poster) b[0][1] = b[0][4] = 0
  if (o.dark) for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) b[r][c] = Math.round(b[r][c] * 0.3)
  return {
    id: o.id,
    brightness: b,
    depth: d,
    eyes: o.picture ? null : EYES,
    top: o.picture ? null : 3,
    kind: o.picture ? 'poster' : o.dark ? 'dark' : 'bright',
  }
}

/** The photos, from the friends' phones. Each puzzle adds the ones its idea is about. */
export const PHOTOS = {
  dinda: makeFace({ id: 'dinda', skin: 6 }),
  raka: makeFace({ id: 'raka', skin: 5, poster: true }),
  sari: makeFace({ id: 'sari', skin: 4, mole: true }),
  bimo: makeFace({ id: 'bimo', skin: 3, hair: 1 }),
  ayu: makeFace({ id: 'ayu', skin: 6, poster: true, mole: true }),
  dindaDark: makeFace({ id: 'dindaDark', skin: 6, dark: true }),
  bimoDark: makeFace({ id: 'bimoDark', skin: 3, hair: 1, dark: true }),
  poster: makeFace({ id: 'poster', skin: 5, picture: true }),
}
export type PhotoId = keyof typeof PHOTOS

export const PUZZLE_PHOTOS: Record<string, PhotoId[]> = {
  p1: ['dinda'],
  p2: ['dinda', 'raka'],
  p3: ['dinda', 'raka', 'sari', 'bimo', 'ayu'],
  p4: ['dinda', 'sari', 'bimo', 'dindaDark', 'bimoDark'],
  p5: ['dinda', 'raka', 'bimo', 'dindaDark', 'poster'],
  sandbox: ['dinda', 'raka', 'sari', 'bimo', 'ayu', 'dindaDark', 'bimoDark', 'poster'],
}

export type Step =
  | { kind: 'dark'; below: number; id: string }
  | { kind: 'edges'; over: number; id: string }
  | { kind: 'inside'; id: string }
  | { kind: 'pair'; id: string }
  | { kind: 'exposure'; id: string }
  | { kind: 'depth'; id: string }
  | { kind: 'glasses'; id: string }
  | { kind: 'hat'; id: string }

export const DARK_LEVELS = [1, 2, 3, 4, 5]
export const EDGE_LEVELS = [0, 1, 2, 3]

type Cell = [number, number]
const key = ([r, c]: Cell) => r * SIZE + c

/** Stretches a photo's numbers so its darkest pixel is 0 and its brightest is 9. */
export function autoExposure(b: Grid): Grid {
  const flat = b.flat()
  const lo = Math.min(...flat)
  const hi = Math.max(...flat)
  if (hi === lo) return b.map((row) => [...row])
  return b.map((row) => row.map((v) => Math.round(((v - lo) / (hi - lo)) * 9)))
}

/** Pixels where brightness jumps by more than `over` to the right or below. */
export function edgeCells(b: Grid, over: number): Set<number> {
  const out = new Set<number>()
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (c + 1 < SIZE && Math.abs(b[r][c] - b[r][c + 1]) > over) out.add(key([r, c])).add(key([r, c + 1]))
      if (r + 1 < SIZE && Math.abs(b[r][c] - b[r + 1][c]) > over) out.add(key([r, c])).add(key([r + 1, c]))
    }
  return out
}

/**
 * The inside of an outline: every cell the background can't reach without
 * crossing an edge. With no closed outline, nothing is inside.
 */
export function enclosed(edges: Set<number>): Set<number> {
  const seen = new Set<number>()
  const queue: Cell[] = []
  for (let i = 0; i < SIZE; i++)
    for (const cell of [[0, i], [SIZE - 1, i], [i, 0], [i, SIZE - 1]] as Cell[]) {
      if (!edges.has(key(cell)) && !seen.has(key(cell))) {
        seen.add(key(cell))
        queue.push(cell)
      }
    }
  while (queue.length) {
    const [r, c] = queue.shift()!
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n: Cell = [r + dr, c + dc]
      if (n[0] < 0 || n[1] < 0 || n[0] >= SIZE || n[1] >= SIZE) continue
      if (seen.has(key(n)) || edges.has(key(n))) continue
      seen.add(key(n))
      queue.push(n)
    }
  }
  // Peel off the outer ring of the outline: edge cells that touch the wall
  // (or the photo's border) are the wall's side of the jump. What's left,
  // biggest piece first, is the face, eyes included. Marks on the wall are
  // their own small pieces, or get peeled with the border.
  const touchesWall = (r: number, c: number) =>
    r === 0 || c === 0 || r === SIZE - 1 || c === SIZE - 1 || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => seen.has(key([r + dr, c + dc])))
  const inner = new Set<number>()
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const k = key([r, c])
      if (seen.has(k)) continue
      if (edges.has(k) && touchesWall(r, c)) continue
      inner.add(k)
    }
  const biggest = components(inner).sort((a, b) => b.length - a.length)[0] ?? []
  return biggest.length >= 12 ? new Set(biggest.map(key)) : new Set()
}

/** Groups of marked cells that touch (up, down, left, right). */
export function components(mask: Set<number>): Cell[][] {
  const left = new Set(mask)
  const out: Cell[][] = []
  for (const start of [...mask].sort((a, b) => a - b)) {
    if (!left.has(start)) continue
    const comp: Cell[] = []
    const queue = [start]
    left.delete(start)
    while (queue.length) {
      const k = queue.shift()!
      const cell: Cell = [Math.floor(k / SIZE), k % SIZE]
      comp.push(cell)
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const r = cell[0] + dr
        const c = cell[1] + dc
        if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) continue
        const n = key([r, c])
        if (left.has(n)) {
          left.delete(n)
          queue.push(n)
        }
      }
    }
    out.push(comp)
  }
  return out
}

const centre = (cells: Cell[]) => [cells.reduce((a, [r]) => a + r, 0) / cells.length, cells.reduce((a, [, c]) => a + c, 0) / cells.length] as const

/** Pairs of small spots on the same row, a few pixels apart: what a pair of eyes looks like. */
function pairsOf(comps: Cell[][]): [Cell[], Cell[]][] {
  const small = comps.filter((c) => c.length <= 2)
  const out: [Cell[], Cell[]][] = []
  for (let i = 0; i < small.length; i++)
    for (let j = i + 1; j < small.length; j++) {
      const [ri, ci] = centre(small[i])
      const [rj, cj] = centre(small[j])
      if (Math.abs(ri - rj) < 0.01 && Math.abs(ci - cj) >= 2 && Math.abs(ci - cj) <= 5) out.push([small[i], small[j]])
    }
  return out
}

export interface PhotoResult {
  photo: PhotoId
  /** The brightness the detectors saw (after exposure, if used). */
  seen: Grid
  dark: Set<number> | null
  edges: Set<number> | null
  region: Set<number> | null
  regionFrom: 'edges' | 'depth' | null
  /** The cells still marked after every filter. */
  kept: Set<number>
  glasses: Cell[] | null
  hat: number | null
  /** Did the filter do the right thing for this photo? */
  right: boolean
  /** Why not, in a few words, for the log. */
  why: 'ok' | 'noGlasses' | 'wrongSpot' | 'noFace' | 'fooled' | 'needsRegion'
}

export interface VisionResult {
  photos: PhotoResult[]
  right: number
  total: number
  uses: Set<Step['kind']>
  /** Blocks that need something earlier in the program and didn't get it. */
  missing: ('dark' | 'region' | 'action')[]
}

export function runVision(program: Step[], photoIds: PhotoId[]): VisionResult {
  const uses = new Set(program.map((s) => s.kind))
  const missing: VisionResult['missing'] = []
  if (!uses.has('glasses') && !uses.has('hat')) missing.push('action')
  if ((uses.has('inside') || uses.has('hat')) && !uses.has('edges') && !uses.has('depth')) missing.push('region')

  const photos = photoIds.map((pid): PhotoResult => {
    const photo = PHOTOS[pid]
    let seen = photo.brightness.map((row) => [...row])
    let dark: Set<number> | null = null
    let edges: Set<number> | null = null
    let region: Set<number> | null = null
    let regionFrom: PhotoResult['regionFrom'] = null
    let kept = new Set<number>()
    let paired = false
    let glasses: Cell[] | null = null
    let hat: number | null = null
    let needsRegion = false

    for (const step of program) {
      if (step.kind === 'exposure') seen = autoExposure(seen)
      else if (step.kind === 'dark') {
        dark = new Set<number>()
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (seen[r][c] < step.below) dark.add(key([r, c]))
        kept = new Set(dark)
      } else if (step.kind === 'edges') {
        edges = edgeCells(seen, step.over)
        if (regionFrom !== 'depth') {
          region = enclosed(edges)
          regionFrom = 'edges'
        }
      } else if (step.kind === 'depth') {
        // The depth sensor wins over the camera's outline: it can't be fooled by a picture.
        region = new Set<number>()
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (photo.depth[r][c]) region.add(key([r, c]))
        regionFrom = 'depth'
      } else if (step.kind === 'inside') {
        if (!region) needsRegion = true
        else kept = new Set([...kept].filter((k) => region!.has(k)))
      } else if (step.kind === 'pair') paired = true
      else if (step.kind === 'glasses') {
        const comps = components(kept)
        let pick: Cell[][] = []
        if (paired) pick = pairsOf(comps)[0] ?? []
        else pick = [...comps].sort((a, b) => b.length - a.length).slice(0, 2)
        glasses = pick.length === 2 ? pick.flat() : null
      } else if (step.kind === 'hat') {
        if (!region) needsRegion = true
        else if (region.size) hat = Math.min(...[...region].map((k) => Math.floor(k / SIZE)))
      }
    }

    // Judge the photo.
    let right = false
    let why: PhotoResult['why'] = 'ok'
    const wantsHat = uses.has('hat')
    if (needsRegion) why = 'needsRegion'
    else if (!photo.eyes) {
      right = !glasses && (!wantsHat || hat === null)
      why = right ? 'ok' : 'fooled'
    } else if (wantsHat) {
      // The hat sits on the top of the head: the hair, or the face's first row.
      right = hat !== null && hat >= 1 && hat <= photo.top!
      why = right ? 'ok' : hat === null ? 'noFace' : 'wrongSpot'
    } else if (!glasses) why = 'noGlasses'
    else {
      const want = new Set(photo.eyes.map(key))
      right = glasses.length === want.size && glasses.every((g) => want.has(key(g)))
      why = right ? 'ok' : 'wrongSpot'
    }
    return { photo: pid, seen, dark, edges, region, regionFrom, kept, glasses, hat, right, why }
  })
  return { photos, right: photos.filter((p) => p.right).length, total: photos.length, uses, missing }
}
