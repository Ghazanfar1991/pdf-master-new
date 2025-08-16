import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.HF_API_KEY': JSON.stringify(env.HF_API_KEY),
      global: 'globalThis',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            tesseract: ['tesseract.js'],
            pdfjs: ['pdfjs-dist'],
            fabric: ['fabric'], // Add fabric as a separate chunk
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'tesseract.js',
        'pdfjs-dist',
        'fabric',
        'pdf-lib',
        'pdfjs-dist/legacy/build/pdf.worker.entry',
      ],
      esbuildOptions: {
        // Ensure CommonJS modules are handled correctly
        mainFields: ['module', 'main'],
        resolveExtensions: ['.js', '.mjs', '.cjs'],
      },
    },
  };
});