import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000, 
    entry: 'index.js' 
  },
  build: {
    outDir: 'dist', 
    emptyOutDir: true 
  }
})