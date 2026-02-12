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
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID),
      'process.env.STAGING_CLIENT_ID': JSON.stringify(process.env.VITE_STAGING_CLIENT_ID || env.VITE_STAGING_CLIENT_ID || env.STAGING_CLIENT_ID),
      'process.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID),
      'process.env.VITE_GOOGLE_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || "AIzaSyBy4rWW3PbFyKpCOigV3uBRm_8pjtK-N5w"),
      'process.env.VITE_STARTER_FOLDER_ID': JSON.stringify(process.env.VITE_STARTER_FOLDER_ID || env.VITE_STARTER_FOLDER_ID || "1y-I0ydJBTG6DzVFqcxR-6pPqQwr7xHPK"),
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || "AIzaSyBy4rWW3PbFyKpCOigV3uBRm_8pjtK-N5w"),
      'import.meta.env.VITE_STARTER_FOLDER_ID': JSON.stringify(process.env.VITE_STARTER_FOLDER_ID || env.VITE_STARTER_FOLDER_ID || "1y-I0ydJBTG6DzVFqcxR-6pPqQwr7xHPK")
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
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      }
    }
  };
});
