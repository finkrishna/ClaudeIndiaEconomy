import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base: './' → relative asset paths, so the same build works on GitHub Pages
// (project subpath) and on Vercel/Netlify (domain root) with no reconfiguration.
export default defineConfig({
  plugins: [react()],
  base: './',
})
