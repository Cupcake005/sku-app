import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // App update otomatis
      injectRegister: 'auto',
      includeAssets: ['logo.png'], 
      manifest: {
        name: 'SKU Master Inventory',
        short_name: 'SKU Master',
        description: 'Aplikasi Manajemen Stok dan SKU Toko',
        theme_color: '#2563eb', // Sesuaikan warna header (Biru)
        background_color: '#ffffff',
        display: 'standalone', // <--- KUNCI UTAMA (Biar kayak aplikasi native)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // <--- WAJIB ADA untuk Android modern
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // <--- WAJIB ADA
          }
        ]
      },
      workbox: {
        // Paksa browser langsung mengaktifkan service worker baru
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
})