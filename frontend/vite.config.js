import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

const target_prod = "http://portainer-my-apps.fritz.box:3004"
const target_dev = "http://localhost:3000"

const target_local = target_dev

export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  server: {
    proxy: {
      '/api': target_local,
      '/thumbnail': target_local,
      '/files': target_local,
      '/public': target_local,
    }
  }  
})
