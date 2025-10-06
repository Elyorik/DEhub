import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // чтобы Vite слушал внешний доступ
    allowedHosts: [
      "62c9f5491e23.ngrok-free.app"
    ]
  }
})
