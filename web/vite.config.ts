import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev-only proxy for M365 public roadmap API to avoid CORS
      '/api/m365': {
        target: 'https://www.microsoft.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/m365/, '/releasecommunications/api/v1/m365'),
      },
    },
  },
})
