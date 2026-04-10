import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwind from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Carga las variables que empiecen con VITE_
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    // 1. IMPORTANTE: Usa VITE_APP_BASE para que coincida con tu .env
    base: env.VITE_APP_BASE || '/', 
    
    server: {
      // 2. Aquí también usamos el prefijo VITE_ si lo tienes así en el .env
      port: parseInt(env.VITE_APP_PORT) || 4999,
      host: true,
    },
    
    plugins: [vue(), tailwind()],
    
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            plotly: ['plotly.js-dist-min'],
            leaflet: ['leaflet'],
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