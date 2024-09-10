import { sentryVitePlugin } from '@sentry/vite-plugin'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    sentryVitePlugin({
      org: 'argus-labs',
      project: 'cardinal-editor',
      reactComponentAnnotation: { enabled: true },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  define: {
    __CARDINAL_PROJECT_ID__: `'__CARDINAL_PROJECT_ID__'`,
  },

  build: {
    sourcemap: true,
  },

  server: {
    headers: {
      'Document-Policy': 'js-profiling',
    },
  },
})
