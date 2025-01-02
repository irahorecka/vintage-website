import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src', // Keep the alias for cleaner imports
      },
    },
    base: isProduction ? '/' : '/', // Adjust the base path for production deployment
    build: {
      outDir: 'dist', // Output directory for production build
      assetsDir: 'assets', // Directory for static assets
      sourcemap: false, // Disable source maps for production
      emptyOutDir: true, // Clean the output directory before building
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
  };
});
