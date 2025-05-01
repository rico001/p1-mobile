import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/thumbnail': 'http://localhost:3000',
      '/files': 'http://localhost:3000',
      '/public': 'http://localhost:3000',

    }
  }  
})
