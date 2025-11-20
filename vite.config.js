import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'view/about/index.html'),
        adopt: resolve(__dirname, 'view/adopt/index.html'),
        debut: resolve(__dirname, 'view/debug/index.html'),
        sky: resolve(__dirname, 'view/sky/index.html'),
      },
    },
  },
  esbuild: {  // Don't minify function names, so Sign In with Google can access the callback.
    minifyIdentifiers: false,
    keepNames: true,
  }
})
