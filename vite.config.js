import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'], // Pastikan nama file ini sesuai dengan di folder public
      manifest: {
        name: 'SKU Master Inventory',
        short_name: 'SKU Master',
        description: 'Aplikasi Stok Toko Acan',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',      // Wajib agar jadi App
        orientation: 'portrait',    // Wajib kunci potret
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo.png', // Vite akan otomatis mencari ini di folder public
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo.png',
            sizes: '512x512', // Pastikan file asli minimal segini
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
})