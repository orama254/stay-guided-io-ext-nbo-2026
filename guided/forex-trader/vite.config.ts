import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: ['https://warm-wolf-b8d3d2e4.tunnl.gg'],
  },
  plugins: [tanstackStart(), viteReact()],
})
