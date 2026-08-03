import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
      /*  target: 'http://172.20.10.2:8000',*/
        target: 'http://192.168.100.232:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})