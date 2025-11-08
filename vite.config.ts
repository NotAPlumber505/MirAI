import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dns from 'node:dns'
dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  plugins: [react(), tailwindcss()],
})