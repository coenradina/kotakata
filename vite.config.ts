import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
    "connect-src 'self' data: blob:",
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
 * GitHub Pages answers unknown paths with 404.html. A copy of index.html
 * there lets deep links such as /kotakata/buku boot the app, which then
 * reads the path and shows the right page.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = bundle['index.html']
      if (html?.type === 'asset') this.emitFile({ type: 'asset', fileName: '404.html', source: html.source })
    },
  }
}
