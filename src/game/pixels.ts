import type * as Phaser from 'phaser'
import { css } from '../theme'

// Sprites are drawn as text grids: one character per pixel.
// Palette follows aastr.id (ink, tosca, maroon, amber, cream) plus fruit colours.
export const PALETTE: Record<string, string> = {
  k: css('ink'), // ink outline
  t: css('tosca'), // tosca
  T: css('tosca-deep'), // dark tosca
  m: css('maroon'), // maroon
  a: css('amber'), // amber
  c: css('cream'), // cream
  p: css('parchment'), // parchment
  w: css('white'),
  e: css('ink'), // pupils
  s: css('stone'), // slate
  r: css('apple'), // apple red
  R: css('apple-dark'),
  y: css('banana'), // banana yellow
  Y: css('banana-dark'),
  g: css('leaf'), // leaf green
  G: css('leaf-dark'),
  n: css('wood'), // wood / brown
  N: css('wood-dark'),
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
  // Level 4: the tavern bard, with a feathered hat and a lute
  bard: [
    '.......a.....',
    '......aa.....',
    '...kkkkkkk...',
    '..kmmmmmmmk..',
    '.kkkkkkkkkkk.',
    '..kssssssk...',
    '..ksesseskk..',
    '..ksssmssk...',
    '...kssssk....',
    '..kttttttk...',
    '.kttttttttkk.',
    'kttkttttkaaak',
    'kttkttttkaNak',
    '.kktttttkaaak',
    '..kttttttkk..',
    '..kTTkkTTk...',
    '..kTTk.kTTk..',
    '..kkkk.kkkk..',
  ],
    // Level 2 critters. Colour variants are built by swapping the body colour.
  'bird-brown': birdRows('n', 'N'),
  'bird-yellow': birdRows('y', 'Y'),
  bee: [
    '..kk..kk..',
    '.kwwk.kwwk',
    '.kwwkkkwwk',
    '..kykkykk.',
    '.kyykyykyk',
    'kyykyykyek',
    '.kyykyykk.',
    '..kkkkkk..',
    '....kk....',
  ],
  'frog-green': frogRows('g', 'G'),
  'frog-brown': frogRows('n', 'N'),
  pen: [
    'kk...kk...kk...kk...kk',
    'kNk..kNk..kNk..kNk..kN',
    'kkkkkkkkkkkkkkkkkkkkkk',
    'knnnnnnnnnnnnnnnnnnnnk',
    'kkkkkkkkkkkkkkkkkkkkkk',
    'kNk..kNk..kNk..kNk..kN',
    'kNk..kNk..kNk..kNk..kN',
    'kkkkkkkkkkkkkkkkkkkkkk',
    'knnnnnnnnnnnnnnnnnnnnk',
    'kkkkkkkkkkkkkkkkkkkkkk',
  ],
  cross: ['..k..', '..k..', 'kkkkk', '..k..', '..k..'],
}

function birdRows(body: string, shade: string) {
  return [
    '....kkkk....',
    '...kbbbbk...',
    '..kbbkwbbk..',
    '..kbbbbbbkaa',
    'kkkbbbbbbka.',
    'kBBBbbbbbk..',
    '.kBBBbbbbk..',
    '..kkbbbbk...',
    '....kaak....',
    '...ka..ak...',
  ].map((r) => r.replace(/b/g, body).replace(/B/g, shade))
}

function frogRows(body: string, shade: string) {
  return [
    '..kk....kk..',
    '.kwek..kwek.',
    '.kbbkkkkbbk.',
    'kbbbbbbbbbbk',
    'kbbkkkkkkbbk',
    'kbbbbbbbbbbk',
    '.kBBk..kBBk.',
    'kBBk....kBBk',
  ].map((r) => r.replace(/b/g, body).replace(/B/g, shade))
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

/** Paints a sprite grid onto any 2D canvas, `scale` canvas pixels per sprite pixel. */
export function paintSprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number, scale: number) {
  rows.forEach((row, ry) => {
    ;[...row].forEach((ch, rx) => {
      const colour = PALETTE[ch]
      if (!colour) return
      ctx.fillStyle = colour
      ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale)
    })
  })
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
