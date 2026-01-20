import { defineConfig } from 'vite';

export default defineConfig({
  // This helps when deploying to GitHub Pages (repo sub-folder)
  base: './', 
  build: {
    outDir: 'dist',
  }
});
