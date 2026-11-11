// Colours and fonts for canvas code. Phaser scenes and the Blockly theme
// cannot use Tailwind classes, so they read the same CSS files the page
// uses. tokens.css and art.css stay the only place a colour is written.
import tokensCss from './styles/tokens.css?raw'
import artCss from './styles/art.css?raw'
import iconCodepoints from './icons/codepoints.json'

const vars = new Map<string, string>()
for (const m of `${tokensCss}\n${artCss}`.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) vars.set(m[1], m[2].trim())

export type Token =
  | 'white' | 'cream' | 'parchment' | 'ink' | 'ink-soft' | 'ink-muted'
  | 'tosca' | 'tosca-dark' | 'tosca-light' | 'tosca-tint'
  | 'maroon' | 'maroon-dark' | 'maroon-tint'
  | 'amber' | 'amber-tint' | 'gold'
export type Art =
  | 'apple' | 'apple-dark' | 'banana' | 'banana-dark' | 'leaf' | 'leaf-dark'
  | 'wood' | 'wood-dark' | 'grass' | 'path' | 'plank' | 'stone' | 'tosca-deep' | 'spark' | 'skin'
  | 'block-events-2' | 'block-data-2' | 'block-model-2'

function read(name: string): string {
  const v = vars.get(name)
  if (!v || !/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`theme: --${name} is not a hex colour in tokens.css or art.css`)
  return v
}

/** A palette or art colour as a CSS hex string. */
export const css = (name: Token | Art): string => read(vars.has(`color-${name}`) ? `color-${name}` : `art-${name}`)
/** The same colour as a number, the form Phaser wants. */
export const hex = (name: Token | Art): number => parseInt(css(name).slice(1), 16)
/** A colour with an alpha channel, as #rrggbbaa. */
export const alpha = (name: Token | Art, a: number): string => css(name) + Math.round(a * 255).toString(16).padStart(2, '0')

/** Font stacks from tokens.css. */
export const FONTS = {
  sans: vars.get('font-sans') ?? 'sans-serif',
  mono: vars.get('font-mono') ?? 'monospace',
  pixel: vars.get('font-pixel') ?? 'monospace',
}

/**
 * The base style for Phaser text. Phaser sizes a text's canvas from how far
 * the ink of a sample string reaches above and below the baseline. Its
 * default sample is letters only, and the KK Icons glyphs stand taller than
 * VT323's letters, so any icon in a label had its top cut off. Measuring
 * every icon as well gives each line room for whichever one it holds.
 */
export const PIXEL_TEXT = {
  fontFamily: FONTS.pixel,
  testString: '|MÉqgy' + String.fromCodePoint(...iconCodepoints.map((u) => parseInt(u.slice(2), 16)).filter((cp) => cp !== 0x200d && cp !== 0xfe0f)),
}
