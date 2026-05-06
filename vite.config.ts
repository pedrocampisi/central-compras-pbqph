import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// GitHub Pages serves from a subpath: /central-compras-pbqph/
// Em dev (localhost) o base é '/'. Em produção (qualquer build), aplicamos o
// subpath do GH Pages — antes dependíamos da env GITHUB_ACTIONS, que era fácil
// de esquecer no build manual e gerava tela branca em produção.
// Para gerar build com base '/' (auto-host raiz), use VITE_BASE_PATH=/.
const PROD_BASE = process.env['VITE_BASE_PATH'] ?? '/central-compras-pbqph/';

export default defineConfig(({ command }) => {
  const base = command === 'build' ? PROD_BASE : '/';
  return {
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brazao1.png', 'icons/*.png'],
      manifest: {
        name: 'Central de Compras PBQP-H',
        short_name: 'Central Compras',
        description: 'Sistema de Ordens de Compra — Campisi PBQP-H',
        theme_color: '#0d2b4a',
        background_color: '#f4f6fa',
        display: 'standalone',
        start_url: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,json}'],
        // Large chunks — cache them longer
        runtimeCaching: [
          {
            urlPattern: /assets\/pdf.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-libs',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('jspdf') || id.includes('jspdf-autotable')) return 'pdf-libs';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-vendor';
          if (id.includes('node_modules/zustand/') || id.includes('node_modules/zod/')) return 'state-vendor';
        },
      },
    },
    // Increase warning limit — pdf.worker is inherently large
    chunkSizeWarningLimit: 700,
  },
  };
});
