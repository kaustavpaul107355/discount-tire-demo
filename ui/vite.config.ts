import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'recharts'
          if (id.includes('node_modules/react-leaflet') || id.includes('node_modules/leaflet')) return 'leaflet'
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark-gfm')) return 'markdown'
          if (id.includes('node_modules/lucide-react')) return 'lucide'
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
