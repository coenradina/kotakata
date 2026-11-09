import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { STATIC_ROUTES } from './src/staticRoutes'

// Served from https://aastr.id/kotakata/ via GitHub Pages.
export default defineConfig({
  base: '/kotakata/',
  plugins: [react(), tailwindcss(), productionCsp(), spaFallback()],
  build: { chunkSizeWarningLimit: 2000 },
})

/** GitHub Pages can't send headers, so production builds carry the CSP as a meta tag. */
function productionCsp(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    // Firestore, for survey answers (src/survey/send.ts).
    "connect-src 'self' data: blob: https://firestore.googleapis.com",
    "media-src 'self' data: blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ')
  return {
    name: 'production-csp',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' },
      { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head' },
    ],
  }
}

/**
 * GitHub Pages serves files only. Each route in STATIC_ROUTES gets its own
 * copy of index.html, so a link such as /kotakata/survei answers 200 and the
 * app reads the path to show the right page. Other paths still get 404.html,
 * which boots the app too, with a 404 status.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = bundle['index.html']
      if (html?.type !== 'asset') return
      this.emitFile({ type: 'asset', fileName: '404.html', source: html.source })
      // Pages serves /survei from survei.html with no redirect, and /survei/ from survei/index.html.
      for (const route of STATIC_ROUTES.filter(Boolean)) {
        this.emitFile({ type: 'asset', fileName: `${route}.html`, source: html.source })
        this.emitFile({ type: 'asset', fileName: `${route}/index.html`, source: html.source })
      }
    },
  }
}
