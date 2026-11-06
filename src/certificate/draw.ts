// Draws a certificate onto a canvas, for the PNG download. Colours and
// fonts come from the design tokens through theme.ts.

import { SPRITES, paintSprite } from '../game/pixels'
import { FONTS, css } from '../theme'
import type { CertificateText } from './content'

/** A4 landscape at 150 dpi. */
export const CERT_W = 1754
export const CERT_H = 1240

/** Waits for the page fonts, so the canvas doesn't fall back to a default face. */
export async function loadCertificateFonts() {
  await Promise.all([
    document.fonts.load(`96px ${FONTS.pixel}`),
    document.fonts.load(`bold 88px ${FONTS.sans}`),
    document.fonts.load(`32px ${FONTS.sans}`),
    document.fonts.load(`bold 28px ${FONTS.mono}`),
  ]).catch(() => undefined)
}

export function drawCertificate(canvas: HTMLCanvasElement, text: CertificateText) {
  canvas.width = CERT_W
  canvas.height = CERT_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const cx = CERT_W / 2

  // Paper and the double frame, with hard pixel corners
  ctx.fillStyle = css('cream')
  ctx.fillRect(0, 0, CERT_W, CERT_H)
  ctx.fillStyle = css('ink')
  ctx.fillRect(48, 48, CERT_W - 96, CERT_H - 96)
  ctx.fillStyle = css('cream')
  ctx.fillRect(56, 56, CERT_W - 112, CERT_H - 112)
  ctx.strokeStyle = css('ink')
  ctx.lineWidth = 4
  ctx.strokeRect(84, 84, CERT_W - 168, CERT_H - 168)
  for (const [x, y] of [
    [84, 84],
    [CERT_W - 84, 84],
    [84, CERT_H - 84],
    [CERT_W - 84, CERT_H - 84],
  ]) {
    ctx.fillStyle = css('amber')
    ctx.fillRect(x - 20, y - 20, 40, 40)
    ctx.strokeRect(x - 20, y - 20, 40, 40)
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = css('maroon')
  ctx.font = `104px ${FONTS.pixel}`
  ctx.fillText(text.title, cx, 250)

  ctx.fillStyle = css('ink-soft')
  ctx.font = `36px ${FONTS.sans}`
  ctx.fillText(text.given, cx, 360)

  ctx.fillStyle = css('ink')
  ctx.font = `bold ${fitFont(ctx, text.name, 96, CERT_W - 520, `bold`, FONTS.sans)}px ${FONTS.sans}`
  ctx.fillText(text.name, cx, 480)
  ctx.fillStyle = css('amber')
  ctx.fillRect(cx - 380, 512, 760, 8)

  ctx.fillStyle = css('ink-soft')
  ctx.font = `36px ${FONTS.sans}`
  ctx.fillText(text.forLine, cx, 610)

  ctx.fillStyle = css('tosca-dark')
  ctx.font = `bold ${fitFont(ctx, text.what, 64, CERT_W - 520, `bold`, FONTS.sans)}px ${FONTS.sans}`
  ctx.fillText(text.what, cx, 700)
  ctx.fillStyle = css('ink-muted')
  ctx.font = `bold 30px ${FONTS.mono}`
  ctx.fillText(text.topic.toUpperCase(), cx, 760)

  ctx.fillStyle = css('ink')
  ctx.font = `bold 28px ${FONTS.mono}`
  ctx.fillText(text.learnedLabel.toUpperCase(), cx, 860)
  ctx.font = `${fitFont(ctx, text.learned, 36, CERT_W - 420, `normal`, FONTS.sans)}px ${FONTS.sans}`
  ctx.fillText(text.learned, cx, 914)

  ctx.textAlign = 'left'
  ctx.fillStyle = css('ink-muted')
  ctx.font = `bold 28px ${FONTS.mono}`
  ctx.fillText(text.date, 170, CERT_H - 160)
  ctx.textAlign = 'right'
  ctx.fillText(text.site, CERT_W - 170, CERT_H - 160)

  // Kata, bottom centre
  const robot = SPRITES.robot0
  const scale = 9
  const w = Math.max(...robot.map((r) => r.length)) * scale
  paintSprite(ctx, robot, cx - w / 2, CERT_H - 120 - robot.length * scale, scale)
}

/** The largest font size up to `max` at which `text` fits in `width`. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, max: number, width: number, weight: string, family: string) {
  let size = max
  for (; size > 20; size -= 4) {
    ctx.font = `${weight} ${size}px ${family}`
    if (ctx.measureText(text).width <= width) break
  }
  return size
}
