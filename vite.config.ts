import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    sourcemap: true, // Habilita source maps para producción
  },
  css: {
    devSourcemap: true, // Habilita source maps para CSS en desarrollo
  }
})