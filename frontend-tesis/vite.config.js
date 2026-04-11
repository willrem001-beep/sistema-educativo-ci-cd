import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: false,
    devSourcemap: false,
    preprocessorOptions: {}
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'https://relief-lamps-flood-tomatoes.trycloudflare.com/',
      '.trycloudflare.com' 
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('lucide-react') || id.includes('react-toastify')) {
              return 'ui';
            }
            if (id.includes('axios')) {
              return 'api';
            }
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-toastify',
      'lucide-react'
    ],
    rolldownOptions: {
      target: 'es2015'
    }
  },
  resolve: {
    alias: {}
  }
})