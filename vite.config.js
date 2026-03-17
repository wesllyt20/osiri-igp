import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwind from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['APP_'])

  return {
    server: {
      port: env.APP_PORT || 5000,
      host: true,
    },
    base: env.APP_BASE || '/',
    plugins: [vue(), tailwind()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            plotly: ['plotly.js-dist-min'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})