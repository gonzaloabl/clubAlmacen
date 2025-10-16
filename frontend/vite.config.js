import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Puerto especifico para el front
    proxy: {
      '/api':{
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
