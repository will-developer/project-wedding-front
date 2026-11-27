import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    server: {
      port: 5175,
      strictPort: true,
      proxy: {
        '^/api(?:/|$)': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: '',
        },
      },
    },
  };
})
