/* eslint-disable */
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import blitsVitePlugins from '@lightningjs/blits/vite'

export default defineConfig(({ mode }) => {
  // Load env vars prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = Number(env.VITE_PORT || 3000)

  return {
    base: '/',
    plugins: [...blitsVitePlugins],
    resolve: {
      mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
    },
    server: {
      host: '0.0.0.0',
      // Allow *.kavia.ai by default; can be extended with VITE_FRONTEND_URL host if provided
      allowedHosts: ['.kavia.ai'],
      port: PORT,
      strictPort: false, // if true, Vite will exit when port is taken; keep false to auto-fallback but we'll log
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      fs: {
        allow: ['..'],
      },
    },
    worker: {
      format: 'es',
    },
    define: {
      __APP_INFO__: JSON.stringify({
        port: PORT,
        mode,
      }),
    },
  }
})