import { useEffect, useRef, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import { MAX_NAME, certificateText } from '../certificate/content'
import { drawCertificate, loadCertificateFonts } from '../certificate/draw'
import { t } from '../i18n'
import { useLang } from '../lang'
import { LEVELS } from '../levels'
import { Link } from '../router'
import { store } from '../store'

/**
 * A certificate for a finished session (docs/plan/04-ui-design.md, section
 * 5.5). The player types a name, which stays in this page's memory only:
 * it's drawn onto a canvas and never saved or sent. The same canvas is the
 * preview, the PNG and the printout.
 */
export default function CertificatePage({ id }: { id: string }) {
  const { lang } = useLang()
  const index = LEVELS.findIndex((l) => l.id === id)
  const level = LEVELS[index]
  const passed = level ? store.load().passed.includes(level.id) : false
  const [name, setName] = useState('')
  const canvas = useRef<HTMLCanvasElement>(null)
  const [today] = useState(() => new Date())

  useEffect(() => {
    if (!level || !passed) return
    let live = true
    loadCertificateFonts().then(() => {
      if (live && canvas.current) drawCertificate(canvas.current, certificateText(level, index, lang, name, today))
    })
    return () => {
      live = false
    }
  }, [level, index, passed, lang, name, today])

  const download = () => {
    canvas.current?.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kotakata-${lang === 'id' ? 'sertifikat' : 'certificate'}-${id}.png`
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  return (
    <div className="min-h-full bg-cream">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/main" className="inline-block type-label underline hover:text-maroon print:hidden">
          {t(lang, 'certBack')}
        </Link>

        {!level || !passed ? (
          <div className="rounded-lg border-2 border-ink bg-white p-6 shadow-pixel">
            <p className="type-lead">{t(lang, 'certLocked')}</p>
            {level && (
              <Link to={`/main/${level.id}`} className="pixel-btn mt-4 inline-block rounded border-2 border-ink bg-maroon px-4 py-2 type-button text-white hover:bg-maroon-dark">
                {t(lang, 'play')}
              </Link>
            )}
          </div>
        ) : (
          <>
            <h1 className="type-title print:hidden">🎓 {t(lang, 'certificate')}</h1>
            <div className="flex flex-wrap items-end gap-4 print:hidden">
              <label className="min-w-64 flex-1 space-y-1.5">
                <span className="block type-label">{t(lang, 'certNameLabel')}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
                  maxLength={MAX_NAME}
                  autoComplete="off"
                  placeholder={t(lang, 'certNamePlaceholder')}
                  className="w-full rounded border-2 border-ink bg-white px-3 py-2 type-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                />
              </label>
              <button onClick={download} className="pixel-btn rounded border-2 border-ink bg-maroon px-4 py-2 type-button-lg text-white hover:bg-maroon-dark">
                {t(lang, 'certPng')}
              </button>
              <button onClick={() => window.print()} className="pixel-btn rounded border-2 border-ink bg-white px-4 py-2 type-button-lg hover:bg-parchment">
                {t(lang, 'certPrint')}
              </button>
            </div>
            <p className="type-caption text-ink-muted print:hidden">🔒 {t(lang, 'certNameHelp')}</p>
            <canvas
              ref={canvas}
              role="img"
              aria-label={`${t(lang, 'certTitle')}: ${level.title[lang]}`}
              className="cert-sheet w-full rounded-lg border-2 border-ink shadow-pixel print:rounded-none print:border-0 print:shadow-none"
            />
          </>
        )}
      </main>
    </div>
  )
}
