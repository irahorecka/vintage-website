import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/humans.txt': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/easteregg.txt': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
