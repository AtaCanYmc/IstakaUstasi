import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { UserConfig as ViteUserConfig } from 'vite'
import type { InlineConfig as VitestInlineConfig } from 'vitest'

interface UserConfig extends ViteUserConfig {
  test?: VitestInlineConfig
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
  }
} as UserConfig)
