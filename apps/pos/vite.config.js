import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { emailApiPlugin } from './vite-plugin-email-api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), emailApiPlugin()],
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    modulePreload: {
      resolveDependencies(_filename, deps) {
        // Keep initial marketing load lean; these load with app/lazy routes.
        return deps.filter(
          (dep) =>
            !/(firebase|charts|select|motion)-[\w-]+\.js$/.test(dep) &&
            !dep.includes('/firebase-') &&
            !dep.includes('/charts-') &&
            !dep.includes('/select-') &&
            !dep.includes('/motion-'),
        )
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('firebase')) return 'firebase'
          if (id.includes('recharts') || id.includes('/d3-')) return 'charts'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('react-select')) return 'select'
          if (id.includes('lucide-react')) return 'icons'
          return undefined
        },
      },
    },
  },
})
