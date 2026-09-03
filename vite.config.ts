import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// O endereço é a raiz, em dev e em produção.
//
// Já não é: até 02/09/2026 a produção saía no subendereço do GitHub Pages
// (`/central-compras-pbqph/`), e havia uma variável de ambiente para fugir
// dele. O Pages saiu (o Pedro mandou o aplicativo morar no Cloudflare, junto
// com o resto da plataforma), e com ele saiu o subendereço — então some também
// a variável, porque manivela que só tem uma posição é manivela que engana.
//
// A trava que impede o subendereço de voltar sem ninguém ver mora em
// `scripts/conferir-pacote.js`, e roda no `pnpm deploy` antes de subir.

export default defineConfig(() => {
  const base = '/';
  return {
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['marca/brasao.png', 'marca/mascote-rosto.png', 'icons/*.png'],
      manifest: {
        name: 'Central de Compras PBQP-H',
        short_name: 'Central Compras',
        description: 'Sistema de Ordens de Compra — Campisi PBQP-H',
        // Cores do padrão "Creme": a barra do sistema no celular acompanha a
        // tela em vez de brigar com ela.
        theme_color: '#FBF3DE',
        background_color: '#FBF3DE',
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
        // Os quadros do martelo (133 KB) ficam fora do pacote pré-carregado:
        // só aparecem em espera acima de 250ms, e o próprio loader os busca
        // na hora.
        globIgnores: ['**/marca/loader-quadro-*.png'],
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
