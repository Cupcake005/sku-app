import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // <--- INI KUNCINYA AGAR SW JALAN
      includeAssets: ['logo.png'], // Pastikan file ini ada di folder public
      manifest: {
        name: 'SKU Master Inventory',
        short_name: 'SKU Master',
        description: 'Aplikasi Manajemen Stok dan SKU Toko',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // <--- INI WAJIB AGAR JADI APLIKASI
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo.png', // Jangan pakai '/' di depan jika error, coba 'logo.png' saja
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})