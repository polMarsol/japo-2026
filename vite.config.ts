import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Repo de GitHub Pages: japo-marsol.github.io/japo-2026/ -> base "/japo-2026/"
// En local (`vite`/`vite build --mode development`) se sirve en la raiz.
const isProdBuild = process.env.NODE_ENV === 'production'
const base = isProdBuild ? '/japo-2026/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'Japó 2026',
        short_name: 'Japó 2026',
        description: 'Itinerari del viatge al Japó - Agost 2026',
        theme_color: '#c8102e',
        background_color: '#0b0b0f',
        display: 'standalone',
        orientation: 'portrait',
        // Sin start_url/scope explicitos: vite-plugin-pwa los deriva de `base`
        // para que funcionen tanto en local (/) como en GH Pages (/japo-2026/).
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precachea TODO el bundle (JS/CSS/HTML) + el db.json embebido y assets estaticos
        // para que la app funcione 100% offline desde la primera visita.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,json}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            // Tiles de mapa (si hay conexion): cache-first para que, una vez
            // vistos, queden disponibles offline en la siguiente visita.
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: {
                // Subido de 500 a 6000 para que la descarga deliberada de
                // mapas offline (ver src/lib/offlineTiles.ts) no expulse
                // tiles ya descargados de otros dias por LRU.
                maxEntries: 6000,
                maxAgeSeconds: 60 * 60 * 24 * 60,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
