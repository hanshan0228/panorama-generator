import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        hdri: resolve(import.meta.dirname, 'ai-hdri-generator/index.html'),
        skybox: resolve(import.meta.dirname, 'skybox-generator/index.html'),
        photo360: resolve(import.meta.dirname, 'photo-to-360-converter/index.html'),
        cubemap: resolve(import.meta.dirname, 'cubemap-generator/index.html'),
        metadata: resolve(import.meta.dirname, '360-metadata-injector/index.html'),
      },
    },
  },
})
