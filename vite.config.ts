import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { localRealtimePlugin } from './src/server/lanRealtimePlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localRealtimePlugin()],
  server: {
    host: true,
    port: 5174,
  },
  preview: {
    host: true,
    port: 5174,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
