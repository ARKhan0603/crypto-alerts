import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// API requests are routed to Django by nginx (see ../nginx/nginx.conf), not by Vite.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
