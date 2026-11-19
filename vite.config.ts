import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { headFor } from './src/data/meta';

/** Preload the Latin subset of the self-hosted font so the first paint uses it (no reflow). */
function preloadFont(): Plugin {
  return {
    name: 'preload-font',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) => /inter-tight-latin-wght-normal.*\.woff2$/.test(f));
        return file ? [{ tag: 'link', attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head-prepend' }] : [];
      },
    },
  };
}

/** Dev server: fill <!--app-head--> with the home page head (the production build does it per page in scripts/prerender.mjs). */
function devHead(): Plugin {
  return { name: 'dev-head', apply: 'serve', transformIndexHtml: (html) => html.replace('<!--app-head-->', headFor('home')) };
}

// One timestamp for the client and the pre-render bundle (scripts/build.mjs sets BUILD_TIME before both builds).
const BUILD_TIME = process.env.BUILD_TIME ?? new Date().toISOString();

export default defineConfig(({ isSsrBuild }) => ({
  base: '/', // served from the domain root (Vercel); '/' keeps assets working on /privacy-policy and deep 404 URLs
  // TURNSTILE_SITE_KEY is public (it is sent to every browser); TURNSTILE_SECRET_KEY never matches this prefix.
  envPrefix: ['VITE_', 'TURNSTILE_SITE_KEY'],
  define: { __BUILD_TIME__: JSON.stringify(BUILD_TIME) },
  plugins: [react(), preloadFont(), devHead()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // pre-render bundle: bundle every dependency so Node can run it without ESM/CJS surprises (gsap, lenis, …)
  ssr: { noExternal: true },
  build: {
    sourcemap: false, // never ship source maps to production
    chunkSizeWarningLimit: 1600,
    assetsInlineLimit: 0,
    rollupOptions: isSsrBuild ? {} : {
      output: {
        // long-lived vendor chunks: app changes don't bust the animation libraries' cache
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return;
          if (/[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
          if (/[\\/](gsap|lenis)[\\/]/.test(id)) return 'scroll';
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
        },
      },
    },
  },
}));
