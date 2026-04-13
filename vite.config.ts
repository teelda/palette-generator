import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',   // bind to loopback only — not exposed to local network
    proxy: {
      // All /api/* calls from the browser go to the local Express server.
      // The API key never leaves the server process.
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: false,
      },
    },
  },
})
