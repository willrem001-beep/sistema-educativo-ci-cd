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
        manualChunks: {
          // Divide el código en chunks para mejor rendimiento en móviles
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'react-toastify'],
          'api': ['axios']
        }
      }
    }
  },
  // Optimización para desarrollo móvil
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-toastify',
      'lucide-react'
    ],
    esbuildOptions: {
      target: 'es2015' // Compatibilidad con móviles
    }
  },

  css: {
    devSourcemap: false,
    preprocessorOptions: {}
  },
  // Resolver problemas de compatibilidad
  resolve: {
    alias: {}
  }
})