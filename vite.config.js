import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module'

const { version } = createRequire(import.meta.url)('./package.json')

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [react()],
  base: '/shift-calendar/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Proxy API requests to a locally-running API server (not Docker)
    proxy: {
      '/shift-calendar/calendars': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace('/shift-calendar', ''),
      },
      '/shift-calendar/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace('/shift-calendar', ''),
      },
    }
  }
})
