import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_ACTIONS ? '/liu-xunhao-portfolio/' : '/',
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
})
