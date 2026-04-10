import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    //colocamos el enlace de la aplicacion funcional en red
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
    outDir:'dist',
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
        //manualChunks como FUNCIÓN en lugar de objeto
        manualChunks(id) {
          // Divide el código en chunks para mejor rendimiento en móviles
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
    rolldownOptions: {  // Cambiado de esbuildOptions a rolldownOptions
      target: 'es2015' // Compatibilidad con móviles
    }
  },
  css: {
    postcss: false,
    devSourcemap: false,
    preprocessorOptions: {}
  },
  // Resolver problemas de compatibilidad
  resolve: {
    alias: {}
  }
})