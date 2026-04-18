import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
 
/**
 * Vite Configuration for MentorMatch
 * Modern, fast build tool for React + TypeScript
 */
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173,
    open: true,
    strictPort: false,
  },
 
  build: {
    target: 'ES2020',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
        },
      },
    },
  },
 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, './src/types'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
 
  // Environment variables
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000/api'),
  },
});
