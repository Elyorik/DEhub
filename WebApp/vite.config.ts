import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // чтобы Vite слушал внешний доступ
    allowedHosts: [
      '2e2f88adcd86.ngrok-free.app' // твой ngrok-домен
    ]
  }
})
