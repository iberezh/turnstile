// The admin console is a SPA (no SSR): it talks to the separate admin-api and is fully behind
// authentication, so there is nothing to server-render.
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,
  devtools: { enabled: true },
  devServer: { port: 3004 },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxt/fonts'],
  css: ['~/assets/css/tailwind.css'],
  fonts: {
    families: [
      { name: 'Poppins', provider: 'google' },
      { name: 'Hind', provider: 'google' },
    ],
  },
  shadcn: { prefix: '', componentDir: '~/components/ui' },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Turnstile Admin',
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
      adminApiBase: process.env.NUXT_PUBLIC_ADMIN_API_BASE ?? 'http://localhost:4003/admin/v1',
    },
  },
});
