// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  devServer: { port: 3003 },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxt/fonts'],
  css: ['~/assets/css/tailwind.css'],
  // Self-hosted (downloaded + cached) brand type.
  fonts: {
    families: [
      { name: 'Poppins', provider: 'google' },
      { name: 'Hind', provider: 'google' },
    ],
  },
  // The dashboard is authenticated and client-rendered (the API session cookie isn't available to
  // SSR); public marketplace pages stay server-rendered for SEO.
  routeRules: { '/dashboard/**': { ssr: false }, '/tickets': { ssr: false } },
  shadcn: { prefix: '', componentDir: '~/components/ui' },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Turnstile',
      // Apply a saved dark-theme choice before paint to avoid a flash. Light is the default.
      script: [
        {
          innerHTML:
            "try{if(localStorage.getItem('ts-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          tagPosition: 'head',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4002/api/v1',
    },
  },
});
