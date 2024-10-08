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

  // defining sentry dsn and posthog key here since they're public anyways and
  // is more straightforward than putting them in github secrets. note the
  // backticks (`) surrounding the single quotes (') is required as the values
  // must be JSON serializable
  define: {
    __CARDINAL_PROJECT_ID__: `'__CARDINAL_PROJECT_ID__'`,
    __SENTRY_DSN__: `'https://731f7b8388eaf882bb175a8e548404ef@o4506475620204544.ingest.us.sentry.io/4507899857534976'`,
    __POSTHOG_KEY__: `'phc_nkoe1cRzoBD3JUNX7ZKFC1M9wUV189UMc9ZhXAq56ts'`,
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
