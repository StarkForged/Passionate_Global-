import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/** Preload the Latin subset of the self-hosted font so the first paint uses it (no reflow). */
function preloadFont(): Plugin {
  return {
    name: 'preload-font',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) => /inter-tight-latin-wght-normal.*\.woff2$/.test(f));
        return file ? [{ tag: 'link', attrs: { rel: 'preload', href: `./${file}`, as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head-prepend' }] : [];
      },
    },
  };
}

// base './' keeps the build portable (works from any sub-folder / static host)
export default defineConfig({
  base: './',
  plugins: [react(), preloadFont()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    chunkSizeWarningLimit: 1600,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // long-lived vendor chunks: app changes don't bust the animation libraries' cache
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          if (/[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
          if (/[\\/](gsap|lenis)[\\/]/.test(id)) return 'scroll';
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
        },
      },
    },
  },
});
