import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'LOGO3.webp', 'souf.webp'],
      manifest: {
        name: 'Souf Estate - عقارات سوف',
        short_name: 'Souf Estate',
        description: 'منصة عقارية جزائرية موثوقة للبيع والكراء',
        theme_color: '#facc15',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'ar',
        dir: 'rtl',
        categories: ['business', 'lifestyle'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        navigateFallbackDenylist: [/^\/api/],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 80, maxAgeSeconds: 2592000 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8800',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': ['framer-motion', 'lucide-react'],
        'map-vendor': ['leaflet', 'react-leaflet'], // Adjust based on your actual map library
        'clerk-vendor': ['@clerk/clerk-react'],
      }
    }
  }
}
})