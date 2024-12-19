import { defineConfig } from 'vite';

export default defineConfig({
  root: './www',
  build: {
    outDir: '../build',
    minify: false,
    emptyOutDir: true,
  },
});
