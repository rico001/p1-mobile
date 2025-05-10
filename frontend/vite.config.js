import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/thumbnail': 'http://localhost:3000',
      '/files': 'http://localhost:3000',
      '/public': 'http://localhost:3000',
    }
  }  
})
