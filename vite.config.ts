import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';

export default defineConfig({
  root: './www',
  build: {
    outDir: '../build',
    minify: false,
    emptyOutDir: false,
  },
  plugins: [
    babel({
      babelConfig: {
        presets: ['@babel/preset-env'],
      },
    }),
  ],
});
