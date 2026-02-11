import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    css: {
      devSourcemap: true,
    },
    build: {
      sourcemap: true,
    },
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID),
      'process.env.STAGING_CLIENT_ID': JSON.stringify(env.VITE_STAGING_CLIENT_ID || env.STAGING_CLIENT_ID),
      'process.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/drive': {
          target: 'https://www.googleapis.com/drive/v3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/drive/, '')
        }
      }
    }
  };
});
