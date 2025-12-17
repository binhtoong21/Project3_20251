import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy cho API request
      '/api': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
        secure: false,
      },
      // Proxy cho ảnh Uploads 
      '/uploads': {
        target: 'http://localhost:3000', // Phải trùng với port bên trên
        changeOrigin: true,
        secure: false,
      },
    },
  }
})