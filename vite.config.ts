import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração Vital para rodar React Native com Vite
export default defineConfig({
  plugins: [react()],
  define: {
    // Corrige erro "global is not defined" no navegador
    global: 'window',
    DEV: 'true',
    process: {
      env: {
        NODE_ENV: '"development"'
      }
    }
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js', '.jsx', '.json'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // Ajuda com bibliotecas antigas (CJS/ESM)
    },
    outDir: 'dist',
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js', '.jsx', '.json'],
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000
  }
});