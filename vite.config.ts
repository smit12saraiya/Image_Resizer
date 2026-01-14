import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  optimizeDeps: {
    include: ['lucide-react'],  // Change exclude to include
  },
  resolve: {
    alias: {
      'lucide-react': 'lucide-react/dist/esm/lucide-react'
    }
  }
});