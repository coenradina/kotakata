import type * as Phaser from 'phaser'

// Sprites are drawn as text grids: one character per pixel.
// Palette follows aastr.id (ink, tosca, maroon, amber, cream) plus fruit colours.
const PALETTE: Record<string, string> = {
  k: '#0F172A', // ink outline
  t: '#0D9488', // tosca
  T: '#115E59', // dark tosca
  m: '#881337', // maroon
  a: '#E5A93C', // amber
  c: '#FDF6E3', // cream
  p: '#EEE8D5', // parchment
  w: '#FFFFFF',
  s: '#94A3B8', // slate
  r: '#DC2626', // apple red
  R: '#991B1B',
  y: '#FACC15', // banana yellow
  Y: '#CA8A04',
  g: '#16A34A', // leaf green
}

export const SPRITES: Record<string, string[]> = {
  apple: [
    '....kg....',
    '....kgg...',
    '.kkkkkkk..',
    'krwrrrrrk.',
    'krwrrrrrrk',
    'krrrrrrrrk',
    'krrrrrrrRk',
    '.krrrrrRk.',
    '..kkkkkk..',
  ],
  banana: [
    '..........kk',
    '.........kYk',
    'kk......kyyk',
    'kyk....kyyk.',
    '.kyykkkyyyk.',
    '.kyyyyyyyk..',
    '..kYYyyykk..',
    '...kkkkk....',
  ],
  robot0: [
    '......kk......',
    '......ka......',
    '...kkkkkkkk...',
    '..kttttttttk..',
    '..ktkkkkkktk..',
    '..ktkwkkwktk..',
    '..ktkkkkkktk..',
    '..ktkkaakktk..',
    '..kttttttttk..',
    '...kkkkkkkk...',
    '.kkTttttttTkk.',
    'kTkttmmmmttkTk',
    'kTkttttttttkTk',
    '.k.kttttttk.k.',
    '...kkk..kkk...',
    '...kTk..kTk...',
    '..kkkk..kkkk..',
  ],
  robot1: [
    '......kk......',
    '......kk......',
    '...kkkkkkkk...',
    '..kttttttttk..',
    '..ktkkkkkktk..',
    '..ktkkkkkktk..',
    '..ktkwkkwktk..',
    '..ktkkaakktk..',
    '..kttttttttk..',
    '...kkkkkkkk...',
    '.kkTttttttTkk.',
    'kTkttmmmmttkTk',
    'kTkttttttttkTk',
    '.k.kttttttk.k.',
    '...kkk..kkk...',
    '...kTk..kTk...',
    '..kkkk..kkkk..',
  ],
  binApple: binRows('r'),
  binBanana: binRows('y'),
  belt: [
    'kkkkkkkkkkkkkkkk',
    'ssssssssksssssss',
    'sssssssskkssssss',
    'ssssssssksssssss',
    'kkkkkkkkkkkkkkkk',
    'kskkkkskkkkskkkk',
  ],
  spark: ['.a.', 'aya', '.a.'],
  cross: ['..k..', '..k..', 'kkkkk', '..k..', '..k..'],
}

function binRows(c: string) {
  const b = (row: string) => row.replace(/b/g, c)
  return [
    'kkkkkkkkkkkkkkkkkk',
    'kbbbbbbbbbbbbbbbbk',
    '.kbbbbbbbbbbbbbbk.',
    '.kbbwbbbbbbbbbbbk.',
    '.kbbwbbbbbbbbbbbk.',
    '.kbbbbbbbbbbbbbbk.',
    '.kbbbbbbbbbbbbbbk.',
    '.kbbbbbbbbbbbbbbk.',
    '..kbbbbbbbbbbbbk..',
    '..kkkkkkkkkkkkkk..',
  ].map(b)
}

/** Turns every sprite grid into a Phaser texture. Short rows are padded. */
export function registerPixelTextures(scene: Phaser.Scene) {
  for (const [key, rows] of Object.entries(SPRITES)) {
    if (scene.textures.exists(key)) continue
    const w = Math.max(...rows.map((r) => r.length))
    const tex = scene.textures.createCanvas(key, w, rows.length)
    if (!tex) continue
    const ctx = tex.getContext()
    rows.forEach((row, y) => {
      ;[...row].forEach((ch, x) => {
        const colour = PALETTE[ch]
        if (!colour) return
        ctx.fillStyle = colour
        ctx.fillRect(x, y, 1, 1)
      })
    })
    tex.refresh()
  }
}
