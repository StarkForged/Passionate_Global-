/// <reference types="vite/client" />

/** ISO timestamp of the build (vite.config.ts `define`), identical in the client and pre-render bundles. */
declare const __BUILD_TIME__: string;

interface ImportMetaEnv { readonly TURNSTILE_SITE_KEY?: string }
