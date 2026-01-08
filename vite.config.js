import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'vite.svg'], // Pastikan nama file logo kamu benar
      manifest: {
        name: 'SKU Master Inventory',
        short_name: 'SKU Master',
        description: 'Aplikasi Manajemen Stok dan SKU Toko',
        theme_color: '#2563eb', // Sesuaikan dengan warna biru header aplikasi
        background_color: '#ffffff',
        display: 'standalone', // Ini yang bikin dia kayak aplikasi native (tanpa address bar browser)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/logo.png', // Pastikan kamu punya file logo.png di folder public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})